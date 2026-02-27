import { type } from '@eva/inspector-decorator';
import { Component } from '@eva/eva.js';

export interface ImgParams {
  resource: string;
}

/**
 * 图片组件
 *
 * Img 组件用于渲染单张图片。
 * 它是最基础的图像渲染组件，适用于背景、UI 元素、静态贴图等场景。
 *
 * @example
 * ```typescript
 * // 渲染一张背景图
 * const background = new GameObject('background');
 * background.addComponent(new Img({
 *   resource: 'bgImage' // 资源名称
 * }));
 * ```
 */
export default class Img extends Component<ImgParams> {
  /** 组件名称 */
  static componentName: string = 'Img';

  /** 图片资源名称 */
  @type('string') resource: string = '';

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 图片资源名称
   */
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
  }
}
