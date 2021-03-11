import {Transform} from '../lib';
import ComponentObserver from '../lib/core/ComponentObserver';
import {ObserverType} from '../lib/core/observer';

describe('componentObserver', () => {
  let co: ComponentObserver;
  beforeEach(() => {
    co = new ComponentObserver();
  });
  it('make componentObserver', () => {
    expect(co.getChanged().length).toBe(0);
  });

  it('add change event', () => {
    co.add({
      component: new Transform(),
      prop: {prop: ['size'], deep: false},
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
    expect(co.getChanged().length).toBe(1);
  });

  it('add same change event twice', () => {
    const transform1 = new Transform();
    const prop = {prop: ['size'], deep: false};
    co.add({
      prop,
      component: transform1,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
    const transform2 = new Transform();
    co.add({
      prop,
      component: transform2,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
    co.add({
      prop,
      component: transform1,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
    expect(co.getChanged().length).toBe(2);
  });

  it('should remove change event', () => {
    const transform1 = new Transform();
    const prop = {prop: ['size'], deep: false};
    co.add({
      prop,
      component: transform1,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
    const transform2 = new Transform();
    co.add({
      prop,
      component: transform2,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });

    expect(co.getChanged().length).toBe(2);

    co.add({
      prop,
      component: transform2,
      type: ObserverType.REMOVE,
      componentName: Transform.componentName,
    });

    expect(co.getChanged().length).toBe(2);
    expect(co.getChanged()[0]).toMatchObject({
      prop,
      gameObject: undefined,
      component: transform1,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });
  });

  it('should clear change events', () => {
    const transform1 = new Transform();
    const prop = {prop: ['size'], deep: false};
    co.add({
      prop,
      component: transform1,
      type: ObserverType.ADD,
      componentName: Transform.componentName,
    });

    expect(co.getChanged().length).toBe(1);

    co.clear();

    expect(co.getChanged().length).toBe(0);
  });

  afterEach(() => {
    co = null;
  });
});
