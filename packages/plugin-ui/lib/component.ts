import { Component } from '@eva/eva.js';
import { Graphics } from '@eva/plugin-renderer-graphics';
import { FillGradient } from 'pixi.js';

interface InspectorFieldMetadata {
  name: string;
  type: string;
  isArray: boolean;
  children?: InspectorFieldMetadata[];
  isFolder?: boolean;
  step?: number;
  label?: unknown;
}

/** UI 形状类型枚举 */
export enum UIShapeType {
  RECT = 'rect',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  ROUNDED_RECT = 'roundedRect',
}

/** UI 基础样式 */
export interface UIStyle {
  /** 填充颜色,支持 #RRGGBB / rgb()/rgba() / linear-gradient(...) */
  fill?: string;
  /** 描边颜色 */
  stroke?: string;
  /** 描边宽度 */
  lineWidth?: number;
  /** 透明度 0~1 */
  alpha?: number;
}

/** 矩形样式 */
export interface RectStyle extends UIStyle {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

/** 圆形样式 */
export interface CircleStyle extends UIStyle {
  x?: number;
  y?: number;
  radius: number;
}

/** 椭圆样式 */
export interface EllipseStyle extends UIStyle {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

/** 圆角矩形样式 */
export interface RoundedRectStyle extends UIStyle {
  x?: number;
  y?: number;
  width: number;
  height: number;
  radius?: number;
}

/** 单个 shape 描述 */
export interface UIShape {
  type: UIShapeType;
  style: RectStyle | CircleStyle | EllipseStyle | RoundedRectStyle;
}

/** UI 组件参数接口 */
export interface UIParams {
  componentName?: string;
  shapes?: UIShape[];
  /** 单形状简化用法:type + style */
  type?: UIShapeType;
  style?: RectStyle | CircleStyle | EllipseStyle | RoundedRectStyle;
}

/** 兼容别名:历史代码中沿用的 UIComponentParams */
export type UIComponentParams = UIParams;

/** 渐变色标 */
interface GradientColorStop {
  color: string;
  position: number;
}

/**
 * UI 组件
 *
 * 基于 `@eva/plugin-renderer-graphics` 实现 rect/circle/ellipse/roundedRect 的
 * 矢量绘制,支持纯色 / linear-gradient 填充与描边。`shapes` 数组允许在同一个
 * GameObject 上层叠多个形状。
 */
export default class UI extends Component<UIParams> {
  /** 组件名称 */
  static override componentName = 'UI';

  /** 实例侧 componentName,DSL 序列化时使用 */
  componentName?: string = 'UI';

  private shapes: UIShape[] = [];

  /** 编辑器 Inspector 元数据,主仓 ComponentInspector 通过静态方法读取 */
  static getInspectorMetadata(): InspectorFieldMetadata {
    const styleFields: InspectorFieldMetadata[] = [
      { name: 'fill', type: 'color', isArray: false },
      { name: 'stroke', type: 'color', isArray: false },
      { name: 'lineWidth', type: 'number', isArray: false },
      { name: 'alpha', type: 'number', isArray: false },
      { name: 'x', type: 'number', isArray: false },
      { name: 'y', type: 'number', isArray: false },
      { name: 'width', type: 'number', isArray: false },
      { name: 'height', type: 'number', isArray: false },
      { name: 'radius', type: 'number', isArray: false },
    ];

    return {
      name: UI.componentName,
      type: 'object',
      isArray: false,
      isFolder: true,
      children: [
        { name: 'componentName', type: 'string', isArray: false },
        {
          name: 'shapes',
          type: 'object',
          isArray: true,
          children: [
            { name: 'type', type: 'string', isArray: false },
            { name: 'style', type: 'object', isArray: false, children: styleFields },
          ],
        },
        { name: 'type', type: 'string', isArray: false },
        { name: 'style', type: 'object', isArray: false, children: styleFields },
      ],
    };
  }

  override init(params?: UIParams) {
    if (!params) return;

    this.componentName = params.componentName ?? this.componentName;

    if (params.shapes) {
      this.shapes = params.shapes;
    } else if (params.type && params.style) {
      this.shapes = [
        {
          type: params.type,
          style: params.style,
        },
      ];
    }
  }

  override awake() {
    this.redraw();
  }

