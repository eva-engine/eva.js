import { TestSystem, TestComponent } from '@eva/plugin-renderer-test';
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
      }).toThrow("Cannot read property 'gameObject' of null");
    });

    it('component is undefined', () => {
      expect(() => {
        observerRemoved(undefined, TestComponent.componentName);
      }).toThrow("Cannot read property 'gameObject' of undefined");
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
