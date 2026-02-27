import { type, step } from '@eva/inspector-decorator';
import Component from './Component';
import type { ComponentParams } from './Component';

/**
 * 二维向量
 */
interface Vector2 {
  x: number;
  y: number;
}

/**
 * 二维尺寸
 */
interface Size2 {
  width: number;
  height: number;
}

/**
 * 二维变换矩阵
 *
 * 用于描述对象的平移、旋转、缩放等变换信息。
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/matrix()}
 */
export interface TransformMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
  array: Float32Array | null;
}

/**
 * Transform 组件的参数配置
 */
export interface TransformParams extends ComponentParams {
  /** 位置坐标 */
  position?: Vector2;
  /** 尺寸大小 */
  size?: Size2;
  /** 原点偏移（用于旋转和缩放的中心点） */
  origin?: Vector2;
  /** 锚点（用于定位的参考点） */
  anchor?: Vector2;
  /** 缩放比例 */
  scale?: Vector2;
  /** 倾斜角度 */
  skew?: Vector2;
  /** 旋转角度（弧度） */
  rotation?: number;
}

/**
 * Transform 组件，游戏对象的基础组件
 *
 * 用于管理游戏对象的位置、旋转、缩放等变换属性。
 * 每个 GameObject 都默认包含一个 Transform 组件，且不能被移除。
 * Transform 还管理游戏对象的父子层级关系。
 *
 * @example
 * ```typescript
 * const obj = new GameObject('player');
 * obj.transform.position = { x: 100, y: 200 };
 * obj.transform.rotation = Math.PI / 4; // 旋转45度
 * obj.transform.scale = { x: 2, y: 2 }; // 放大2倍
 * ```
 */
class Transform extends Component<TransformParams> {
  /**
   * 组件名称
   * @readonly
   */
  static componentName: string = 'Transform';
  readonly name: string = 'Transform';
  private _parent: Transform = null;

  /** 该 Transform 是否在场景对象中 */
  inScene: boolean = false;

  /** 世界坐标系变换矩阵 */
  worldTransform: TransformMatrix;

  /** 子 Transform 组件列表 */
  children: Transform[] = [];

  /**
   * 初始化组件
   *
   * 使用提供的参数初始化 Transform 的各项属性。
   *
   * @param params - Transform 初始化数据
   */
  init(params: TransformParams = {}) {
    const props = ['position', 'size', 'origin', 'anchor', 'scale', 'skew'];
    for (const key of props) {
      Object.assign(this[key], params[key]);
    }
    this.rotation = params.rotation || this.rotation;
  }

  /** 位置坐标（世界坐标或相对父对象坐标） */
  @type('vector2') @step(1) position: Vector2 = { x: 0, y: 0 };

  /** 尺寸大小 */
  @type('size') @step(1) size: Size2 = { width: 0, height: 0 };

  /** 原点偏移，旋转和缩放的中心点（相对于锚点的偏移） */
  @type('vector2') @step(0.1) origin: Vector2 = { x: 0, y: 0 };

  /** 锚点，对象定位的参考点（0-1 范围，0.5 表示中心） */
  @type('vector2') @step(0.1) anchor: Vector2 = { x: 0, y: 0 };

  /** 缩放比例 */
  @type('vector2') @step(0.1) scale: Vector2 = { x: 1, y: 1 };

  /** 倾斜角度 */
  @type('vector2') @step(0.1) skew: Vector2 = { x: 0, y: 0 };

  /** 旋转角度（弧度制） */
  @type('number') @step(0.1) rotation: number = 0;

  set parent(val: Transform) {
    if (val) {
      val.addChild(this);
    } else if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  /**
   * 获取父 Transform 组件
   *
   * 通过父子关系可以建立游戏对象的层级结构，
   * 子对象的变换会相对于父对象进行计算。
   *
   * @returns 父 Transform 组件，如果没有父对象则返回 null
   */
  get parent(): Transform {
    return this._parent;
  }

  /**
   * 添加子 Transform 组件
   *
   * 建立父子层级关系。如果子对象已经是当前对象的子对象，
   * 会将其移动到子列表末尾。如果子对象已经有其他父对象，
   * 会先从原父对象移除。
   *
   * @param child - 子游戏对象的 Transform 组件
   */
  addChild(child: Transform) {
    if (child.parent === this) {
      const index = this.children.findIndex(item => item === child);
      this.children.splice(index, 1);
    } else if (child.parent) {
      child.parent.removeChild(child);
    }
    child._parent = this;
    this.children.push(child);
  }

  /**
   * 移除子 Transform 组件
   *
   * 断开与子对象的父子关系，子对象不会被销毁。
   *
   * @param child - 子游戏对象的 Transform 组件
   */
  removeChild(child: Transform) {
    const index = this.children.findIndex(item => item === child);
    if (index > -1) {
      this.children.splice(index, 1);
      child._parent = null;
    }
  }

  /**
   * 清空所有子 Transform 组件
   *
   * 移除所有子对象的引用，但不销毁子对象本身。
   */
  clearChildren() {
    this.children.length = 0;
  }
}

export default Transform;
