import { Component, Field, step, type } from '@eva/eva.js';
import { Padding, normalizePadding } from './types';

/**
 * Layout 组件参数
 */
export interface LayoutParams {
  /** 排列方向，默认 'row' */
  direction?: 'row' | 'column';
  /** 内边距: number | [v, h] | [top, right, bottom, left]，默认 0 */
  padding?: number | [number, number] | [number, number, number, number];
  /** 子元素间距，默认 0 */
  gap?: number;
  /** 主轴对齐，默认 'start' */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** 交叉轴对齐，默认 'start' */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** 容器尺寸是否跟随内容自动调整，默认 true */
  autoSize?: boolean | 'width' | 'height';
}

class LayoutPaddingMetadata {
  @type('number') @step(1) top?: number;
  @type('number') @step(1) right?: number;
  @type('number') @step(1) bottom?: number;
  @type('number') @step(1) left?: number;
}

/**
 * Layout 容器组件 — 为子元素提供盒模型布局能力
 *
 * @description 挂载在容器 GameObject 上，LayoutSystem 会根据此组件配置自动排列子元素。
 * 支持 row/column 方向、padding、gap、对齐方式和自动尺寸。
 *
 * @example
 * ```json
 * {
 *   "type": "Layout",
 *   "props": {
 *     "direction": "row",
 *     "padding": [12, 24],
 *     "gap": 16,
 *     "alignItems": "center",
 *     "justifyContent": "center",
 *     "autoSize": true
 *   }
 * }
 * ```
 */
export default class Layout extends Component {
  static componentName = 'Layout';

  @type('string')
  direction: 'row' | 'column' = 'row';

  @Field(() => LayoutPaddingMetadata)
  padding: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

  @type('number') @step(1)
  gap: number = 0;

  @type('string')
  justifyContent: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'start';

  @type('string')
  alignItems: 'start' | 'center' | 'end' | 'stretch' = 'start';

  @Field({ type: 'object' })
  autoSize: boolean | 'width' | 'height' = true;

  init(params?: LayoutParams) {
    if (!params) return;
    this.direction = params.direction ?? 'row';
    this.padding = normalizePadding(params.padding);
    this.gap = params.gap ?? 0;
    this.justifyContent = params.justifyContent ?? 'start';
    this.alignItems = params.alignItems ?? 'start';
    this.autoSize = params.autoSize ?? true;
  }
}
