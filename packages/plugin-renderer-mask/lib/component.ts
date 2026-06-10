import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export enum MASK_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
  Polygon = 'Polygon',
  Img = 'Img',
  Sprite = 'Sprite',
}

export type MaskTypeValue = MASK_TYPE | 'circle' | 'ellipse' | 'rect' | 'roundedRect' | 'polygon' | 'img' | 'sprite';

export interface MaskParams {
  type: MaskTypeValue;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  paths?: number[];
  resource?: string;
  spriteName?: string;
  enabled?: boolean;
}

/**
 * 遮罩组件
 *
 * Mask 组件用于裁剪游戏对象的显示区域，只显示遮罩形状内的内容。
 * 支持多种遮罩形状（矩形、圆形、多边形、图片、精灵等），
 * 适用于头像裁剪、窗口遮罩、特殊形状显示等场景。
 *
 * 遮罩类型：
 * - Circle - 圆形遮罩
 * - Ellipse - 椭圆形遮罩
 * - Rect - 矩形遮罩
 * - RoundedRect - 圆角矩形遮罩
 * - Polygon - 多边形遮罩
 * - Img - 图片遮罩（基于图片 alpha 通道）
 * - Sprite - 精灵遮罩
 *
 * @example
 * ```typescript
 * // 圆形头像遮罩
 * const avatar = new GameObject('avatar');
 * avatar.addComponent(new Img({ resource: 'userAvatar' }));
 * avatar.addComponent(new Mask({
 *   type: MASK_TYPE.Circle,
 *   style: {
 *     x: 50, // 圆心 x
 *     y: 50, // 圆心 y
 *     radius: 50 // 半径
 *   }
 * }));
 *
 * // 矩形遮罩
 * avatar.addComponent(new Mask({
 *   type: MASK_TYPE.Rect,
 *   style: {
 *     x: 0, y: 0,
 *     width: 100,
 *     height: 100
 *   }
 * }));
 *
 * // 使用图片作为遮罩
 * avatar.addComponent(new Mask({
 *   type: MASK_TYPE.Img,
 *   resource: 'maskImage' // alpha 通道作为遮罩
 * }));
 * ```
 */
export default class Mask extends Component<MaskParams> {
  /** 组件名称 */
  static componentName: string = 'Mask';

  /** 上一次的遮罩类型 */
  _lastType: MaskTypeValue;

  /** 遮罩类型 */
  // @decorators.IDEProp 复杂编辑后续添加
  type: MaskTypeValue = MASK_TYPE.Rect;

  /** 遮罩样式配置 */
  // @decorators.IDEProp 复杂编辑后续添加
  style?: MaskParams['style'] = {};

  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') radius?: number;
  @type('number') width?: number;
  @type('number') height?: number;
  paths?: number[];

  /** 遮罩图片资源名称（用于 Img 类型） */
  @type('string') resource?: string = '';

  /** 遮罩精灵名称（用于 Sprite 类型） */
  @type('string') spriteName?: string = '';

  /** 是否启用遮罩 */
  @type('boolean') enabled: boolean = true;

  constructor(params?: MaskParams) {
    super(params);
    this.init(params);
  }

  /**
   * 初始化组件
   * @param obj - 初始化参数
   */
  init(obj?: MaskParams) {
    if (!obj) return;
    const { style, ...rest } = obj;
    Object.assign(this, rest);
    this.style = {
      ...this.style,
      ...style,
      x: obj.x ?? style?.x ?? this.style?.x ?? this.x,
      y: obj.y ?? style?.y ?? this.style?.y ?? this.y,
      radius: obj.radius ?? style?.radius ?? this.style?.radius,
      width: obj.width ?? style?.width ?? this.style?.width,
      height: obj.height ?? style?.height ?? this.style?.height,
      paths: obj.paths ?? style?.paths ?? this.style?.paths,
    };
    this.x = this.style.x ?? 0;
    this.y = this.style.y ?? 0;
    this.radius = this.style.radius;
    this.width = this.style.width;
    this.height = this.style.height;
    this.paths = this.style.paths;
  }

  destroy() {
    return this;
  }
}
