import { System, decorators, OBSERVER_TYPE, Transform } from '@eva/eva.js';
import type { ComponentChanged } from '@eva/eva.js';
import PhysicsEngine from './PhysicsEngine';
import { Physics } from './Physics';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Object ? DeepPartial<T[P]> : T[P];
};

export interface PhysicsSystemParams {
  resolution?: number;
  fps?: number;
  isTest?: boolean;
  element?: HTMLElement;
  canvas?: HTMLCanvasElement;
  deltaSampleSize?: number;
  mouse?: {
    open: boolean;
    constraint?: Matter.Constraint;
  };
  world: DeepPartial<Matter.IWorldDefinition>;
}

/**
 * 物理系统（基于 Matter.js）
 *
 * PhysicsSystem 集成了 Matter.js 2D 物理引擎，为游戏提供完整的刚体物理模拟。
 * 它管理物理世界、物理引擎的运行，并自动同步物理引擎的状态到游戏对象。
 *
 * 主要功能：
 * - 集成 Matter.js 物理引擎
 * - 管理物理世界和物理体
 * - 自动同步物理状态到游戏对象
 * - 支持鼠标交互约束
 * - 可配置物理引擎参数和渲染调试
 *
 * @example
 * ```typescript
 * // 基础配置
 * game.addSystem(new PhysicsSystem({
 *   resolution: 2,
 *   fps: 60,
 *   world: {
 *     gravity: { x: 0, y: 1 } // 重力方向
 *   }
 * }));
 *
 * // 开启调试渲染和鼠标交互
 * game.addSystem(new PhysicsSystem({
 *   isTest: true, // 显示物理调试绘制
 *   canvas: debugCanvas,
 *   mouse: {
 *     open: true // 启用鼠标拖拽物理体
 *   },
 *   world: {
 *     gravity: { x: 0, y: 1 }
 *   }
 * }));
 * ```
 */
@decorators.componentObserver({
  Physics: [{ prop: ['bodyParams'], deep: true }],
  Transform: ['_parent'],
})
export default class PhysicsSystem extends System<PhysicsSystemParams> {
  /** 系统名称 */
  static systemName = 'PhysicsSystem';

  /** 物理引擎实例 */
  private engine: PhysicsEngine;

  /**
   * 初始化物理系统
   *
   * 配置物理引擎参数、创建物理世界、设置渲染分辨率等。
   *
   * @param param - 物理系统配置参数
   * @param param.resolution - 渲染分辨率，默认 1
   * @param param.fps - 物理引擎更新帧率，默认 60
   * @param param.isTest - 是否开启调试渲染模式
   * @param param.element - 物理调试渲染的容器元素
   * @param param.canvas - 物理调试渲染的画布
   * @param param.deltaSampleSize - 时间步长采样大小
   * @param param.mouse - 鼠标交互配置
   * @param param.world - Matter.js 世界配置（重力、边界等）
   */
  init(param?: PhysicsSystemParams) {
    this.engine = new PhysicsEngine(this.game, param);
    this.game.canvas.setAttribute('data-pixel-ratio', (param.resolution || '1') as string);
  }
  /**
   * System 被安装的时候，如果游戏还没有开始，那么会在游戏开始的时候调用。用于前置操作，初始化数据等。
   *
   * Called while the System installed, if game is not begain, it will be called while begain. use to pre operation, init data.
   */
  awake() {}

  /**
   * System 被安装后，所有的 awake 执行完后
   *
   * Called while the System installed, after all of systems' awake been called
   */
  start() {
    this.engine.start();
  }
  /**
   * 每一次游戏循环调用，可以做一些游戏操作，控制改变一些组件属性。
   *
   * Called by every loop, can do some operation, change some property or other component property.
   */
  update(e) {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      if (changed) {
        this.componentChanged(changed);
      }
    }
    this.engine.update(e);
  }

  componentChanged(changed: ComponentChanged) {
    if (changed.component instanceof Physics) {
      switch (changed.type) {
        case OBSERVER_TYPE.ADD: {
          if (changed.gameObject.transform.parent && !changed.gameObject.getComponent(Physics).body) {
            this.engine.add(changed.component);
          }
          break;
        }
        case OBSERVER_TYPE.CHANGE: {
          this.engine.change(changed.component);
          break;
        }
        case OBSERVER_TYPE.REMOVE: {
          break;
        }
      }
    } else {
      switch (changed.type) {
        case OBSERVER_TYPE.CHANGE: {
          if ((changed.component as Transform).parent) {
            let physics = changed.gameObject.getComponent(Physics);
            if (physics && !physics.body) {
              this.engine.add(physics);
            }
          } else {
            let physics = changed.gameObject.getComponent(Physics);
            physics && this.engine.remove(physics);
          }
        }
      }
    }
  }
  /**
   * 和 update?() 类似，在所有System和组件的 update?() 执行以后调用。
   *
   * Like update, called all of gameobject update.
   */
  lateUpdate() {}
  /**
   * 游戏开始和游戏暂停后开始播放的时候调用。
   *
   * Called while the game to play when game pause.
   */
  onResume() {
    if (!this.engine.enabled) {
      this.engine.awake();
    }
  }
  /**
   * 游戏暂停的时候调用。
   *
   * Called while the game paused.
   */
  onPause() {
    this.engine.stop();
  }
  /**
   * System 被销毁的时候调用。
   * Called while the system be destroyed.
   */
  onDestroy() {}
}
