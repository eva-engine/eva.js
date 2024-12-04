import { System, decorators, Game, LOAD_SCENE_MODE } from '@eva/eva.js';
import { Application } from '@eva/renderer-adapter';
import RendererManager from './manager/RendererManager';
import ContainerManager from './manager/ContainerManager';
import Transform from './Transform';
// import { ticker } from 'pixi.js';
import type { WebGLRenderer, ApplicationOptions } from 'pixi.js';
import { Ticker } from 'pixi.js';
import { registerCompressedTexture } from './compressedTexture';
import { SuportedCompressedTexture, getSuportCompressedTextureFormats } from './compressedTexture/ability';

export interface RendererSystemParams extends Partial<ApplicationOptions> {
  canvas?: HTMLCanvasElement;
  renderType?: number;
  /**
   * @deprecated PreventScroll property will deprecate at next major version, please use enableScroll instead. https://eva.js.org/#/tutorials/game
   */
  preventScroll?: boolean;
  enableScroll?: boolean;
}

export enum RENDERER_TYPE {
  UNKNOWN = 0,
  WEBGL = 1,
  CANVAS = 2,
}

const disableScroll = renderer => {
  // renderer.plugins.interaction.autoPreventDefault = true;
  // renderer.view.style.touchAction = 'none';
};

const enableScroll = renderer => {
  // renderer.plugins.interaction.autoPreventDefault = false;
  // renderer.view.style.touchAction = 'auto';
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
    this.game.canvas = this.application.canvas;
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

    const gl = (this.application.renderer as WebGLRenderer).gl;
    if (gl) {
      this.suportedCompressedTextureFormats = getSuportCompressedTextureFormats(gl);
      registerCompressedTexture(gl);
    }
  }

  registerObserver(observerInfo) {
    // @ts-ignore
    const thisObserverInfo = this.constructor.observerInfo;
    for (const key in observerInfo) {
      if (!thisObserverInfo[key]) {
        thisObserverInfo[key] = [];
      }
      thisObserverInfo[key].push(...observerInfo[key]);
    }
  }

  createMultiApplication({ params }: { params: RendererSystemParams }) {
    const app = this.createApplication(params);
    this.multiApps.push(app);
    return app;
  }

  async createApplication(params: Partial<RendererSystemParams>) {
    const app = new Application();
    await app.init({ sharedTicker: true, ...params, hello: true });
    Ticker.shared.stop();
    Ticker.shared.autoStart = false;
    /**
     * Fix https://github.com/eva-engine/eva.js/issues/30
     * PreventScroll is legacy, because it has bug.
     */
    if (params.preventScroll !== undefined) {
      console.warn(
        'PreventScroll property will deprecate at next major version, please use enableScroll instead. https://eva.js.org/#/tutorials/game',
      );
      params.preventScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
    }

    if (params.enableScroll !== undefined) {
      params.enableScroll ? enableScroll(app.renderer) : disableScroll(app.renderer);
    }

    if (params.preventScroll === undefined && params.enableScroll === undefined) {
      enableScroll(app.renderer);
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
    this.application.renderer.resize(width, height);
  }
}
