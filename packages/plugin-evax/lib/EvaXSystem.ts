import { System, decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import EventEmitter from 'eventemitter3';
import EvaXComponent from './EvaXComponent';
import { defineProperty, updateStore } from './utils';

export interface EvaXSystemParams {
  store: {
    [key: string]: any
  }
}

@decorators.componentObserver({
  EvaX: [],
})
export default class EvaXSystem extends System<EvaXSystemParams> {
  static systemName = 'EvaX';
  public store: any;
  private ee: EventEmitter;
  changeList: { key: string; oldStore: any }[] = [];

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
  onDestroy() { }
}
