import { Component } from '@eva/eva.js';
import { Graphics } from '@eva/plugin-renderer-graphics';

interface InspectorFieldMetadata {
  name: string;
  type: string;
  isArray: boolean;
  children?: InspectorFieldMetadata[];
  isFolder?: boolean;
  step?: number;
}

/** ProgressBar 填充模式 */
export type ProgressBarFillMode = 'horizontal' | 'vertical' | 'circular';

/** Track / fill 单层样式 — UIShape 的子集,只支持 rect / roundedRect / circle 圆环 */
export interface ProgressBarLayerStyle {
  /** rect | roundedRect | circle */
  shape?: 'rect' | 'roundedRect' | 'circle';
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  alpha?: number;
  /** rect / roundedRect 的圆角半径 */
  radius?: number;
}

export interface ProgressBarParams {
  /** 当前进度值 */
  value?: number;
  /** 取值范围 [min, max],默认 [0, 100] */
  valueRange?: [number, number];
  /** horizontal(默认)/ vertical / circular */
  fillMode?: ProgressBarFillMode;
  /** 整体几何 — 横/竖向 = rect 矩形,circular = 圆环外径 */
  width?: number;
  height?: number;
  /** circular 模式专用 */
  radius?: number;
  /** circular 模式的环宽(像素) */
  thickness?: number;
  /** circular 起始角度(deg,默认 -90 = 12 点钟方向) */
  startAngle?: number;
  /** 背景轨道样式 */
  trackStyle?: ProgressBarLayerStyle;
  /** 进度填充样式 */
  fillStyle?: ProgressBarLayerStyle;
  /** 填充内缩(px),仅 horizontal/vertical */
  fillPadding?: { top?: number; right?: number; bottom?: number; left?: number };
}

const DEFAULT_TRACK_STYLE: ProgressBarLayerStyle = {
  shape: 'roundedRect',
  fill: '#1f2937',
  radius: 8,
  alpha: 1,
};

const DEFAULT_FILL_STYLE: ProgressBarLayerStyle = {
  shape: 'roundedRect',
  fill: '#22c55e',
  radius: 8,
  alpha: 1,
};

/**
 * ProgressBar — 进度条组件
 *
 * 通过同 GameObject 上的 Graphics 组件绘制 track + fill 两层。`value` / `fillMode` 改变时
 * 由 ProgressBarSystem 触发 redraw。组件实现 RuntimeEditableComponent.applyDeclarativeProps
 * 契约,Inspector 改字段不会摧毁运行时私有状态(本组件目前无私有状态,但保持契约一致性)。
 *
 * 三种 fillMode:
 * - `horizontal` : 横向左→右填充(默认)
 * - `vertical`   : 竖向下→上填充
 * - `circular`   : 圆环 0→100% 角度填充
 */
export default class ProgressBar extends Component<ProgressBarParams> {
  static override componentName = 'ProgressBar';

  value = 0;
  valueRange: [number, number] = [0, 100];
  fillMode: ProgressBarFillMode = 'horizontal';
  width = 200;
  height = 24;
  radius = 60;
  thickness = 12;
  startAngle = -90;
  trackStyle: ProgressBarLayerStyle = { ...DEFAULT_TRACK_STYLE };
  fillStyle: ProgressBarLayerStyle = { ...DEFAULT_FILL_STYLE };
  fillPadding: { top: number; right: number; bottom: number; left: number } = { top: 0, right: 0, bottom: 0, left: 0 };

  static getInspectorMetadata(): InspectorFieldMetadata {
    const layerFields: InspectorFieldMetadata[] = [
      { name: 'shape', type: 'string', isArray: false },
      { name: 'fill', type: 'color', isArray: false },
      { name: 'stroke', type: 'color', isArray: false },
      { name: 'lineWidth', type: 'number', isArray: false },
      { name: 'alpha', type: 'number', isArray: false, step: 0.05 },
      { name: 'radius', type: 'number', isArray: false },
    ];
    const paddingFields: InspectorFieldMetadata[] = [
      { name: 'top', type: 'number', isArray: false },
      { name: 'right', type: 'number', isArray: false },
      { name: 'bottom', type: 'number', isArray: false },
      { name: 'left', type: 'number', isArray: false },
    ];
    return {
      name: ProgressBar.componentName,
      type: 'object',
      isArray: false,
      isFolder: true,
      children: [
        { name: 'value', type: 'number', isArray: false },
        { name: 'fillMode', type: 'string', isArray: false },
        { name: 'width', type: 'number', isArray: false },
        { name: 'height', type: 'number', isArray: false },
        { name: 'radius', type: 'number', isArray: false },
        { name: 'thickness', type: 'number', isArray: false },
        { name: 'startAngle', type: 'number', isArray: false, step: 5 },
        { name: 'trackStyle', type: 'object', isArray: false, isFolder: true, children: layerFields },
        { name: 'fillStyle', type: 'object', isArray: false, isFolder: true, children: layerFields },
        { name: 'fillPadding', type: 'object', isArray: false, isFolder: true, children: paddingFields },
      ],
    };
  }

