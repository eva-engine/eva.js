import { GameObject, Transform, Component, Scene } from '../lib';
import { TestComponent } from '../../plugin-renderer-test';

describe('GameObject', () => {
  it('create game object with name', () => {
    const gameObj = new GameObject('gameObj');
    expect(gameObj.name).toBe('gameObj');
    expect(gameObj.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    expect(gameObj.scene).toBeUndefined();
    expect(gameObj.parent).toBeNull();
    expect(gameObj.components).toHaveLength(1);
    expect(gameObj.components[0]).toBeInstanceOf(Transform);

    const transform = gameObj.transform;
    expect(transform.gameObject).toStrictEqual(gameObj);
    expect(transform.size).toMatchObject({ width: 0, height: 0 });
  });

  it('create game object with empty name', () => {
    const gameObj = new GameObject('');
    const child1 = new GameObject('child1');
    gameObj.addChild(child1);

    const scene = new Scene('scene');
    gameObj.scene = scene;

    expect(gameObj.transform).toBeInstanceOf(Transform);
    expect(gameObj.name).toBe('');
    expect(gameObj.scene).toStrictEqual(child1.scene);
  });

  it('create game object with transform', () => {
    const gameObj = new GameObject('gameObj', {
      size: { width: 200, height: 200 },
      position: { x: 10, y: 10 },
    });
    const transform = gameObj.transform;
    expect(transform).toBeInstanceOf(Transform);
    expect(transform.size).toMatchObject({ width: 200, height: 200 });
    expect(transform.position).toMatchObject({ x: 10, y: 10 });
  });

  it('append new child gameObject', () => {
    const parent = new GameObject('parent');
    const child1 = new GameObject('child1');
    parent.addChild(child1);
    expect(child1.parent).toStrictEqual(parent);
    expect(child1.scene).toStrictEqual(parent.scene);
  });

  it('should throw error when child is null', () => {
    const parent = new GameObject('parent');
    expect(() => {
      parent.addChild(null);
      parent.addChild(undefined);
      parent.addChild(parent);
    }).not.toThrow();
  });

  it('add child', () => {
    const parent = new GameObject('parent');
    const child = new GameObject('child');
    expect(child.transform).toBeInstanceOf(Transform);
    expect(child.parent).toBeNull();
    child.components.length = 0;
    parent.addChild(child);
    expect(child.parent).toBe(parent);
  });

  it('should throw error when child not instanceof GameObject', () => {
    const parent = new GameObject('parent');
    const child = { transform: {} } as any;
    expect(() => {
      parent.addChild(child);
    }).toThrow('addChild only receive GameObject');
  });

  it('should throw error when parent has been destroyed', () => {
    const parent = new GameObject('parent');
    const child = new GameObject('child');
    parent.destroy();
    expect(() => {
      parent.addChild(child);
    }).toThrow(`gameObject '${parent.name}' has been destroy`);
  });

  it('remove child gameObject', () => {
    const parent = new GameObject('parent');
    const child = new GameObject('child');
    child.transform.parent = parent.transform;
    child.scene = parent.scene;

    expect(child.parent).toStrictEqual(parent);
    expect(child.scene).toStrictEqual(parent.scene);

    parent.removeChild(child);
    expect(child.parent).toBeNull();
    expect(child.scene).toBeNull();
  });

  it('do nothing if child not instance of GameObject', () => {
    const parent = new GameObject('parent');
    const child = {} as any;
    parent.removeChild(child);
    expect(child).toMatchObject({});
  });

  it('do nothing if child do not have parent', () => {
    const parent = new GameObject('parent');
    const child = new GameObject('child');
    parent.removeChild(child);
    expect(child.parent).toBeNull();
    expect(child.scene).toBeUndefined();
  });

  it("do nothing if child's parent not this", () => {
    const parent = new GameObject('parent');
    const parent2 = new GameObject('parent2');
    const child = new GameObject('child');

    child.transform.parent = parent2.transform;
    // child.scene = child.scene;

    parent.removeChild(child);
    expect(child.parent).toStrictEqual(parent2);
    expect(child.scene).toStrictEqual(parent2.scene);
  });

  it('add component from Constructor or instance', () => {
    const init = jest.fn();
    const awake = jest.fn();
    class MoveComponent extends Component {
      init() {
        init();
      }
      awake() {
        awake();
      }
    }
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(MoveComponent);
    expect(gameObj.components.length).toBe(2);

    const moveComp = new MoveComponent();
    gameObj.addComponent(moveComp);
    expect(gameObj.components.length).toBe(2);

    expect(init).toBeCalledTimes(1);
    expect(awake).toBeCalledTimes(1);
  });

  it('should throw error when params is null', () => {
    const gameObj = new GameObject('gameObj');
    expect(() => {
      gameObj.addComponent(null);
    }).toThrow('addComponent recieve Component and Component Constructor');
  });

  it('should throw error when params is undefined', () => {
    const gameObj = new GameObject('gameObj');
    let comp;
    expect(() => {
      gameObj.addComponent(comp);
    }).toThrow('addComponent recieve Component and Component Constructor');
  });

  it('should throw error when component has used by other gameObject', () => {
    const gameObj1 = new GameObject('gameObj1');
    const testComp = new TestComponent();
    gameObj1.addComponent(testComp);

    const gameObj2 = new GameObject('gameObj2');
    expect(() => {
      gameObj2.addComponent(testComp);
    }).toThrow(`component has been added on gameObject ${gameObj1.name}`);
  });

  it('add same component to gameObject', () => {
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    gameObj.addComponent(TestComponent);
    expect(gameObj.components.length).toBe(2);
  });

  it('remove component from gameObject', () => {
    const parent = new GameObject('parent');
    const testComp = new TestComponent();

    parent.addComponent(testComp);
    expect(parent.components.length).toBe(2);

    parent.removeComponent(testComp);
    expect(parent.components.length).toBe(1);

    parent.addComponent(testComp);
    parent.removeComponent(TestComponent);
    expect(parent.components.length).toBe(1);

    parent.addComponent(testComp);
    parent.removeComponent(TestComponent.componentName);
    expect(parent.components.length).toBe(1);
  });

  it('do nothing when Component.componentName not on gameObject', () => {
    const gameObj = new GameObject('gameObj');
    expect(gameObj.removeComponent(TestComponent.componentName)).toBeUndefined();
    expect(gameObj.components.length).toBe(1);
  });

  it('do nothing when component.name not on gameObject', () => {
    const testComp = new TestComponent();
    const gameObj = new GameObject('gameObj');
    expect(gameObj.removeComponent(testComp.name)).toBeUndefined();
    expect(gameObj.components.length).toBe(1);
  });

  it('do nothing when component not on gameObject', () => {
    const gameObj = new GameObject('gameObj');
    expect(gameObj.removeComponent('TestComponent')).toBeUndefined();
    expect(gameObj.components.length).toBe(1);
  });

  it('should throw error when componen is Transform', () => {
    const gameObj = new GameObject('gameObj');
    expect(() => {
      gameObj.removeComponent('Transform');
    }).toThrow("Transform can't be removed");

    expect(() => {
      gameObj.removeComponent(Transform.componentName);
    }).toThrow("Transform can't be removed");

    expect(() => {
      gameObj.removeComponent(gameObj.transform.name);
    }).toThrow("Transform can't be removed");
  });

  it('getComponent by componentName', () => {
    const gameObj = new GameObject('gameObj');
    const comp1 = gameObj.getComponent('Transform');
    expect(comp1.name).toBe('Transform');

    const comp2 = gameObj.getComponent(Transform);
    expect(comp2.name).toBe('Transform');

    expect(gameObj.getComponent('TestComponent')).toBeUndefined();
  });

  it('should remove from parent game object', () => {
    const parent = new GameObject('parent');
    const child = new GameObject('child');
    parent.addChild(child);
    expect(child.transform.parent).toStrictEqual(parent.transform);
    expect(child.scene).toStrictEqual(parent.scene);

    child.remove();
    expect(child.transform.parent).toBeNull();
    expect(child.scene).toBeNull();
  });

  it('do nothing if child do not have parent', () => {
    const gameObj = new GameObject('gameObj');
    gameObj.remove();
    expect(gameObj.parent).toBeNull();
    expect(gameObj.scene).toBeUndefined();
  });

  it('should destory successfully', () => {
    const rootObj = new GameObject('rootObj');
    const gameObj1 = new GameObject('gameObj1');
    rootObj.addChild(gameObj1);
    const leaftGameObj = new GameObject('leaftGameObject');
    gameObj1.addChild(leaftGameObj);

    expect(leaftGameObj.transform.parent).toStrictEqual(gameObj1.transform);
    expect(gameObj1.transform.parent).toStrictEqual(rootObj.transform);

    rootObj.destroy();

    expect(rootObj.components.length).toBe(0);
    expect(gameObj1.components.length).toBe(0);
    expect(gameObj1.transform).toBeUndefined();
    expect(gameObj1.scene).toBeNull();
    expect(leaftGameObj.components.length).toBe(0);
    expect(leaftGameObj.transform).toBeUndefined();
    expect(leaftGameObj.scene).toBeNull();
  });
});
