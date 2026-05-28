import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import {
  RenderTexture as PixiRenderTexture,
  Sprite,
  Texture,
  Container,
  Graphics,
  Text,
  Rectangle,
  ColorMatrixFilter,
} from 'pixi.js';
import RenderTextureComponent, { RenderTextureOp } from './component';

interface RenderTextureRecord {
  rt: PixiRenderTexture;
  sprite: Sprite;
  component: RenderTextureComponent;
  // last replayed op-list signature (length + dirty counter) so we don't redraw
  // every frame when nothing changed.
  lastSig: string;
  /** Pending replay scheduled for next renderer-update tick. */
  needsReplay: boolean;
}

const FRAME_SEP = '#'; // resource name separator: `myAtlas#frame.png`

@decorators.componentObserver({
  RenderTexture: [
    { prop: ['width'], deep: false },
    { prop: ['height'], deep: false },
    { prop: ['ops'], deep: true },
    { prop: ['dirty'], deep: false },
    { prop: ['backgroundColor'], deep: false },
    { prop: ['backgroundAlpha'], deep: false },
  ],
})
export default class RenderTextureSystem extends Renderer {
  static systemName = 'RenderTexture';
  name: string = 'RenderTexture';
  private records: { [propName: number]: RenderTextureRecord } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  rendererUpdate(gameObject: GameObject) {
    const record = this.records[gameObject.id];
    if (!record) return;
    if (record.needsReplay) {
      record.needsReplay = false;
      // fire-and-forget: replay is async (loads textures). next frame will see updated RT.
      this.replay(gameObject.id);
    }
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'RenderTexture') return;
    const component = changed.component as RenderTextureComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const rt = PixiRenderTexture.create({
        width: Math.max(1, component.width || 1),
        height: Math.max(1, component.height || 1),
        resolution: 1,
      });
      const sprite = new Sprite(rt);
      // Force sprite display rect to match component.width/height (in design units)
      // so the RT shows at intended logical size regardless of devicePixelRatio.
      sprite.width = component.width;
      sprite.height = component.height;
      this.containerManager.getContainer(gameObjectId).addChildAt(sprite, 0);
      this.records[gameObjectId] = { rt, sprite, component, lastSig: '', needsReplay: true };
      // schedule replay for next frame so PIXI Application & renderer are ready.
      this.maybeSave(gameObjectId);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      record.component = component;
      // Resize when width/height changed
      if (
        record.rt.width !== component.width ||
        record.rt.height !== component.height
      ) {
        try {
          (record.rt as any).resize?.(
            Math.max(1, component.width),
            Math.max(1, component.height),
          );
        } catch (e) {
          // ignore
        }
        record.sprite.width = component.width;
        record.sprite.height = component.height;
      }
      record.needsReplay = true;
      this.maybeSave(gameObjectId);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      this.containerManager?.getContainer(gameObjectId)?.removeChild(record.sprite);
      record.sprite.destroy({ children: true });
      record.rt.destroy(true);
      delete this.records[gameObjectId];
    }
  }

  /** Resolve a resource name (optionally with `#frame` suffix) → Texture. */
  private async resolveTexture(name: string, explicitFrame?: string): Promise<Texture | null> {
    if (!name) return null;
    let resName = name;
    let frame = explicitFrame;
    if (!frame && name.includes(FRAME_SEP)) {
      const idx = name.indexOf(FRAME_SEP);
      resName = name.slice(0, idx);
      frame = name.slice(idx + 1);
    }
    try {
      const { instance } = await resource.getResource(resName);
      if (!instance) return null;
      // sprite atlas: instance is a frames map
      if (frame) {
        if (instance && (instance as any)[frame] instanceof Texture) {
          return (instance as any)[frame] as Texture;
        }
        // Sometimes instance has `.textures[frame]`
        const textures = (instance as any).textures;
        if (textures && textures[frame] instanceof Texture) {
          return textures[frame] as Texture;
        }
      }
      if (instance instanceof Texture) return instance;
      // sprite atlas single texture access
      if ((instance as any).baseTexture) return instance as unknown as Texture;
      // grab first frame as fallback
      if (typeof instance === 'object') {
        const keys = Object.keys(instance as any);
        for (const k of keys) {
          const v = (instance as any)[k];
          if (v instanceof Texture) return v;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Build an offscreen Pixi DisplayObject describing the op, then render it into the RT. */
  private async replay(gameObjectId: number) {
    const record = this.records[gameObjectId];
    if (!record) return;
    const { rt, component } = record;
    const sig = `${component.dirty}|${component.ops?.length ?? 0}|${component.width}|${component.height}`;
    if (record.lastSig === sig && component.append) {
      // No structural change — skip redundant replays.
    }
    record.lastSig = sig;

    const renderer = this.renderSystem.application?.renderer as any;
    if (!renderer) return;

    // Build a single staging Container that aggregates this commit's ops.
    const stage = new Container();

    // Optional background (fill RT with color, replacing previous content)
    const bg = component.backgroundColor;
    const bgA = component.backgroundAlpha ?? 1;
    if (!component.append) {
      const g = new Graphics();
      if (bg != null && bg >= 0) {
        g.rect(0, 0, component.width, component.height).fill({ color: bg, alpha: bgA });
      } else {
        // transparent clear
        g.rect(0, 0, component.width, component.height).fill({ color: 0x000000, alpha: 0 });
      }
      stage.addChild(g);
    }

    for (const op of component.ops || []) {
      const node = await this.buildOpNode(op);
      if (node) stage.addChild(node);
    }

    try {
      // Pixi v8 render-to-target API
      renderer.render({
        container: stage,
        target: rt,
        clear: !component.append,
      });
      // eslint-disable-next-line no-console
      if ((globalThis as any).__RT_DEBUG) {
        console.log('[RT] replayed', {
          ops: component.ops?.length,
          w: rt.width,
          h: rt.height,
          stageChildren: stage.children?.length,
        });
      }
    } catch (e) {
      // fallback for older API: renderer.render(displayObject, { renderTexture: rt })
      try {
        renderer.render(stage, { renderTexture: rt, clear: !component.append });
      } catch {
        console.warn('[RenderTexture] renderer.render failed', e);
      }
    } finally {
      // Defer destroy to next microtask so the GPU has time to consume.
      // Some Pixi v8 builds upload the geometry lazily.
      Promise.resolve().then(() => {
        try { stage.destroy({ children: true }); } catch { /* noop */ }
      });
    }
  }

  private async buildOpNode(op: RenderTextureOp): Promise<Container | null> {
    if (op.type === 'clear') {
      const g = new Graphics();
      g.rect(0, 0, 1e6, 1e6).fill({ color: 0x000000, alpha: 0 });
      // Use destination-in trick alternative: simpler — caller knows append=false to actually clear.
      return g;
    }
    if (op.type === 'fill') {
      const g = new Graphics();
      const x = op.x ?? 0;
      const y = op.y ?? 0;
      const w = op.width ?? 1e6;
      const h = op.height ?? 1e6;
      g.rect(x, y, w, h).fill({ color: op.color, alpha: op.alpha ?? 1 });
      return g;
    }
    if (op.type === 'draw' || op.type === 'drawFrame') {
      const tex = await this.resolveTexture(op.resource, (op as any).frame);
      if (!tex) return null;
      const sp = new Sprite(tex);
      sp.x = op.x ?? 0;
      sp.y = op.y ?? 0;
      const o = op as any;
      sp.alpha = o.alpha ?? 1;
      if (o.tint != null) sp.tint = o.tint;
      if (o.width != null) sp.width = o.width;
      if (o.height != null) sp.height = o.height;
      if (o.rotation != null) sp.rotation = o.rotation;
      if (o.anchorX != null || o.anchorY != null) {
        sp.anchor.set(o.anchorX ?? 0, o.anchorY ?? 0);
      }
      if (o.scaleX != null || o.scaleY != null) {
        sp.scale.set(o.scaleX ?? 1, o.scaleY ?? 1);
      }
      if (o.blendMode) {
        try {
          (sp as any).blendMode = o.blendMode;
        } catch {
          // ignore
        }
      }
      return sp;
    }
    if (op.type === 'erase') {
      const g = new Graphics();
      const w = op.width ?? 16;
      const h = op.height ?? 16;
      const ax = op.anchorX ?? 0;
      const ay = op.anchorY ?? 0;
      const x = (op.x ?? 0) - w * ax;
      const y = (op.y ?? 0) - h * ay;
      g.rect(x, y, w, h).fill({ color: 0xffffff, alpha: 1 });
      try {
        (g as any).blendMode = 'erase';
      } catch {
        // ignore
      }
      return g;
    }
    if (op.type === 'drawText') {
      const t = new Text({
        text: op.text,
        style: {
          fontFamily: op.style?.fontFamily ?? 'Arial',
          fontSize: op.style?.fontSize ?? 32,
          fontWeight: (op.style?.fontWeight as any) ?? 'normal',
          fill: op.style?.fill ?? 0xffffff,
          stroke: op.style?.stroke as any,
          align: op.style?.align ?? 'left',
        },
      });
      t.x = op.x ?? 0;
      t.y = op.y ?? 0;
      if (op.alpha != null) t.alpha = op.alpha;
      if (op.tint != null) (t as any).tint = op.tint;
      return t;
    }
    if (op.type === 'paint') {
      const tex = await this.resolveTexture(op.resource, op.frame);
      if (!tex) return null;
      const c = new Container();
      const times = Math.max(1, op.times ?? 1);
      const dx = op.step?.x ?? 0;
      const dy = op.step?.y ?? 0;
      for (let i = 0; i < times; i++) {
        const sp = new Sprite(tex);
        sp.x = (op.x ?? 0) + dx * i;
        sp.y = (op.y ?? 0) + dy * i;
        sp.anchor.set(0.5, 0.5);
        sp.alpha = op.alpha ?? 1;
        if (op.tintCycle && op.tintCycle.length > 0) {
          sp.tint = op.tintCycle[i % op.tintCycle.length];
        } else if (op.tint != null) {
          sp.tint = op.tint;
        }
        c.addChild(sp);
      }
      return c;
    }
    return null;
  }

  /**
   * After a successful replay, save the RT as a resource so other Img/Sprite can reference it.
   * Idempotent: registers once per gameObject.saveAs key.
   */
  private maybeSave(gameObjectId: number) {
    const record = this.records[gameObjectId];
    if (!record) return;
    const key = record.component.saveAs;
    if (!key) return;
    try {
      // Check if already in resourcesMap
      const existing = (resource as any).resourcesMap?.[key];
      if (existing) {
        existing.complete = true;
        existing.instance = record.rt;
        // Make sure callers awaiting getResource get our instance
        const promiseMap = (resource as any).promiseMap;
        if (promiseMap) {
          promiseMap[key] = Promise.resolve({ instance: record.rt, name: key });
        }
        return;
      }
      // Register a fresh entry
      (resource as any).resourcesMap = (resource as any).resourcesMap || {};
      (resource as any).resourcesMap[key] = {
        name: key,
        type: 'IMAGE',
        complete: true,
        instance: record.rt,
        data: {},
      };
      const promiseMap = (resource as any).promiseMap;
      if (promiseMap) {
        promiseMap[key] = Promise.resolve({ instance: record.rt, name: key });
      }
    } catch (e) {
      console.warn('[RenderTexture] saveAs failed', e);
    }
  }

  destroy(): void {
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      this.containerManager?.getContainer(id)?.removeChild(record.sprite);
      record.sprite.destroy({ children: true });
      record.rt.destroy(true);
      delete this.records[id];
    }
  }
}
