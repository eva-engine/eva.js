import { Texture, ticker } from 'pixi.js';
import { decorators, resource, ComponentChanged, RESOURCE_TYPE, OBSERVER_TYPE, Component } from '@eva/eva.js';
import { Renderer, RendererSystem, RendererManager, ContainerManager } from '@eva/plugin-renderer';
import DragonBoneEngine from './engine';
import DragonBoneComponent from './component';
import dragonBones from './db';

const events = {
  START: 'start',
  LOOP_COMPLETE: 'loopComplete',
  COMPLETE: 'complete',
  FADE_IN: 'fadeIn',
  FADE_IN_COMPLETE: 'fadeInComplete',
  FADE_OUT: 'fadeOut',
  FADE_OUT_COMPLETE: 'fadeOutComplete',
  FRAME_EVENT: 'frameEvent',
  SOUND_EVENT: 'soundEvent',
};

const factory = dragonBones.PixiFactory.factory;

resource.registerInstance(RESOURCE_TYPE.DRAGONBONE, ({ data, name }) => {
  factory.parseDragonBonesData(data.ske, name);
  factory.parseTextureAtlasData(data.tex, Texture.from(data.image), name);
});
resource.registerDestroy(RESOURCE_TYPE.DRAGONBONE, ({ name }) => {
  factory.removeDragonBonesData(name);
  factory.removeTextureAtlasData(name);
});

@decorators.componentObserver({
  DragonBone: ['armatureName'],
})
export default class DragonBone extends Renderer {
  static systemName: string = 'DragonBone';
  name: string = 'DragonBone';
  armatures: { [propName: number]: DragonBoneEngine } = {};
  autoPlay: { [propName: number]: boolean } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  private isRemovedMap: Map<Component, boolean> = new Map();
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    ticker.shared.add(dragonBones.PixiFactory._clockHandler, dragonBones.PixiFactory);
  }
  onDestroy() {
    ticker.shared.remove(dragonBones.PixiFactory._clockHandler, dragonBones.PixiFactory);
  }
  async componentChanged(changed: ComponentChanged) {
    this.autoPlay[changed.gameObject.id] = (changed.component as DragonBoneComponent).autoPlay;
    if (changed.componentName === 'DragonBone') {
      if (changed.type === OBSERVER_TYPE.ADD) {
        this.add(changed);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        switch (changed.prop.prop[0]) {
          case 'armature':
            this.change(changed);
            break;
        }
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        this.remove(changed);
      }
    }
  }
  async add(changed: ComponentChanged) {
    const component = changed.component as DragonBoneComponent;
    this.isRemovedMap.delete(component);
    await resource.getResource(component.resource);
    if (this.isRemovedMap.get(component)) {
      this.isRemovedMap.delete(component);
      return;
    }
    const armature = new DragonBoneEngine({
      armatureName: component.armatureName,
    });
    this.armatures[changed.gameObject.id] = armature;
    this.renderSystem.containerManager.getContainer(changed.gameObject.id).addChildAt(armature.armature, 0);
    component.armature = armature;
    for (const key in events) {
      armature.armature.on(events[key], e => {
        component.emit(events[key], e);
      });
    }
  }
  change(changed: ComponentChanged) {
    this.remove(changed);
    this.add(changed);
    if (this.autoPlay[changed.gameObject.id]) {
      const component = changed.component as DragonBoneComponent;
      component.play(component.animationName);
    }
  }
  remove(changed: ComponentChanged) {
    const armature = this.armatures[changed.gameObject.id];
    if (!armature) {
      this.isRemovedMap.set(changed.component, true);
      return;
    }
    this.autoPlay[changed.gameObject.id] = armature.armature.animation.isPlaying;
    this.renderSystem.containerManager.getContainer(changed.gameObject.id).removeChild(armature.armature);
    armature.armature.removeAllListeners();
    armature.armature.destroy({ children: true });
    const component = changed.component as DragonBoneComponent;
    component.armature = null;
    delete this.armatures[changed.gameObject.id];
    if (changed.type === OBSERVER_TYPE.CHANGE) {
      delete this.autoPlay[changed.gameObject.id];
      component.removeAllListeners();
    }
  }
}