  override init(params?: ProgressBarParams) {
    if (!params) return;
    this.applyParams(params);
  }

  override awake() {
    this.redraw();
  }

  override start() {
    this.redraw();
    queueMicrotask(() => this.redraw());
  }

  /** RuntimeEditableComponent 契约入口:幂等同步 props,不破坏运行时私有状态 */
  applyDeclarativeProps(next: ProgressBarParams, _prev?: ProgressBarParams): void {
    this.applyParams(next);
    this.redraw();
  }

  private applyParams(params: ProgressBarParams): void {
    if (typeof params.value === 'number') this.value = params.value;
    if (Array.isArray(params.valueRange) && params.valueRange.length === 2) {
      this.valueRange = [params.valueRange[0], params.valueRange[1]];
    }
    if (params.fillMode) this.fillMode = params.fillMode;
    if (typeof params.width === 'number') this.width = params.width;
    if (typeof params.height === 'number') this.height = params.height;
    if (typeof params.radius === 'number') this.radius = params.radius;
    if (typeof params.thickness === 'number') this.thickness = params.thickness;
    if (typeof params.startAngle === 'number') this.startAngle = params.startAngle;
    if (params.trackStyle) this.trackStyle = { ...DEFAULT_TRACK_STYLE, ...params.trackStyle };
    if (params.fillStyle) this.fillStyle = { ...DEFAULT_FILL_STYLE, ...params.fillStyle };
    if (params.fillPadding) {
      this.fillPadding = {
        top: params.fillPadding.top ?? 0,
        right: params.fillPadding.right ?? 0,
        bottom: params.fillPadding.bottom ?? 0,
        left: params.fillPadding.left ?? 0,
      };
    }
  }

  /** 0~1 归一化进度 */
  getProgress(): number {
    const [min, max] = this.valueRange;
    if (max <= min) return 0;
    const clamped = Math.max(min, Math.min(max, this.value));
    return (clamped - min) / (max - min);
  }

  redraw(): void {
    if (!this.gameObject) return;
    let graphicsComponent: Graphics = this.gameObject.getComponent('Graphics') as Graphics;
    if (!graphicsComponent) {
      graphicsComponent = this.gameObject.addComponent(new Graphics());
    }
    const g = graphicsComponent.graphics;
    if (!g) return;
    g.clear();
    if (this.fillMode === 'circular') {
      this.drawCircular(g);
    } else {
      this.drawLinear(g);
    }
  }

  private drawLinear(g: any): void {
    const { width, height, fillPadding, fillMode } = this;
    const progress = this.getProgress();

    // track
    this.drawLayerRect(g, this.trackStyle, 0, 0, width, height);

    // fill
    const innerX = fillPadding.left;
    const innerY = fillPadding.top;
    const innerW = Math.max(0, width - fillPadding.left - fillPadding.right);
    const innerH = Math.max(0, height - fillPadding.top - fillPadding.bottom);

    if (fillMode === 'horizontal') {
      const filled = innerW * progress;
      if (filled > 0) {
        this.drawLayerRect(g, this.fillStyle, innerX, innerY, filled, innerH);
      }
    } else {
      // vertical:从底向上填充
      const filled = innerH * progress;
      if (filled > 0) {
        this.drawLayerRect(g, this.fillStyle, innerX, innerY + (innerH - filled), innerW, filled);
      }
    }
  }

  private drawLayerRect(g: any, style: ProgressBarLayerStyle, x: number, y: number, w: number, h: number): void {
    if (style.alpha !== undefined) g.alpha = style.alpha;
    if (style.stroke) g.setStrokeStyle({ color: style.stroke, width: style.lineWidth ?? 1 });
    const shape = style.shape ?? 'rect';
    if (shape === 'roundedRect') {
      g.roundRect(x, y, w, h, style.radius ?? 0);
    } else if (shape === 'circle') {
      const r = Math.min(w, h) / 2;
      g.circle(x + w / 2, y + h / 2, r);
    } else {
      g.rect(x, y, w, h);
    }
    if (style.fill) g.fill(style.fill);
  }

  private drawCircular(g: any): void {
    const { radius, thickness, startAngle } = this;
    const progress = this.getProgress();

    const cx = radius;
    const cy = radius;
    const innerR = Math.max(1, radius - thickness);
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = startRad + progress * Math.PI * 2;

    // track 圆环
    if (this.trackStyle.alpha !== undefined) g.alpha = this.trackStyle.alpha;
    g.circle(cx, cy, radius);
    if (this.trackStyle.fill) g.fill(this.trackStyle.fill);
    g.circle(cx, cy, innerR);
    g.cut();

    // fill 弧
    if (progress > 0) {
      if (this.fillStyle.alpha !== undefined) g.alpha = this.fillStyle.alpha;
      g.moveTo(cx, cy);
      g.arc(cx, cy, radius, startRad, endRad);
      g.lineTo(cx, cy);
      if (this.fillStyle.fill) g.fill(this.fillStyle.fill);
      // 内圆 cut
      g.circle(cx, cy, innerR);
      g.cut();
    }
  }
}
