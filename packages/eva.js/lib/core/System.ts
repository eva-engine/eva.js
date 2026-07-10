import { PureObserverInfo } from './observer';
import { UpdateParams } from './Component';
import ComponentObserver from './ComponentObserver';
import Game from '../game/Game';
import type { FrameParams } from '../game/Ticker';

export interface SystemConstructor<T extends System = System> {
  systemName: string;
  observerInfo: PureObserverInfo;
  new (params?: any): T;
}
/**
 * 系统类，持续运行并对拥有相同方面组件的每个实体执行全局操作
 *
 * 系统是 ECS 架构中的 S（System），负责处理具有特定组件的游戏对象。
 * 系统可以观察组件的属性变化，并在每帧中执行相应的逻辑处理。
 *
 * @example
 * ```typescript
 * // 创建一个渲染系统来处理 Sprite 组件
 * class RenderSystem extends System {
 *   static systemName = 'RenderSystem';
 *   static observerInfo = {
 *     Transform: [{ prop: 'position' }, { prop: 'scale' }]
 *   };
 *
 *   update() {
 *     const changes = this.componentObserver.clear();
 *     // 处理 Transform 组件的变化
 *   }
 * }
 * ```
 */
class System<T extends {} = {}> {
  /** 系统类的静态名称标识 */
  static systemName: string;

  /** 系统实例的名称 */
  name: string;

  /**
   * 系统观察的组件属性集合，系统会响应这些属性的变化
   *
   * 通过配置 observerInfo，系统可以监听特定组件的特定属性变化，
   * 实现高效的数据驱动更新机制。
   *
   * @example
   * ```typescript
   * // TestSystem 会响应 Transform 组件的 size 和 position 属性变化
   * class TestSystem extends System {
   *   static observerInfo = {
   *     Transform: [{ prop: 'size', deep: true }, { prop: 'position', deep: true }]
   *   }
   * }
   * ```
   */
  static observerInfo: PureObserverInfo;

  /** 组件观察者实例，用于收集和管理组件变化事件 */
  componentObserver: ComponentObserver;

  /** 所属的游戏实例 */
  game: Game;

  /**
   * 系统是否已启动的状态标识
   * @defaultValue false
   */
  started = false;

  /** 系统的默认参数配置 */
  __systemDefaultParams: T;

  /**
   * 构造一个新的系统实例
   * @param params - 可选的初始化参数
   */
  constructor(params?: T) {
    this.componentObserver = new ComponentObserver();
    this.__systemDefaultParams = params;
    // @ts-ignore
    this.name = this.constructor.systemName;
  }

  /**
   * 系统被添加到游戏时调用的初始化方法
   *
   * `init` 和 `awake` 的区别在于 `init` 方法接收参数。
   * 这两个方法都在 `start` 方法之前调用。
   * 适合在此方法中准备数据、配置系统等初始化工作。
   *
   * @param param - 初始化参数
   */
  init?(param?: T): void;

  /**
   * 系统安装完成时调用
   *
   * 此方法在系统被添加到游戏后立即执行，用于建立系统的基础状态。
   */
  awake?(): void;

  /**
   * 所有系统的 `awake` 方法都被调用后执行
   *
   * 此方法保证所有系统都已完成 awake，因此可以安全地
   * 访问和操作其他系统。
   */
  start?(): void;

  /**
   * 每帧调用，用于执行系统的主要逻辑
   *
   * 这是系统的核心更新方法，在每个渲染帧都会被调用。
   * 适合处理全局逻辑、系统级别的状态更新等。
   *
   * @param e - 当前帧的时间信息
   *
   * @example
   * ```typescript
   * // 在主循环中运行 TWEEN 的 update 方法
   * class TransitionSystem extends System {
   *   update() {
   *     TWEEN.update()
   *   }
   * }
   * ```
   */
  update?(e: UpdateParams): void;

  /**
   * 所有系统都调用完 `update` 方法后执行
   *
   * 此方法在同一帧内所有 update 之后调用，适合用于处理需要
   * 依赖其他系统更新结果的逻辑。
   *
   * @param e - 当前帧的时间信息
   */
  lateUpdate?(e: UpdateParams): void;

  /**
   * 每个物理 RAF 开始时调用一次，先于本帧的所有固定逻辑更新。
   *
   * @param frame - 当前物理帧的时间与逻辑步数信息
   */
  frameStart?(frame: FrameParams): void;

  /**
   * 每个物理 RAF 结束时调用一次，晚于本帧的所有固定逻辑更新。
   *
   * @param frame - 当前物理帧的时间与逻辑步数信息
   */
  frameUpdate?(frame: FrameParams): void;

  /**
   * 游戏开始运行前或游戏暂停后恢复时调用
   *
   * 用于处理游戏恢复运行时的系统级逻辑。
   */
  onResume?(): void;

  /**
   * 游戏暂停时调用
   *
   * 用于处理游戏暂停时的系统级逻辑。
   */
  onPause?(): void;

  /**
   * 系统被销毁时调用
   *
   * 用于清理系统占用的资源。
   */
  onDestroy?(): void;

  /**
   * 默认的销毁方法
   *
   * 清理组件观察者和默认参数，并调用 onDestroy 钩子。
   */
  destroy() {
    this.componentObserver = null;
    this.__systemDefaultParams = null;
    this.onDestroy?.();
  }
}

export default System;
