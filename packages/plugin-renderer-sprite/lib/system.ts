import { GameObject, decorators, resource, ComponentChanged, RESOURCE_TYPE, OBSERVER_TYPE } from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';

import SpriteComponent from './component';
import { Sprite as SpriteEngine } from '@eva/renderer-adapter';
import { Spritesheet, Texture } from 'pixi.js';

const resourceKeySplit = '_s|r|c_'; // Notice: This key be used in ninepatch system.

resource.registerInstance(RESOURCE_TYPE.SPRITE, ({ name, data }) => {
  return new Promise(r => {
    const textureObj = data.json.data;
    const texture = data.image instanceof Texture ? data.image : Texture.from(data.image);
    // Phaser-style atlas JSON often ships frames as an array (`frames: [{ filename, frame, ... }]`)
    // while PixiJS Spritesheet expects a hash (`frames: { name: { frame, ... } }`).
    // TexturePacker "Hash" exports use numeric keys but carry the real name in `filename`.
    // Normalize all three so DSL spawn `texture: "atlas#name"` resolves correctly.
    let frames = textureObj.frames || {};
    if (Array.isArray(frames)) {
      const hashFrames: Record<string, any> = {};
      for (const f of frames) {
        const key = f.filename ?? f.name;
        if (key) hashFrames[key] = f;
      }
      frames = hashFrames;
    } else {
      const sample = Object.values(frames)[0] as any;
      if (sample && typeof sample.filename === 'string') {
        const remapped: Record<string, any> = {};
        for (const k in frames) {
          const f = frames[k];
          remapped[f.filename || k] = f;
        }
        frames = remapped;
      }
    }
    const animations = textureObj.animations || {};
    const newAnimations = {};
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
      newAnimations[key] = spriteList;
    }
    const spriteSheet = new Spritesheet(texture, { ...textureObj, frames: newFrames, animations: newAnimations });
    spriteSheet.parse().then(() => {
      r(spriteSheet.textures);
    });
  });
});

resource.registerDestroy(RESOURCE_TYPE.SPRITE, ({ instance }) => {
  if (!instance) return;
  for (const key in instance) {
    instance[key].destroy(true);
  }
});

@decorators.componentObserver({
  Sprite: ['spriteName'],
})
export default class Sprite extends Renderer {
  static systemName = 'SpriteSystem';
  name: string = 'SpriteSystem';
  sprites: { [propName: number]: SpriteEngine } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const { width, height } = gameObject.transform.size;
    if (this.sprites[gameObject.id]) {
      this.sprites[gameObject.id].sprite.width = width;
      this.sprites[gameObject.id].sprite.height = height;
    }
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'Sprite') {
      const gameObjectId = changed.gameObject.id;
      const component: SpriteComponent = changed.component as SpriteComponent;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const sprite = new SpriteEngine(null);
        this.sprites[changed.gameObject.id] = sprite;
        this.containerManager.getContainer(changed.gameObject.id).addChildAt(sprite.sprite, 0);
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s Sprite resource load error`);
          return;
        }
        sprite.image = instance[component.resource + resourceKeySplit + component.spriteName];
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s Sprite resource load error`);
          return;
        }
        this.sprites[changed.gameObject.id].image =
          instance[component.resource + resourceKeySplit + component.spriteName];
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.increaseAsyncId(gameObjectId);
        const sprite = this.sprites[changed.gameObject.id];
        this.containerManager.getContainer(changed.gameObject.id).removeChild(sprite.sprite);
        sprite.sprite.destroy({ children: true });
        delete this.sprites[changed.gameObject.id];
      }
    }
  }
}
