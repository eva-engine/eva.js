import Ticker from './Ticker';
import type { FrameParams } from './Ticker';
import Scene from './Scene';
import type { SystemConstructor } from '../core/System';
import System from '../core/System';
import Component from '../core/Component';
import GameObject from '../core/GameObject';
import { setSystemObserver, initObserver } from '../core/observer';
import EventEmitter from 'eventemitter3';

/** eva plugin struct */
export interface PluginStruct {
  Components?: (typeof Component)[];
  Systems?: (typeof System)[];
}

interface GameParams {
  /** isn't game will auto start */
  autoStart?: boolean;

  /** fps for this game */
  frameRate?: number;

  /** systems in this game */
  systems?: System[];

  /** whether or not need to create scene */
  needScene?: boolean;
}

export enum LOAD_SCENE_MODE {
  SINGLE = 'SINGLE',
  MULTI_CANVAS = 'MULTI_CANVAS',
}

interface LoadSceneParams {
  scene: Scene;
  mode?: LOAD_SCENE_MODE;
  params?: {
    width?: number;
    height?: number;
    canvas?: HTMLCanvasElement;
    renderType?: number;
    autoStart?: boolean;
    sharedTicker?: boolean;
    sharedLoader?: boolean;
    transparent?: boolean;
    antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    resolution?: number;
    backgroundColor?: number;
    clearBeforeRender?: boolean;
    roundPixels?: boolean;
    forceFXAA?: boolean;
    legacy?: boolean;
    autoResize?: boolean;
    powerPreference?: 'high-performance';
  };
}

interface DestroySceneParams {
  scene: Scene;
}

const triggerStart = (obj: System | Component) => {
  if (!(obj instanceof System) && !(obj instanceof Component)) return;
  if (obj.started) return;
  obj.started = true;

  try {
    obj.start && obj.start();
  } catch (e) {
    if (obj instanceof Component) {
      // @ts-ignore
      console.error(`${obj.constructor.componentName} start error`, e);
    } else {
      // @ts-ignore
      console.error(`${obj.constructor.systemName} start error`, e);
    }
  }
};

const getAllGameObjects = game => {
  const mainSceneGameObjects = game?.scene?.gameObjects || [];

  const gameObjectsArray = game?.multiScenes.map(({ gameObjects }) => gameObjects);
  let otherSceneGameObjects = [];
  for (const gameObjects of gameObjectsArray) {
    otherSceneGameObjects = [...otherSceneGameObjects, ...gameObjects];
  }
  return [...mainSceneGameObjects, ...otherSceneGameObjects];
};

const gameObjectLoop = (e, gameObjects = []) => {
  for (const gameObject of gameObjects) {
    for (const component of gameObject.components) {
      try {
        triggerStart(component);
        component.update && component.update(e);
      } catch (e) {
        console.error(`gameObject: ${gameObject.name} ${component.name} update error`, e);
      }
    }
  }
  for (const gameObject of gameObjects) {
    for (const component of gameObject.components) {
      try {
        component.lateUpdate && component.lateUpdate(e);
      } catch (e) {
        console.error(`gameObject: ${gameObject.name} ${component.name} lateUpdate error`, e);
      }
    }
  }
};

const systemFrameLoop = (frame: FrameParams, systems: System[], hook: 'frameStart' | 'frameUpdate') => {
  for (const system of systems) {
    try {
      const callback = system[hook];
      if (!callback) continue;
      triggerStart(system);
      callback.call(system, frame);
    } catch (e) {
      // @ts-ignore
      console.error(`${system.constructor.systemName} ${hook} error`, e);
    }
  }
};

const gameObjectResume = gameObjects => {
  for (const gameObject of gameObjects) {
    for (const component of gameObject.components) {
      try {
        component.onResume && component.onResume();
      } catch (e) {
        console.error(`gameObject: ${gameObject.name}, ${component.name}, onResume error`, e);
      }
    }
  }
};

const gameObjectPause = gameObjects => {
  for (const gameObject of gameObjects) {
    for (const component of gameObject.components) {
      try {
        component.onPause && component.onPause();
      } catch (e) {
        console.error(`gameObject: ${gameObject.name}, ${component.name}, onResume error`, e);
      }
    }
  }
};

