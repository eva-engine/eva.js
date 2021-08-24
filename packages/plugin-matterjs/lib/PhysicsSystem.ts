import { System, decorators, OBSERVER_TYPE } from '@eva/eva.js';
import PhysicsEngine from './PhysicsEngine';
import { Physics } from './Physics';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Object ? DeepPartial<T[P]> : T[P];
}

export interface PhysicsSystemParams {
  resolution?: number
  fps?: number
  isTest?: boolean
  element?: HTMLElement
  canvas?: HTMLCanvasElement
  mouse?: {
    open: boolean
    constraint?: Matter.Constraint
  }
  world: DeepPartial<Matter.IWorldDefinition>
}

@decorators.componentObserver({
  Physics: [{ prop: ['bodyParams'], deep: true }],
  Transform: ['_parent'],
})
export default class PhysicsSystem extends System<PhysicsSystemParams> {
  static systemName = 'PhysicsSystem';
  private engine: PhysicsEngine;

  /**
   * System 初始化用，可以配置参数，游戏未开始
   *
   * System init, set params, game is not begain
   * @param param init params
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
  awake() { }

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
  update() {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      if (changed) {
        this.componentChanged(changed);
      }
    }
    this.engine.update();
  }

  componentChanged(changed) {
    if (changed.component instanceof Physics) {
      switch (changed.type) {
        case OBSERVER_TYPE.ADD: {
          changed.gameObject.getComponent('Transform') && this.engine.add(changed.component);
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
          if (changed.component.parent) {
            let physics = changed.gameObject.getComponent(Physics) as Physics;
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
  lateUpdate() { }
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
  onDestroy() { }
}
