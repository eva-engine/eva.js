import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  RESOURCE_TYPE,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import {
  RendererManager,
  ContainerManager,
  RendererSystem,
  Renderer,
} from '@eva/plugin-renderer';
import {Sprite} from '@eva/renderer-adapter';
import {Texture} from 'pixi.js';
import ImgComponent from './component';

resource.registerInstance(RESOURCE_TYPE.IMAGE, ({data = {}}) => {
  const {image} = data;
  if (image) {
    const texture = Texture.from(image);
    return texture;
  }
  return;
});
resource.registerDestroy(RESOURCE_TYPE.IMAGE, ({instance}) => {
  if (instance) {
    (instance as Texture).destroy(true);
  }
});

@decorators.componentObserver({
  Img: [{prop: ['resource'], deep: false}],
})
export default class Img extends Renderer {
  static systemName = 'Img';
  name: string = 'Img';
  imgs: {[propName: number]: Sprite} = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const {width, height} = gameObject.transform.size;
    if (this.imgs[gameObject.id]) {
      this.imgs[gameObject.id].sprite.width = width;
      this.imgs[gameObject.id].sprite.height = height;
    }
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'Img') {
      const component: ImgComponent = changed.component as ImgComponent;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const sprite = new Sprite(null);
        resource.getResource(component.resource).then(({instance}) => {
          if (!instance) {
            console.error(
              `GameObject:${changed.gameObject.name}'s Img resource load error`,
            );
          }
          sprite.image = instance;
        });
        this.imgs[changed.gameObject.id] = sprite;
        this.containerManager
          .getContainer(changed.gameObject.id)
          .addChildAt(sprite.sprite, 0);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        const {instance} = await resource.getResource(component.resource);
        if (!instance) {
          console.error(
            `GameObject:${changed.gameObject.name}'s Img resource load error`,
          );
        }
        this.imgs[changed.gameObject.id].image = instance;
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        const sprite = this.imgs[changed.gameObject.id];
        this.containerManager
          .getContainer(changed.gameObject.id)
          .removeChild(sprite.sprite);
          sprite.sprite.destroy({children: true})
        delete this.imgs[changed.gameObject.id];
      }
    }
  }
}
