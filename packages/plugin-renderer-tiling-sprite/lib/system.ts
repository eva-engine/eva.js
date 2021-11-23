import { GameObject, decorators, resource, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import TilingSpriteComponent from './component';
import { TilingSprite as TilingSpriteEngine } from '@eva/renderer-adapter';
import type { Point } from 'pixi.js';

@decorators.componentObserver({
  TilingSprite: [
    { prop: ['resource'], deep: false },
    { prop: ['tileScale'], deep: true },
    { prop: ['tilePosition'], deep: true },
  ],
})
export default class TilingSprite extends Renderer {
  name: string = 'TilingSprite';
  imgs: { [propName: number]: TilingSpriteEngine } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const { width, height } = gameObject.transform.size;
    const img = this.imgs[gameObject.id];
    if (img) {
      img.tilingSprite.width = width;
      img.tilingSprite.height = height;
    }
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'TilingSprite') {
      const component: TilingSpriteComponent = changed.component as TilingSpriteComponent;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const sprite = new TilingSpriteEngine(null);
        resource.getResource(component.resource).then(({ data }) => {
          if (!data) {
            console.error(`GameObject:${changed.gameObject.name}'s TilingSprite resource load error`);
            return
          }
          sprite.image = data.image;
        });
        this.imgs[changed.gameObject.id] = sprite;
        this.containerManager.getContainer(changed.gameObject.id).addChildAt(sprite.tilingSprite, 0);
        this.setProp(changed.gameObject.id, component);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        if (changed.prop.prop[0] === 'resource') {
          const { data } = await resource.getResource(component.resource);
          if (!data) {
            console.error(`GameObject:${changed.gameObject.name}'s TilingSprite resource load error`);
            return
          }
          this.imgs[changed.gameObject.id].image = data.image;
        } else {
          this.setProp(changed.gameObject.id, component);
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        const sprite = this.imgs[changed.gameObject.id];
        this.containerManager.getContainer(changed.gameObject.id).removeChild(sprite.tilingSprite);
        sprite.tilingSprite.destroy({
          children: true
        });
        delete this.imgs[changed.gameObject.id];
      }
    }
  }
  setProp(id: number, component: TilingSpriteComponent) {
    // bug possible
    this.imgs[id].tilingSprite.tilePosition = component.tilePosition as Point;
    this.imgs[id].tilingSprite.tileScale = component.tileScale as Point;
  }
}