  // 在 awake 之后再 schedule 一次重绘,绕过 v8 graphics context 在 awake 时
  // 的 fillStyle 懒赋值问题(每条 fill 指令记录的 fillStyle 都被后续 fill 调用覆盖)。
  override start() {
    this.redraw();
    // 再延迟一次,确保 RenderSystem 已把 graphics 实例 attach 到 stage
    queueMicrotask(() => this.redraw());
  }

  /**
   * 解析 linear-gradient 字符串
   * 支持格式: linear-gradient(180deg, #340033 4%, #93005D 83%, #CB2269 99%)
   */
  private parseLinearGradient(gradientStr: string): { angle: number; colorStops: GradientColorStop[] } | null {
    const match = gradientStr.match(/linear-gradient\s*\(\s*([^,]+),\s*(.+)\)/);
    if (!match) return null;

    const angleStr = match[1].trim();
    const angle = parseFloat(angleStr);

    const colorStopsStr = match[2];
    const colorStops: GradientColorStop[] = [];
    const stops = colorStopsStr.split(/,(?![^(]*\))/);

    for (const stop of stops) {
      const stopMatch = stop.trim().match(/(.+?)\s+(\d+)%/);
      if (stopMatch) {
        const color = stopMatch[1].trim();
        const position = parseFloat(stopMatch[2]) / 100;
        colorStops.push({ color, position });
      }
    }

    return { angle, colorStops };
  }

  /**
   * 创建 PixiJS FillGradient 对象
   * CSS linear-gradient 角度定义：
   * - 0deg = 从下到上(↑)
   * - 90deg = 从左到右(→)
   * - 180deg = 从上到下(↓)
   * - 270deg = 从右到左(←)
   *
   * FillGradient 的坐标范围是 0~1 的相对坐标
   */
  private createGradient(
    angle: number,
    colorStops: GradientColorStop[],
    width: number,
    height: number,
    _offsetX: number = 0,
    _offsetY: number = 0,
  ): FillGradient {
    let x0 = 0;
    let y0 = 0;
    let x1 = 0;
    let y1 = 0;

    if (angle === 0) {
      x0 = 0.5;
      y0 = 1;
      x1 = 0.5;
      y1 = 0;
    } else if (angle === 90) {
      x0 = 0;
      y0 = 0.5;
      x1 = 1;
      y1 = 0.5;
    } else if (angle === 180) {
      x0 = 0.5;
      y0 = 0;
      x1 = 0.5;
      y1 = 1;
    } else if (angle === 270) {
      x0 = 1;
      y0 = 0.5;
      x1 = 0;
      y1 = 0.5;
    } else {
      // 通用角度:CSS 0deg 朝上,顺时针
      const mathAngle = (90 - angle) * (Math.PI / 180);

      const centerX = 0.5;
      const centerY = 0.5;
      const maxDimension = Math.max(width, height);
      const diagonalLength = Math.sqrt(width * width + height * height);
      const normalizedLength = diagonalLength / (2 * maxDimension);

      x0 = centerX - Math.cos(mathAngle) * normalizedLength;
      y0 = centerY - Math.sin(mathAngle) * normalizedLength;
      x1 = centerX + Math.cos(mathAngle) * normalizedLength;
      y1 = centerY + Math.sin(mathAngle) * normalizedLength;
    }

    const gradient = new FillGradient(x0, y0, x1, y1);
    colorStops.forEach((stop) => {
      gradient.addColorStop(stop.position, stop.color);
    });

    return gradient;
  }

  /** 计算形状包围盒,供渐变坐标使用 */
  private getShapeBounds(type: UIShapeType, style: any): { width: number; height: number; x: number; y: number } {
    const x = style.x || 0;
    const y = style.y || 0;

    switch (type) {
      case UIShapeType.RECT:
      case UIShapeType.ROUNDED_RECT:
        return { width: style.width, height: style.height, x, y };
      case UIShapeType.CIRCLE:
        return { width: style.radius * 2, height: style.radius * 2, x, y };
      case UIShapeType.ELLIPSE:
        return { width: style.width, height: style.height, x, y };
      default:
        return { width: 100, height: 100, x, y };
    }
  }

  /** 重新绘制所有形状 */
  public redraw(): void {
    if (!this.gameObject) return;

    let graphicsComponent: Graphics = this.gameObject.getComponent('Graphics') as Graphics;
    if (!graphicsComponent) {
      graphicsComponent = this.gameObject.addComponent(new Graphics());
    }

    const graphics = graphicsComponent.graphics;
    if (!graphics) {
      console.warn('Graphics component has no graphics instance');
      return;
    }

    graphics.clear();
    this.shapes.forEach((shape) => {
      this.drawShape(graphics, shape.type, shape.style);
    });
  }

