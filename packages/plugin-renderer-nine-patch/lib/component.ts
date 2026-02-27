import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
import { NinePatch as NinePatchSprite } from '@eva/renderer-adapter';

export interface NinePatchParams {
  resource: string;
  spriteName?: string;
  leftWidth?: number;
  topHeight?: number;
  rightWidth?: number;
  bottomHeight?: number;
}

/**
 * 九宫格组件
 *
 * NinePatch 组件用于实现可拉伸的图片，保持边角不变形。
 * 将图片分为 9 个区域，拉伸时只拉伸中间区域，边角保持原始比例，
 * 适用于按钮、对话框、面板等需要自适应尺寸的 UI 元素。
 *
 * 九宫格原理：
 * ```
 * +-------+-------+-------+
 * | 左上  |  上   | 右上  |
 * +-------+-------+-------+
 * |  左   | 中间  |  右   |
 * +-------+-------+-------+
 * | 左下  |  下   | 右下  |
 * +-------+-------+-------+
 * ```
 * 拉伸时，四个角保持不变，四条边单向拉伸，中间区域双向拉伸。
 *
 * @example
 * ```typescript
 * // 创建可拉伸的按钮背景
 * const button = new GameObject('button');
 * button.addComponent(new NinePatch({
 *   resource: 'buttonBg', // 按钮背景资源
 *   spriteName: 'btn_normal.png',
 *   leftWidth: 20,   // 左边不拉伸区域宽度
 *   topHeight: 20,   // 顶部不拉伸区域高度
 *   rightWidth: 20,  // 右边不拉伸区域宽度
 *   bottomHeight: 20 // 底部不拉伸区域高度
 * }));
 *
 * // 设置按钮尺寸（自动拉伸）
 * button.transform.size = { width: 200, height: 60 };
 *
 * // 创建对话框背景
 * const dialog = new GameObject('dialog');
 * dialog.addComponent(new NinePatch({
 *   resource: 'dialogBg',
 *   leftWidth: 30,
 *   topHeight: 30,
 *   rightWidth: 30,
 *   bottomHeight: 30
 * }));
 * dialog.transform.size = { width: 400, height: 300 };
 * ```
 */
export default class NinePatch extends Component<NinePatchParams> {
  /** 组件名称 */
  static componentName: string = 'NinePatch';

  /** 九宫格精灵实例 */
  ninePatch: NinePatchSprite;

  /** 图片资源名称 */
  @type('string') resource: string = '';

  /** 精灵图集中的图片名称 */
  @type('string') spriteName: string = '';

  /** 左边不拉伸区域的宽度 */
  @type('number') @step(1) leftWidth: number = 0;

  /** 顶部不拉伸区域的高度 */
  @type('number') @step(1) topHeight: number = 0;

  /** 右边不拉伸区域的宽度 */
  @type('number') @step(1) rightWidth: number = 0;

  /** 底部不拉伸区域的高度 */
  @type('number') @step(1) bottomHeight: number = 0;

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 资源名称
   * @param obj.spriteName - 精灵名称
   * @param obj.leftWidth - 左边固定宽度
   * @param obj.topHeight - 顶部固定高度
   * @param obj.rightWidth - 右边固定宽度
   * @param obj.bottomHeight - 底部固定高度
   */
  init(obj?: NinePatchParams) {
    this.resource = obj.resource;
    this.spriteName = obj.spriteName;
    this.leftWidth = obj.leftWidth;
    this.topHeight = obj.topHeight;
    this.rightWidth = obj.rightWidth;
    this.bottomHeight = obj.bottomHeight;
  }
}
