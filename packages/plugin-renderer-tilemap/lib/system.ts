import {
  GameObject,
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import TilemapComponent, { TilemapLayer, TileMapLayerV2, ChunkedCellData } from './component';
import { CHUNK_SIZE, decodeChunk, isEmptyCellValue, unpackCell } from './chunk-codec';
import { makeLoadedTileset, type LoadedTileset, type TilesetDocumentRaw } from './tileset-types';
import { TileAnimationDriver } from './animation-driver';
import { adaptGamePerfProbes, TILEMAP_PROBE_NAMES, type PerfProbeRegistry } from './probes';
import { resolveChunkRenderStrategy } from './chunk-renderer';
import { buildChunkMesh, isMeshPathAvailable } from './chunk-mesh';

interface TilemapRecord {
  /** 整个 tilemap 的根容器(挂在 GameObject 容器下)。 */
  root: Container;
  /** v1 layer 容器。 */
  layerContainers: Container[];
  /** v2 layer 容器:每个 layer 一个 Container,内部 chunkKey → Container。 */
  layerContainersV2: Map<string, { container: Container; chunkContainers: Map<string, Container> }>;
  /** v1 切出的 frame 纹理缓存。 */
  frameTextures: Texture[];
  /** v2 atlas frame texture cache:`${atlasAssetId}#${col},${row}` → Texture。 */
  frameTexturesV2: Map<string, Texture>;
  /** v1 base texture(或 v2 默认 atlas)。 */
  baseTexture: Texture | null;
  /** v2 atlas 纹理表:assetId → Texture。 */
  atlasTextures: Map<string, Texture>;
  /** v2 tileset 解析后产物。 */
  loadedTileset: LoadedTileset | null;
  /** 走 v1 还是 v2 路径。 */
  mode: 'v1' | 'v2' | 'unknown';
  /**
   * v2 animation tracking — animation source key `${slot},${col},${row}` → all live
   * Sprites currently displaying that source tile.
   *
   * Same source tile can be painted onto many map cells; when the driver reports a
   * dirty animation key, every Sprite under it gets its texture swapped to the new
   * frame. Sprite refs are dropped when the layer/chunk is torn down.
   */
  animatedSpritesByAnimKey: Map<string, Sprite[]>;
  /**
   * SceneCollection source 警告去重(P1-4)。
   *
   * 一个 record 内可能有上千个 sceneCollection cell 同时被跳过,console.warn 每个 cell
   * 一次会把 devtools 刷爆。改为 per-record 一次警告:第一次遇到 sceneCollection cell 时
   * warn(并把 source.id 记录在此 set),之后跳过同 source 不再 warn。
   * tearDownChildrenV2 不清空它(record 整个 destroy 时随 record 一起 GC)。
   */
  sceneCollectionWarnedSourceIds: Set<string>;
  /**
   * Viewport culling hint(C-2)。
   *
   * Host (e.g. eva-design preview, game runtime) 可在 record 创建后写入此字段告诉 plugin
   * "只有这个矩形内的 chunk 需要 build"。世界坐标(已经把 tilemap entity 的 transform
   * 反算到 chunk grid 同坐标系)。
   *
   * 未注入时 `buildChunksForLayer` 不剔除(行为兼容)。Phase B follow-up:接
   * RendererSystem.application.renderer.view 计算 camera bounds 自动注入。
   *
   * T-L7 (Phase L):通过 `setCullingBoundsHint(gameObjectId, bounds)` public API 注入,
   * 同样 null 可清除。本字段更新后不强制 rebuild,等下次 build/host 主动 invalidate 时生效。
   */
  cullingBoundsHint?: { minX: number; minY: number; maxX: number; maxY: number };
  /**
   * Dirty chunk tracking(T-L4, Phase L)。
   *
   * Host 在 layer paint stroke 后调 `invalidateChunks(gameObjectId, layerId, chunkKeys)`,
   * 把受影响 chunkKey 标记 dirty。下次 rAF flush 时只 destroy + populate 这些 chunk,
   * 避免整 layer 重建造成的浪费。
   *
   * Key 形态:`Map<layerId, Set<chunkKey>>`。Cycle 1 整 layer rebuild 路径仍走 T-L1
   * 的 layersV2 observer;invalidateChunks 是优化通道,由 host 显式触发。
   */
  dirtyChunkKeys: Map<string, Set<string>>;
  /** T-L4:rAF flush 是否已 scheduled,防止一帧内重复 schedule。 */
  flushScheduled: boolean;
}

@decorators.componentObserver({
  Tilemap: [
    { prop: ['tileset'], deep: false },
    { prop: ['tilemapRef'], deep: false },
    // T-L1 (Phase L):watch layersV2 整体 ref 变化(浅观察)。
    // Host 通过 `component.layersV2 = layersV2.slice()` 或重新 assign 触发 rebuild。
    // 不用 deep:true:每个 chunk 编辑都触发 too 频繁(host 应用 batch + assign new array)。
    // 当前实现:T-L1 走整 layer rebuild(reuse loadedTileset + atlasTextures);
    // T-L4 增量 dirty chunk path 由 host 显式 invalidateChunks 触发,不走 observer。
    { prop: ['layersV2'], deep: false },
  ],
})
export default class TilemapSystem extends Renderer {
  static systemName = 'Tilemap';
  name: string = 'Tilemap';
  private records: { [propName: number]: TilemapRecord } = {};
  /** Animation driver per Tilemap entity(只有 v2 路径有 animation,v1 不用)。 */
  private animationDrivers = new Map<number, TileAnimationDriver>();
  /**
   * Perf probe sink (ADR-0013 + ADR-0018 §4.6).
   * Resolved from `game.perfProbes` in init(); null when host did not install probes —
   * all helper methods become no-ops, no overhead in production builds without perf.
   */
  private probes: PerfProbeRegistry | null = null;
  /**
   * T-N2 (Phase N):tab visibility / WebGL context loss state。
   * - `isHidden`:document.visibilityState === 'hidden' 时为 true,update() early return
   * - `contextLost`:webglcontextlost 事件触发为 true;webglcontextrestored 清回 false
   * - listener 引用保留以便 destroy 时 detach(避免内存泄漏)
   */
  private isHidden: boolean = false;
  private contextLost: boolean = false;
  private visibilityListener?: () => void;
  private contextLostListener?: () => void;
  private contextRestoredListener?: () => void;
  /** T-N2:已 install handlers 的 canvas 引用,destroy 时 detach 用。 */
  private canvasWithCtxListeners: HTMLCanvasElement | null = null;
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    // Best-effort probe pickup; host may install perf hooks later (see ADR-0013).
    this.probes = adaptGamePerfProbes(this.game as unknown as { perfProbes?: Partial<PerfProbeRegistry> });
    // T-N2:浏览器环境下绑定 visibility / context-loss listener;
    // node/jsdom 缺 document 时跳过(installVisibilityHandlers 自带早返)。
    this.installVisibilityHandlers();
  }

  /**
   * T-N2 (Phase N):安装 visibility / WebGL context-loss listener。
   *
   * 安装姿势:
   *   - visibility:`document.visibilitychange` → 更新 `isHidden`
   *   - context loss:`canvas.webglcontextlost` → 设 `contextLost=true` + probe;
   *                   `canvas.webglcontextrestored` → 清回 false
   *
   * 失败容忍:任何环境异常(jsdom 不支持某些 listener / renderSystem 还没初始化 application)
   * 都静默 catch,不让 init 因此崩溃。
   */
  private installVisibilityHandlers(): void {
    if (typeof document === 'undefined') return; // node / jsdom 跳过
    try {
      this.visibilityListener = () => {
        this.isHidden = !!document.hidden;
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
    } catch {
      /* ignore — 某些 jsdom 环境的 addEventListener 可能行为异常 */
    }
    // WebGL context lost/restored — canvas 来自 renderSystem.application.canvas
    try {
      const canvas =
        (this.renderSystem as unknown as { application?: { canvas?: HTMLCanvasElement } })?.application?.canvas ??
        null;
      if (canvas && typeof canvas.addEventListener === 'function') {
        this.contextLostListener = () => {
          this.contextLost = true;
          this.probeCount(TILEMAP_PROBE_NAMES.CONTEXT_LOST_COUNT, 1);
          if (typeof console !== 'undefined') {
            console.warn('[Tilemap] WebGL context lost — pausing animation tick');
          }
        };
        this.contextRestoredListener = () => {
          this.contextLost = false;
          if (typeof console !== 'undefined') {
            console.info('[Tilemap] WebGL context restored — resuming animation tick');
          }
          // Host 决定是否 force component re-add 重建几何;plugin 不主动 rebuild,
          // 仅清掉 contextLost flag 让 update tick 恢复。
        };
        canvas.addEventListener('webglcontextlost', this.contextLostListener);
        canvas.addEventListener('webglcontextrestored', this.contextRestoredListener);
        this.canvasWithCtxListeners = canvas;
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * T-N2:卸载 visibility / context-loss listener,destroy() 调用以避免内存泄漏。
   */
  private uninstallVisibilityHandlers(): void {
    if (typeof document !== 'undefined' && this.visibilityListener) {
      try {
        document.removeEventListener('visibilitychange', this.visibilityListener);
      } catch {
        /* ignore */
      }
      this.visibilityListener = undefined;
    }
    if (this.canvasWithCtxListeners) {
      try {
        if (this.contextLostListener) {
          this.canvasWithCtxListeners.removeEventListener('webglcontextlost', this.contextLostListener);
        }
        if (this.contextRestoredListener) {
          this.canvasWithCtxListeners.removeEventListener('webglcontextrestored', this.contextRestoredListener);
        }
      } catch {
        /* ignore */
      }
      this.contextLostListener = undefined;
      this.contextRestoredListener = undefined;
      this.canvasWithCtxListeners = null;
    }
  }

  /** Late probe attach — host can call this after `installPerfProbes` if init order isn't right. */
  attachPerfProbes(probes: PerfProbeRegistry | null): void {
    this.probes = probes;
  }

  /**
   * T-L7 (Phase L) public API:host 注入 viewport culling hint。
   *
   * - bounds 非 null:更新 record.cullingBoundsHint,下次 build 时 buildChunksForLayer 会
   *   跳过不相交的 chunk。
   * - null:清除 hint(等价于不剔除任何 chunk)。
   *
   * 本方法只更新字段,不强制重建。host 想立刻生效有两种姿势:
   *   1. 调用后通过 `component.layersV2 = layersV2.slice()` 触发 observer rebuild
   *   2. 调 `invalidateChunks` 标记 dirty 让 rAF flush 时按新 hint rebuild
   * 这样 setHint 是 O(1),呼应性能预算。
   */
  setCullingBoundsHint(
    gameObjectId: number,
    bounds: { minX: number; minY: number; maxX: number; maxY: number } | null,
  ): void {
    const record = this.records[gameObjectId];
    if (!record) return;
    if (bounds === null) {
      record.cullingBoundsHint = undefined;
    } else {
      record.cullingBoundsHint = bounds;
    }
  }

  /**
   * T-L4 (Phase L) public API:host 标记若干 chunk dirty,触发 rAF flush 增量重建。
   *
   * 触发场景:layer paint stroke 完成后 host 知道哪些 chunkKey 被改了,调本方法即可。
   * 比 prop=layersV2 整体 reassign 高效得多(整 layer rebuild O(visibleChunks) → O(stroke)).
   *
   * 流程:
   *   1. 把 chunkKeys 累加到 record.dirtyChunkKeys.get(layerId)
   *   2. emit DIRTY_PENDING gauge(总 size)
   *   3. 如果还没 scheduled,启动一次 rAF tick 在下一帧调 flushDirtyChunks
   *
   * 调用方应保证 chunkKey 形态与 cellData.chunks key 一致(如 "0,0")。未知 chunkKey
   * 在 flush 时被静默忽略(已在 cellData.chunks 内会被处理;否则跳过)。
   */
  invalidateChunks(gameObjectId: number, layerId: string, chunkKeys: string[]): void {
    const record = this.records[gameObjectId];
    if (!record || chunkKeys.length === 0) return;
    let bucket = record.dirtyChunkKeys.get(layerId);
    if (!bucket) {
      bucket = new Set();
      record.dirtyChunkKeys.set(layerId, bucket);
    }
    for (const k of chunkKeys) bucket.add(k);
    // gauge:总 dirty chunk 数(跨 layer)
    let total = 0;
    for (const s of record.dirtyChunkKeys.values()) total += s.size;
    this.probeGauge(TILEMAP_PROBE_NAMES.DIRTY_PENDING, total);
    // schedule rAF flush(避免一帧内重复 schedule)
    if (!record.flushScheduled) {
      record.flushScheduled = true;
      const sched =
        typeof requestAnimationFrame !== 'undefined'
          ? requestAnimationFrame
          : (cb: (now: number) => void) => setTimeout(() => cb(0), 16);
      sched(() => this.flushDirtyChunks(gameObjectId));
    }
  }

  /**
   * T-L4 (Phase L):rAF callback;只 rebuild record.dirtyChunkKeys 内 chunk,不影响其他 chunk。
   *
   * 本方法是 public 供测试调用,但生产路径只走 invalidateChunks scheduled trigger。
   * 行为:
   *   - 找到 component 的 layersV2 layer for layerId
   *   - 对每个 dirty chunkKey:destroy 旧 chunkContainer + 重新 populate
   *   - emit DIRTY_FRAMES_BEHIND counter+1(本帧 flush 了 N 个 chunk 即"延迟一帧")
   *   - 清空 dirtyChunkKeys + 把 DIRTY_PENDING gauge 归零
   */
  flushDirtyChunks(gameObjectId: number): void {
    const record = this.records[gameObjectId];
    if (!record) return;
    record.flushScheduled = false;
    if (record.dirtyChunkKeys.size === 0) return;
    if (record.mode !== 'v2' || !record.loadedTileset) {
      // v1 / unknown 路径不支持增量 chunk rebuild;清空 dirty + skip
      record.dirtyChunkKeys.clear();
      this.probeGauge(TILEMAP_PROBE_NAMES.DIRTY_PENDING, 0);
      return;
    }
    this.probeCount(TILEMAP_PROBE_NAMES.DIRTY_FRAMES_BEHIND, 1);
    const loaded = record.loadedTileset;
    const animDriver = this.animationDrivers.get(gameObjectId) ?? null;

    // lookup component 通过 game.gameObjects → 找 Tilemap component。
    // 这里取巧:invalidateChunks 调用方应该已经写好 layersV2,我们从 layerContainersV2 反查
    // chunkContainer,destroy + 重新调 populateChunkSprites。需要拿到 layer 配置(cellData/modulate
    // /opacity)— 通过遍历 record.layerContainersV2 找到 chunkContainers 即可。但要 populate 还需
    // cellData.chunks[chunkKey] — 必须找 component。
    const game = (this as { game?: { gameObjects?: Array<{ id: number; components?: Array<{ name?: string }> }> } }).game;
    let component: TilemapComponent | null = null;
    if (game?.gameObjects) {
      for (const go of game.gameObjects) {
        if (go.id !== gameObjectId) continue;
        const c = go.components?.find((cc) => cc?.name === 'Tilemap') as TilemapComponent | undefined;
        if (c) {
          component = c;
          break;
        }
      }
    }

    const cellW = component?.cellSize?.width ?? loaded.tileWidth;
    const cellH = component?.cellSize?.height ?? loaded.tileHeight;
    const originX = component?.mapOrigin?.x ?? 0;
    const originY = component?.mapOrigin?.y ?? 0;

    this.probeBegin(TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS);
    try {
      for (const [layerId, chunkKeys] of record.dirtyChunkKeys) {
        const layerEntry = record.layerContainersV2.get(layerId);
        if (!layerEntry) continue;
        // 找 layer 配置(modulate/opacity/cellData)— 必须从 component.layersV2 找。
        const layerSpec = component?.layersV2?.find((l) => l.id === layerId) ?? null;
        if (!layerSpec) continue;
        for (const chunkKey of chunkKeys) {
          const oldChunkContainer = layerEntry.chunkContainers.get(chunkKey);
          if (oldChunkContainer) {
            layerEntry.container.removeChild(oldChunkContainer);
            try {
              oldChunkContainer.destroy({ children: true });
            } catch {
              /* ignore */
            }
            layerEntry.chunkContainers.delete(chunkKey);
          }
          // populate 新 chunk(如果 cellData 还包含该 key)
          const blob = layerSpec.cellData?.chunks?.[chunkKey];
          if (!blob || blob.nonEmpty <= 0) continue;
          const chunkContainer = new Container();
          chunkContainer.label = `chunk-${chunkKey}`;
          this.populateChunkSprites(chunkContainer, chunkKey, blob, record, loaded, cellW, cellH, originX, originY, layerSpec, animDriver);
          layerEntry.container.addChild(chunkContainer);
          layerEntry.chunkContainers.set(chunkKey, chunkContainer);
        }
      }
    } finally {
      this.probeEnd(TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS);
    }

    record.dirtyChunkKeys.clear();
    this.probeGauge(TILEMAP_PROBE_NAMES.DIRTY_PENDING, 0);
    this.requestRedraw();
  }

  private probeBegin(name: string): void {
    this.probes?.beginTiming(name);
  }
  private probeEnd(name: string): void {
    this.probes?.endTiming(name);
  }
  private probeCount(name: string, delta: number = 1): void {
    this.probes?.count(name, delta);
  }
  private probeGauge(name: string, value: number): void {
    this.probes?.gauge(name, value);
  }

  rendererUpdate(_gameObject: GameObject) {
    // 静态 tilemap MVP:几何不随 transform.size 变化,无需逐帧刷新。
  }

  /**
   * Eva.js update 调用(每帧)— 推进 v2 path animation tick。
   * 任何 tile 切到新 frame 时,标记对应 chunk dirty,下一帧重建。
   * v1 路径不参与(没 animation 元数据)。
   *
   * T-N1 (Phase N) hardening:
   *   - 每个 driver advance 包在内层 try/catch:一个 entity 的 animation pipeline 抛错
   *     不影响其他 entity 的 tick(continue 到下一个);失败计入 ANIM_TICK_ERROR_COUNT probe
   *     并 console.error 留诊断。
   *   - 外层 try/finally 包整段 hot path:保证 probeEnd(ANIM_TICK_MS) 一定 pair probeBegin,
   *     不会因为内层逻辑泄漏 throw 导致 timing 计 inFlight 永远不释放。
   *
   * T-N2 (Phase N) hardening:
   *   - tab hidden 或 WebGL context lost 时直接 early return,不浪费 CPU,且避免 context lost
   *     期间渲染调用堆栈抛错。
   */
  update(_frame: unknown) {
    // T-N2:tab 切换到后台 / WebGL context 异常 → 暂停 tick。
    if (this.isHidden || this.contextLost) return;
    if (this.animationDrivers.size === 0) return;
    this.probeBegin(TILEMAP_PROBE_NAMES.ANIM_TICK_MS);
    let totalSpritesSwapped = 0;
    try {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
      // PERF-T-O2 (see ADR-0022): consider flattening dirty (sprite, texture) pairs into a typed
      // array once per record when animatedSpritesByAnimKey changes. Trigger: >1000 animated cells
      // + p99(animTick.ms) > 2ms. Defer until probe data warrants.
      for (const [gameObjectId, driver] of this.animationDrivers) {
        const record = this.records[gameObjectId];
        if (!record || record.mode !== 'v2') continue;
        try {
          const result = driver.advance(now);
          if (result.dirtyKeys.size === 0) continue;
          // For each dirty animation source (slot,col,row), look up every live Sprite that
          // was painted with that source tile and swap its texture to the new frame.
          // currentFrames maps source key → new (col,row) within the same source atlas.
          const loaded = record.loadedTileset;
          if (!loaded) continue;
          let anyApplied = false;
          for (const animKey of result.dirtyKeys) {
            const sprites = record.animatedSpritesByAnimKey.get(animKey);
            if (!sprites || sprites.length === 0) continue;
            const nextFrame = result.currentFrames.get(animKey);
            if (!nextFrame) continue;
            const parts = animKey.split(',');
            const slot = Number.parseInt(parts[0]!, 10);
            const newTex = this.getAtlasFrameTexture(record, loaded, {
              sourceSlot: slot,
              col: nextFrame.col,
              row: nextFrame.row,
            });
            if (!newTex) continue;
            for (const sp of sprites) {
              sp.texture = newTex;
              anyApplied = true;
              totalSpritesSwapped++;
            }
          }
          if (anyApplied) this.requestRedraw();
        } catch (e) {
          // T-N1:本 entity 出错不破坏其他 entity 的 tick。
          this.probeCount(TILEMAP_PROBE_NAMES.ANIM_TICK_ERROR_COUNT, 1);
          if (typeof console !== 'undefined') {
            console.error(`[Tilemap] animation tick failed for entity ${gameObjectId}`, e);
          }
          // continue to next driver
        }
      }
    } finally {
      this.probeEnd(TILEMAP_PROBE_NAMES.ANIM_TICK_MS);
      if (totalSpritesSwapped > 0) this.probeCount('tilemap.anim.spritesSwapped', totalSpritesSwapped);
    }
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Tilemap') return;
    const component = changed.component as TilemapComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      await this.handleAdd(gameObjectId, changed.gameObject, component);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      await this.handleChange(gameObjectId, component, changed);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.handleRemove(gameObjectId);
    }
  }

  /* ───────────────────────────────────────────────────────────── lifecycle ── */

  private async handleAdd(gameObjectId: number, gameObject: GameObject, component: TilemapComponent) {
    this.probeBegin(TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS);
    try {
      const asyncId = this.increaseAsyncId(gameObjectId);
      const mode = this.detectMode(component);

      const root = new Container();
      const containerHost = this.containerManager.getContainer(gameObjectId);
      if (containerHost) containerHost.addChildAt(root, 0);

      const record: TilemapRecord = {
        root,
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map(),
        loadedTileset: null,
        mode,
        animatedSpritesByAnimKey: new Map(),
        sceneCollectionWarnedSourceIds: new Set(),
        // T-L4 (Phase L):dirty chunk tracking,默认空 + 未 scheduled。
        dirtyChunkKeys: new Map(),
        flushScheduled: false,
      };
      this.records[gameObjectId] = record;

      if (mode === 'v1') {
        await this.ensureV1Built(record, gameObjectId, gameObject, component, asyncId);
      } else if (mode === 'v2') {
        await this.ensureV2Built(record, gameObjectId, gameObject, component, asyncId);
      }
      // mode === 'unknown' → no-op (record sits empty, waiting for handleChange to upgrade).
    } finally {
      this.probeEnd(TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS);
    }
  }

  /**
   * v1 path:load tileset texture + buildLayersV1。被 handleAdd 与 handleChange(mode upgrade)共用。
   *
   * 调用方负责:
   *   - 在调用前设置 record.mode = 'v1'
   *   - 在调用前 increaseAsyncId 拿到 asyncId
   *   - record 在 records[gameObjectId] 已就位
   *
   * 本方法负责:
   *   - resource.getResource(tileset)
   *   - asyncId 校验(swap 期间 ref 被替换则中断)
   *   - 错误日志
   *   - 把 baseTexture 写回 record + buildLayersV1 + requestRedraw
   */
  private async ensureV1Built(
    record: TilemapRecord,
    gameObjectId: number,
    gameObject: GameObject,
    component: TilemapComponent,
    asyncId: number,
  ): Promise<void> {
    const texture = await this.loadV1Texture(component);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    if (!texture) {
      if (typeof console !== 'undefined') {
        console.error(`GameObject:${gameObject.name}'s Tilemap tileset load error`);
      }
      return;
    }
    record.baseTexture = texture;
    this.buildLayersV1(record, component);
    this.requestRedraw(); // Editor preview ticker 在 edit 模式被冻结,资源加载完手动 trigger 一帧
  }

  /**
   * v2 path:load tileset doc + atlas textures + animation driver + buildLayersV2。
   * 被 handleAdd 与 handleChange(mode upgrade / tilemapRef swap)共用。
   *
   * 调用方负责:
   *   - 在调用前设置 record.mode = 'v2'
   *   - 在调用前 increaseAsyncId 拿到 asyncId
   *   - 在调用前已 tearDown 旧 mode 的产物(如果是 mode upgrade)
   */
  private async ensureV2Built(
    record: TilemapRecord,
    gameObjectId: number,
    gameObject: GameObject,
    component: TilemapComponent,
    asyncId: number,
  ): Promise<void> {
    const loaded = await this.loadV2Tileset(component);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    if (!loaded) {
      if (typeof console !== 'undefined') {
        console.error(`GameObject:${gameObject.name}'s Tilemap tilemapRef load error`);
      }
      return;
    }
    record.loadedTileset = loaded;
    await this.loadAtlasTextures(record, loaded);
    if (!this.validateAsyncId(gameObjectId, asyncId)) return;
    // Animation:为该 entity 创建独立 driver(per-entity 避免跨 tilemap phase 互相干扰)。
    // Driver must exist BEFORE buildLayersV2 so populate can register animated sprites.
    const animDriver = new TileAnimationDriver();
    animDriver.loadFromTileset(loaded.raw);
    const driverForBuild = animDriver.animationCount > 0 ? animDriver : null;
    if (driverForBuild) this.animationDrivers.set(gameObjectId, driverForBuild);
    this.buildLayersV2(record, component, driverForBuild);
    this.requestRedraw();
  }

  /**
   * Editor preview 的 PIXI ticker 在 edit 模式被冻结。Tilemap mount/hot-swap 完成时
   * 主动 trigger 一帧让 chunk 立即可见。preserveDrawingBuffer:true 后单次 render 即可
   * 定格(见 plugin-renderer/lib/System.ts createApplication 注释)。
   */
  private requestRedraw(): void {
    try {
      const app = (this.renderSystem as unknown as { application?: { renderer?: { render: (stage: unknown) => void }; stage?: unknown } })?.application;
      if (app?.renderer && app.stage) {
        app.renderer.render(app.stage);
      }
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn('[Tilemap] requestRedraw failed', e);
      }
    }
  }

  private async handleChange(gameObjectId: number, component: TilemapComponent, changed: ComponentChanged) {
    const record = this.records[gameObjectId];
    if (!record) return;
    const prop = changed.prop?.prop?.[0];
    this.probeBegin(TILEMAP_PROBE_NAMES.PATCH_APPLY_MS);
    try {
      // C-1 + T-L2(Phase L):mode upgrade / switch on live entity,带 fail-safe rollback。
      //
      // 触发场景:
      //   - unknown → v1 (component 起初无 tileset/tilemapRef,后续 patch 上 tileset)
      //   - unknown → v2 (同上,patch 上 tilemapRef)
      //   - v1 → v2  (host 切换:tileset 清空 + tilemapRef 设值)
      //   - v2 → v1  (反向)
      //
      // T-L2 修复:旧代码先 `record.mode = newMode` + 清空 baseTexture/loadedTileset 再 await load。
      // 如果 load 失败,record 卡在新 mode + 半建空白 → 之后 prop change 走错分支。
      // 新流程:load 失败时 record.mode → 'unknown',emit MODE_SWITCH_FAILED probe,host 看得见。
      const newMode = this.detectMode(component);
      if (newMode !== record.mode) {
        const asyncId = this.increaseAsyncId(gameObjectId);
        try {
          // Teardown 旧 mode 的产物(不可逆,但 host 已发 patch,旧 mode 不再展示是用户预期)
          if (record.mode === 'v1') {
            this.tearDownChildrenV1(record);
          } else if (record.mode === 'v2') {
            this.tearDownChildrenV2(record);
            this.animationDrivers.delete(gameObjectId);
          }
          // 清空跨 mode 共享字段(mode 暂不切,等 ensure resolve 再 commit)
          record.baseTexture = null;
          record.loadedTileset = null;

          if (newMode === 'v1') {
            const texture = await this.loadV1Texture(component);
            if (!this.validateAsyncId(gameObjectId, asyncId)) return;
            if (!texture) {
              // mode-switch 失败:record 状态 → 'unknown',probe+1,host 可在 dashboard 看到。
              record.mode = 'unknown';
              this.probeCount(TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT, 1);
              if (typeof console !== 'undefined') {
                console.error(`GameObject:${changed.gameObject.name}'s Tilemap mode-switch v→v1 failed (tileset load returned null)`);
              }
              return;
            }
            record.mode = 'v1';
            record.baseTexture = texture;
            this.buildLayersV1(record, component);
            this.requestRedraw();
          } else if (newMode === 'v2') {
            const loaded = await this.loadV2Tileset(component);
            if (!this.validateAsyncId(gameObjectId, asyncId)) return;
            if (!loaded) {
              record.mode = 'unknown';
              this.probeCount(TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT, 1);
              if (typeof console !== 'undefined') {
                console.error(`GameObject:${changed.gameObject.name}'s Tilemap mode-switch v→v2 failed (tilemapRef load returned null)`);
              }
              return;
            }
            await this.loadAtlasTextures(record, loaded);
            if (!this.validateAsyncId(gameObjectId, asyncId)) return;
            // commit 推迟到这里
            record.mode = 'v2';
            record.loadedTileset = loaded;
            const animDriver = new TileAnimationDriver();
            animDriver.loadFromTileset(loaded.raw);
            const driverForBuild = animDriver.animationCount > 0 ? animDriver : null;
            if (driverForBuild) this.animationDrivers.set(gameObjectId, driverForBuild);
            this.buildLayersV2(record, component, driverForBuild);
            this.requestRedraw();
          } else {
            // newMode === 'unknown' → 干净 teardown 后保持 unknown
            record.mode = 'unknown';
          }
        } catch (e) {
          record.mode = 'unknown';
          this.probeCount(TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT, 1);
          if (typeof console !== 'undefined') {
            console.error('[Tilemap] mode switch threw', e);
          }
        }
        return;
      }

      // 同 mode 内 prop 替换(tileset 换图 / tilemapRef 换 ref / layersV2 整体 reassign)
      if (prop === 'tileset' && record.mode === 'v1') {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const texture = await this.loadV1Texture(component);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!texture) return;
        this.tearDownChildrenV1(record);
        record.baseTexture = texture;
        this.buildLayersV1(record, component);
        this.requestRedraw();
      } else if (prop === 'tilemapRef' && record.mode === 'v2') {
        const asyncId = this.increaseAsyncId(gameObjectId);
        const loaded = await this.loadV2Tileset(component);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        if (!loaded) return;
        this.tearDownChildrenV2(record);
        record.loadedTileset = loaded;
        await this.loadAtlasTextures(record, loaded);
        if (!this.validateAsyncId(gameObjectId, asyncId)) return;
        // Rebuild animation driver to match the new tileset (animations may have changed).
        this.animationDrivers.delete(gameObjectId);
        const animDriver = new TileAnimationDriver();
        animDriver.loadFromTileset(loaded.raw);
        const driverForBuild = animDriver.animationCount > 0 ? animDriver : null;
        if (driverForBuild) this.animationDrivers.set(gameObjectId, driverForBuild);
        this.buildLayersV2(record, component, driverForBuild);
        this.requestRedraw();
      } else if (prop === 'layersV2' && record.mode === 'v2') {
        // T-L1 (Phase L):layersV2 整体 ref reassign → 整 layer 重建。
        // 复用 loadedTileset + atlasTextures(它们没变),只 teardown sprite/chunk container
        // + animation driver(driver 来自 loadedTileset.raw 可重建)。
        // 整 layer rebuild 是浪费 — T-L4 提供 invalidateChunks 增量路径,
        // host 在 paint stroke 后用 invalidateChunks 而不是替换整个 layersV2。
        this.tearDownChildrenV2(record);
        this.animationDrivers.delete(gameObjectId);
        // 清空 dirtyChunkKeys:整 layer rebuild 后所有 chunk 都是 fresh
        record.dirtyChunkKeys.clear();
        const loaded = record.loadedTileset;
        let driverForBuild: TileAnimationDriver | null = null;
        if (loaded) {
          const animDriver = new TileAnimationDriver();
          animDriver.loadFromTileset(loaded.raw);
          if (animDriver.animationCount > 0) {
            driverForBuild = animDriver;
            this.animationDrivers.set(gameObjectId, animDriver);
          }
        }
        this.buildLayersV2(record, component, driverForBuild);
        this.requestRedraw();
      }
    } finally {
      this.probeEnd(TILEMAP_PROBE_NAMES.PATCH_APPLY_MS);
    }
  }

  private handleRemove(gameObjectId: number) {
    this.increaseAsyncId(gameObjectId);
    const record = this.records[gameObjectId];
    if (!record) return;
    this.tearDownChildrenV1(record);
    this.tearDownChildrenV2(record);
    const containerHost = this.containerManager?.getContainer(gameObjectId);
    if (containerHost) containerHost.removeChild(record.root);
    record.root.destroy({ children: true });
    delete this.records[gameObjectId];
    this.animationDrivers.delete(gameObjectId);
    // Re-emit live record count as a gauge so dashboards can see entity churn.
    this.probeGauge('tilemap.records.alive', Object.keys(this.records).length);
  }

  private detectMode(component: TilemapComponent): 'v1' | 'v2' | 'unknown' {
    if (component.tilemapRef) return 'v2';
    if (component.tileset) return 'v1';
    return 'unknown';
  }

  /* ───────────────────────────────────────────────────── v1 Phaser-style ── */

  private async loadV1Texture(component: TilemapComponent): Promise<Texture | null> {
    if (!component.tileset) return null;
    const { instance } = await resource.getResource(component.tileset);
    return (instance as Texture) ?? null;
  }

  private tearDownChildrenV1(record: TilemapRecord) {
    for (const layer of record.layerContainers) {
      record.root.removeChild(layer);
      layer.destroy({ children: true });
    }
    record.layerContainers = [];
    for (const tex of record.frameTextures) {
      try {
        tex.destroy(false);
      } catch {
        /* ignore */
      }
    }
    record.frameTextures = [];
  }

  private buildLayersV1(record: TilemapRecord, component: TilemapComponent) {
    const base = record.baseTexture;
    if (!base) return;
    const tileW = component.tileWidth || 32;
    const tileH = component.tileHeight || 32;
    const renderW = component.renderTileWidth ?? tileW;
    const renderH = component.renderTileHeight ?? tileH;
    const margin = component.tilesetMargin || 0;
    const spacing = component.tilesetSpacing || 0;
    const sourceWidth =
      (base as any).orig?.width ??
      (base as any).source?.width ??
      (base as any).width ??
      base.frame?.width ??
      0;
    const inferredCols =
      sourceWidth > 0 ? Math.max(1, Math.floor((sourceWidth - margin + spacing) / (tileW + spacing))) : 1;
    const cols = component.tilesetColumns && component.tilesetColumns > 0 ? component.tilesetColumns : inferredCols;

    const cache: Map<number, Texture> = new Map();
    const getFrameTexture = (tileId: number): Texture | null => {
      if (tileId <= 0) return null;
      const idx = tileId - 1;
      const cached = cache.get(idx);
      if (cached) return cached;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = margin + col * (tileW + spacing);
      const y = margin + row * (tileH + spacing);
      try {
        const source = (base as any).source ?? (base as any).baseTexture ?? base;
        const sub = new Texture({ source, frame: new Rectangle(x, y, tileW, tileH) });
        cache.set(idx, sub);
        record.frameTextures.push(sub);
        return sub;
      } catch (e) {
        if (typeof console !== 'undefined') {
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

  /* ──────────────────────────────────────────────────── v2 chunked path ── */

  private async loadV2Tileset(component: TilemapComponent): Promise<LoadedTileset | null> {
    if (!component.tilemapRef) return null;
    const res = await resource.getResource(component.tilemapRef);
    if (!res) return null;
    const json =
      (res.instance as TilesetDocumentRaw | undefined) ??
      (res.data?.json as TilesetDocumentRaw | undefined);
    if (!json || json.kind !== 'tileset') {
      if (typeof console !== 'undefined') {
        console.error(`[Tilemap] resource '${component.tilemapRef}' is not a TileSet document`);
      }
      return null;
    }
    return makeLoadedTileset(json);
  }

  private async loadAtlasTextures(record: TilemapRecord, loaded: LoadedTileset): Promise<void> {
    const assetsToLoad = new Set<string>();
    for (const src of loaded.sourcesBySlot) {
      if (src.kind === 'atlas' && src.textureAsset) assetsToLoad.add(src.textureAsset);
    }
    await Promise.all(
      Array.from(assetsToLoad).map(async (assetId) => {
        try {
          const res = await resource.getResource(assetId);
          const texture =
            (res?.instance as Texture | undefined) ??
            ((res?.data?.image as unknown) as Texture | undefined) ??
            null;
          if (texture) record.atlasTextures.set(assetId, texture);
        } catch (e) {
          if (typeof console !== 'undefined') {
            console.warn(`[Tilemap] failed to load atlas asset '${assetId}'`, e);
          }
        }
      })
    );
  }

  private tearDownChildrenV2(record: TilemapRecord) {
    for (const { container } of record.layerContainersV2.values()) {
      record.root.removeChild(container);
      container.destroy({ children: true });
    }
    record.layerContainersV2.clear();
    for (const tex of record.frameTexturesV2.values()) {
      try {
        tex.destroy(false);
      } catch {
        /* ignore */
      }
    }
    record.frameTexturesV2.clear();
    // Live Sprite references are now invalid (destroyed by container.destroy above).
    record.animatedSpritesByAnimKey.clear();
  }

  private buildLayersV2(record: TilemapRecord, component: TilemapComponent, animDriver: TileAnimationDriver | null) {
    const loaded = record.loadedTileset;
    if (!loaded) return;
    const cellW = component.cellSize?.width ?? loaded.tileWidth;
    const cellH = component.cellSize?.height ?? loaded.tileHeight;
    const originX = component.mapOrigin?.x ?? 0;
    const originY = component.mapOrigin?.y ?? 0;

    const layers = component.layersV2 ?? [];
    // 按 zIndex 稳定排序
    const sorted = layers
      .map((l, i) => ({ layer: l, idx: i }))
      .sort((a, b) => (a.layer.zIndex ?? 0) - (b.layer.zIndex ?? 0));

    for (const { layer } of sorted) {
      if (layer.enabled === false) continue;
      const container = new Container();
      container.label = layer.name ?? layer.id;
      container.alpha = layer.opacity ?? 1;
      container.visible = layer.visible !== false;
      const chunkContainers = new Map<string, Container>();
      this.buildChunksForLayer(record, container, chunkContainers, layer, loaded, cellW, cellH, originX, originY, animDriver);
      record.root.addChild(container);
      record.layerContainersV2.set(layer.id, { container, chunkContainers });
    }
  }

  // PERF-T-O4 (see ADR-0022): consider lazy chunk building tied to cullingBoundsHint.
  // Chunks entering viewport: unbuilt → built. Leaving: built → evicted (destroy sprites,
  // keep metadata). Trigger: tilemap > 50×50 OR > 100 chunks total + DIRTY_REBUILD_MS p99
  // > 30ms. Needs a host writer for cullingBoundsHint first (T-L7 ship, no writer today).
  private buildChunksForLayer(
    record: TilemapRecord,
    layerContainer: Container,
    chunkContainers: Map<string, Container>,
    layer: TileMapLayerV2,
    loaded: LoadedTileset,
    cellW: number,
    cellH: number,
    originX: number,
    originY: number,
    animDriver: TileAnimationDriver | null,
  ) {
    const cellData: ChunkedCellData | undefined = layer.cellData;
    if (!cellData || !cellData.chunks) return;
    const visibleChunks = Object.entries(cellData.chunks).filter(([, b]) => b && b.nonEmpty > 0);
    const totalChunksVisible = visibleChunks.length;

    // C-2:viewport culling。
    //
    // 当 record.cullingBoundsHint 由 host 注入时,跳过任何 chunk 世界 bounds 与 hint 不相交的
    // chunk(不 build sprite container,但保留 chunkContainers slot 为空让后续 lazy build 接入)。
    // hint 未注入时 = 不剔除,行为兼容。
    //
    // 真正的 camera bounds 计算留下 cycle(参考 RendererSystem.application.renderer.view)。本 cycle
    // 只做 probe emission + API ready,实际剔除生效仅当 host 主动注入 hint。
    const cullingHint = record.cullingBoundsHint ?? null;
    let culledCount = 0;
    this.probeBegin(TILEMAP_PROBE_NAMES.CULL_CHECK_MS);

    for (const [chunkKey, blob] of visibleChunks) {
      // Viewport culling check(per-chunk,O(1))。仅当 host 注入 hint 时启用。
      if (cullingHint) {
        const parts = chunkKey.split(',');
        const ckX = Number.parseInt(parts[0]!, 10);
        const ckY = Number.parseInt(parts[1]!, 10);
        const chunkMinX = originX + ckX * CHUNK_SIZE * cellW;
        const chunkMinY = originY + ckY * CHUNK_SIZE * cellH;
        const chunkMaxX = chunkMinX + CHUNK_SIZE * cellW;
        const chunkMaxY = chunkMinY + CHUNK_SIZE * cellH;
        const intersects =
          chunkMaxX > cullingHint.minX &&
          chunkMinX < cullingHint.maxX &&
          chunkMaxY > cullingHint.minY &&
          chunkMinY < cullingHint.maxY;
        if (!intersects) {
          culledCount++;
          continue;
        }
      }

      const chunkContainer = new Container();
      chunkContainer.label = `chunk-${chunkKey}`;

      // P1-3:每个 chunk 先咨询 ChunkRenderStrategy 选择渲染路径。
      // - sprite:populateChunkSprites(现有 MVP 路径,每非空 cell 一个 PIXI.Sprite)
      // - mesh:  尝试 buildChunkMesh(...)。当前 isMeshPathAvailable()===false,buildChunkMesh
      //          只返回 stub 空 Container,会被视为"mesh 不可用"自动降级 sprite。
      // 计算 atlasesInChunk 需要 decode 一次 chunk 数据,扫一遍 unique sourceSlot 的 atlas source 个数。
      //
      // C-4:复用 decoded Int32Array — populateChunkSprites 内部会再 decode 一次,把这里 decode
      //      结果透传过去避免重复工作(纯优化,行为兼容)。
      let atlasesInChunk = 1;
      let preDecoded: Int32Array | null = null;
      try {
        preDecoded = decodeChunk(blob);
        const seenAtlasSlots = new Set<number>();
        for (let i = 0; i < preDecoded.length; i++) {
          const v = preDecoded[i];
          if (isEmptyCellValue(v)) continue;
          const slot = v & 0xff;
          const src = loaded.sourcesBySlot[slot - 1];
          if (src && src.kind === 'atlas') seenAtlasSlots.add(slot);
        }
        atlasesInChunk = Math.max(1, seenAtlasSlots.size);
      } catch {
        // Decode failure 在 populateChunkSprites 内会再次报警并跳过,这里保留默认 1 让 strategy 继续走。
        atlasesInChunk = 1;
        preDecoded = null;
      }

      const strategy = resolveChunkRenderStrategy({
        nonEmptyCellsInChunk: blob.nonEmpty,
        atlasesInChunk,
        totalChunksVisible,
        // preference 未来从 layer/component config 透出;当前一律走 auto。
      });

      let dispatched: 'sprite' | 'mesh' | 'meshFallback' = 'sprite';
      if (strategy === 'mesh') {
        if (this.tryBuildMeshChunk(chunkContainer, chunkKey, blob, loaded, cellW, cellH, originX, originY, layer)) {
          dispatched = 'mesh';
        } else {
          // mesh path 当前不可用(stub),降级 sprite + 记录 fallback probe。
          dispatched = 'meshFallback';
          this.probeCount(TILEMAP_PROBE_NAMES.STRATEGY_MESH_FALLBACK_COUNT, 1);
          this.populateChunkSprites(chunkContainer, chunkKey, blob, record, loaded, cellW, cellH, originX, originY, layer, animDriver, preDecoded);
        }
      } else {
        this.populateChunkSprites(chunkContainer, chunkKey, blob, record, loaded, cellW, cellH, originX, originY, layer, animDriver, preDecoded);
      }

      if (dispatched === 'sprite') this.probeCount(TILEMAP_PROBE_NAMES.STRATEGY_SPRITE_COUNT, 1);
      else if (dispatched === 'mesh') this.probeCount(TILEMAP_PROBE_NAMES.STRATEGY_MESH_COUNT, 1);

      layerContainer.addChild(chunkContainer);
      chunkContainers.set(chunkKey, chunkContainer);
    }

    this.probeEnd(TILEMAP_PROBE_NAMES.CULL_CHECK_MS);
    if (culledCount > 0) this.probeCount(TILEMAP_PROBE_NAMES.CULL_HITS_COUNT, culledCount);
  }

  /**
   * 尝试用 mesh path 渲染 chunk(P1-3)。
   *
   * 当前实现策略:
   * - 先检查 isMeshPathAvailable():当 false(本 cycle 默认),直接返回 false 让上层降级。
   * - 当 true(后续 cycle 接入真实 shader 时):调 buildChunkMesh,把结果 add 到 chunkContainer。
   *
   * 出错 / 返回空容器一律视为不可用,返回 false 让 buildChunksForLayer 走 sprite 路径。
   * 这样 "mesh path is dead code" 的局面变成 "mesh path 已 wired,降级有 probe 记录"。
   */
  private tryBuildMeshChunk(
    chunkContainer: Container,
    chunkKey: string,
    blob: { blob: string; nonEmpty: number },
    loaded: LoadedTileset,
    cellW: number,
    cellH: number,
    _originX: number,
    _originY: number,
    _layer: TileMapLayerV2,
  ): boolean {
    if (!isMeshPathAvailable()) return false;
    let decoded: Int32Array;
    try {
      decoded = decodeChunk(blob);
    } catch {
      return false;
    }
    // 找到 chunk 内第一个 atlas source 作为 shader uTexture(MVP:暂时只支持单 atlas chunk;
    // resolveChunkRenderStrategy 已经把 atlasesInChunk>1 的 chunk 路由到 sprite)。
    let primarySrc: { kind: 'atlas'; regionSize: { width: number; height: number }; margins?: { x: number; y: number }; separation?: { x: number; y: number }; textureAsset: string } | null = null;
    for (let i = 0; i < decoded.length; i++) {
      const v = decoded[i];
      if (isEmptyCellValue(v)) continue;
      const slot = v & 0xff;
      const src = loaded.sourcesBySlot[slot - 1];
      if (src && src.kind === 'atlas') {
        primarySrc = src as typeof primarySrc;
        break;
      }
    }
    if (!primarySrc) return false;
    const parts = chunkKey.split(',');
    const chunkX = Number.parseInt(parts[0]!, 10);
    const chunkY = Number.parseInt(parts[1]!, 10);
    try {
      const meshContainer = buildChunkMesh({
        chunkKey,
        chunkX,
        chunkY,
        cellWidth: cellW,
        cellHeight: cellH,
        atlas: null,
        cells: decoded,
        regionWidth: primarySrc.regionSize.width,
        regionHeight: primarySrc.regionSize.height,
        margins: primarySrc.margins,
        separation: primarySrc.separation,
      });
      // 当前 buildChunkMesh 是 stub,只返回 empty Container —— 视为"mesh path 没有真渲染",
      // 也视为不可用,让上层降级 sprite。后续 cycle 接入真实 mesh 后,meshContainer.children.length
      // 会 > 0,这里就 return true 让 mesh path 上线。
      if (!meshContainer || (meshContainer.children?.length ?? 0) === 0) {
        return false;
      }
      chunkContainer.addChild(meshContainer);
      return true;
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn(`[Tilemap] buildChunkMesh failed for ${chunkKey}, falling back to sprite`, e);
      }
      return false;
    }
  }

  // PERF-T-O3 (see ADR-0022): consider per-Tilemap Sprite pool. On tearDownChildrenV2,
  // move sprites to pool instead of destroy({children: true}); pop from pool here before
  // `new Sprite`. Trigger: GC pause profile shows alloc churn dominates + > 5000 sprites
  // per rebuild cycle. Note: Mesh path (Phase 4) would sidestep this entirely.
  private populateChunkSprites(
    chunkContainer: Container,
    chunkKey: string,
    blob: { blob: string; nonEmpty: number },
    record: TilemapRecord,
    loaded: LoadedTileset,
    cellW: number,
    cellH: number,
    originX: number,
    originY: number,
    layer: TileMapLayerV2,
    animDriver: TileAnimationDriver | null,
    /** C-4:caller(buildChunksForLayer)decode 后透传,可省一次 decodeChunk 调用。 */
    decoded?: Int32Array | null,
  ) {
    let arr: Int32Array;
    if (decoded) {
      arr = decoded;
    } else {
      try {
        arr = decodeChunk(blob);
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.warn(`[Tilemap] chunk decode failed for ${chunkKey}`, e);
        }
        return;
      }
    }
    const parts = chunkKey.split(',');
    const ckX = Number.parseInt(parts[0]!, 10);
    const ckY = Number.parseInt(parts[1]!, 10);
    const baseCx = ckX * CHUNK_SIZE;
    const baseCy = ckY * CHUNK_SIZE;
    const tintNum = parseHexTint(layer.modulate);
    let spritesInChunk = 0;
    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const packed = arr[ly * CHUNK_SIZE + lx];
        if (isEmptyCellValue(packed)) continue;
        const cell = unpackCell(packed);
        const tex = this.getAtlasFrameTexture(record, loaded, cell);
        if (!tex) continue;
        const sprite = new Sprite(tex);
        spritesInChunk++;
        sprite.x = originX + (baseCx + lx) * cellW;
        sprite.y = originY + (baseCy + ly) * cellH;
        sprite.width = cellW;
        sprite.height = cellH;
        if (cell.flipH) sprite.scale.x = -Math.abs(sprite.scale.x || 1);
        if (cell.flipV) sprite.scale.y = -Math.abs(sprite.scale.y || 1);
        if (cell.transpose) sprite.rotation = Math.PI / 2;
        if (cell.flipH) sprite.x += cellW;
        if (cell.flipV) sprite.y += cellH;
        if (tintNum != null) sprite.tint = tintNum;
        chunkContainer.addChild(sprite);

        // Register sprite for live animation texture swap if this source tile is animated.
        if (animDriver && animDriver.isAnimatedSource(cell.sourceSlot, cell.col, cell.row)) {
          const animKey = `${cell.sourceSlot},${cell.col},${cell.row}`;
          let bucket = record.animatedSpritesByAnimKey.get(animKey);
          if (!bucket) {
            bucket = [];
            record.animatedSpritesByAnimKey.set(animKey, bucket);
          }
          bucket.push(sprite);
        }
      }
    }
    if (spritesInChunk > 0) {
      this.probeCount(TILEMAP_PROBE_NAMES.DRAWCALLS_COUNT, spritesInChunk);
    }
  }

  private getAtlasFrameTexture(record: TilemapRecord, loaded: LoadedTileset, cell: { sourceSlot: number; col: number; row: number }): Texture | null {
    const src = loaded.sourcesBySlot[cell.sourceSlot - 1];
    if (!src) return null;
    if (src.kind !== 'atlas') {
      // P1-4:遇到 sceneCollection(或其他非 atlas)source。当前 runtime 暂时不实例化 prefab,
      // 跳过该 cell 不渲染,但要让 host 看见这个 gap:
      //   - 每个 record 内对同一 source 只 warn 一次(防 devtools 刷爆)
      //   - 计数 probe 累加,host 可在 perf dashboard 上看到"static path 漏渲染 N 个 cell"
      // 真正的 prefab placeholder 渲染留下一轮 cycle(参考 expandSceneCollectionSource / resolveCellPrefabName)。
      if (src.kind === 'sceneCollection') {
        this.probeCount(TILEMAP_PROBE_NAMES.SCENECOLLECTION_SKIPPED_COUNT, 1);
        if (!record.sceneCollectionWarnedSourceIds.has(src.id)) {
          record.sceneCollectionWarnedSourceIds.add(src.id);
          if (typeof console !== 'undefined') {
            console.warn(
              `[Tilemap] sceneCollection source '${src.id}' cells are not yet rendered ` +
              `(prefab instantiation pending). Skipped cell at slot=${cell.sourceSlot} col=${cell.col} row=${cell.row}.`
            );
          }
        }
      }
      return null;
    }
    const atlas = record.atlasTextures.get(src.textureAsset);
    if (!atlas) return null;
    const margins = src.margins ?? { x: 0, y: 0 };
    const sep = src.separation ?? { x: 0, y: 0 };
    const fw = src.regionSize.width;
    const fh = src.regionSize.height;
    // T-N3 (Phase N):cache key 必须包含 regionSize / margins / separation —
    // 同一个 textureAsset 在多个 source 配置(不同切片大小或留白)下会有不同的 frame 坐标,
    // 旧的 `${textureAsset}#${col},${row}` 在 hot-swap tileset 后会 collision,误返回旧 frame。
    // 现在把切片几何参数都拼进 key,确保不同配置之间隔离。
    const cacheKey = `${src.textureAsset}#${fw}x${fh}|${margins.x},${margins.y}|${sep.x},${sep.y}#${cell.col},${cell.row}`;
    const cached = record.frameTexturesV2.get(cacheKey);
    if (cached) return cached;
    const fx = margins.x + cell.col * (fw + sep.x);
    const fy = margins.y + cell.row * (fh + sep.y);
    try {
      const source = (atlas as any).source ?? (atlas as any).baseTexture ?? atlas;
      const sub = new Texture({ source, frame: new Rectangle(fx, fy, fw, fh) });
      record.frameTexturesV2.set(cacheKey, sub);
      return sub;
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.warn(`[Tilemap] frame slice failed for ${cacheKey}`, e);
      }
      return null;
    }
  }

  destroy(): void {
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      this.tearDownChildrenV1(record);
      this.tearDownChildrenV2(record);
      const container = this.containerManager?.getContainer(id);
      if (container) container.removeChild(record.root);
      record.root.destroy({ children: true });
      delete this.records[id];
    }
    // T-N2:解绑 visibility / context-loss listener,避免 system tear-down 后泄漏。
    this.uninstallVisibilityHandlers();
  }
}

function parseHexTint(modulate?: string): number | undefined {
  if (!modulate) return undefined;
  const m = /^#?([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?$/.exec(modulate);
  if (!m) return undefined;
  return parseInt(m[1]!, 16);
}

export type { TilemapLayer };