/**
 * 游戏实例类，EVA.js 的核心管理类
 *
 * Game 类负责管理游戏的生命周期、系统、场景和主循环。
 * 它协调各个系统的执行，处理游戏对象的更新，管理游戏的运行状态。
 *
 * @example
 * ```typescript
 * const game = new Game();
 * await game.init({
 *   systems: [new RendererSystem(), new PhysicsSystem()],
 *   autoStart: true,
 *   frameRate: 60
 * });
 *
 * const scene = new Scene('main');
 * game.loadScene(scene);
 * ```
 */
class Game extends EventEmitter {
  /** 私有场景引用 */
  _scene: Scene;

  /** 画布元素 */
  canvas: HTMLCanvasElement;

  /**
   * 游戏运行状态
   * @defaultValue false
   */
  playing: boolean = false;

  /** 游戏是否已启动 */
  started: boolean = false;

  /** 多场景列表（用于多画布渲染模式） */
  multiScenes: Scene[] = [];

  /** 时钟管理器，控制游戏主循环 */
  ticker: Ticker;

  /** 游戏中注册的所有系统 */
  systems: System[] = [];

  async init({ systems, frameRate = 60, autoStart = true, needScene = true }: GameParams = {}) {
    if (typeof window !== 'undefined' && window.__EVA_INSPECTOR_ENV__) {
      window.__EVA_GAME_INSTANCE__ = this;
    }
    this.ticker = new Ticker({ autoStart: false, frameRate });
    this.initTicker();
    if (systems && systems.length) {
      for (const system of systems) {
        await this.addSystem(system);
      }
    }
    if (needScene) {
      this.loadScene(new Scene('scene'));
    }

    if (autoStart) {
      this.start();
    }
  }

  /**
   * Get scene on this game
   */
  get scene() {
    return this._scene;
  }

  set scene(scene: Scene) {
    this._scene = scene;
  }

  get gameObjects() {
    return getAllGameObjects(this);
  }

  /**
   * 通过名字查找游戏对象（跨所有场景）
   *
   * 先查主场景，再依次查多场景，返回第一个匹配的未销毁对象。
   *
   * @param name - 游戏对象名称
   * @returns 匹配的游戏对象，无则返回 null
   */
  findByName(name: string): GameObject | null {
    const result = this._scene?.findByName(name);
    if (result) return result;
    for (const scene of this.multiScenes) {
      const found = scene.findByName(name);
      if (found) return found;
    }
    return null;
  }

  /**
   * 通过名字查找所有匹配的游戏对象（跨所有场景）
   *
   * @param name - 游戏对象名称
   * @returns 所有匹配且未销毁的游戏对象数组
   */
  findAllByName(name: string): GameObject[] {
    const result = this._scene?.findAllByName(name) || [];
    for (const scene of this.multiScenes) {
      const found = scene.findAllByName(name);
      for (const go of found) {
        result.push(go);
      }
    }
    return result;
  }

  async addSystem<T extends System>(S: T): Promise<T>;
  async addSystem<T extends System>(
    S: SystemConstructor<T>,
    obj?: ConstructorParameters<SystemConstructor<T>>,
  ): Promise<T>;

  /**
   * Add system
   * @param S - system instance or system Class
   * @typeParam T - system which extends base `System` class
   * @typeparam U - type of system class
   */
  async addSystem<T extends System>(
    S: T | SystemConstructor<T>,
    obj?: ConstructorParameters<SystemConstructor<T>>,
  ): Promise<T> {
    let system;
    if (S instanceof Function) {
      system = new S(obj);
    } else if (S instanceof System) {
      system = S;
    } else {
      console.warn('can only add System');
      return;
    }

    const hasTheSystem = this.systems.find(item => {
      return item.constructor === system.constructor;
    });
    if (hasTheSystem) {
      console.warn(`${system.constructor.systemName} System has been added`);
      return;
    }

    system.game = this;
    system.init && (await system.init(system.__systemDefaultParams));

    setSystemObserver(system, system.constructor);
    initObserver(system.constructor);

    try {
      system.awake && system.awake();
    } catch (e) {
      // @ts-ignore
      console.error(`${system.constructor.systemName} awake error`, e);
    }

    this.systems.push(system);
    this.emit('systemAdded', system);
    return system;
  }

