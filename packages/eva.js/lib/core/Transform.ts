import { type, step } from '@eva/inspector-decorator';
import Component from './Component';
import type { ComponentParams } from './Component';

/**
 * Two dimensional vector
 */
interface Vector2 {
  x: number;
  y: number;
}

/**
 * Two dimensional size
 */
interface Size2 {
  width: number;
  height: number;
}

/**
 * Radiation transformation martix
 *
 * {@link https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/matrix() }
 */
export interface TransformMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
  array?: number[];
}

/**
 * Transform propterty
 */
export interface TransformParams extends ComponentParams {
  position?: Vector2;
  size?: Size2;
  origin?: Vector2;
  anchor?: Vector2;
  scale?: Vector2;
  skew?: Vector2;
  rotation?: number;
}

/** Basic component for gameObject, See {@link TransformParams}  */
class Transform extends Component<TransformParams> {
  /**
   * component's name
   * @readonly
   */
  static componentName: string = 'Transform';
  readonly name: string = 'Transform';
  private _parent: Transform = null;

  /** only used in addChildAt */
  childIndex: number = -1;

  /** Whether this transform in a scene object */
  inScene: boolean = false;

  /** World coordinate system transformation matrix */
  worldTransform: TransformMatrix;

  /** Child transform components */
  children: Transform[] = [];

  /**
   * Init component
   * @param params - Transform init data
   */
  init(params: TransformParams = {}) {
    const props = ['position', 'size', 'origin', 'anchor', 'scale', 'skew'];
    for (const key of props) {
      Object.assign(this[key], params[key]);
    }
    this.rotation = params.rotation || this.rotation;
  }

  @type('vector2') @step(1) position: Vector2 = { x: 0, y: 0 };
  @type('size') @step(1) size: Size2 = { width: 0, height: 0 };
  @type('vector2') @step(0.1) origin: Vector2 = { x: 0, y: 0 };
  @type('vector2') @step(0.1) anchor: Vector2 = { x: 0, y: 0 };
  @type('vector2') @step(0.1) scale: Vector2 = { x: 1, y: 1 };
  @type('vector2') @step(0.1) skew: Vector2 = { x: 0, y: 0 };
  @type('number') @step(0.1) rotation: number = 0;

  set parent(val: Transform) {
    if (val) {
      val.addChild(this);
    } else if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  /**
   * Get parent of this component
   */
  get parent(): Transform {
    return this._parent;
  }

  /**
   * Add Child Transform
   * @remarks
   * If `child` is already a child of this component, `child` will removed to the last of children list
   * If `child` is already a child of other component, `child` will removed from its parent first
   * @param child - child gameObject's transform component
   */
  addChild(child: Transform) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child._parent = this;
    if (child.childIndex > -1) {

      // packages/eva.js/lib/core/GameObject.ts > addChildAt
      // packages/plugin-renderer/lib/Transform.ts > change
      // packages/eva.js/lib/core/Transform.ts > addChild
      this.children.splice(child.childIndex, 0, child);
    } else {
      this.children.push(child);
    }
  }

  /**
   * Remove child transform
   * @param child - child gameObject's transform component
   */
  removeChild(child: Transform) {
    const index = this.children.findIndex(item => item === child);
    if (index > -1) {
      this.children.splice(index, 1);
      child._parent = null;
    }
  }

  /** Clear all child transform */
  clearChildren() {
    this.children.length = 0;
  }
}

export default Transform;
