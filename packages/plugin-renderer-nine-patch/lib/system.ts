import { GameObject, decorators, resource, ComponentChanged, RESOURCE_TYPE, OBSERVER_TYPE } from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { NinePatch as NinePatchSprite } from '@eva/renderer-adapter';
import NinePatchComponent from './component';
import type { Texture } from 'pixi.js';

const resourceKeySplit = '_s|r|c_'; // Notice: This key be created by sprite system.

@decorators.componentObserver({
  NinePatch: ['resource', 'spriteName', 'leftWidth', 'topHeight', 'rightWidth', 'bottomHeight'],
})
export default class NinePatch extends Renderer {
  static systemName: string = 'NinePatch';
  name: string = 'NinePatch';
  ninePatch: { [propName: number]: NinePatchSprite } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const { width, height } = gameObject.transform.size;
    if (this.ninePatch[gameObject.id]) {
      this.ninePatch[gameObject.id].width = width;
      this.ninePatch[gameObject.id].height = height;
    }
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'NinePatch') {
      if (changed.type === OBSERVER_TYPE.ADD) {
        this.add(changed);
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.remove(changed);
      } else {
        this.remove(changed);
        this.add(changed);
      }
    }
  }
  async add(changed: ComponentChanged) {
    const component = changed.component as NinePatchComponent;
    const gameObjectId = changed.gameObject.id;
    const asyncId = this.increaseAsyncId(gameObjectId);
    const { type, data } = await resource.getResource(component.resource);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    if (!data) {
      console.error(`GameObject:${changed.gameObject.name}'s NinePatch resource load error`);
      return
    }
    let img: Parameters<(typeof Texture)['from']>[0];
    if (type === RESOURCE_TYPE.SPRITE) {
      img = component.resource + resourceKeySplit + component.spriteName;
    } else {
      img = data.image;
    }
    const { leftWidth, topHeight, rightWidth, bottomHeight } = component;
    const np = new NinePatchSprite(img, leftWidth, topHeight, rightWidth, bottomHeight);

    this.ninePatch[changed.gameObject.id] = np;
    component.ninePatch = np;
    this.containerManager
      .getContainer(changed.gameObject.id)
      // @ts-ignore
      .addChildAt(np, 0);
  }
  remove(changed: ComponentChanged) {
    const gameObjectId = changed.gameObject.id;
    this.increaseAsyncId(gameObjectId);
    const sprite = this.ninePatch[gameObjectId];
    if (sprite) {
      this.containerManager.getContainer(changed.gameObject.id).removeChild(sprite);
      delete this.ninePatch[changed.gameObject.id];
      sprite.destroy({ children: true });
    }
  }
}
