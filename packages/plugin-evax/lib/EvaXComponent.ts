import { Component } from '@eva/eva.js';
import EvaXSystem from './EvaXSystem';

interface Events {
  [propName: string]: Function & {
    deep: boolean;
    handler: Function;
  };
}

export interface EvaXParams {
  events: Events;
}

/**
 * EvaX 状态管理组件
 *
 * EvaXComponent 为游戏对象提供响应式状态管理能力，类似于前端框架的状态订阅机制。
 * 通过监听全局 store 的变化，自动触发组件的回调函数，实现数据驱动的游戏逻辑。
 *
 * 主要功能：
 * - 订阅全局 store 的属性变化
 * - 支持深度监听（deep watch）
 * - 自动绑定和解绑事件监听
 * - 提供响应式数据更新机制
 *
 * @example
 * ```typescript
 * const player = new GameObject('player');
 * player.addComponent(new EvaXComponent({
 *   events: {
 *     'store.playerHealth': function(newStore, oldStore) {
 *       // 当 playerHealth 改变时触发
 *       console.log('血量变化:', oldStore.playerHealth, '->', newStore.playerHealth);
 *     },
 *     'store.position': {
 *       deep: true, // 深度监听
 *       handler: function(newStore, oldStore) {
 *         this.gameObject.transform.position = newStore.position;
 *       }
 *     }
 *   }
 * }));
 * ```
 */
export default class EvaXComponent extends Component<EvaXParams> {
  /** 组件名称 */
  static componentName: string = 'EvaX';

  /**
   * 构造 EvaX 组件
   * @param gameObject - 所属的游戏对象
   */
  constructor(gameObject) {
    super(gameObject);
  }

  /** EvaX 系统实例的引用 */
  evax: EvaXSystem;

  /** 事件监听配置对象，key 为 store 路径，value 为回调函数 */
  // @decorators.IDEProp 复杂编辑后续添加
  events: Events = {};

  /**
   * 初始化组件
   *
   * 配置组件需要监听的 store 属性和对应的回调函数。
   *
   * @param option - 初始化配置
   * @param option.events - 事件监听配置对象
   */
  init(option: EvaXParams = { events: {} }) {
    const { events } = option;
    this.events = events || {};
  }
}
