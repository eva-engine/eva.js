import EventEmitter from 'eventemitter3';
import GameObject from './GameObject';
import { getPropertiesOf } from '../decorators/inspector';
import type { FieldMetadata } from '../decorators/inspector';

/** 传递给 `Component.update` 方法的帧信息 */
export interface UpdateParams {
  /** 距离上一帧的时间间隔（毫秒） */
  deltaTime: number;

  /** 自游戏开始以来的帧计数 */
  frameCount: number;

  /** 当前时间戳 */
  time: number;

  /** 当前时间戳（与 time 相同） */
  currentTime: number;

  /** 当前帧的 FPS（每秒帧数） */
  fps: number;
}

/** 组件类型定义，指向 Component 类的构造函数 */
export type ComponentType = typeof Component;

/**
 * 从组件实例或组件类中获取组件名称
 *
 * 该函数可以接受组件实例或组件构造函数，返回对应的组件名称字符串。
 * 组件名称用于在游戏对象中唯一标识组件类型。
 *
 * @param component - 组件实例或组件类
 * @returns 组件的名称字符串
 *
 * @example
 * ```typescript
 * import { Transform } from 'eva.js'
 *
 * assert(getComponentName(Transform) === 'Transform')
 * assert(getComponentName(new Transform()) === 'Transform')
 * ```
 */
export function getComponentName<T extends Component<ComponentParams>>(component: T | ComponentConstructor<T>): string {
  if (component instanceof Component) {
    return component.name;
  } else if (component instanceof Function) {
    return component.componentName;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ComponentParams {}

export interface ComponentConstructor<T extends Component<ComponentParams>> {
  componentName: string;
  new (params?: ComponentParams): T;
}

/**
 * 组件类，包含应用于游戏对象的原始数据以及它如何与世界交互的逻辑
 *
 * 组件是 ECS 架构中的 C（Component），用于存储数据和定义行为。
 * 每个组件都可以添加到游戏对象上，通过生命周期方法响应游戏的不同阶段。
 *
 * @example
 * ```typescript
 * class CustomComponent extends Component {
 *   static componentName = 'CustomComponent';
 *
 *   init(params) {
 *     // 组件初始化逻辑
 *   }
 *
 *   update(frame) {
 *     // 每帧更新逻辑
 *   }
 * }
 *
 * const gameObject = new GameObject('player');
 * gameObject.addComponent(new CustomComponent());
 * ```
 */
class Component<T extends ComponentParams = {}> extends EventEmitter {
  /** 组件类的静态名称标识 */
  static componentName: string;

  /**
   * 获取当前组件类的 Inspector 元数据。
   *
   * 该方法读取 `@eva/inspector-decorator` 生成的 metadata，
   * 同时兼容没有字段装饰器、但定义了 componentName 的组件。
   */
  static getInspectorMetadata(): FieldMetadata {
    return getPropertiesOf(this as ComponentConstructor<Component<ComponentParams>>);
  }

  /** 组件实例的名称 */
  public readonly name: string;

  /**
   * 组件是否已启动的状态标识
   * @defaultValue false
   */
  started: boolean = false;

  /**
   * 该组件所添加到的游戏对象
   * @remarks
   * 每个组件只能添加到一个游戏对象上，否则会抛出错误
   * @see {@link https://eva.js.org/#/tutorials/gameObject}
   */
  gameObject: GameObject;

  /** 组件的默认参数配置 */
  __componentDefaultParams: T;

  /**
   * 构造一个新的组件实例
   * @param params - 可选的初始化参数
   */
  constructor(params?: T) {
    super();
    // @ts-ignore
    this.name = this.constructor.componentName;
    this.__componentDefaultParams = params;
  }

  /**
   * 获取当前组件实例所属组件类的 Inspector 元数据。
   */
  getInspectorMetadata(): FieldMetadata {
    return (this.constructor as typeof Component).getInspectorMetadata();
  }

  /**
   * 组件构造期间调用的初始化方法
   *
   * 用于处理组件的初始化逻辑，设置初始状态和配置参数。
   * 该方法在组件被添加到游戏对象后立即执行。
   *
   * @param params - 初始化参数
   */
  init?(params?: T): void;

  /**
   * 组件被添加到游戏对象时调用
   *
   * 此方法在 `init` 之后执行，用于建立组件与游戏对象的关联关系。
   * 适合在此处访问其他组件或执行依赖于游戏对象的初始化逻辑。
   */
  awake?(): void;

  /**
   * 所有组件的 `awake` 方法都被调用后执行
   *
   * 此方法保证场景中所有组件都已完成 awake，因此可以安全地
   * 访问和操作其他组件。适合用于组件间的交互初始化。
   */
  start?(): void;

  /**
   * 每帧更新时调用，用于修改自身或其他组件的属性
   *
   * 这是组件的主要逻辑更新方法，在每个渲染帧都会被调用。
   * 适合处理游戏逻辑、状态更新、动画播放等持续性操作。
   *
   * @param frame - 当前帧的时间信息
   */
  update?(frame: UpdateParams): void;

  /**
   * 所有游戏对象的 `update` 方法调用完成后执行
   *
   * 此方法在同一帧内所有 update 之后调用，适合用于处理需要
   * 依赖其他组件更新结果的逻辑，例如相机跟随、后处理效果等。
   *
   * @param frame - 当前帧的时间信息
   */
  lateUpdate?(frame: UpdateParams): void;

  /**
   * 游戏开始运行前或游戏暂停后恢复时调用
   *
   * 用于处理游戏恢复运行时的逻辑，例如恢复音频播放、
   * 重新启动动画等。
   */
  onResume?(): void;

  /**
   * 游戏暂停时调用
   *
   * 用于处理游戏暂停时的逻辑，例如暂停音频、
   * 停止动画等。
   */
  onPause?(): void;

  /**
   * 组件被销毁时调用
   *
   * 用于清理组件占用的资源，例如移除事件监听器、
   * 释放内存、销毁关联对象等。
   */
  onDestroy?(): void;
}

export default Component;
