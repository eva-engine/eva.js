import Scene from '../game/Scene';
import Transform, { TransformParams } from './Transform';
import Component, { ComponentConstructor, ComponentParams, getComponentName } from './Component';
import { observer, observerAdded, observerRemoved } from './observer';

let _id = 0;
/** 为游戏对象生成唯一 ID */
function getId() {
  return ++_id;
}

/**
 * 游戏对象类，是游戏中的通用对象容器
 *
 * GameObject 是 ECS 架构中的 E（Entity），由唯一 ID 和多个组件组成。
 * 它本身不包含逻辑，所有行为都通过添加的组件来实现。
 * 每个 GameObject 默认包含一个 Transform 组件，用于处理位置、缩放、旋转等变换信息。
 *
 * @example
 * ```typescript
 * // 创建一个游戏对象
 * const player = new GameObject('player', {
 *   position: { x: 100, y: 100 },
 *   size: { width: 50, height: 50 }
 * });
 *
 * // 添加组件
 * player.addComponent(new Sprite({ resource: 'playerTexture' }));
 * player.addComponent(new PhysicsBody());
 *
 * // 建立父子关系
 * const weapon = new GameObject('weapon');
 * player.addChild(weapon);
 * ```
 */
class GameObject {
  /** 游戏对象的名称 */
  private _name: string;

  /** 游戏对象所属的场景 */
  private _scene: Scene;

  /** 组件缓存映射表，用于快速查找组件 */
  private _componentCache: Record<string, Component<ComponentParams>> = {};

  /** 游戏对象的唯一标识符 */
  public id: number;

  /** 游戏对象上的所有组件列表 */
  public components: Component<ComponentParams>[] = [];

  /** 游戏对象是否已被销毁 */
  public destroyed: boolean = false;

  /**
   * 构造一个新的游戏对象
   * @param name - 游戏对象的名称
   * @param obj - 可选的 Transform 组件初始化参数
   */
  constructor(name: string, obj?: TransformParams) {
    this._name = name;
    this.id = getId();
    this.addComponent(Transform, obj);
  }

  /**
   * 获取默认的 Transform 组件
   *
   * 每个 GameObject 都自动包含一个 Transform 组件，
   * 用于管理对象的位置、旋转、缩放等变换属性。
   *
   * @returns 该游戏对象的 Transform 组件
   */
  get transform(): Transform {
    return this.getComponent(Transform);
  }

  /**
   * 获取父游戏对象
   *
   * 通过 Transform 组件的父子关系获取父对象。
   * 如果没有父对象则返回 undefined。
   *
   * @returns 父游戏对象
   */
  get parent(): GameObject {
    return this.transform && this.transform.parent && this.transform.parent.gameObject;
  }

  /**
   * 获取所有子游戏对象
   *
   * 返回通过 Transform 组件建立父子关系的所有子对象列表。
   *
   * @returns 子游戏对象数组
   */
  get children(): GameObject[] {
    return this.transform.children.map(child => child.gameObject);
  }

  /**
   * 获取游戏对象的名称
   * @returns 游戏对象名称
   */
  get name() {
    return this._name;
  }

  set scene(val: Scene) {
    if (this._scene === val) return;
    const scene = this._scene;
    this._scene = val;
    if (this.transform && this.transform.children) {
      for (const child of this.transform.children) {
        child.gameObject.scene = val;
      }
    }
    if (val) {
      val.addGameObject(this);
    } else {
      scene && scene.removeGameObject(this);
    }
  }

  /**
   * 获取游戏对象所属的场景
   *
   * 场景是游戏对象的容器，管理着场景内所有游戏对象的生命周期。
   *
   * @returns 所属场景对象
   */
  get scene() {
    return this._scene;
  }

  /**
   * 添加子游戏对象
   *
   * 建立父子层级关系。子对象的变换会相对于父对象进行计算。
   * 如果子对象已经有父对象，会先从原父对象移除。
   *
   * @param gameObject - 要添加的子游戏对象
   *
   * @throws 如果参数不是 GameObject 实例，抛出错误
   * @throws 如果当前对象已被销毁，抛出错误
   */
  addChild(gameObject: GameObject) {
    if (!gameObject || !gameObject.transform || gameObject === this) return;

    if (!(gameObject instanceof GameObject)) {
      throw new Error('addChild only receive GameObject');
    }

    if (!this.transform) {
      throw new Error(`gameObject '${this.name}' has been destroy`);
    }
    gameObject.transform.parent = this.transform;
    gameObject.scene = this.scene;
  }

  /**
   * 移除子游戏对象
   *
   * 断开与子对象的父子关系。子对象不会被销毁，只是从层级中移除。
   *
   * @param gameObject - 要移除的子游戏对象
   * @returns 被移除的子游戏对象
   */
  removeChild(gameObject: GameObject): GameObject {
    if (!(gameObject instanceof GameObject) || !gameObject.parent || gameObject.parent !== this) {
      return gameObject;
    }

    gameObject.transform.parent = null;
    gameObject.scene = null;
    return gameObject;
  }

