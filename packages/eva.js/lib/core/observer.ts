import { isEqual, isObject } from 'lodash-es';
import Component from './Component';
import System from './System';
import type { SystemConstructor } from './System';
import type { ObserverEvent } from './ComponentObserver';

/** Observer event type */
export enum ObserverType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  CHANGE = 'CHANGE',
}

/**
 * Observer property
 * @remarks
 * If `deep` is true then all descendants of `prop` will be observed
 * @example
 * ```typescript
 * @observerComponent({
 *   Transform: [{ prop: 'size', deep: true }]
 * })
 * class TestSystem extends System {}
 * ```
 */
export interface PureObserverProp {
  deep: boolean;
  prop: string[];
}

/**
 * Observer Info
 * @remarks
 * The key of this map always be component's name, the value of this map is an array of `PureObserverProp`
 */
export type PureObserverInfo = Record<string, PureObserverProp[]>;

type GameObjectId = number; // gameObject.id
type CacheKey = string; // `component.name_${keys.join(',')}`
interface ObservableItem {
  property?: Component;
  key?: string;
}

export default class Observer {

  objectCache: Record<GameObjectId, Record<CacheKey, ObservableItem>> = {};

  systemInstance: Record<string, System> = {};
  observerInfos: Record<string, PureObserverInfo> = {};
  componentProps: Record<string, PureObserverProp[]> = {};

  // code for test
  testUtils = {
    getLocal: undefined,
    clearLocal: undefined,
  };
  getLocal(): Record<string, any> {
    return { systemInstance: this.systemInstance, observerInfos: this.observerInfos, componentProps: this.componentProps, objectCache: this.objectCache };
  }
  clearLocal() {
    for (let key in this.componentProps) {
      delete this.componentProps[key];
    }
    for (let key in this.systemInstance) {
      delete this.systemInstance[key];
    }
    for (let key in this.observerInfos) {
      delete this.observerInfos[key];
    }
    for (let key in this.objectCache) {
      delete this.objectCache[key];
    }
  }
  /* istanbul ignore next */
  if(__TEST__) {
    this.testUtils.getLocal = this.getLocal;
    this.testUtils.clearLocal = this.clearLocal;
  }

  /**
   * Get the `ObjectCache` on `component` access by `keys`
   * @example
   * ```typescript
   * expect(getObjectCache(testComponent, ['style', 'transform', 'scale'])).toMatchObject({
   *   property: { scale: 1.1, rotation: 45 },
   *   key: 'scale'
   * })
   * ```
   * @param {Component} component
   * @param {string[]} keys - access path to properties, such as ['style', 'transform', 'scale', 'x']
   * @returns {ObservableItem}
   */
  getObjectCache(component: Component, keys: string[]): ObservableItem {
    if (!this.objectCache[component.gameObject.id]) {
      this.objectCache[component.gameObject.id] = {};
    }
    const cache = this.objectCache[component.gameObject.id];
    const key = component.name + '_' + keys.join(',');
    if (cache[key]) {
      return cache[key];
    }

    const keyIndex = keys.length - 1;
    let property = component;
    // FIXME: Bug is here, property[keys[i]] maybe undefined
    for (let i = 0; i < keyIndex; i++) {
      property = property[keys[i]];
    }

    cache[key] = { property, key: keys[keyIndex] };
    return cache[key];
  }

  /**
   * Remove property cache by component
   * @remarks
   * The component should added to a gameObject, otherwise there is no gameObject on component
   * @param {Component} component - a component that has been added to gameObject
   */
  removeObjectCache(component: Component) {
    if (component.gameObject) {
      delete this.objectCache[component.gameObject.id];
    }
  }

  /**
   * Add observe event to `componentObserver` on system
   * @param {string} param0.systemName - system name
   * @param {string} param0.componentName - compnent name
   * @param {Component} param0.component - component instance
   * @param {pureObserverProp} param0.prop - pure observer prop
   * @param {ObserverType} param0.type - observer type
   */
  addObserver({ systemName, componentName, component, prop, type }: ObserverEvent) {
    this.systemInstance[systemName]?.componentObserver?.add({
      component,
      prop,
      type,
      componentName,
    });
  }

  pushToQueue({
    prop,
    component,
    componentName,
  }: {
    prop: PureObserverProp;
    component: Component;
    componentName: string;
  }) {
    for (const systemName in this.observerInfos) {
      const observerInfo = this.observerInfos[systemName] || {};
      const info = observerInfo[componentName];
      if (!info) continue;

      const index = info.findIndex(p => {
        return isEqual(p, prop);
      });
      if (index > -1) {
        this.addObserver({
          systemName,
          componentName,
          component,
          prop,
          type: ObserverType.CHANGE,
        });
      }
    }
  }

