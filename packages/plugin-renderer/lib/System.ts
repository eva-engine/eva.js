import { System, decorators, Game, LOAD_SCENE_MODE, GameObject } from '@eva/eva.js';
import { Application } from '@eva/renderer-adapter';
import RendererManager from './manager/RendererManager';
import ContainerManager from './manager/ContainerManager';
import Transform from './Transform';
import type { GetBoundsOptions, RenderBounds } from './manager/ContainerManager';
// import { ticker } from 'pixi.js';
import type { ApplicationOptions } from 'pixi.js';
import { Ticker } from 'pixi.js';
import { SuportedCompressedTexture } from './compressedTexture/ability';

export interface RendererSystemParams extends Partial<ApplicationOptions> {
  canvas?: HTMLCanvasElement;
  renderType?: number;
  enableScroll?: boolean;
  debugMode?: boolean;
}

export interface ResizeRendererOptions {
  /** Eva design/canvas logical width. This does not include resolution scaling. */
  width?: number;
  /** Eva design/canvas logical height. This does not include resolution scaling. */
  height?: number;
  /** Pixi backing-store resolution. Does not change Eva design coordinates. */
  resolution?: number;
  /** Upper bound for resolution to avoid oversized backing stores. Defaults to 3. */
  maxResolution?: number;
}

export interface RendererResolutionState {
  width: number;
  height: number;
  resolution: number;
  /** Number of display objects whose own resolution was synchronized. */
  displayResolutionSyncCount?: number;
}

type RendererGameLike = Partial<Game> & {
  scene?: unknown;
  gameObjects?: unknown;
  on?: (name: string, handler: (...args: any[]) => void) => void;
};

export enum RENDERER_TYPE {
  UNKNOWN = 0,
  WEBGL = 1,
  CANVAS = 2,
}

const disableScroll = renderer => {
  renderer.events.autoPreventDefault = true;
  renderer.canvas.style.touchAction = 'none';
};

const enableScroll = renderer => {
  renderer.events.autoPreventDefault = false;
  renderer.canvas.style.touchAction = 'auto';
};

function isRendererGameLike(value: unknown): value is RendererGameLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as RendererGameLike;
  return Boolean(candidate.scene || candidate.gameObjects || typeof candidate.on === 'function');
}

@decorators.componentObserver({
  Transform: ['_parent'],
})
export default class Renderer extends System<RendererSystemParams> {
  static systemName: string = 'Renderer';
  params: Partial<RendererSystemParams>;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  application: Application;
  game: Game;
  transform: Transform;
  multiApps: Application[] = [];
  suportedCompressedTextureFormats: SuportedCompressedTexture;
  private destroyed = false;
  async init(params: Partial<RendererSystemParams> | RendererGameLike = {}) {
    this.destroyed = false;
    const gameLike = !this.game && isRendererGameLike(params) ? params : undefined;
    if (gameLike) {
      this.game = gameLike as Game;
    }
    const rendererParams = gameLike ? this.__systemDefaultParams || {} : (params as Partial<RendererSystemParams>);
    this.params = rendererParams;
    this.application = await this.createApplication(rendererParams);

    this.containerManager = new ContainerManager();
    this.rendererManager = new RendererManager({
      game: this.game,
      rendererSystem: this,
    });
    if (this.game) {
      this.game.canvas = this.application.canvas as any;
    }
    this.transform = new Transform({
      system: this,
      containerManager: this.containerManager,
    });

    this.game?.on?.('sceneChanged', async ({ scene, mode, params }) => {
      let application;
      switch (mode) {
        case LOAD_SCENE_MODE.SINGLE:
          application = this.application;
          break;
        case LOAD_SCENE_MODE.MULTI_CANVAS:
          application = await this.createMultiApplication({ params });
          break;
      }
      scene.canvas = application.canvas;
      this.transform.emit('changeScene', {
        scene,
        mode,
        application,
      });
    });

    this.game?.on?.('pauseScene', ({ scene }) => {
      this.onPauseScene(scene);
    });

    this.game?.on?.('startScene', ({ scene }) => {
      this.onStartScene(scene);
    });

    this.game?.on?.('sceneDestroyed', async ({ scene }) => {
      const index = this.multiApps.findIndex(app => app.canvas === scene.canvas);
      if (index > -1) {
        const app = this.multiApps.splice(index, 1)[0];
        app.destroy();
        scene.destroy();
      }
    });
  }

  registerObserver(observerInfo) {
    // @ts-ignore
    const thisObserverInfo = this.constructor.observerInfo;
    for (const key in observerInfo) {
      if (!thisObserverInfo[key]) {
        thisObserverInfo[key] = [];
      }
      //@ts-ignore
      thisObserverInfo[key].push(...observerInfo[key]);
    }
  }

  async createMultiApplication({ params }: { params: RendererSystemParams }): Promise<Application> {
    const app = await this.createApplication(params);
    // @ts-ignore
    this.multiApps.push(app);
    return app;
  }

  async createApplication(params: Partial<RendererSystemParams>): Promise<Application> {
    const app = new Application();
    if (params.debugMode) {
      globalThis.__PIXI_APP__ = app;
    }
    await app.init({ sharedTicker: true, ...params, hello: true });
    if (params.enableScroll !== undefined) {
      params.enableScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
    }
    Ticker.shared.stop();
    Ticker.shared.autoStart = false;
    return app;
  }

  update() {
    if (this.destroyed || !this.game || !this.containerManager || !this.rendererManager) return;

    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      this.transform.componentChanged(changed);
    }

