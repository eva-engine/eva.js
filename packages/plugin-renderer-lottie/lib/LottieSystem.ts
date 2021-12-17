import { OBSERVER_TYPE, decorators, ComponentChanged, resource } from '@eva/eva.js';
import type { RendererManager, ContainerManager, RendererSystem } from '@eva/plugin-renderer';
import { Renderer } from '@eva/plugin-renderer';
import {
  AnimationManager,
  DisplayRegister,
  LoaderRegister,
  CompElement,
  PathLottie,
  SolidElement,
  SpriteElement,
  Container,
  LoadTexture,
  LoadJson,
} from './lottie-pixi';
import { imageHandle } from './utils';
import Lottie from './Lottie';
import type { Application } from '@eva/renderer-adapter';

function loadTexture(assets, options) {
  return new LoadTexture(assets, options);
}

function loadJson(path) {
  return new LoadJson(path);
}

LoaderRegister.registerLoaderByType(LoaderRegister.Type.Texture, loadTexture);
LoaderRegister.registerLoaderByType(LoaderRegister.Type.Ajax, loadJson);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Null, CompElement);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Path, PathLottie);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Shape, CompElement);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Solid, SolidElement);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Sprite, SpriteElement);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Component, CompElement);
DisplayRegister.registerDisplayByType(DisplayRegister.Type.Container, Container);

@decorators.componentObserver({
  Lottie: [],
})
export default class LottieSystem extends Renderer {
  static systemName = 'LottieSystem';
  public manager: any;
  public app: Application;
  public renderSystem: RendererSystem;
  public rendererManager: RendererManager;
  public containerManager: ContainerManager;
  public managerLife = [
    'DisplayReady',
    'ImageReady',
    'success',
    'error',
    'complete',
    'loopComplete',
    'enterFrame',
    'update',
  ];

  /**
   * System 初始化用，可以配置参数，游戏未开始
   *
   * System init, set params, game is not begain
   * @param param init params
   */
  init() {
    this.renderSystem = this.game.getSystem('Renderer') as RendererSystem;
    this.app = this.renderSystem.application;
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'Lottie') {
      if (changed.type === OBSERVER_TYPE.ADD) {
        this.add(changed);
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.remove(changed);
      }
    }
  }

  async add(changed: ComponentChanged) {
    this.manager = new AnimationManager(this.app);
    const component = changed.component as Lottie;
    const container = this.renderSystem.containerManager.getContainer(changed.gameObject.id);
    if (!container) return;
    const { resource: rn, ...otherOpts } = component.options;
    const { data } = await resource.getResource(rn);
    const json = { ...(data.json || {}) };
    const assets = json.assets || [];
    assets.forEach(item => {
      if (item.p) item.p = imageHandle(item.p);
    });
    const anim = this.manager.parseAnimation({
      keyframes: json,
      ...otherOpts,
    }) as any;
    component.anim = anim;
    container.addChildAt(anim.group, 0);
    this.managerLife.forEach(eventName => {
      anim.on(eventName, e => component.emit(eventName, e));
    });
    if (anim.isImagesLoaded) component.emit('success', {});
  }

  remove(changed: ComponentChanged) {
    const component = changed.component as Lottie;
    const container = this.renderSystem.containerManager.getContainer(changed.gameObject.id);
    if (container) {
      container.removeChild(component.anim.group);
      component.anim.destroy();
    }
    component.anim = null;
  }
}
