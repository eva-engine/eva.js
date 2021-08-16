import {Component} from '@eva/eva.js';
import {type, step} from '@eva/inspector-decorator';
import {uuid} from './utils';

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

export default class A11y extends Component<A11yParams> {
  static componentName: string = 'A11y';

  /**
   * 是否可交互
   */
  @type('boolean') interactive: boolean;
  /**
   * 无障碍标签朗读内容
   */
  @type('string') hint: string;
  /**
   * 弃用，将根据Event组件自动添加
   * 事件对象
   */
  event: Component;
  /**
   * 延时加载时间（millisecond）
   */
  @type('number') @step(1) delay: number;

  /**
   * role 属性
   */
  @type('string') role: string;

  /**
   * 弃用，将属性写在component上
   * aria-value 属性
   * @example
   * aria-valuemin = "0"
   */
  props: object;

  /**
   * 弃用，将属性写在component上
   * aria state 属性
   * @example
   * aria-hidden = "true"
   */
  state: object;

  /**
   * 弃用，将属性写在component上
   * 传入自定义属性
   */
  attr: object;

  /**
   * 辅助Dom id 自动生成
   */
  @type('string') a11yId: string;

  /**
   * 无障碍组件构造函数
   * @param param interactive 默认为 false，如果游戏对象可交互，传入 true
   * @example
   * // 为游戏对象提供朗读能力
   * new A11y({hint: '这是一个div'})
   * // 游戏对象有事件，传入 event 对象
   * new A11y({hint: '点击事件对象', event: event})
   * // 无障碍属性
   * new A11y({hint:'按钮', role: 'button', state: {aria-hidden="true"}})
   * // 自定义属性
   * new A11y({hint: '自定义属性', attr: {key: '1'}})
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