  /**
   * Remove system from this game
   * @param system - one of system instance / system Class or system name
   */
  removeSystem<S extends System>(system: S | SystemConstructor<S> | string) {
    if (!system) return;

    let index = -1;
    if (typeof system === 'string') {
      index = this.systems.findIndex(s => s.name === system);
    } else if (system instanceof Function) {
      index = this.systems.findIndex(s => s.constructor === system);
    } else if (system instanceof System) {
      index = this.systems.findIndex(s => s === system);
    }

    if (index > -1) {
      this.systems[index].destroy && this.systems[index].destroy();
      this.systems.splice(index, 1);
    }
  }

  /**
   * Get system
   * @param S - system class or system name
   * @returns system instance
   */
  getSystem<T extends System>(S: SystemConstructor<T> | string): T {
    return this.systems.find(system => {
      if (typeof S === 'string') {
        return system.name === S;
      } else {
        return system instanceof S;
      }
    }) as T;
  }

  /** Pause game */
  pause() {
    if (!this.playing) return;
    this.playing = false;
    this.ticker.pause();
    this.triggerPause();
  }

  /** Start game */
  start() {
    if (this.playing) return;
    this.playing = true;
    this.started = true;
    this.ticker.start();
  }

  /** Resume game */
  resume() {
    if (this.playing) return;
    this.playing = true;
    this.ticker.start();
    this.triggerResume();
  }

  /**
   * add main render method to ticker
   * @remarks
   * the method added to ticker will called in each requestAnimationFrame,
   * 1. call update method on all gameObject
   * 2. call lastUpdate method on all gameObject
   * 3. call update method on all system
   * 4. call lastUpdate method on all system
   */
  initTicker() {
    this.ticker.addFrameStart(frame => {
      systemFrameLoop(frame, this.systems, 'frameStart');
    });
    this.ticker.add(e => {
      this.scene && gameObjectLoop(e, this.gameObjects);
      for (const system of this.systems) {
        try {
          triggerStart(system);
          system.update && system.update(e);
        } catch (e) {
          // @ts-ignore
          console.error(`${system.constructor.systemName} update error`, e);
        }
      }
      for (const system of this.systems) {
        try {
          system.lateUpdate && system.lateUpdate(e);
        } catch (e) {
          // @ts-ignore
          console.error(`${system.constructor.systemName} lateUpdate error`, e);
        }
      }
    });
    this.ticker.addFrame(frame => {
      systemFrameLoop(frame, this.systems, 'frameUpdate');
    });
  }

  /** Call onResume method on all gameObject's, and then call onResume method on all system */
  triggerResume() {
    gameObjectResume(this.gameObjects);
    for (const system of this.systems) {
      try {
        system.onResume && system.onResume();
      } catch (e) {
        // @ts-ignore
        console.error(`${system.constructor.systemName}, onResume error`, e);
      }
    }
  }

  /** Call onPause method on all gameObject */
  triggerPause() {
    gameObjectPause(this.gameObjects);

    for (const system of this.systems) {
      try {
        system.onPause && system.onPause();
      } catch (e) {
        // @ts-ignore
        console.error(`${system.constructor.systemName}, onPause error`, e);
      }
    }
  }

  // TODO: call system destroy method
  /** remove all system on this game */
  destroySystems() {
    for (const system of [...this.systems]) {
      this.removeSystem(system);
    }
    this.systems.length = 0;
  }

  /** Destroy game instance */
  destroy() {
    this.removeAllListeners();
    if (this.playing) {
      this.pause();
    } else {
      this.ticker?.pause();
    }
    this.scene?.destroy();
    this.destroySystems();
    this.ticker = null;
    this.scene = null;
    this.canvas = null;
    this.multiScenes = null;
  }

  loadScene({ scene, mode = LOAD_SCENE_MODE.SINGLE, params = {} }: LoadSceneParams) {
    if (!scene) {
      return;
    }
    switch (mode) {
      case LOAD_SCENE_MODE.SINGLE:
        this.scene = scene;
        break;

      case LOAD_SCENE_MODE.MULTI_CANVAS:
        this.multiScenes.push(scene);
        break;
    }
    this.emit('sceneChanged', { scene, mode, params });
  }

  pauseScene({ scene }) {
    this.emit('pauseScene', { scene });
  }

  startScene({ scene }) {
    this.emit('startScene', { scene });
  }

  destroyScene({ scene }: DestroySceneParams) {
    const index = this.multiScenes.findIndex(item => item === scene);
    if (index > -1) {
      const scene = this.multiScenes.splice(index, 1)[0];
      this.emit('sceneDestroyed', { scene });
    }
  }
}

export default Game;
