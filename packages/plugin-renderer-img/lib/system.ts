import { GameObject, decorators, resource, ComponentChanged, RESOURCE_TYPE, OBSERVER_TYPE } from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Sprite } from '@eva/renderer-adapter';
import { Texture } from 'pixi.js';
import ImgComponent from './component';

resource.registerInstance(RESOURCE_TYPE.IMAGE, ({ data = {} }) => {
  const { image } = data;
  if (image) {
    if (image instanceof Texture) {
      return image;
    }
    const texture = Texture.from(image);
    return texture;
  }
  return data;
});
resource.registerDestroy(RESOURCE_TYPE.IMAGE, ({ instance }) => {
  if (instance) {
    (instance as Texture).destroy(true);
  }
});

@decorators.componentObserver({
  Img: ['resource', { prop: 'anchor', deep: true }, 'width', 'height'],
})
export default class Img extends Renderer {
  static systemName = 'ImgSystem';
  name: string = 'ImgSystem';
  imgs: { [propName: number]: Sprite } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init(_params?: unknown) {
    const renderSystem = this.game?.getSystem?.(RendererSystem) as RendererSystem | undefined;
    if (!renderSystem?.rendererManager) return;

    this.renderSystem = renderSystem;
    this.renderSystem.rendererManager.register(this);
  }
  update(_frame?: unknown) {
    super.update(_frame as any);
  }
  rendererUpdate(gameObject: GameObject) {
    const component = gameObject.getComponent('Img') as ImgComponent;
    this.applySpriteLayout(gameObject, component);
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'Img') {
      const gameObjectId = changed.gameObject.id;
      const component: ImgComponent = changed.component as ImgComponent;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const sprite = new Sprite(null);
        this.imgs[gameObjectId] = sprite;
        this.containerManager?.getContainer(gameObjectId)?.addChildAt(sprite.sprite, 0);
        this.applySpriteLayout(changed.gameObject, component);
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
          return;
        }
        sprite.image = instance;
        this.applySpriteLayout(changed.gameObject, component);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        this.applySpriteLayout(changed.gameObject, component);
        if (changed.prop?.prop?.includes('resource')) {
          const asyncId = this.increaseAsyncId(gameObjectId);
          const { instance } = await resource.getResource(component.resource);
          if (!this.validateAsyncId(gameObjectId, asyncId)) return;
          if (!instance) {
            console.error(`GameObject:${changed.gameObject.name}'s Img resource load error`);
            return;
          }
          this.imgs[gameObjectId].image = instance;
          this.applySpriteLayout(changed.gameObject, component);
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.increaseAsyncId(gameObjectId);
        const sprite = this.imgs[gameObjectId];
        if (!sprite) return;
        this.containerManager?.getContainer(gameObjectId)?.removeChild(sprite.sprite);
        sprite.sprite.destroy({ children: true });
        delete this.imgs[gameObjectId];
      }
    }
  }
  private applySpriteLayout(gameObject: GameObject, component?: ImgComponent) {
    const sprite = this.imgs[gameObject.id];
    if (!sprite) return;

    const size = gameObject.transform?.size;
    const width = component?.width ?? size?.width;
    const height = component?.height ?? size?.height;
    if (typeof width === 'number') {
      sprite.sprite.width = width;
    }
    if (typeof height === 'number') {
      sprite.sprite.height = height;
    }
    const anchor = component?.anchor;
    if (anchor) {
      sprite.sprite.anchor?.set?.(anchor.x, anchor.y);
    }
  }
  destroy(): void {
    for (const key in this.imgs) {
      const sprite = this.imgs[key];
      this.containerManager?.getContainer(parseInt(key))?.removeChild(sprite.sprite);
      sprite.sprite.destroy({ children: true });
      delete this.imgs[key];
    }
  }
}
