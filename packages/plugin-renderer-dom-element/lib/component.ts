import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

/**
 * DOMElement 组件参数。
 *
 * 设计理念:把一个 HTML 元素 "钉" 在 GameObject 的 Transform 上,
 * 不绘制到 Canvas,而是浮在(或叠在)Canvas 之上的 DOM layer 中。
 * Transform 的 position/scale/rotation 会通过 CSS `transform` 同步过去。
 *
 * 优先级(决定如何创建元素):
 * 1. `html` 非空 → 用 `innerHTML` 解析,取第一个根元素作为渲染元素;
 * 2. 否则使用 `element`(默认 'div')创建一个空元素。
 *
 * 锚点(anchorX/anchorY)等价 Phaser DOMElement.setOrigin。默认 0.5/0.5。
 * Transform 的 position 表示元素的锚点像素坐标。
 */
export interface DOMElementParams {
  /** 直接传入 HTML 字符串(取首个根节点)。 */
  html?: string;
  /** 不传 html 时,作为根元素的 tag,默认 'div'。 */
  element?: string;
  /** 元素 className(覆盖 html 解析出的)。 */
  className?: string;
  /** 内联 cssText(等价 element.style.cssText)。 */
  cssText?: string;
  /** style 对象(逐个写入 element.style)。 */
  style?: Record<string, string>;
  /** attribute 对象(逐个 setAttribute)。 */
  attrs?: Record<string, string>;
  /** 元素显式宽度(px),写入 style.width。 */
  width?: number;
  /** 元素显式高度(px),写入 style.height。 */
  height?: number;
  /** 锚点 X(0..1),默认 0.5。 */
  anchorX?: number;
  /** 锚点 Y(0..1),默认 0.5。 */
  anchorY?: number;
  /** CSS mix-blend-mode(normal/multiply/screen/...) */
  blendMode?: string;
  /** CSS pointer-events,默认 'auto'。 */
  pointerEvents?: string;
}

/**
 * DOMElement 组件 — 在 Canvas 上方/下方分层显示一个 HTML 元素。
 *
 * 行为:
 * 1. DOMElementSystem 负责确保 canvas 父容器内有一个 absolute 覆盖的 dom-layer div;
 * 2. ADD 时按 params 创建 DOM 节点并插入 dom-layer;
 * 3. 每帧 rendererUpdate 把 GameObject 的 Transform 同步到元素的 CSS transform;
 * 4. REMOVE 时从 dom-layer 摘除元素。
 */
export default class DOMElement extends Component<DOMElementParams> {
  static componentName: string = 'DOMElement';

  @type('string') html: string = '';
  @type('string') element: string = 'div';
  @type('string') className: string = '';
  @type('string') cssText: string = '';
  @type('string') blendMode: string = '';
  @type('string') pointerEvents: string = 'auto';
  @type('number') anchorX: number = 0.5;
  @type('number') anchorY: number = 0.5;
  width?: number;
  height?: number;
  style?: Record<string, string>;
  attrs?: Record<string, string>;

  init(obj?: DOMElementParams) {
    if (obj) Object.assign(this, obj);
  }
}
