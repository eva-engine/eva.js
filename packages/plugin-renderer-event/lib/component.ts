import { Component } from '@eva/eva.js';
import type { GameObject } from "@eva/eva.js";

export enum HIT_AREA_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Polygon = 'Polygon',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
}

interface HitArea {
  type: HIT_AREA_TYPE;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
}

export interface EventParams {
  hitArea: HitArea;
}

type TouchEventName = 'touchstart' | 'touchmove' | 'touchend' | 'tap' | 'touchendoutside' | 'touchcancel';
type EventParam = {
  stopPropagation: () => void,
  data: {
    pointerId: number,
    position: {
      x: number,
      y: number,
    },
    /**
     * The position related to event target gameobject
     */
    localPosition: {
      x: number,
      y: number
    }
  },
  gameObject: GameObject,
}

export default class Event extends Component<EventParams> {
  static componentName = 'Event';
  hitArea: HitArea = undefined;
  init(params?: EventParams) {
    params && Object.assign(this, params);
  }

  emit(eventName: TouchEventName, ...args: [EventParam]): boolean
  emit<T extends string>(eventName: Exclude<T, TouchEventName>, ...args: any[]): boolean
  emit(en: string, ...args: any[]) {
    return super.emit(en, ...args);
  }

  once(eventName: TouchEventName, fn: (arg: EventParam) => void, context?: any): this
  once<T extends string>(eventName: Exclude<T, TouchEventName>, fn: (...args: any[]) => void, context?: any): this
  once(en: string, fn: (...args: any[]) => void, context?: any) {
    return super.once(en, fn, context);
  }

  on(eventName: TouchEventName, fn: (arg: EventParam) => void, context?: any): this
  on<T extends string>(eventName: Exclude<T, TouchEventName>, fn: (...args: any[]) => void, context?: any): this
  on(en: string, fn: (...args: any[]) => void, context?: any) {
    return super.on(en, fn, context);
  }

}
