import Ticker from './Ticker';
import Scene from './Scene';
import type { SystemConstructor } from '../core/System';
import System from '../core/System';
import Component from '../core/Component';
import { setSystemObserver, initObserver } from '../core/observer';
import EventEmitter from 'eventemitter3';
import { shouldExecuteInEditMode } from '@eva/inspector-decorator';

/** eva plugin struct */
export interface PluginStruct {
  Components?: typeof Component[];
  Systems?: typeof System[];
}

type Mode = 'EDIT' | 'PLAY';

interface GameParams {
  /** isn't game will auto start */
  autoStart?: boolean;

  /** fps for this game */
  frameRate?: number;

  /** systems in this game */
  systems?: System[];

  /** whether or not need to create scene */
  needScene?: boolean;
  /**  */
  mode?: Mode;
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

class Game extends EventEmitter {
  _scene: Scene;
  canvas: HTMLCanvasElement;

  /**
   * State of game
   * @defaultValue false
   */
  playing: boolean = false;
  started: boolean = false;
  multiScenes: Scene[] = [];

  /**
   * Ticker
   */
  ticker: Ticker;

  /** Systems alled to this game */
  systems: System[] = [];

  mode: Mode = 'PLAY';

  constructor({ systems, frameRate = 60, autoStart = true, needScene = true, mode = 'PLAY' }: GameParams = {}) {
    super();
    this.mode = mode;
    if (window.__EVA_INSPECTOR_ENV__) {
      window.__EVA_GAME_INSTANCE__ = this;
    }
    this.ticker = new Ticker({ autoStart: false, frameRate });
    this.initTicker();

    if (systems && systems.length) {
      for (const system of systems) {
        this.addSystem(system);
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

  addSystem<T extends System>(S: T): T;
  addSystem<T extends System>(S: SystemConstructor<T>, obj?: ConstructorParameters<SystemConstructor<T>>): T;

  /**
   * Add system
   * @param S - system instance or system Class
   * @typeParam T - system which extends base `System` class
   * @typeparam U - type of system class
   */
  addSystem<T extends System>(S: T | SystemConstructor<T>, obj?: ConstructorParameters<SystemConstructor<T>>): T {
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
    system.init && system.init(system.__systemDefaultParams);

    setSystemObserver(system, system.constructor);
    initObserver(system.constructor);

    try {
      system.awake && system.awake();
    } catch (e) {
      // @ts-ignore
      console.error(`${system.constructor.systemName} awake error`, e);
    }

    this.systems.push(system);
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
    this.ticker.add(e => {
      this.scene && this.gameObjectLoop(e, this.gameObjects);
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
    this.pause();
    this.scene.destroy();
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

  private shouldUpdate(component) {
    return this.mode === 'PLAY' || (this.mode === 'EDIT' && shouldExecuteInEditMode(component.constructor));
  }

  private gameObjectLoop(e, gameObjects = []) {
    for (const gameObject of gameObjects) {
      for (const component of gameObject.components) {
        try {
          if (this.shouldUpdate(component)) {
            triggerStart(component);
            component.update && component.update(e);
          }
        } catch (e) {
          console.error(`gameObject: ${gameObject.name} ${component.name} update error`, e);
        }
      }
    }
    for (const gameObject of gameObjects) {
      for (const component of gameObject.components) {
        try {
          if (this.shouldUpdate(component)) {
            component.lateUpdate && component.lateUpdate(e);
          }
        } catch (e) {
          console.error(`gameObject: ${gameObject.name} ${component.name} lateUpdate error`, e);
        }
      }
    }
  }
}

export default Game;
