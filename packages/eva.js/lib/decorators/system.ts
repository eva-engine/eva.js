import { PureObserverInfo } from '../core/observer';

type observableKeys = string | string[];

interface ObserverProp {
  deep: boolean;
  prop: observableKeys;
}

type ObserverValue = observableKeys | ObserverProp;

type ComponentName = string;

/**
 * Normailized observer info
 * @example
 * ```typescript
 * {
 *   Transform: [{ prop: ['size'], deep: false }],
 *   OtherComponent: [{ prop: ['style', 'transform'], deep: true }]
 * }
 * ```
 */
export type ObserverInfo = Record<ComponentName, ObserverValue[]>;

/**
 * Normailize system observer info
 * @param obj - system observer info
 */
export function componentObserver(observerInfo: ObserverInfo = {}) {
  return function (constructor) {
    if (!constructor.observerInfo) {
      for (const key in observerInfo) {
        for (const index in observerInfo[key]) {
          if (typeof observerInfo[key][index] === 'string') {
            observerInfo[key][index] = [observerInfo[key][index]] as string[];
          }
          let observerProp: ObserverProp;
          if (Array.isArray(observerInfo[key][index])) {
            observerProp = {
              prop: observerInfo[key][index] as string[],
              deep: false,
            };
            observerInfo[key][index] = observerProp;
          }
          observerProp = observerInfo[key][index] as ObserverProp;
          if (typeof observerProp.prop === 'string') {
            observerProp.prop = [observerProp.prop];
          }
        }
      }
      constructor.observerInfo = observerInfo as PureObserverInfo;
    }
  };
}
