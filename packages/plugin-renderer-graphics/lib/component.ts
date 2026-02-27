import { Component } from '@eva/eva.js';
import { Graphics as GraphicsEngine } from '@eva/renderer-adapter';

/**
 * 图形绘制组件
 *
 * Graphics 组件提供矢量图形绘制能力，可以动态绘制各种几何图形。
 * 它基于 PixiJS Graphics，支持绘制线条、矩形、圆形、多边形等，
 * 适用于调试可视化、动态UI、简单特效等场景。
 *
 * @example
 * ```typescript
 * const shape = new GameObject('shape');
 * const graphics = new Graphics();
 * shape.addComponent(graphics);
 *
 * // 在组件初始化后使用 graphics 对象绘制
 * graphics.graphics.clear();
 * graphics.graphics.beginFill(0xff0000);
 * graphics.graphics.drawCircle(100, 100, 50); // 绘制圆形
 * graphics.graphics.endFill();
 *
 * // 绘制矩形
 * graphics.graphics.lineStyle(2, 0x0000ff);
 * graphics.graphics.drawRect(0, 0, 100, 100);
 *
 * // 绘制多边形
 * graphics.graphics.beginFill(0x00ff00);
 * graphics.graphics.drawPolygon([0,0, 100,0, 100,100, 0,100]);
 * graphics.graphics.endFill();
 * ```
 */
export default class Graphics extends Component {
  /** 组件名称 */
  static componentName: string = 'Graphics';

  /** PixiJS Graphics 实例，用于绘制矢量图形 */
  graphics: GraphicsEngine = null;

  /**
   * 初始化组件
   * 创建 Graphics 绘图对象实例
   */
  init() {
    this.graphics = new GraphicsEngine();
  }
}
