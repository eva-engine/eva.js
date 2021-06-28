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
import {SpriteAnimation as SpriteAnimationEngine} from '@eva/renderer-adapter';
import {Spritesheet, BaseTexture} from 'pixi.js';

import SpriteAnimationComponent from './component';

const resourceKeySplit = '_s|r|c_';

resource.registerInstance(RESOURCE_TYPE.SPRITE_ANIMATION, ({name, data}) => {
  return new Promise(r => {
    const textureObj = data.json;
    const texture = BaseTexture.from(data.image);
    const frames = textureObj.frames || {};
    const animations = textureObj.animations || {};
    const newFrames = {};
    for (const key in frames) {
      const newKey = name + resourceKeySplit + key;
      newFrames[newKey] = frames[key];
    }
    for (const key in animations) {
      const spriteList = [];
      if (animations[key] && animations[key].length >= 0) {
        for (const spriteName of animations[key]) {
          const newSpriteName = name + resourceKeySplit + spriteName;
          spriteList.push(newSpriteName);
        }
      }
      animations[key] = spriteList;
    }
    textureObj.frames = newFrames;
    const spriteSheet = new Spritesheet(texture, textureObj);
    spriteSheet.parse(() => {
      const {textures} = spriteSheet;
      const spriteFrames = [];
      for (const key in textures) {
        spriteFrames.push(textures[key]);
      }
      r(spriteFrames);
    });
  });
});
resource.registerDestroy(RESOURCE_TYPE.SPRITE_ANIMATION, ({instance}) => {
  if (!instance) return;
  for (const texture of instance) {
    texture.destroy(true);
  }
});

@decorators.componentObserver({
  SpriteAnimation: ['speed', 'resource'],
})
export default class SpriteAnimation extends Renderer {
  static systemName = 'SpriteAnimation';
  name: string = 'SpriteAnimation';
  animates: {[propName: number]: SpriteAnimationEngine} = {};
  autoPlay: {[propName: number]: boolean} = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const {width, height} = gameObject.transform.size;
    if (this.animates[gameObject.id]) {
      this.animates[gameObject.id].animatedSprite.width = width;
      this.animates[gameObject.id].animatedSprite.height = height;
    }
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'SpriteAnimation') {
      const component: SpriteAnimationComponent = changed.component as SpriteAnimationComponent;
      this.autoPlay[changed.gameObject.id] = component.autoPlay;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const {instance: frames} = await resource.getResource(
          component.resource,
        );
        if (!frames) {
          console.error(
            `GameObject:${changed.gameObject.name}'s Img resource load error`,
          );
        }
        this.add({
          frames: frames,
          id: changed.gameObject.id,
          component,
        });
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        if (changed.prop && changed.prop.prop[0] === 'speed') {
          this.animates[changed.gameObject.id].speed =
            1000 / 60 / component.speed;
        } else {
          const {instance: frames} = await resource.getResource(
            component.resource,
          );
          if (!frames) {
            console.error(
              `GameObject:${changed.gameObject.name}'s Img resource load error`,
            );
          }
          this.change({
            frames: frames,
            id: changed.gameObject.id,
            component,
          });
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.remove(changed.gameObject.id);
      }
    }
  }
  add({frames, id, component}) {
    const animate = new SpriteAnimationEngine({frames});
    this.animates[id] = animate;
    this.containerManager
      .getContainer(id)
      .addChildAt(animate.animatedSprite, 0);

    animate.animatedSprite.onComplete = () =>{
      component.emit('onComplete')
    }
    animate.animatedSprite.onFrameChange = () =>{
      component.emit('onFrameChange')
    }
    animate.animatedSprite.onLoop = () =>{
      component.emit('onLoop')
    }

    component.animate = this.animates[id];
    this.animates[id].speed = 1000 / 60 / component.speed;
    if (this.autoPlay[id]) {
      animate.animatedSprite.play();
    }
  }
  change({frames, id, component}) {
    this.remove(id, true);
    this.add({frames, id, component});
  }
  remove(id, isChange?: boolean) {
    const animate = this.animates[id];
    this.autoPlay[id] = animate.animatedSprite.playing;
    this.containerManager.getContainer(id).removeChild(animate.animatedSprite);
    animate.animatedSprite.destroy();
    delete this.animates[id];
    if (!isChange) {
      delete this.autoPlay[id];
    }
  }
}
