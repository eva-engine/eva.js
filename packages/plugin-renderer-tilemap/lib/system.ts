import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import TilemapComponent, { TilemapLayer } from './component';

interface TilemapRecord {
  /** 整个 tilemap 的根容器(挂在 GameObject 容器下)。 */
  root: Container;
  /** 每个 layer 对应的 Container。 */
  layerContainers: Container[];
  /** 切出的 frame 纹理缓存(每次 add 都重建一份)。 */
  frameTextures: Texture[];
  baseTexture: Texture | null;
}

@decorators.componentObserver({
  Tilemap: [{ prop: ['tileset'], deep: false }],
})
export default class TilemapSystem extends Renderer {
  static systemName = 'Tilemap';
  name: string = 'Tilemap';
  private records: { [propName: number]: TilemapRecord } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  rendererUpdate(_gameObject: GameObject) {
    // 静态 tilemap MVP:几何不随 transform.size 变化,无需逐帧刷新。
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Tilemap') return;
    const component = changed.component as TilemapComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const asyncId = this.increaseAsyncId(gameObjectId);
      let texture: Texture | null = null;
      if (component.tileset) {
        const { instance } = await resource.getResource(component.tileset);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) {
          console.error(`GameObject:${changed.gameObject.name}'s Tilemap tileset load error`);
          return;
        }
        texture = instance as Texture;
      }
      if (!texture) return;

      const root = new Container();
      const container = this.containerManager.getContainer(gameObjectId);
      if (container) container.addChildAt(root, 0);
      const record: TilemapRecord = {
        root,
        layerContainers: [],
        frameTextures: [],
        baseTexture: texture,
      };
      this.records[gameObjectId] = record;
      this.buildLayers(record, component);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      if (changed.prop?.prop?.[0] === 'tileset') {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const { instance } = await resource.getResource(component.tileset);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!instance) return;
        this.tearDownChildren(record);
        record.baseTexture = instance as Texture;
        this.buildLayers(record, component);
      }
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.increaseAsyncId(gameObjectId);
      const record = this.records[gameObjectId];
      if (!record) return;
      this.tearDownChildren(record);
      const container = this.containerManager?.getContainer(gameObjectId);
      if (container) container.removeChild(record.root);
      record.root.destroy({ children: true });
      delete this.records[gameObjectId];
    }
  }

  /** 销毁现有 layer/frame 纹理(切换 tileset 或卸载时调用)。 */
  private tearDownChildren(record: TilemapRecord) {
    for (const layer of record.layerContainers) {
      record.root.removeChild(layer);
      layer.destroy({ children: true });
    }
    record.layerContainers = [];
    for (const tex of record.frameTextures) {
      try { tex.destroy(false); } catch { /* ignore */ }
    }
    record.frameTextures = [];
  }

  private buildLayers(record: TilemapRecord, component: TilemapComponent) {
    const base = record.baseTexture;
    if (!base) return;
    const tileW = component.tileWidth || 32;
    const tileH = component.tileHeight || 32;
    const renderW = component.renderTileWidth ?? tileW;
    const renderH = component.renderTileHeight ?? tileH;
    const margin = component.tilesetMargin || 0;
    const spacing = component.tilesetSpacing || 0;
    // 推断 columns
    const sourceWidth =
      (base as any).orig?.width ??
      (base as any).source?.width ??
      (base as any).width ??
      base.frame?.width ??
      0;
    const inferredCols = sourceWidth > 0 ? Math.max(1, Math.floor((sourceWidth - margin + spacing) / (tileW + spacing))) : 1;
    const cols = component.tilesetColumns && component.tilesetColumns > 0 ? component.tilesetColumns : inferredCols;

    // 每次重建 frameTextures(以 tile id - 1 索引)。Phaser 中 id 0 = 空,真实 tile id 从 1 开始。
    // 我们提前不知道 layer 用了哪些 id,所以延迟切;为简单先一次性切前 cols * 推断行数 个。
    // 但避免无限切,这里只在 setTexture 时按需切。
    const tilesetCache: Map<number, Texture> = new Map();
    const getFrameTexture = (tileId: number): Texture | null => {
      if (tileId <= 0) return null;
      const idx = tileId - 1;
      const cached = tilesetCache.get(idx);
      if (cached) return cached;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = margin + col * (tileW + spacing);
      const y = margin + row * (tileH + spacing);
      try {
        // PixiJS v8: 用源纹理 + frame Rectangle 创建子纹理
        const source = (base as any).source ?? (base as any).baseTexture ?? base;
        const sub = new Texture({
          source,
          frame: new Rectangle(x, y, tileW, tileH),
        });
        tilesetCache.set(idx, sub);
        record.frameTextures.push(sub);
        return sub;
      } catch (e) {
        if (typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[Tilemap] Texture slice failed, falling back to base', e);
        }
        return base;
      }
    };

    for (const layerSpec of component.layers || []) {
      const layerContainer = new Container();
      layerContainer.label = layerSpec.name ?? 'tilemap-layer';
      const offX = layerSpec.offsetX || 0;
      const offY = layerSpec.offsetY || 0;
      if (layerSpec.alpha != null) layerContainer.alpha = layerSpec.alpha;
      if (layerSpec.visible === false) layerContainer.visible = false;
      const data = layerSpec.data || [];
      const tint = layerSpec.tint;
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const id = row[c];
          if (!id || id <= 0) continue;
          const tex = getFrameTexture(id);
          if (!tex) continue;
          const sp = new Sprite(tex);
          sp.x = offX + c * tileW;
          sp.y = offY + r * tileH;
          sp.width = renderW;
          sp.height = renderH;
          if (tint != null) sp.tint = tint;
          layerContainer.addChild(sp);
        }
      }
      record.root.addChild(layerContainer);
      record.layerContainers.push(layerContainer);
    }
  }

  destroy(): void {
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      this.tearDownChildren(record);
      const container = this.containerManager?.getContainer(id);
      if (container) container.removeChild(record.root);
      record.root.destroy({ children: true });
      delete this.records[id];
    }
  }
}

// re-export TilemapLayer 以便在 d.ts 中可见
export type { TilemapLayer };