  /** 绘制单个形状 */
  private drawShape(graphics: any, type: UIShapeType, style: any): void {
    if (style.alpha !== undefined) {
      graphics.alpha = style.alpha;
    }

    if (style.stroke && style.lineWidth !== undefined) {
      graphics.setStrokeStyle({ color: style.stroke, width: style.lineWidth });
    } else if (style.stroke) {
      graphics.setStrokeStyle({ color: style.stroke, width: 1 });
    }

    switch (type) {
      case UIShapeType.RECT:
        this.drawRect(graphics, style as RectStyle);
        break;
      case UIShapeType.CIRCLE:
        this.drawCircle(graphics, style as CircleStyle);
        break;
      case UIShapeType.ELLIPSE:
        this.drawEllipse(graphics, style as EllipseStyle);
        break;
      case UIShapeType.ROUNDED_RECT:
        this.drawRoundedRect(graphics, style as RoundedRectStyle);
        break;
      default:
        console.warn(`Unknown shape type: ${type}`);
    }

    if (style.fill) {
      if (typeof style.fill === 'string' && style.fill.includes('linear-gradient')) {
        const gradientInfo = this.parseLinearGradient(style.fill);
        if (gradientInfo) {
          const bounds = this.getShapeBounds(type, style);
          const gradient = this.createGradient(
            gradientInfo.angle,
            gradientInfo.colorStops,
            bounds.width,
            bounds.height,
            bounds.x,
            bounds.y,
          );
          graphics.fill(gradient);
        } else {
          console.warn(`Failed to parse gradient: ${style.fill}`);
          graphics.fill('#000000');
        }
      } else {
        graphics.fill(style.fill);
      }
    }
  }

  private drawRect(graphics: any, style: RectStyle): void {
    const x = style.x || 0;
    const y = style.y || 0;
    graphics.rect(x, y, style.width, style.height);
  }

  private drawCircle(graphics: any, style: CircleStyle): void {
    const x = style.x || 0;
    const y = style.y || 0;
    graphics.circle(x, y, style.radius);
  }

  private drawEllipse(graphics: any, style: EllipseStyle): void {
    const x = style.x || 0;
    const y = style.y || 0;
    graphics.ellipse(x, y, style.width / 2, style.height / 2);
  }

  private drawRoundedRect(graphics: any, style: RoundedRectStyle): void {
    const x = style.x || 0;
    const y = style.y || 0;
    const radius = style.radius || 0;
    graphics.roundRect(x, y, style.width, style.height, radius);
  }

  /** 追加一个形状 */
  public addShape(type: UIShapeType, style: RectStyle | CircleStyle | EllipseStyle | RoundedRectStyle): void {
    this.shapes.push({ type, style });
    this.redraw();
  }

  /** 清除所有形状 */
  public clearShapes(): void {
    this.shapes = [];
    this.redraw();
  }

  /** 更新指定索引的形状 */
  public updateShape(
    index: number,
    type: UIShapeType,
    style: RectStyle | CircleStyle | EllipseStyle | RoundedRectStyle,
  ): void {
    if (index >= 0 && index < this.shapes.length) {
      this.shapes[index] = { type, style };
      this.redraw();
    }
  }

  /** 移除指定索引的形状 */
  public removeShape(index: number): void {
    if (index >= 0 && index < this.shapes.length) {
      this.shapes.splice(index, 1);
      this.redraw();
    }
  }

  /** 获取形状数量 */
  public getShapeCount(): number {
    return this.shapes.length;
  }

  /** 获取指定索引的形状(只读视图) */
  public getShape(index: number): UIShape | null {
    if (index >= 0 && index < this.shapes.length) {
      return this.shapes[index];
    }
    return null;
  }

  /** 设置所有形状的透明度 */
  public setAlpha(alpha: number): void {
    this.shapes.forEach((shape) => {
      shape.style.alpha = alpha;
    });
    this.redraw();
  }

  /** 设置所有形状的填充色 */
  public setFill(fill: string): void {
    this.shapes.forEach((shape) => {
      shape.style.fill = fill;
    });
    this.redraw();
  }

  /** 设置所有形状的描边 */
  public setStroke(stroke: string, lineWidth: number = 1): void {
    this.shapes.forEach((shape) => {
      shape.style.stroke = stroke;
      shape.style.lineWidth = lineWidth;
    });
    this.redraw();
  }
}