  /**
   * Define property `key` for obj, make `key` observable
   * @param {Object} param0.obj - object contains the 'key'
   * @param {string} param0.key - the key will be observed
   * @param {PureObserverProp} param0.prop
   * @param {Component} param0.component
   * @param {strng} param0.componentName
   */
  defineProperty({
    obj,
    key,
    prop,
    component,
    componentName,
  }: {
    obj: Record<any, any>;
    key: string;
    prop: PureObserverProp;
    component: Component;
    componentName: string;
  }) {
    if (obj === undefined) {
      return;
    }
    if (!(key in obj)) {
      console.error(`prop ${key} not in component: ${componentName}, Can not observer`);
      return;
    }

    Object.defineProperty(obj, `_${key}`, {
      enumerable: false,
      writable: true,
      value: obj[key],
    });

    if (prop.deep && isObject(obj[key])) {
      for (const childKey of Object.keys(obj[key])) {
        this.defineProperty({
          obj: obj[key],
          key: childKey, // Bug is here
          prop,
          component,
          componentName,
        });
      }
    }
    Object.defineProperty(obj, key, {
      enumerable: true,
      set(val) {
        if (obj[`_${key}`] === val) return;
        obj[`_${key}`] = val;
        this.pushToQueue({ prop, component, componentName });
      },
      get() {
        return obj[`_${key}`];
      },
    });
  }

  /**
   * Return true if parameter is a component
   * @param comp - any thing
   * @returns {bool}
   */
  isComponent(comp): comp is Component {
    return comp && comp.constructor && 'componentName' in comp.constructor;
  }

  /**
   * Collect observerInfo on system
   * @param Systems - array of system or just a system
   */
  initObserver(Systems: SystemConstructor[] | SystemConstructor) {
    const Ss = [];
    if (Systems instanceof Array) {
      Ss.push(...Systems);
    } else {
      Ss.push(Systems);
    }
    for (const S of Ss) {
      for (const componentName in S.observerInfo) {
        this.componentProps[componentName] = this.componentProps[componentName] || [];
        const props = this.componentProps[componentName];
        for (const prop of S.observerInfo[componentName]) {
          const index = props.findIndex(p => {
            return isEqual(p, prop);
          });
          if (index === -1) {
            this.componentProps[componentName].push(prop);
          }
        }
      }
    }
  }

  /**
   * Make component observerable
   * @remarks
   * Throw an error if component not added to a gameObject
   * @param {Component} component
   * @param {string} componentName - default value is `component.name`, it will be deprecated
   */
  observer(component: Component, componentName: string = component.name) {
    if (!componentName || !this.componentProps[componentName]) {
      return;
    }

    if (!component || !this.isComponent(component)) {
      throw new Error('component param must be an instance of Component');
    }

    if (!component.gameObject || !component.gameObject.id) {
      throw new Error('component should be add to a gameObject');
    }

    for (const item of this.componentProps[componentName]) {
      const { property, key } = this.getObjectCache(component, item.prop);
      this.defineProperty({
        obj: property,
        key,
        prop: item,
        component,
        componentName,
      });
    }
  }

  /**
   * Push a `Add` event to componentObserver
   * @param component
   * @param componentName - default value is `component.name`, it will be deprecated
   */
  observerAdded(component: Component, componentName: string = component.name) {
    for (const systemName in this.observerInfos) {
      const observerInfo = this.observerInfos[systemName] || {};
      const info = observerInfo[componentName];
      if (info) {
        this.systemInstance[systemName]?.componentObserver?.add({
          component,
          type: ObserverType.ADD,
          componentName,
        });
      }
    }
  }

  /**
   * Push a `Remove` event to componentObserver
   * @param component
   * @param componentName - default value is `component.name`, it will be deprecated
   */
  observerRemoved(component: Component, componentName: string = component.name) {
    for (const systemName in this.observerInfos) {
      const observerInfo = this.observerInfos[systemName] || {};
      const info = observerInfo[componentName];
      if (info) {
        this.systemInstance[systemName]?.componentObserver?.add({
          component,
          type: ObserverType.REMOVE,
          componentName,
        });
      }
    }
    this.removeObjectCache(component);
  }

  /**
   * Collect observerInfo from system
   * @param system - system instance
   * @param S - system constructor
   */
  setSystemObserver(system: System, S: SystemConstructor) {
    this.observerInfos[S.systemName] = S.observerInfo;
    this.systemInstance[S.systemName] = system;
  }

}
