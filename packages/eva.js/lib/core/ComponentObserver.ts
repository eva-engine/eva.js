import { isEqual } from 'lodash-es';
import GameObject from './GameObject';
import Component from './Component';
import { PureObserverProp, ObserverType } from './observer';

export interface ObserverEventParams {
  type: ObserverType;
  component: Component;
  componentName: string;
  prop?: PureObserverProp;
}

export interface ObserverEvent extends ObserverEventParams {
  gameObject?: GameObject;
  systemName?: string;
}

/**
 * 组件观察者，管理组件属性变化事件
 *
 * 用于收集和管理组件属性的变化事件，供系统订阅和响应。
 * 系统可以通过 ComponentObserver 获取组件的变化记录，
 * 实现数据驱动的更新机制。
 *
 * @see {@link System}
 */
class ComponentObserver {
  /**
   * 组件属性变化事件列表
   * @defaultValue []
   */
  private events: ObserverEvent[] = [];

  /**
   * 添加组件变化事件
   *
   * 将组件的属性变化记录到事件列表中。
   * 相同的事件会被移动到列表末尾，避免重复记录。
   *
   * @param component - 发生变化的组件
   * @param prop - 组件上变化的属性
   * @param type - 变化事件类型（添加、移除、修改等）
   * @param componentName - 组件名称（该参数将被废弃）
   */
  add({ component, prop, type, componentName }: ObserverEventParams) {
    if (type === ObserverType.REMOVE) {
      if (
        this.events.find(
          (changed: ObserverEvent) => changed.component === component && changed.type === ObserverType.ADD,
        )
      ) {
        this.events = this.events.filter(changed => changed.component !== component);
        return;
      }
      this.events = this.events.filter(changed => changed.component !== component);
    }

    const index = this.events.findIndex(
      changed => changed.component === component && isEqual(changed.prop, prop) && changed.type === type,
    );
    if (index > -1) {
      this.events.splice(index, 1);
    }

    this.events.push({
      gameObject: component.gameObject,
      component,
      prop: prop,
      type,
      componentName,
    });
  }

  /**
   * 获取变化事件列表
   * @returns 所有记录的变化事件
   */
  getChanged() {
    return this.events;
  }

  /**
   * 获取变化事件列表（只读属性）
   * @returns 所有记录的变化事件
   */
  get changed() {
    return this.events;
  }

  /**
   * 清空并返回所有变化事件
   *
   * 获取当前记录的所有事件，然后清空事件列表。
   * 通常在系统处理完变化事件后调用。
   *
   * @returns 清空前的所有变化事件
   */
  clear() {
    const events = this.events;
    this.events = [];
    return events;
  }
}

export default ComponentObserver;
