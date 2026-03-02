import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
export interface RenderParams {
  alpha?: number;
  zIndex?: number;
  visible?: boolean;
  sortableChildren?: boolean;
  resolution?: number;
}
/**
 * 渲染属性组件
 *
 * Render 组件控制游戏对象的渲染相关属性，如可见性、透明度、层级等。
 * 这些属性影响对象的显示效果和渲染顺序，
 * 适用于需要控制显示状态、淡入淡出、层级排序等场景。
 *
 * 主要属性：
 * - visible - 控制对象是否可见
 * - alpha - 控制对象透明度（0-1）
 * - zIndex - 控制对象渲染层级
 * - sortableChildren - 是否对子对象按 zIndex 排序
 * - resolution - 渲染分辨率，值越大越清晰但性能消耗越大
 *
 * @example
 * ```typescript
 * // 创建带渲染属性的对象
 * const sprite = new GameObject('sprite');
 * sprite.addComponent(new Img({ resource: 'player' }));
 * sprite.addComponent(new Render({
 *   visible: true,
 *   alpha: 1,
 *   zIndex: 10
 * }));
 *
 * // 控制可见性
 * const render = sprite.getComponent('Render');
 * render.visible = false; // 隐藏对象
 *
 * // 淡入淡出效果
 * let alpha = 1;
 * setInterval(() => {
 *   alpha -= 0.01;
 *   if (alpha <= 0) alpha = 1;
 *   render.alpha = alpha;
 * }, 16);
 *
 * // 设置渲染层级
 * render.zIndex = 100; // 越大越靠前
 *
 * // 启用子对象排序
 * const container = new GameObject('container');
 * container.addComponent(new Render({
 *   sortableChildren: true // 子对象将按 zIndex 排序
 * }));
 *
 * // 设置渲染分辨率
 * const text = new GameObject('text');
 * text.addComponent(new Text({ text: 'High Resolution' }));
 * text.addComponent(new Render({
 *   resolution: 2 // 2倍分辨率，使渲染更清晰
 * }));
 * ```
 */
export default class Render extends Component<RenderParams> {
  /** 组件名称 */
  static componentName: string = 'Render';

  /** 排序脏标记 */
  sortDirty: boolean = false;

  /** 是否可见 */
  @type('boolean') visible: boolean = true;

  /** 透明度（0-1，0 为完全透明，1 为完全不透明） */
  @type('number') @step(0.1) alpha: number = 1;

  /** 渲染层级（数值越大越靠前） */
  @type('number') @step(1) zIndex: number = 0;

  /** 是否对子对象按 zIndex 排序 */
  @type('boolean') sortableChildren: boolean = false;

  /** 渲染分辨率（值越大越清晰但性能消耗越大，默认为 1） */
  @type('number') @step(0.1) resolution: number = 1;

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.visible - 是否可见
   * @param obj.alpha - 透明度
   * @param obj.zIndex - 渲染层级
   * @param obj.sortableChildren - 是否对子对象排序
   * @param obj.resolution - 渲染分辨率
   */
  init(obj?: RenderParams) {
    obj && Object.assign(this, obj);
  }
}
