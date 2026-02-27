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

export interface MaskParams {
  type: MASK_TYPE;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
  resource?: string;
  spriteName?: string;
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
  _lastType: MaskParams['type'];

  /** 遮罩类型 */
  // @decorators.IDEProp 复杂编辑后续添加
  type: MaskParams['type'];

  /** 遮罩样式配置 */
  // @decorators.IDEProp 复杂编辑后续添加
  style?: MaskParams['style'] = {};

  /** 遮罩图片资源名称（用于 Img 类型） */
  @type('string') resource?: string = '';

  /** 遮罩精灵名称（用于 Sprite 类型） */
  @type('string') spriteName?: string = '';

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.type - 遮罩类型
   * @param obj.style - 遮罩样式
   * @param obj.resource - 遮罩资源（可选）
   * @param obj.spriteName - 精灵名称（可选）
   */
  init(obj?: MaskParams) {
    Object.assign(this, obj);
  }
}
