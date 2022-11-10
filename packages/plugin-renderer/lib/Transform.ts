import { Transform as Trans, decorators, ComponentChanged, OBSERVER_TYPE, Scene, LOAD_SCENE_MODE } from '@eva/eva.js';
import EventEmitter from 'eventemitter3';
import { Application, Container } from '@eva/renderer-adapter';
import Render from './System';
import ContainerManager from './manager/ContainerManager';
import type { Render as RenderComponent } from "@eva/plugin-renderer-render";

@decorators.componentObserver({
  Transform: ['_parent'],
})
export default class Transform extends EventEmitter {
  name: string = 'Transform';
  waitRemoveIds: number[] = [];
  waitSceneId: number;
  system: Render;
  containerManager: ContainerManager;
  waitChangeScenes: {
    scene: Scene;
    mode: LOAD_SCENE_MODE;
    application: Application;
  }[] = [];
  constructor({ system, containerManager }) {
    super();
    this.containerManager = containerManager;
    this.init(system);
  }
  init(system: Render) {
    this.system = system;
    this.on('changeScene', ({ scene, mode, application }) => {
      // switch (mode) {
      // case LOAD_SCENE_MODE.SINGLE:
      this.waitChangeScenes.push({ scene, mode, application });
      // break;
      // case LOAD_SCENE_MODE.MULTI_CANVAS:

      // }
    });
  }
  update() {
    for (const id of this.waitRemoveIds) {
      this.containerManager.removeContainer(id);
    }
    this.waitRemoveIds = [];

    for (const sceneInfo of this.waitChangeScenes) {
      // set scene
      const container = this.containerManager.getContainer(sceneInfo.scene.id);
      if (container) {
        sceneInfo.application.stage.removeChildren();
        sceneInfo.application.stage.addChild(container);
      }
    }
    this.waitChangeScenes = [];
  }
  componentChanged(changed: ComponentChanged) {
    if (changed.type === OBSERVER_TYPE.ADD) {
      this.addContainer(changed);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      this.change(changed);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.waitRemoveIds.push(changed.gameObject.id);
    }
  }
  addContainer(changed: ComponentChanged) {
    const container = new Container();
    container.name = changed.gameObject.name;
    this.containerManager.addContainer({
      name: changed.gameObject.id,
      container,
    });
    const transform = changed.component as Trans;
    transform.worldTransform = container.transform.worldTransform;
  }
  change(changed: ComponentChanged) {
    const transform = changed.component as Trans;
    if (transform.parent) {
      const parentContainer = this.containerManager.getContainer(transform.parent.gameObject.id);
      parentContainer.addChild(this.containerManager.getContainer(changed.gameObject.id));

      const render =
        changed.gameObject.transform.parent &&
        (changed.gameObject.transform.parent.gameObject.getComponent('Render') as RenderComponent);
      if (render) {
        render.sortDirty = true;
      }
    } else {
      const container = this.containerManager.getContainer(changed.gameObject.id);
      container.parent && container.parent.removeChild(container);
    }
  }
  destroy() {
    this.removeAllListeners();
    this.waitRemoveIds = null;
    this.waitChangeScenes = null;
    this.system = null;
    this.containerManager = null;
  }
}
