import { System, decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import EventEmitter from 'eventemitter3';
import EvaXComponent from './EvaXComponent';
import { defineProperty, updateStore } from './utils';

export interface EvaXSystemParams {
  store: {
    [key: string]: any;
  };
}

/**
 * EvaX 状态管理系统
 *
 * EvaXSystem 提供全局状态管理和响应式数据绑定功能，类似于 Vuex 或 Redux。
 * 它维护一个全局 store，并在 store 属性变化时通知订阅的组件。
 * 通过 Object.defineProperty 实现数据劫持，自动追踪依赖和触发更新。
 *
 * 核心特性：
 * - 全局状态 store 管理
 * - 响应式数据绑定（基于 Object.defineProperty）
 * - 支持深度监听对象嵌套属性
 * - 事件驱动的更新机制
 * - 批量更新优化（在 lateUpdate 中统一触发）
 *
 * @example
 * ```typescript
 * // 初始化系统并设置初始 store
 * const evaxSystem = new EvaXSystem();
 * game.addSystem(evaxSystem);
 * evaxSystem.init({
 *   store: {
 *     playerHealth: 100,
 *     score: 0,
 *     position: { x: 0, y: 0 }
 *   }
 * });
 *
 * // 在游戏逻辑中更新 store
 * evaxSystem.store.playerHealth -= 10; // 自动触发订阅者
 *
 * // 手动更新 store（会合并数据）
 * evaxSystem.updateStore({ score: 100 });
 *
 * // 强制更新 store（会完全替换）
 * evaxSystem.forceUpdateStore({ playerHealth: 100 });
 *
 * // 通过事件总线通信
 * evaxSystem.on('gameOver', () => {
 *   console.log('游戏结束');
 * });
 * evaxSystem.emit('gameOver');
 * ```
 */
@decorators.componentObserver({
  EvaX: [],
})
export default class EvaXSystem extends System<EvaXSystemParams> {
  /** 系统名称 */
  static systemName = 'EvaX';

  /** 全局状态 store 对象 */
  public store: any;

  /** 内部事件发射器，用于事件通信 */
  private ee: EventEmitter;

  /** 当前帧的 store 变化列表，在 lateUpdate 中批量处理 */
  changeList: { key: string; oldStore: any }[] = [];

  /**
   * 初始化系统
   *
   * 设置全局 store 并绑定默认的事件监听器。
   *
   * @param params - 初始化参数
   * @param params.store - 初始的全局状态对象
   */
  init({ store = {} } = { store: {} }) {
    this.ee = new EventEmitter();
    this.store = store;
    this.bindDefaultListener();
  }
  bindDefaultListener() {
    this.ee.on('evax.updateStore', store => {
      this.updateStore(store);
    });
    this.ee.on('evax.forceUpdateStore', store => {
      this.forceUpdateStore(store);
    });
  }
  changeCallback(key, oldStore) {
    this.changeList.push({
      key: key as string,
      oldStore: oldStore as any,
    });
  }
  updateStore(store) {
    updateStore(this.store, store, false);
  }
  forceUpdateStore(store) {
    updateStore(this.store, store, true);
  }
  bindListener(key, deep) {
    if (key.indexOf('store.') === -1) {
      return;
    }
    const realKey = key.split('.').slice(1).join('.');
    defineProperty(realKey, deep, this.store, key, this.store, (key, oldStore) => this.changeCallback(key, oldStore));
  }
  update() {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      switch (changed.type) {
        case OBSERVER_TYPE.ADD:
          this.add(changed);
          break;
        // case OBSERVER_TYPE.CHANGE:
        //   this.change(changed)
        //   break;
        case OBSERVER_TYPE.REMOVE:
          this.remove(changed);
          break;
      }
    }
  }
  lateUpdate() {
    for (const item of this.changeList) {
      this.ee.emit(item.key, this.store, item.oldStore);
    }
    this.changeList = [];
  }
  add(changed: ComponentChanged) {
    const component = changed.component as EvaXComponent;
    component.evax = this;
    for (const key in component.events) {
      if (component.events[key]) {
        this.bindListener(key, !!component.events[key].deep);
        let func;
        if (component.events[key] instanceof Function) {
          func = component.events[key];
        } else {
          func = component.events[key].handler;
        }
        this.ee.on(key, func.bind(component));
      }
    }
  }
  remove(changed: ComponentChanged) {
    const component = changed.component as EvaXComponent;
    for (const key in component.events) {
      if (component.events[key] instanceof Function) {
        this.ee.off(key, component.events[key].bind(component));
      }
    }
  }
  on(eventName, func) {
    return this.ee.on(eventName, func, this);
  }
  off(eventName, func) {
    return this.ee.off(eventName, func);
  }
  emit(eventName, ...args) {
    return this.ee.emit(eventName, ...args);
  }
  onDestroy() {}
}
