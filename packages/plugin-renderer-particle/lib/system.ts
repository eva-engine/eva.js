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

const SPRITE_KEY_SEP = '_s|r|c_'; // Sync with plugin-renderer-sprite resourceKeySplit.

/**
 * Resolve resource instance to a primary texture + optional frame texture pool.
 * - IMAGE resource → instance is a Texture, return single.
 * - SPRITE resource → instance is `{[fullKey]: Texture}`. Pick frames listed in `frame`
 *   (string or array); fall back to first frame as the primary texture.
 */
/**
 * Check if a value is a PixiJS Texture. Uses duck typing because separate copies of pixi.js
 * may be loaded across plugins (ESM module duplication breaks `instanceof`).
 */
function isTexture(v: any): v is Texture {
  return !!v && v.isTexture === true && !!v.orig && !!v.uvs;
}

function pickFrameTextures(
  instance: any,
  resourceName: string,
  frame: string | string[] | undefined,
): { texture: Texture | null; frameTextures: Texture[] | null } {
  if (isTexture(instance)) {
    return { texture: instance as Texture, frameTextures: null };
  }
  if (instance && typeof instance === 'object') {
    const lookup = (name: string): Texture | null => {
      const fullKey = resourceName + SPRITE_KEY_SEP + name;
      const v = instance[fullKey] ?? instance[name];
      return isTexture(v) ? (v as Texture) : null;
    };
    const frameNames = Array.isArray(frame) ? frame : frame ? [frame] : [];
    const frameTextures: Texture[] = [];
    for (const f of frameNames) {
      const t = lookup(f);
      if (t) frameTextures.push(t);
    }
    if (frameTextures.length > 0) {
      return { texture: frameTextures[0], frameTextures };
    }
    // No frame requested → fall back to first texture in the map.
    for (const k in instance) {
      const v = instance[k];
      if (isTexture(v)) return { texture: v as Texture, frameTextures: null };
    }
  }
  return { texture: null, frameTextures: null };
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
      let frameTextures: Texture[] | null = null;
      if (component.resource) {
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s ParticleEmitter resource load error`);
          return;
        }
        const picked = pickFrameTextures(instance, component.resource, component.frame);
        texture = picked.texture;
        frameTextures = picked.frameTextures;
      }
      if (!texture) return;

      const pc = new ParticleContainer({
        dynamicProperties: { position: true, rotation: true, scale: true, color: true, uvs: true },
      });
      pc.texture = texture;
      this.containerManager.getContainer(gameObjectId).addChildAt(pc, 0);
      const emitter = new Emitter(component, pc, texture);
      emitter.setFrameTextures(frameTextures);
      this.records[gameObjectId] = { container: pc, emitter, component };
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      if (changed.prop?.prop?.[0] === 'resource') {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.resource);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (instance) {
          const picked = pickFrameTextures(instance, component.resource, component.frame);
          if (picked.texture) {
            record.container.texture = picked.texture;
            record.emitter.setTexture(picked.texture);
          }
          record.emitter.setFrameTextures(picked.frameTextures);
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
