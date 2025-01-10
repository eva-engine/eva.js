import { System, decorators, Game, LOAD_SCENE_MODE } from '@eva/eva.js';
import { Application } from '@eva/renderer-adapter';
import RendererManager from './manager/RendererManager';
import ContainerManager from './manager/ContainerManager';
import Transform from './Transform';
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
  async init(params: Partial<RendererSystemParams>) {
    this.params = params;
    this.application = await this.createApplication(params);

    this.containerManager = new ContainerManager();
    this.rendererManager = new RendererManager({
      game: this.game,
      rendererSystem: this,
    });
    this.game.canvas = this.application.canvas as any;
    this.transform = new Transform({
      system: this,
      containerManager: this.containerManager,
    });

    this.game.on('sceneChanged', ({ scene, mode, params }) => {
      let application;
      switch (mode) {
        case LOAD_SCENE_MODE.SINGLE:
          application = this.application;
          break;
        case LOAD_SCENE_MODE.MULTI_CANVAS:
          application = this.createMultiApplication({ params });
          break;
      }
      scene.canvas = application.canvas;
      this.transform.emit('changeScene', {
        scene,
        mode,
        application,
      });
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
    const ticker = new Ticker();
    // @ts-ignore
    Ticker._system = Ticker._shared = ticker;
    // @ts-ignore
    ticker._protected = true;

    await app.init({ sharedTicker: true, ...params, hello: true });
    Ticker.shared.stop();
    Ticker.shared.autoStart = false;
    if (params.enableScroll !== undefined) {
      params.enableScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
    }
    return app;
  }

  update() {
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
    this.transform.update();
    this.application.ticker.update(e.time);
  }
  onDestroy() {
    this.application.destroy();
    for (const app of this.multiApps) {
      app && app.destroy();
    }
    this.transform.destroy();
    this.transform = null;
    this.params = null;
    this.rendererManager = null;
    this.containerManager = null;
    this.application = null;
    this.game = null;
    this.multiApps = null;
  }
  resize(width, height) {
    this.params.width = width;
    this.params.height = height;
    // @ts-ignore
    this.application.renderer.resize(width, height);
  }
}
