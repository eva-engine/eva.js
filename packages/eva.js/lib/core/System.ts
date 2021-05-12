import { PureObserverInfo } from './observer';
import { UpdateParams } from './Component';
import ComponentObserver from './ComponentObserver';
import Game from '../game/Game';

/**
 * Each System runs continuously and performs global actions on every Entity that possesses a Component of the same aspect as that System.
 * @public
 */
class System {
  /** System name */
  static systemName: string;
  name: string;

  /**
   * The collection of component properties observed by the System. System will respond to these changes
   * @example
   * ```typescript
   * // TestSystem will respond to changes of `size` and `position` property of the Transform component
   * class TestSystem extends System {
   *   static observerInfo = {
   *     Transform: [{ prop: 'size', deep: true }, { prop: 'position', deep: true }]
   *   }
   * }
   * ```
   */
  static observerInfo: PureObserverInfo;

  /** Component Observer */
  componentObserver: ComponentObserver;

  /** Game instance */
  game: Game;

  /** Represents the status of the component, if component has started, the value is true */
  started = false;

  /** Default paramaters for this system */
  __systemDefaultParams: any;

  constructor(params?: any) {
    this.componentObserver = new ComponentObserver();
    this.__systemDefaultParams = params;
    // @ts-ignore
    this.name = this.constructor.systemName;
  }

  /**
   * Called when system is added to a gameObject
   * @remarks
   * The difference between init and awake is that `init` method recieves params.
   * Both of those methods are called early than `start` method.
   * Use this method to prepare data, ect.
   * @param param - optional params
   * @override
   */
  init?(param?: any): void;

  /**
   * Calleen system installed
   * @override
   */
  awake?(): void;

  /**
   * Called after all system `awake` method has been called
   * @override
   */
  start?(): void;

  /**
   * Called in each tick
   * @example
   * ```typescript
   * // run TWEEN `update` method in main requestAnimationFrame loop
   * class TransitionSystem extends System {
   *   update() {
   *     TWEEN.update()
   *   }
   * }
   * ```
   * @param e - info about this tick
   * @override
   */
  update?(e: UpdateParams): void;

  /**
   * Called after all system have called the `update` method
   * @param e - info about this tick
   * @override
   */
  lateUpdate?(e: UpdateParams): void;

  /**
   * Called before game runing or every time game paused
   * @override
   */
  onResume?(): void;

  /**
   * Called while the game paused
   * @override
   */
  onPause?(): void;

  /**
   * Called while the system be destroyed.
   * @override
   */
  onDestroy?(): void;

  /** Default destory method */
  destroy() {
    this.componentObserver = null;
    this.__systemDefaultParams = null;
    this.onDestroy?.();
  }
}

export type SystemType = typeof System;
export default System;
