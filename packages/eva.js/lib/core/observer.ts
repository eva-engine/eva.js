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
 * Resolve every observer-table key a Component instance could match.
 *
 * Today's behaviour: a single `componentName` is compared against the keys
 * declared on `@componentObserver({...})`. That fails for plugin-behavior-script's
 * "one BehaviorScript host, N synthetic subclasses (cannon.controller, NianMover,
 * …)" pattern — the synthetic subclass's `componentName` is the scriptId, but
 * the observer was authored against the base `BehaviorScript` class.
 *
 * Fix without breaking the API: when the caller leaves `componentName` at its
 * default (= `component.name`), walk the instance's prototype chain and collect
 * every ancestor's static `componentName` so the lookup can fall back to a
 * base-class entry. When the caller passes an explicit string that does not
 * match `component.name`, we honour that string strictly (a deliberate override
 * — see observer.spec.ts cases like `observerAdded(testComp, 'Transform')`).
 */
function collectObserverLookupKeys(component: Component, componentName: string): string[] {
  const keys: string[] = [];
  if (componentName) keys.push(componentName);
  // Only expand to the inheritance chain when the caller didn't pass an
  // explicit override (i.e. the name still matches the instance's own name).
  const ownName = component && typeof (component as any).name === 'string' ? (component as any).name : undefined;
  if (!componentName || componentName === ownName) {
    let ctor: any = component?.constructor;
    // Skip the leaf class — it's already represented by `componentName`.
    if (ctor) ctor = Object.getPrototypeOf(ctor);
    while (ctor && ctor !== Function.prototype) {
      const ctorName = ctor.componentName;
      if (typeof ctorName === 'string' && ctorName && !keys.includes(ctorName)) {
        keys.push(ctorName);
      }
      ctor = Object.getPrototypeOf(ctor);
    }
  }
  return keys;
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
const objectCache: Record<GameObjectId, Record<CacheKey, ObservableItem>> = {};

const systemInstance: Record<string, System> = {};
const observerInfos: Record<string, PureObserverInfo> = {};
const componentProps: Record<string, PureObserverProp[]> = {};

// code for test
export const testUtils = {
  getLocal: undefined,
  clearLocal: undefined,
};
function getLocal(): Record<string, any> {
  return { systemInstance, observerInfos, componentProps, objectCache };
}
function clearLocal() {
  for (let key in componentProps) {
    delete componentProps[key];
  }
  for (let key in systemInstance) {
    delete systemInstance[key];
  }
  for (let key in observerInfos) {
    delete observerInfos[key];
  }
  for (let key in objectCache) {
    delete objectCache[key];
  }
}
/* istanbul ignore next */
if (typeof __TEST__ !== 'undefined') {
  testUtils.getLocal = getLocal;
  testUtils.clearLocal = clearLocal;
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
function getObjectCache(component: Component, keys: string[]): ObservableItem {
  if (!objectCache[component.gameObject.id]) {
    objectCache[component.gameObject.id] = {};
  }
  const cache = objectCache[component.gameObject.id];
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
function removeObjectCache(component: Component) {
  if (component.gameObject) {
    delete objectCache[component.gameObject.id];
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
function addObserver({ systemName, componentName, component, prop, type }: ObserverEvent) {
  systemInstance[systemName]?.componentObserver?.add({
    component,
    prop,
    type,
    componentName,
  });
}

function pushToQueue({
  prop,
  component,
  componentName,
}: {
  prop: PureObserverProp;
  component: Component;
  componentName: string;
}) {
  const lookupKeys = collectObserverLookupKeys(component, componentName);
  for (const systemName in observerInfos) {
    const observerInfo = observerInfos[systemName] || {};
    let info: PureObserverProp[] | undefined;
    for (const key of lookupKeys) {
      if (observerInfo[key]) { info = observerInfo[key]; break; }
    }
    if (!info) continue;

    const index = info.findIndex(p => {
      return isEqual(p, prop);
    });
    if (index > -1) {
      addObserver({
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
function defineProperty({
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
      defineProperty({
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
      pushToQueue({ prop, component, componentName });
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
function isComponent(comp): comp is Component {
  return comp && comp.constructor && 'componentName' in comp.constructor;
}

/**
 * Collect observerInfo on system
 * @param Systems - array of system or just a system
 */
export function initObserver(Systems: SystemConstructor[] | SystemConstructor) {
  const Ss = [];
  if (Systems instanceof Array) {
    Ss.push(...Systems);
  } else {
    Ss.push(Systems);
  }
  for (const S of Ss) {
    for (const componentName in S.observerInfo) {
      componentProps[componentName] = componentProps[componentName] || [];
      const props = componentProps[componentName];
      for (const prop of S.observerInfo[componentName]) {
        const index = props.findIndex(p => {
          return isEqual(p, prop);
        });
        if (index === -1) {
          componentProps[componentName].push(prop);
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
export function observer(component: Component, componentName: string = component.name) {
  const lookupKeys = collectObserverLookupKeys(component, componentName);
  let resolvedName = '';
  let propsList: PureObserverProp[] | undefined;
  for (const key of lookupKeys) {
    if (componentProps[key]) { resolvedName = key; propsList = componentProps[key]; break; }
  }
  if (!propsList) {
    return;
  }

  if (!component || !isComponent(component)) {
    throw new Error('component param must be an instance of Component');
  }

  if (!component.gameObject || !component.gameObject.id) {
    throw new Error('component should be add to a gameObject');
  }

  for (const item of propsList) {
    const { property, key } = getObjectCache(component, item.prop);
    defineProperty({
      obj: property,
      key,
      prop: item,
      component,
      componentName: resolvedName,
    });
  }
}

/**
 * Push a `Add` event to componentObserver
 * @param component
 * @param componentName - default value is `component.name`, it will be deprecated
 */
export function observerAdded(component: Component, componentName: string = component.name) {
  const lookupKeys = collectObserverLookupKeys(component, componentName);
  for (const systemName in observerInfos) {
    const observerInfo = observerInfos[systemName] || {};
    let hit = false;
    for (const key of lookupKeys) {
      if (observerInfo[key]) { hit = true; break; }
    }
    if (hit) {
      systemInstance[systemName]?.componentObserver?.add({
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
export function observerRemoved(component: Component, componentName: string = component.name) {
  const lookupKeys = collectObserverLookupKeys(component, componentName);
  for (const systemName in observerInfos) {
    const observerInfo = observerInfos[systemName] || {};
    let hit = false;
    for (const key of lookupKeys) {
      if (observerInfo[key]) { hit = true; break; }
    }
    if (hit) {
      systemInstance[systemName]?.componentObserver?.add({
        component,
        type: ObserverType.REMOVE,
        componentName,
      });
    }
  }
  removeObjectCache(component);
}

/**
 * Collect observerInfo from system
 * @param system - system instance
 * @param S - system constructor
 */
export function setSystemObserver(system: System, S: SystemConstructor) {
  observerInfos[S.systemName] = S.observerInfo;
  systemInstance[S.systemName] = system;
}
