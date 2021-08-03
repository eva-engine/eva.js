import Scene from '../game/Scene';
import Transform, { TransformParams } from './Transform';
import Component, { ComponentConstructor, ComponentParams, getComponentName } from './Component';
import { observer, observerAdded, observerRemoved } from './observer';

let _id = 0;
/** Generate unique id for gameObject */
function getId() {
  return ++_id;
}

// type ComponentCtor<T extends Component> = new () => T
/**
 * GameObject is a general purpose object. It consists of a unique id and components.
 * @public
 */
class GameObject {
  /** Name of this gameObject */
  private _name: string;

  /** Scene is an abstraction, represent a canvas layer */
  private _scene: Scene;

  /** A key-value map for components on this gameObject */
  private _componentCache: Record<string, Component<ComponentParams>> = {};

  /** Identifier of this gameObject */
  public id: number;

  /** Components apply to this gameObject */
  public components: Component<ComponentParams>[] = [];

  /**
   * Consruct a new gameObject
   * @param name - the name of this gameObject
   * @param obj - optional transform parameters for default Transform component
   */
  constructor(name: string, obj?: TransformParams) {
    this._name = name;
    this.id = getId();
    this.addComponent(Transform, obj);
  }

  /**
   * Get default transform component
   * @returns transform component on this gameObject
   * @readonly
   */
  get transform(): Transform {
    return this.getComponent(Transform);
  }

  /**
   * Get parent gameObject
   * @returns parent gameObject
   * @readonly
   */
  get parent(): GameObject {
    return (
      this.transform &&
      this.transform.parent &&
      this.transform.parent.gameObject
    );
  }

  /**
   * Get the name of this gameObject
   * @readonly
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
   * Get the scene which this gameObject added on
   * @returns scene
   * @readonly
   */
  get scene() {
    return this._scene;
  }

  /**
   * Add child gameObject
   * @param gameObject - child gameobject
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
   * Remove child gameObject
   * @param gameObject - child gameobject
   */
  removeChild(gameObject: GameObject): GameObject {
    if (
      !(gameObject instanceof GameObject) ||
      !gameObject.parent ||
      gameObject.parent !== this
    ) {
      return gameObject;
    }

    gameObject.transform.parent = null;
    gameObject.scene = null;
    return gameObject;
  }

  /**
   * Add component to this gameObject
   * @remarks
   * If component has already been added on a gameObject, it will throw an error
   * @param C - component instance or Component class
   */
  addComponent<T extends Component<ComponentParams>>(C: T): T;
  addComponent<T extends Component<ComponentParams>>(C: ComponentConstructor<T>, obj?: ComponentParams): T;
  addComponent<T extends Component<ComponentParams>>(
    C: T | ComponentConstructor<T>,
    obj?: ComponentParams,
  ): T {
    const componentName = getComponentName(C);
    if (this._componentCache[componentName]) return;

    let component;
    if (C instanceof Function) {
      component = new C(obj);
    } else if (C instanceof Component) {
      component = C;
    } else {
      throw new Error(
        'addComponent recieve Component and Component Constructor',
      );
    }
    if (component.gameObject) {
      throw new Error(
        `component has been added on gameObject ${component.gameObject.name}`,
      );
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
   * Remove component on this gameObject
   * @remarks
   * default Transform component can not be removed, if the paramter represent a transform component, an error will be thrown.
   * @param c - one of the compnoentName, component instance, component Class
   * @returns
   */
  removeComponent<T extends Component<ComponentParams>>(c: string): T;
  removeComponent<T extends Component<ComponentParams>>(c: T): T;
  removeComponent<T extends Component<ComponentParams>>(c: ComponentConstructor<T>): T;
  removeComponent<T extends Component<ComponentParams>>(
    c: string | T | ComponentConstructor<T>,
  ): T {
    let componentName: string;
    if (typeof c === 'string') {
      componentName = c;
    } else if (c instanceof Component) {
      componentName = c.name;
    } else if (c.componentName) {
      componentName = c.componentName;
    }

    if (componentName === 'Transform') {
      throw new Error('Transform can\'t be removed');
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
   * Get component on this gameObject
   * @param c - one of the compnoentName, component instance, component Class
   * @returns
   */
  getComponent<T extends Component<ComponentParams>>(c: ComponentConstructor<T>): T;
  getComponent<T extends Component>(c: string): T;
  getComponent<T extends Component>(
    c: string | ComponentConstructor<T>,
  ): T {
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
   * Remove this gameObject on its parent
   * @returns return this gameObject
   */
  remove() {
    if (this.parent) return this.parent.removeChild(this);
  }

  /** Destory this gameObject */
  destroy() {
    Array.from(this.transform.children).forEach(({ gameObject }) => {
      gameObject.destroy();
    });
    this.remove();
    this.transform.clearChildren();
    for (const key in this._componentCache) {
      this._removeComponent(key);
    }
    this.components.length = 0;
  }
}

export default GameObject;
