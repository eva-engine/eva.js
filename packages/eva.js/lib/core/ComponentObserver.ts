import isEqual from 'lodash-es/isEqual';
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
 * Management observe events
 * @remarks
 * See {@link System} for more details
 * @public
 */
class ComponentObserver {
  /**
   * Component property change events
   * @defaultValue []
   */
  private events: ObserverEvent[] = [];

  /**
   * Add event
   * @remarks
   * The same event will be placed last
   * @param component - changed component
   * @param prop - changed property on `component`
   * @param type - change event type
   * @param componentName - `component.name` this parameter will deprecated
   */
  add({ component, prop, type, componentName }: ObserverEventParams) {
    if (type === ObserverType.REMOVE) {
      this.events = this.events.filter(
        changed => changed.component !== component,
      );
    }

    const index = this.events.findIndex(
      changed =>
        changed.component === component &&
        isEqual(changed.prop, prop) &&
        changed.type === type,
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

  /** Return change events */
  getChanged() {
    return this.events;
  }

  /**
   * Return change events
   * @readonly
   */
  get changed() {
    return this.events;
  }

  /** Clear events */
  clear() {
    const events = this.events;
    this.events = [];
    return events;
  }
}

export default ComponentObserver;
