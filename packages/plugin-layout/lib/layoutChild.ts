import { Component, Field, step, type } from '@eva/eva.js';
import { Padding, normalizePadding } from './types';

/**
 * LayoutChild 组件参数
 */
export interface LayoutChildParams {
  /** 弹性增长比例，默认 0 */
  flexGrow?: number;
  /** 弹性收缩比例，默认 0 */
  flexShrink?: number;
  /** 覆盖父容器的 alignItems */
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  /** 外边距: number | [v, h] | [top, right, bottom, left]，默认 0 */
  margin?: number | [number, number] | [number, number, number, number];
  /** 固定尺寸（不参与弹性计算） */
  fixedSize?: { width?: number; height?: number };
}

class LayoutChildMarginMetadata {
  @type('number') @step(1) top?: number;
  @type('number') @step(1) right?: number;
  @type('number') @step(1) bottom?: number;
  @type('number') @step(1) left?: number;
}

class LayoutChildFixedSizeMetadata {
  @type('number') @step(1) width?: number;
  @type('number') @step(1) height?: number;
}

/**
 * LayoutChild 子元素组件 — 可选，用于控制子元素在 Layout 容器中的布局行为
 *
 * @description 挂载在 Layout 容器的子 GameObject 上，提供 flexGrow/flexShrink/margin 等控制。
 * 不加此组件的子元素按默认行为参与布局。
 *
 * @example
 * ```json
 * {
 *   "type": "LayoutChild",
 *   "props": {
 *     "flexGrow": 1,
 *     "margin": [0, 8]
 *   }
 * }
 * ```
 */
export default class LayoutChild extends Component {
  static componentName = 'LayoutChild';

  @type('number') @step(1)
  flexGrow: number = 0;

  @type('number') @step(1)
  flexShrink: number = 0;

  @type('string')
  alignSelf: 'start' | 'center' | 'end' | 'stretch' | undefined = undefined;

  @Field(() => LayoutChildMarginMetadata)
  margin: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

  @Field(() => LayoutChildFixedSizeMetadata)
  fixedSize: { width?: number; height?: number } | undefined = undefined;

  init(params?: LayoutChildParams) {
    if (!params) return;
    this.flexGrow = params.flexGrow ?? 0;
    this.flexShrink = params.flexShrink ?? 0;
    this.alignSelf = params.alignSelf;
    this.margin = normalizePadding(params.margin);
    this.fixedSize = params.fixedSize;
  }
}