    for (const gameObject of this.game.gameObjects) {
      this.containerManager.updateTransform({
        name: gameObject.id,
        transform: gameObject.transform,
      });
      this.rendererManager.update(gameObject);
    }
  }
  lateUpdate(e) {
    if (this.destroyed || !this.transform || !this.application) return;

    this.transform.update();
    this.application.ticker.update(e.time);
  }
  onDestroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.application?.ticker?.stop?.();
    this.application?.destroy(false, { children: true, context: true });
    for (const app of this.multiApps) {
      app?.ticker?.stop?.();
      app && app.destroy(false, { children: true, context: true });
    }
    this.transform?.destroy();
    this.transform = null;
    this.params = null;
    this.rendererManager = null;
    this.containerManager = null;
    this.application = null;
    this.game = null;
    this.multiApps = null;
  }
  resize(width: number, height: number, resolution?: number) {
    this.params.width = width;
    this.params.height = height;
    if (resolution != null) {
      this.params.resolution = this.clampResolution(resolution);
    }
    // @ts-ignore
    this.application.renderer.resize(width, height, this.params.resolution);
    if (resolution != null) {
      this.syncDisplayObjectResolution(this.params.resolution);
    }
  }

  /**
   * 更新 Pixi renderer backing-store resolution，不改变 Eva 设计坐标系。
   *
   * 预览画布可用该入口在 zoom/devicePixelRatio 变化时提高清晰度；
   * getBounds/Transform/worldTransform 仍返回设计逻辑坐标，不乘 resolution。
   */
  resizeRenderer(options: ResizeRendererOptions): RendererResolutionState {
    const width = options.width ?? this.params.width ?? this.application.renderer.width;
    const height = options.height ?? this.params.height ?? this.application.renderer.height;
    const resolution =
      options.resolution == null
        ? this.params.resolution ?? this.application.renderer.resolution ?? 1
        : this.clampResolution(options.resolution, options.maxResolution);

    this.params.width = width;
    this.params.height = height;
    this.params.resolution = resolution;
    // @ts-ignore Pixi v8 accepts resolution as the third resize argument.
    this.application.renderer.resize(width, height, resolution);
    const displayResolutionSyncCount = this.syncDisplayObjectResolution(resolution);
    return { width, height, resolution, displayResolutionSyncCount };
  }

  setResolution(resolution: number, options: Omit<ResizeRendererOptions, 'resolution'> = {}): RendererResolutionState {
    return this.resizeRenderer({ ...options, resolution });
  }

  private clampResolution(resolution: number, maxResolution: number = 3): number {
    const normalized = Number.isFinite(resolution) && resolution > 0 ? resolution : 1;
    return Math.min(normalized, maxResolution);
  }

  /**
   * Keep renderer-owned display objects that expose a resolution property in
   * sync with the backing-store resolution. This is intentionally display-tree
   * based rather than component-type based, so Text/HTMLText and future Pixi
   * objects with resolution support all follow the same renderer contract.
   */
  private syncDisplayObjectResolution(resolution: number): number {
    const roots = this.containerManager?.containerMap ? Object.values(this.containerManager.containerMap) : [];
    const visited = typeof WeakSet !== 'undefined' ? new WeakSet<object>() : undefined;
    let syncedCount = 0;

    const visit = (displayObject: any) => {
      if (!displayObject || typeof displayObject !== 'object') return;
      if (visited?.has(displayObject)) return;
      visited?.add(displayObject);

      if ('resolution' in displayObject) {
        const currentResolution = displayObject.resolution;
        if (
          (typeof currentResolution === 'number' || currentResolution === null) &&
          Math.abs((currentResolution ?? 1) - resolution) > 0.001
        ) {
          try {
            displayObject.resolution = resolution;
            if (
              typeof displayObject.resolution === 'number' &&
              Math.abs(displayObject.resolution - resolution) <= 0.001
            ) {
              syncedCount += 1;
            }
          } catch (_) {
            // Some Pixi objects expose a readonly or unsupported resolution setter.
          }
        }
      }

      if (Array.isArray(displayObject.children)) {
        for (const child of displayObject.children) {
          visit(child);
        }
      }
    };

    for (const root of roots) {
      visit(root);
    }

    return syncedCount;
  }

  /**
   * 获取 GameObject 的真实渲染 bounds。
   *
   * 默认返回 PixiJS display object 的 world bounds。Eva 的 Pixi world 坐标
   * 与 canvas/design 逻辑坐标一致；如果画布被 CSS 缩放，调用方再按
   * canvas.getBoundingClientRect() / renderer width 做屏幕坐标换算。
   *
   * 当渲染对象尚未挂载或资源未加载完成时，会回退到 Transform.size。
   */
  getBounds(gameObject: GameObject, options?: GetBoundsOptions): RenderBounds | null {
    return this.containerManager?.getBounds(gameObject, options) || null;
  }

  private getApplicationByScene(scene) {
    const index = this.multiApps.findIndex(app => app.canvas === scene.canvas);
    if (index > -1) {
      const application = this.multiApps[index];
      return application;
    } else {
      console.warn('application not found');
    }
  }

  private onPauseScene(scene) {
    const app = this.getApplicationByScene(scene);
    if (app) {
      app.stop();
    }
  }

  private onStartScene(scene) {
    const app = this.getApplicationByScene(scene);
    if (app) {
      app.start();
    }
  }

  resizeByScene(scene, width: number, height: number, resolution?: number) {
    const app = this.getApplicationByScene(scene);
    if (app) {
      // @ts-ignore
      app.renderer.resize(width, height, resolution);
    }
  }
}
