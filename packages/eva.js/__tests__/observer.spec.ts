import { TestSystem, TestComponent } from '@eva/plugin-renderer-test';
import Component from '../lib/core/Component';
import { GameObject, Transform } from '../lib';
import {
  initObserver,
  setSystemObserver,
  testUtils,
  observer,
  observerAdded,
  observerRemoved,
  ObserverType,
} from '../lib/core/observer';

const changed = [];
jest.mock('../lib/core/ComponentObserver', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn((params: any) => changed.push(params)),
    clear: jest.fn(() => (changed.length = 0)),
    getChanged: jest.fn(() => changed),
  }));
});

describe('observer', () => {
  let system: TestSystem;
  beforeEach(() => {
    initObserver(TestSystem);
    system = new TestSystem();
    setSystemObserver(system, TestSystem);
  });

  it('initObserver successfully', () => {
    initObserver([TestSystem]);

    const { componentProps, systemInstance, observerInfos } = testUtils.getLocal();

    const observerKeyCount = Object.keys(TestSystem.observerInfo['Test']).length;
    expect(componentProps['Test'].length).toBe(observerKeyCount);
    expect(systemInstance['Test']).toStrictEqual(system);
    expect(observerInfos['Test']).toStrictEqual(TestSystem.observerInfo);
    expect(system.componentObserver.getChanged().length).toBe(0);
  });

  it('make component observable', () => {
    const testComp = new TestComponent();
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(testComp);

    observer(testComp, testComp.name);

    expect(testComp['_size']).toEqual([10, 10]);
    expect(testComp['_style']).toMatchObject({ color: 'rgba(255, 255, 255)' });
    expect(system.componentObserver.add).toHaveBeenCalledTimes(1);

    const size = [20, 20];
    testComp.size = size;
    expect(system.componentObserver.add).toHaveBeenCalledTimes(2);
    expect(system.componentObserver.add).toHaveBeenLastCalledWith({
      component: testComp,
      prop: {
        deep: false,
        prop: ['size'],
      },
      type: ObserverType.CHANGE,
      componentName: TestComponent.componentName,
    });

    testComp.size = size;
    expect(system.componentObserver.add).toHaveBeenCalledTimes(2);
  });

  it('change Sysntem observerInfo at runtime', () => {
    const testComp = new TestComponent();
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(testComp);

    TestSystem.observerInfo['Test'].push({ prop: ['transform'], deep: false });
    initObserver(TestSystem);
    observer(testComp, testComp.name);

    const { componentProps } = testUtils.getLocal();
    expect(componentProps['Test']).toContainEqual({
      prop: ['transform'],
      deep: false,
    });

    TestSystem.observerInfo['Test'].pop();
  });

  it('should throw error when component is null', () => {
    expect(() => {
      observer(null, TestComponent.componentName);
    }).toThrow('component param must be an instance of Component');
  });

  it('should throw error when component is undefined', () => {
    expect(() => {
      observer(undefined, TestComponent.componentName);
    }).toThrow('component param must be an instance of Component');
  });

  it('should throw error when component not instanceof Component', () => {
    const comp: any = { name: 'Test', size: [15, 15] };
    expect(() => {
      observer(comp);
    }).toThrow('component param must be an instance of Component');
  });

  it('component not used by gameObject', () => {
    const testComp = new TestComponent();
    expect(() => {
      observer(testComp);
    }).toThrow('component should be add to a gameObject');
  });

  it('componentName is empty', () => {
    const testComp = new TestComponent();
    observer(testComp, '');
    expect(testComp['_size']).toBeUndefined();
    expect(testComp['_style']).toBeUndefined();
  });

  it('the component represented by componentName does not exist', () => {
    const testComp = new TestComponent();
    observer(testComp, 'any');
    expect(testComp['_size']).toBeUndefined();
  });

  it.skip('the component represented by componentName not same as component', () => {
    const gameObj = new GameObject('gameObj');
    expect(() => {
      observer(gameObj.transform, TestComponent.componentName);
    }).not.toThrow(/^Cannot read property '\w+' of undefined$/);
  });

  describe('observerAdd', () => {
    it('trigger add event when component is observered', () => {
      const testComp = new TestComponent();
      observerAdded(testComp, TestComponent.componentName);

      expect(system.componentObserver.add).toBeCalledTimes(1);
      expect(system.componentObserver.add).toHaveBeenLastCalledWith({
        component: testComp,
        type: ObserverType.ADD,
        componentName: TestComponent.componentName,
      });
    });

    it('componentName is empty', () => {
      const testComp = new TestComponent();
      observerAdded(testComp, '');
      expect(system.componentObserver.add).not.toBeCalled();
    });

    it('the component represented by the componentName not exist', () => {
      const testComp = new TestComponent();
      observerAdded(testComp, 'Geometry'); // Geometry component is not exist
      expect(system.componentObserver.add).not.toBeCalled();
    });

    it('the component represented by the componentName not same as the component', () => {
      const testComp = new TestComponent();
      observerAdded(testComp, Transform.componentName);
      expect(system.componentObserver.add).not.toBeCalled();
    });
  });

  describe('observerRemoved', () => {
    it('trigger remove event when component observer removed', () => {
      const gameObj = new GameObject('gameObj');
      const testComp = new TestComponent();
      gameObj.addComponent(testComp);

      const { objectCache } = testUtils.getLocal();
      expect(objectCache[gameObj.id]).toHaveProperty('Test_size');
      expect(objectCache[gameObj.id]).toHaveProperty('Test_style');
      expect(objectCache[gameObj.id]).toHaveProperty('Test_geomerty,data,vertex');

      observerRemoved(testComp);
      expect(objectCache[gameObj.id]).toBeUndefined();

      expect(system.componentObserver.add).toBeCalledTimes(2);
      expect(system.componentObserver.add).toHaveBeenCalledWith({
        component: testComp,
        type: ObserverType.REMOVE,
        componentName: TestComponent.componentName,
      });
    });
    it('observer add component is null', () => {
      expect(() => {
        observerRemoved(null, TestComponent.componentName);
      }).toThrow();
    });

    it('component is undefined', () => {
      expect(() => {
        observerRemoved(undefined, TestComponent.componentName);
      }).toThrow();
    });

    it('componentName is empty', () => {
      const gameObj = new GameObject('gameObj');
      const testComp = new TestComponent();
      gameObj.addComponent(testComp);

      observerRemoved(testComp, '');

      expect(system.componentObserver.add).toHaveBeenCalledTimes(1);
      expect(system.componentObserver.add).toHaveBeenLastCalledWith({
        component: testComp,
        type: ObserverType.ADD,
        componentName: TestComponent.componentName,
      });
    });

    it('the component represented by the componentName not exist', () => {
      const gameObj = new GameObject('gameObj');
      const testComp = new TestComponent();
      gameObj.addComponent(testComp);

      observerRemoved(testComp, 'Geometry');

      expect(system.componentObserver.add).toHaveBeenCalledTimes(1);
      expect(system.componentObserver.add).toHaveBeenCalledWith({
        component: testComp,
        type: ObserverType.ADD,
        componentName: TestComponent.componentName,
      });
    });

    it('the component represented by the componentName not same as the component', () => {
      const gameObj = new GameObject('gameObj');
      const testComp = new TestComponent();

      gameObj.addComponent(testComp);
      observerRemoved(testComp, Transform.componentName);

      expect(system.componentObserver.add).toHaveBeenCalledTimes(1);
      expect(system.componentObserver.add).toHaveBeenLastCalledWith({
        component: testComp,
        type: ObserverType.ADD,
        componentName: testComp.name,
      });
    });
  });

  afterEach(() => {
    system.componentObserver.clear();
    system.destroy();
    testUtils.clearLocal();
  });
});

