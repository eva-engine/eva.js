import {
  OBSERVER_TYPE,
  decorators,
  ComponentChanged,
  resource
} from '@eva/eva.js';
import {
  Renderer,
  RendererManager,
  ContainerManager,
} from '@eva/plugin-renderer';
import lottiePixi from '@ali/lottie-pixi';
import { imageHandle } from './utils';
import Lottie from './Lottie'

const { AnimationManager } = lottiePixi;

@decorators.componentObserver({
  Lottie: []
})
export default class LottieSystem extends Renderer {
  static systemName = 'LottieSystem'
  public manager: any;
  public app: any;
  public renderSystem;
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
    'update'
  ]

  /**
   * System 初始化用，可以配置参数，游戏未开始
   *
   * System init, set params, game is not begain
   * @param param init params
   */
  init() {
    this.renderSystem = this.game.systems.find((s: any) => (s.application))
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
    const container = this.renderSystem.containerManager.getContainer(
      changed.gameObject.id,
    );
    if (!container) return;
    const { resource: rn, ...otherOpts } = component.options
    const { data } = await resource.getResource(rn);
    const json = { ...(data.json || {}) };
    const assets = json.assets || [];
    assets.forEach(item => {
      if (item.p) item.p = imageHandle(item.p);
    });
    const anim = this.manager.parseAnimation({
      keyframes: json,
      ...otherOpts
    })
    component.anim = anim;
    container.addChildAt(anim.group, 0)
    this.managerLife.forEach(eventName => {
      anim.on(eventName, e => component.emit(eventName, e))
    })
    if (anim.isImagesLoaded) component.emit('success', {});
  }

  remove(changed: ComponentChanged) {
    const component = changed.component as Lottie;
    const container = this.renderSystem.containerManager.getContainer(
      changed.gameObject.id,
    );
    if (container) {
      container.removeChild(component.anim.group);
    }
    component.anim = null;
  }
}