import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
import { uuid } from './utils';

export interface A11yParams {
  hint: string;
  event?: Component;
  delay?: number;
  role?: string;
  props?: object;
  state?: object;
  attr?: object;
  a11yId?: string;
  [propName: string]: string | object | number;
}

/**
 * 无障碍组件（A11y/Accessibility）
 *
 * A11y 组件为游戏对象提供无障碍支持，使屏幕阅读器能够识别和朗读游戏内容。
 * 它在游戏画布上方创建透明的 DOM 元素，携带 ARIA 属性，让视障用户也能使用游戏。
 *
 * 主要功能：
 * - 提供屏幕阅读器可识别的文本标签
 * - 支持 ARIA 角色和属性
 * - 自动同步游戏对象的位置和尺寸
 * - 支持交互事件的无障碍访问
 *
 * @example
 * ```typescript
 * // 为游戏对象提供朗读能力
 * const button = new GameObject('button');
 * button.addComponent(new A11y({
 *   hint: '开始游戏按钮',
 *   role: 'button'
 * }));
 *
 * // 带交互事件的无障碍元素
 * button.addComponent(new A11y({
 *   hint: '点击开始游戏',
 *   event: eventComponent
 * }));
 * ```
 */
export default class A11y extends Component<A11yParams> {
  /** 组件名称 */
  static componentName: string = 'A11y';

  /** 是否可交互 */
  @type('boolean') interactive: boolean;

  /** 屏幕阅读器朗读的文本内容 */
  @type('string') hint: string;

  /**
   * 事件组件对象
   * @deprecated 已弃用，将根据 Event 组件自动添加
   */
  event: Component;

  /** DOM 元素延迟加载时间（毫秒） */
  @type('number') @step(1) delay: number;

  /** ARIA role 属性，定义元素的角色（如 button、link 等） */
  @type('string') role: string;

  /**
   * ARIA value 属性集合
   * @deprecated 已弃用，请将属性直接写在 component 上
   * @example
   * aria-valuemin = "0"
   */
  props: object;

  /**
   * ARIA state 属性集合
   * @deprecated 已弃用，请将属性直接写在 component 上
   * @example
   * aria-hidden = "true"
   */
  state: object;

  /**
   * 自定义 DOM 属性
   * @deprecated 已弃用，请将属性直接写在 component 上
   */
  attr: object;

  /** 辅助 DOM 元素的唯一 ID，自动生成 */
  @type('string') a11yId: string;

  /**
   * 构造无障碍组件
   *
   * @param param - 无障碍组件配置参数
   * @param param.hint - 屏幕阅读器朗读文本
   * @param param.interactive - 是否可交互，默认 false
   * @param param.role - ARIA 角色属性
   * @param param.event - 关联的事件组件（已弃用）
   * @param param.delay - DOM 延迟加载时间（毫秒）
   * @param param.props - ARIA value 属性（已弃用）
   * @param param.state - ARIA state 属性（已弃用）
   * @param param.attr - 自定义属性（已弃用）
   *
   * @example
   * ```typescript
   * // 简单文本朗读
   * new A11y({ hint: '这是一个图片' })
   *
   * // 可交互按钮
   * new A11y({
   *   hint: '开始游戏',
   *   role: 'button',
   *   interactive: true
   * })
   *
   * // 带 ARIA 属性
   * new A11y({
   *   hint: '进度条',
   *   role: 'progressbar',
   *   'aria-valuemin': '0',
   *   'aria-valuemax': '100',
   *   'aria-valuenow': '50'
   * })
   * ```
   */
  constructor(param: A11yParams) {
    super();
    Object.assign(this, param);
    const { hint = '', event, delay = 0, attr = {}, role = '', props = {}, state = {} } = param;
    this.hint = hint;
    this.event = event;
    this.delay = delay;
    this.attr = attr;
    this.role = role;
    this.props = props;
    this.state = state;
    this.a11yId = `_${uuid(6)}`;
  }
}