  /**
   * 向游戏对象添加组件
   *
   * 组件是游戏对象功能的来源。可以传入组件实例或组件类。
   * 同一类型的组件在一个游戏对象上只能存在一个。
   * 组件添加后会立即调用其 init、awake 等生命周期方法。
   *
   * @param C - 组件实例或组件类
   * @param obj - 组件初始化参数（仅当传入组件类时有效）
   * @returns 添加的组件实例
   *
   * @throws 如果组件已经被添加到其他游戏对象，抛出错误
   * @throws 如果参数类型不正确，抛出错误
   */
  addComponent<T extends Component<ComponentParams>>(C: T): T;
  addComponent<T extends Component<ComponentParams>>(C: ComponentConstructor<T>, obj?: ComponentParams): T;
  addComponent<T extends Component<ComponentParams>>(C: T | ComponentConstructor<T>, obj?: ComponentParams): T {
    if (this.destroyed) return;
    const componentName = getComponentName(C);
    if (this._componentCache[componentName]) return;

    let component;
    if (C instanceof Function) {
      component = new C(obj);
    } else if (C instanceof Component) {
      component = C;
    } else {
      throw new Error('addComponent recieve Component and Component Constructor');
    }
    if (component.gameObject) {
      throw new Error(`component has been added on gameObject ${component.gameObject.name}`);
    }

    component.gameObject = this;
    component.init && component.init(component.__componentDefaultParams);
    observerAdded(component, component.name);
    observer(component, component.name);

    this.components.push(component);
    this._componentCache[componentName] = component;

    component.awake && component.awake();

    return component;
  }

  /**
   * 从游戏对象移除组件
   *
   * 移除指定的组件并调用其 onDestroy 生命周期方法。
   * 注意：默认的 Transform 组件不能被移除，尝试移除会抛出错误。
   *
   * @param c - 组件名称、组件实例或组件类
   * @returns 被移除的组件实例
   *
   * @throws 如果尝试移除 Transform 组件，抛出错误
   */
  removeComponent<T extends Component<ComponentParams>>(c: string): T;
  removeComponent<T extends Component<ComponentParams>>(c: T): T;
  removeComponent<T extends Component<ComponentParams>>(c: ComponentConstructor<T>): T;
  removeComponent<T extends Component<ComponentParams>>(c: string | T | ComponentConstructor<T>): T {
    let componentName: string;
    if (typeof c === 'string') {
      componentName = c;
    } else if (c instanceof Component) {
      componentName = c.name;
    } else if (c.componentName) {
      componentName = c.componentName;
    }

    if (componentName === 'Transform') {
      throw new Error("Transform can't be removed");
    }

    return this._removeComponent(componentName);
  }

  private _removeComponent<T extends Component>(componentName: string) {
    const index = this.components.findIndex(({ name }) => name === componentName);
    if (index === -1) return;

    const component = this.components.splice(index, 1)[0] as T;
    delete this._componentCache[componentName];
    delete component.__componentDefaultParams;
    component.onDestroy && component.onDestroy();
    observerRemoved(component, componentName);
    component.gameObject = undefined;
    return component;
  }

  /**
   * 获取游戏对象上的组件
   *
   * 通过组件名称、组件类或组件实例查找对应的组件。
   * 如果组件不存在，返回 undefined。
   *
   * @param c - 组件名称、组件实例或组件类
   * @returns 找到的组件实例，不存在则返回 undefined
   */
  getComponent<T extends Component<ComponentParams>>(c: ComponentConstructor<T>): T;
  getComponent<T extends Component>(c: string): T;
  getComponent<T extends Component>(c: string | ComponentConstructor<T>): T {
    let componentName: string;
    if (typeof c === 'string') {
      componentName = c;
    } else if (c instanceof Component) {
      componentName = c.name;
    } else if (c.componentName) {
      componentName = c.componentName;
    }
    if (typeof this._componentCache[componentName] !== 'undefined') {
      return this._componentCache[componentName] as T;
    } else {
      return;
    }
  }

  /**
   * 从父对象中移除当前游戏对象
   *
   * 如果当前对象有父对象，则从父对象的子列表中移除。
   * 对象本身不会被销毁。
   *
   * @returns 当前游戏对象
   */
  remove() {
    if (this.parent) return this.parent.removeChild(this);
  }

  /**
   * 销毁游戏对象
   *
   * 递归销毁所有子对象，移除所有组件，清理所有资源。
   * 销毁后的对象不应再被使用。
   */
  destroy() {
    if (!this.transform) {
      return;
    }
    Array.from(this.transform.children).forEach(({ gameObject }) => {
      gameObject.destroy();
    });
    this.remove();
    this.transform.clearChildren();
    for (const key in this._componentCache) {
      this._removeComponent(key);
    }
    this.components.length = 0;
    this.destroyed = true;
  }
}

export default GameObject;
