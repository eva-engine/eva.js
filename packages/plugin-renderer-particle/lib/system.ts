import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
  UpdateParams,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { ParticleContainer, Texture } from 'pixi.js';
import ParticleEmitterComponent from './component';
import { Emitter } from './emitter';

interface EmitterRecord {
  container: ParticleContainer;
  emitter: Emitter;
  component: ParticleEmitterComponent;
}

@decorators.componentObserver({
  ParticleEmitter: [{ prop: ['resource'], deep: false }],
})
export default class ParticleEmitterSystem extends Renderer {
  static systemName = 'ParticleEmitter';
  name: string = 'ParticleEmitter';
  private records: { [propName: number]: EmitterRecord } = {};
  private lastDeltaTime = 1000 / 60;
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  update(e?: UpdateParams) {
    if (e?.deltaTime) this.lastDeltaTime = e.deltaTime;
    super.update(e);
  }

  rendererUpdate(gameObject: GameObject) {
    const record = this.records[gameObject.id];
    if (!record) return;
    record.emitter.setParams(record.component);
    record.emitter.update(this.lastDeltaTime);
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'ParticleEmitter') return;
    const component = changed.component as ParticleEmitterComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const asyncId = this.increaseAsyncId(gameObjectId);
      let texture: Texture | null = null;
      if (component.resource) {
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s ParticleEmitter resource load error`);
          return;
        }
        texture = instance as Texture;
      }
      if (!texture) return;

      const pc = new ParticleContainer({
        dynamicProperties: { position: true, rotation: true, scale: true, color: true, uvs: false },
      });
      pc.texture = texture;
      this.containerManager.getContainer(gameObjectId).addChildAt(pc, 0);
      const emitter = new Emitter(component, pc, texture);
      this.records[gameObjectId] = { container: pc, emitter, component };
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      if (changed.prop?.prop?.[0] === 'resource') {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (instance) {
          record.container.texture = instance as Texture;
          record.emitter.setTexture(instance as Texture);
        }
      }
      record.component = component;
      record.emitter.setParams(component);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.increaseAsyncId(gameObjectId);
      const record = this.records[gameObjectId];
      if (!record) return;
      record.emitter.destroy();
      this.containerManager?.getContainer(gameObjectId)?.removeChild(record.container);
      record.container.destroy({ children: true });
      delete this.records[gameObjectId];
    }
  }

  destroy(): void {
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      record.emitter.destroy();
      this.containerManager?.getContainer(id)?.removeChild(record.container);
      record.container.destroy({ children: true });
      delete this.records[id];
    }
  }
}