describe('observer inheritance fallback', () => {
  // BehaviorScript needs one observer authored against the base class to cover
  // every synthetic subclass. This is the regression net for that contract.
  // A base class without a hard-coded `readonly name` (TestComponent has one,
  // so it can't model the BehaviorScript subclass story).
  class BaseHost extends Component {
    static componentName = 'BaseHost';
    size = [10, 10];
  }
  class SyntheticChild extends BaseHost {
    static componentName = 'SyntheticChild';
  }
  class BaseHostSystem {
    static systemName = 'BaseHostSystem';
    static observerInfo = {
      BaseHost: [{ prop: ['size'], deep: false }],
    };
    componentObserver = {
      add: jest.fn(),
      clear: jest.fn(),
      getChanged: jest.fn(),
    };
    destroy() {}
  }

  let system: BaseHostSystem;
  beforeEach(() => {
    initObserver(BaseHostSystem as any);
    system = new BaseHostSystem();
    setSystemObserver(system as any, BaseHostSystem as any);
  });
  afterEach(() => {
    testUtils.clearLocal();
  });

  it('observerAdded on a subclass instance fires the base observer', () => {
    const child = new SyntheticChild();
    expect(child.name).toBe('SyntheticChild');
    observerAdded(child);
    expect(system.componentObserver.add).toBeCalledTimes(1);
    expect(system.componentObserver.add).toHaveBeenLastCalledWith({
      component: child,
      type: ObserverType.ADD,
      componentName: 'SyntheticChild',
    });
  });

  it('observer() on a subclass picks up base-class observed props', () => {
    const child = new SyntheticChild();
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(child);
    observer(child);
    expect(child['_size']).toEqual([10, 10]);
    // Mutating the subclass's `size` fires the base-class CHANGE observer.
    child.size = [20, 20];
    expect(system.componentObserver.add).toHaveBeenCalled();
  });

  it('explicit unrelated componentName still suppresses the fire', () => {
    const child = new SyntheticChild();
    observerAdded(child, 'Geometry');
    expect(system.componentObserver.add).not.toBeCalled();
  });

  it('observerRemoved on a subclass instance fires the base observer', () => {
    const child = new SyntheticChild();
    observerRemoved(child);
    expect(system.componentObserver.add).toBeCalledTimes(1);
    expect(system.componentObserver.add).toHaveBeenLastCalledWith({
      component: child,
      type: ObserverType.REMOVE,
      componentName: 'SyntheticChild',
    });
  });
});
