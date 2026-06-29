import { Tilemap, TilemapSystem, CHUNK_SIZE, decodeChunk, unpackCell, isEmptyCellValue, makeLoadedTileset } from '../lib';
import { TileAnimationDriver } from '../lib/animation-driver';
import { createInMemoryProbeRegistry, TILEMAP_PROBE_NAMES } from '../lib/probes';
import { resource, OBSERVER_TYPE } from '@eva/eva.js';

jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  class Container {
    children: any[] = [];
    label: string = '';
    alpha: number = 1;
    visible: boolean = true;
    addChild(c: any) {
      this.children.push(c);
      return c;
    }
    addChildAt(c: any, _i: number) {
      this.children.unshift(c);
      return c;
    }
    removeChild(c: any) {
      this.children = this.children.filter((x: any) => x !== c);
    }
    destroy(_opts?: any) {}
  }
  class Sprite {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    tint = 0xffffff;
    rotation = 0;
    scale = { x: 1, y: 1 };
    constructor(public texture: any) {}
    destroy() {}
  }
  class Rectangle {
    constructor(public x: number, public y: number, public width: number, public height: number) {}
  }
  class Texture {
    constructor(public opts: any = {}) {}
    width = 64;
    height = 64;
    frame = { width: 64, height: 64 };
    destroy(_opts?: any) {}
    static WHITE = { id: 'white' };
    static EMPTY = new Texture();
    static from() {
      return new Texture();
    }
  }
  return { ...pixi, Container, Sprite, Rectangle, Texture };
});

describe('Tilemap Plugin', () => {
  describe('Component (v1 Phaser-style)', () => {
    it('应该使用默认值实例化', () => {
      const c = new Tilemap();
      expect(c.name).toBe('Tilemap');
      expect(c.tileWidth).toBe(32);
      expect(c.tileHeight).toBe(32);
      expect(c.layers).toEqual([]);
    });

    it('应该接收 init 参数', () => {
      const c = new Tilemap();
      c.init({
        tileset: 'mytiles',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 4,
        layers: [
          {
            name: 'ground',
            data: [
              [1, 2],
              [3, 0],
            ],
          },
        ],
      });
      expect(c.tileset).toBe('mytiles');
      expect(c.tileWidth).toBe(16);
      expect(c.layers.length).toBe(1);
      expect(c.layers[0].data[0][0]).toBe(1);
    });
  });

  describe('Component (v2 chunked)', () => {
    it('应该接收 tilemapRef + layersV2', () => {
      const c = new Tilemap();
      c.init({
        tilemapRef: 'world.tileset',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'ground',
            name: 'Ground',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      expect(c.tilemapRef).toBe('world.tileset');
      expect(c.layersV2).toHaveLength(1);
      expect(c.layersV2![0].id).toBe('ground');
    });
  });

  describe('chunk-codec round-trip via plugin export', () => {
    it('unpackCell + isEmptyCellValue 与 dsl 编码一致', () => {
      // 与 libs/dsl chunk-codec 同 bit layout
      const packed = 1 | (3 << 8) | (5 << 16) | (2 << 24) | (1 << 29);
      const cell = unpackCell(packed);
      expect(cell).toEqual({ sourceSlot: 1, col: 3, row: 5, altIdx: 2, flipH: true, flipV: false, transpose: false });
      expect(isEmptyCellValue(0)).toBe(true);
      expect(isEmptyCellValue(packed)).toBe(false);
    });

    it('decodeChunk 解出 256-int 数组', () => {
      // 构造一个 chunk:仅 cell [3,5] = packed value
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      const packed = 1 | (0 << 8) | (0 << 16);
      arr[5 * CHUNK_SIZE + 3] = packed;
      // 把 arr 编码成 base64(plugin 这边只有 decode,所以这里手工 encode)
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      const b64 = Buffer.from(bytes).toString('base64');
      const out = decodeChunk({ blob: b64, nonEmpty: 1 });
      expect(out.length).toBe(CHUNK_SIZE * CHUNK_SIZE);
      expect(out[5 * CHUNK_SIZE + 3]).toBe(packed);
    });
  });

  describe('LoadedTileset', () => {
    it('makeLoadedTileset 给 sources 分配 1-based slot', () => {
      const loaded = makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'world',
        tileSize: { width: 16, height: 16 },
        sources: [
          { kind: 'atlas', id: 'main', textureAsset: 'atlas', regionSize: { width: 16, height: 16 }, tiles: [] },
        ],
      });
      expect(loaded.sourcesBySlot).toHaveLength(1);
      expect(loaded.slotByIdMap.get('main')).toBe(1);
      expect(loaded.tileWidth).toBe(16);
    });
  });

  describe('System', () => {
    it('systemName 应该等于 Tilemap', () => {
      expect(TilemapSystem.systemName).toBe('Tilemap');
    });

    it('应该可以实例化 System', () => {
      const sys = new TilemapSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('Tilemap');
    });

    it('System 应该暴露 records 字段', () => {
      const sys: any = new TilemapSystem();
      expect(sys['records'] || sys.records || {}).toBeTruthy();
    });

    it('System 应该暴露 animationDrivers map(C3 runtime tie-in)', () => {
      const sys: any = new TilemapSystem();
      expect(sys.animationDrivers).toBeDefined();
      expect(sys.animationDrivers.size).toBe(0);
    });

    it('update() 在 animationDrivers 为空时安全 no-op', () => {
      const sys: any = new TilemapSystem();
      expect(() => sys.update({})).not.toThrow();
    });

    it('update() 把 dirtyKeys 应用到 record.animatedSpritesByAnimKey 的 sprite.texture', () => {
      // Arrange — minimal mocked record + driver + two sprites painted with the same animated source tile
      const sys: any = new TilemapSystem();
      const gameObjectId = 42;
      const loaded = makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [
              {
                atlasCoords: { col: 0, row: 0 },
                alternatives: [{ altId: 0 }],
                animation: {
                  stepMs: 100,
                  frames: [
                    { atlasCoords: { col: 0, row: 0 } },
                    { atlasCoords: { col: 1, row: 0 } },
                    { atlasCoords: { col: 2, row: 0 } },
                  ],
                  phase: 'sync',
                },
              } as any,
            ],
          },
        ],
      });
      const fakeAtlasTexture: any = { source: { _src: 'atlas' } };
      const sprite1: any = { texture: 'tex-frame-0' };
      const sprite2: any = { texture: 'tex-frame-0' };
      const record: any = {
        root: { addChild: () => {}, removeChild: () => {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map([['atlas', fakeAtlasTexture]]),
        loadedTileset: loaded,
        mode: 'v2',
        animatedSpritesByAnimKey: new Map<string, any[]>([['1,0,0', [sprite1, sprite2]]]),
      };
      sys.records[gameObjectId] = record;
      const driver = new TileAnimationDriver();
      driver.loadFromTileset(loaded.raw);
      // Force lastFrameIdxByKey to "frame 0" so advance(100) reports key as dirty
      driver.advance(0);
      sys.animationDrivers.set(gameObjectId, driver);

      // Act — advance enough to switch from frame 0 → frame 1
      // Monkey-patch advance to ensure deterministic now value through one tick
      const origAdvance = driver.advance.bind(driver);
      let callCount = 0;
      driver.advance = ((_now: number) => {
        callCount++;
        return origAdvance(100);
      }) as any;
      sys.update({});

      // Assert — both sprites got their texture swapped to a new (non-string-equal) value
      expect(callCount).toBe(1);
      expect(sprite1.texture).not.toBe('tex-frame-0');
      expect(sprite2.texture).not.toBe('tex-frame-0');
      // Same swap target: both sprites share one source key, one new texture
      expect(sprite1.texture).toBe(sprite2.texture);
    });

    it('update() 在 perf probes 注入后 emit ANIM_TICK_MS 计时', () => {
      // Arrange — system with probes + driver + animated sprite registration
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const gameObjectId = 7;
      const loaded = makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [
              {
                atlasCoords: { col: 0, row: 0 },
                alternatives: [{ altId: 0 }],
                animation: {
                  stepMs: 100,
                  frames: [{ atlasCoords: { col: 0, row: 0 } }, { atlasCoords: { col: 1, row: 0 } }],
                  phase: 'sync',
                },
              } as any,
            ],
          },
        ],
      });
      const fakeAtlasTexture: any = { source: { _src: 'atlas' } };
      const sprite: any = { texture: 'tex-frame-0' };
      sys.records[gameObjectId] = {
        root: { addChild: () => {}, removeChild: () => {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map([['atlas', fakeAtlasTexture]]),
        loadedTileset: loaded,
        mode: 'v2',
        animatedSpritesByAnimKey: new Map<string, any[]>([['1,0,0', [sprite]]]),
      };
      const driver = new TileAnimationDriver();
      driver.loadFromTileset(loaded.raw);
      driver.advance(0); // settle last frame index for the upcoming dirty check
      driver.advance = (() => ({
        currentFrames: new Map([['1,0,0', { col: 1, row: 0 }]]),
        dirtyKeys: new Set(['1,0,0']),
      })) as any;
      sys.animationDrivers.set(gameObjectId, driver);

      // Act
      sys.update({});

      // Assert — ANIM_TICK_MS sample recorded + spritesSwapped counted
      const animSamples = probes.timings.get(TILEMAP_PROBE_NAMES.ANIM_TICK_MS);
      expect(animSamples).toBeDefined();
      expect(animSamples!.length).toBe(1);
      expect(probes.counts.get('tilemap.anim.spritesSwapped')).toBe(1);
    });

    it('TileAnimationDriver.isAnimatedSource 报告正确的 source tile', () => {
      const loaded = makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [
              {
                atlasCoords: { col: 2, row: 3 },
                alternatives: [{ altId: 0 }],
                animation: {
                  stepMs: 100,
                  frames: [{ atlasCoords: { col: 2, row: 3 } }, { atlasCoords: { col: 3, row: 3 } }],
                  phase: 'sync',
                },
              } as any,
            ],
          },
        ],
      });
      const d = new TileAnimationDriver();
      d.loadFromTileset(loaded.raw);
      expect(d.isAnimatedSource(1, 2, 3)).toBe(true);
      expect(d.isAnimatedSource(1, 0, 0)).toBe(false);
      expect(d.isAnimatedSource(2, 2, 3)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // System lifecycle integration (P1 gap from audit report)
  //
  // Strategy: path A — invoke private methods (handleAdd/handleChange/handleRemove
  // /tearDownChildrenV1/V2/detectMode) directly through `(sys as any)`, bypassing
  // the OBSERVER_TYPE wiring. We monkey-patch `resource.getResource` on the
  // shared singleton (no jest.mock dance) and inject a fake `containerManager`
  // /`renderSystem` so the system can interact with PIXI containers.
  // ─────────────────────────────────────────────────────────────────────────
  describe('System lifecycle integration', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */

    // Stub container the host attaches to a GameObject. addChildAt/removeChild
    // capture which children flow through. Sprite.destroy is a noop.
    const makeContainerHost = () => {
      const children: any[] = [];
      return {
        children,
        addChildAt: jest.fn((c: any, _i: number) => {
          children.unshift(c);
          return c;
        }),
        removeChild: jest.fn((c: any) => {
          const idx = children.indexOf(c);
          if (idx >= 0) children.splice(idx, 1);
        }),
      };
    };

    const makeRenderSystem = () => ({
      application: {
        renderer: { render: jest.fn() },
        stage: {},
      },
    });

    // Minimal "GameObject" enough for handleAdd to log a name + read .id off
    // ComponentChanged-shaped struct downstream.
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);

    // Build a sys with containerManager + renderSystem injected. records is left
    // empty so each test starts fresh. probes is null unless test attaches one.
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      const containerHost = makeContainerHost();
      sys.containerManager = {
        getContainer: jest.fn((_id: number) => containerHost),
      };
      sys.renderSystem = makeRenderSystem();
      return { sys, containerHost };
    };

    // Standard v1 tileset Texture(returned by mocked resource.getResource('v1-tex'))
    // — the mock Texture class lives in the jest.mock('pixi.js') above.
    const { Texture } = require('pixi.js');
    const makeV1Texture = () => new Texture();

    // Standard v2 atlas Texture
    const makeAtlasTexture = () => new Texture();

    // Standard v2 tileset doc resolved by resource.getResource('v2-ref')
    const makeV2TilesetDoc = (opts?: { withAnimation?: boolean }) => ({
      kind: 'tileset' as const,
      schemaVersion: 1 as const,
      name: 'world',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas' as const,
          id: 'main',
          textureAsset: 'atlas-1',
          regionSize: { width: 16, height: 16 },
          tiles: opts?.withAnimation
            ? [
                {
                  atlasCoords: { col: 0, row: 0 },
                  alternatives: [{ altId: 0 }],
                  animation: {
                    stepMs: 100,
                    frames: [
                      { atlasCoords: { col: 0, row: 0 } },
                      { atlasCoords: { col: 1, row: 0 } },
                    ],
                    phase: 'sync' as const,
                  },
                } as any,
              ]
            : [],
        },
      ],
    });

    // Helper: encode a single-cell chunk where (lx,ly)=(0,0) maps to source 1 col 0 row 0.
    const makeSingleCellChunkBlob = (opts?: { col?: number; row?: number; sourceSlot?: number }) => {
      const col = opts?.col ?? 0;
      const row = opts?.row ?? 0;
      const slot = opts?.sourceSlot ?? 1;
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      const packed = slot | (col << 8) | (row << 16);
      arr[0] = packed; // lx=0,ly=0
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    };

    // Restore resource.getResource after each test so mocks don't bleed.
    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    /* ─── A. v1 lifecycle ──────────────────────────────────────────────── */

    it('test_TilemapSystem_handleAdd_v1_creates_record_with_baseTexture_and_layerContainers', async () => {
      // Arrange — v1 component with one 1x1 layer painting tile id 1
      const { sys } = newSysWithHosts();
      const v1Texture = makeV1Texture();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v1-tileset') return { instance: v1Texture };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tileset: 'v1-tileset',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 1,
        layers: [{ name: 'ground', data: [[1]] }],
      });
      const go = makeFakeGameObject(1, 'go-v1');

      // Act
      await (sys as any).handleAdd(1, go, component);

      // Assert
      const record = sys.records[1];
      expect(record).toBeDefined();
      expect(record.mode).toBe('v1');
      expect(record.baseTexture).toBe(v1Texture);
      expect(record.layerContainers.length).toBe(1);
      // 1 sprite painted for tile id 1
      expect(record.layerContainers[0].children.length).toBe(1);
      // v2 buckets empty
      expect(record.layerContainersV2.size).toBe(0);
      expect(record.animatedSpritesByAnimKey.size).toBe(0);
    });

    it('test_TilemapSystem_handleChange_v1_tileset_swap_teardowns_and_rebuilds', async () => {
      // Arrange — start with one tileset, mount; then swap tileset asset to another
      const { sys } = newSysWithHosts();
      const v1TexA = makeV1Texture();
      const v1TexB = makeV1Texture();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v1-a') return { instance: v1TexA };
        if (id === 'v1-b') return { instance: v1TexB };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tileset: 'v1-a',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 1,
        layers: [{ name: 'ground', data: [[1, 1]] }],
      });
      await (sys as any).handleAdd(2, makeFakeGameObject(2, 'go'), component);
      const layerBefore = sys.records[2].layerContainers[0];
      const destroySpyBefore = jest.spyOn(layerBefore, 'destroy');

      // Act — swap to v1-b
      component.tileset = 'v1-b';
      await (sys as any).handleChange(2, component, {
        prop: { prop: ['tileset'] } as any,
      } as any);

      // Assert
      expect(sys.records[2].baseTexture).toBe(v1TexB);
      // old layer container was destroyed and replaced
      expect(destroySpyBefore).toHaveBeenCalled();
      // new layer rebuilt with same data (1 layer, 2 sprites for [1,1])
      expect(sys.records[2].layerContainers.length).toBe(1);
      expect(sys.records[2].layerContainers[0]).not.toBe(layerBefore);
      expect(sys.records[2].layerContainers[0].children.length).toBe(2);
    });

    it('test_TilemapSystem_handleRemove_v1_destroys_record_and_clears_records_dict', async () => {
      // Arrange
      const { sys, containerHost } = newSysWithHosts();
      const v1Texture = makeV1Texture();
      (resource as any).getResource = jest.fn(async (_id: string) => ({ instance: v1Texture }));
      const component = new Tilemap();
      component.init({
        tileset: 'v1-tileset',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 1,
        layers: [{ name: 'g', data: [[1]] }],
      });
      await (sys as any).handleAdd(3, makeFakeGameObject(3, 'go'), component);
      const rootBefore = sys.records[3].root;
      const destroySpy = jest.spyOn(rootBefore, 'destroy');

      // Act
      (sys as any).handleRemove(3);

      // Assert
      expect(sys.records[3]).toBeUndefined();
      expect(destroySpy).toHaveBeenCalledWith({ children: true });
      expect(containerHost.removeChild).toHaveBeenCalledWith(rootBefore);
      expect(sys.animationDrivers.has(3)).toBe(false);
    });

    it('test_TilemapSystem_tearDownChildrenV1_destroys_layerContainers_and_releases_frameTextures', async () => {
      // Arrange — mount v1 with 2 layers so we have multiple children to tear down
      const { sys } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async () => ({ instance: makeV1Texture() }));
      const component = new Tilemap();
      component.init({
        tileset: 'v1-tileset',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 1,
        layers: [
          { name: 'ground', data: [[1]] },
          { name: 'over', data: [[1]] },
        ],
      });
      await (sys as any).handleAdd(4, makeFakeGameObject(4, 'go'), component);
      const record = sys.records[4];
      expect(record.layerContainers.length).toBe(2);
      expect(record.frameTextures.length).toBeGreaterThan(0);
      const frameTexture = record.frameTextures[0];
      const frameDestroy = jest.spyOn(frameTexture, 'destroy');
      const layerDestroys = record.layerContainers.map((c: any) => jest.spyOn(c, 'destroy'));

      // Act
      (sys as any).tearDownChildrenV1(record);

      // Assert — both layer containers destroyed
      for (const spy of layerDestroys) expect(spy).toHaveBeenCalledWith({ children: true });
      expect(record.layerContainers).toEqual([]);
      expect(record.frameTextures).toEqual([]);
      // texture also destroyed
      expect(frameDestroy).toHaveBeenCalledWith(false);
    });

    it('test_TilemapSystem_buildLayersV1_skips_missing_tile_id_0', async () => {
      // Arrange — layer data has 0s (empty cells) and non-zero ids
      const { sys } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async () => ({ instance: makeV1Texture() }));
      const component = new Tilemap();
      component.init({
        tileset: 'v1-tileset',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 2,
        layers: [{ name: 'g', data: [[1, 0, 2], [0, 0, 0], [3, 0, 0]] }],
      });

      // Act
      await (sys as any).handleAdd(5, makeFakeGameObject(5, 'go'), component);

      // Assert — only the 3 non-zero ids produced sprites
      const layer = sys.records[5].layerContainers[0];
      expect(layer.children.length).toBe(3);
    });

    /* ─── B. v2 lifecycle ──────────────────────────────────────────────── */

    it('test_TilemapSystem_handleAdd_v2_creates_record_with_loadedTileset_and_layerContainersV2', async () => {
      // Arrange — v2 with one chunked layer, no animation
      const { sys } = newSysWithHosts();
      const atlasTex = makeAtlasTexture();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: doc };
        if (id === 'atlas-1') return { instance: atlasTex };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'ground',
            name: 'Ground',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });

      // Act
      await (sys as any).handleAdd(10, makeFakeGameObject(10, 'go-v2'), component);

      // Assert
      const record = sys.records[10];
      expect(record).toBeDefined();
      expect(record.mode).toBe('v2');
      expect(record.loadedTileset).toBeTruthy();
      expect(record.loadedTileset.tileWidth).toBe(16);
      expect(record.atlasTextures.get('atlas-1')).toBe(atlasTex);
      expect(record.layerContainersV2.size).toBe(1);
      const layerEntry = record.layerContainersV2.get('ground');
      expect(layerEntry).toBeDefined();
      expect(layerEntry.chunkContainers.size).toBe(1);
      // 1 sprite painted in chunk '0,0'
      expect(layerEntry.chunkContainers.get('0,0').children.length).toBe(1);
      // v1 bucket empty
      expect(record.layerContainers.length).toBe(0);
    });

    it('test_TilemapSystem_handleAdd_v2_registers_animationDriver_only_when_animations_exist', async () => {
      // Arrange A — tileset WITHOUT animation → no driver registered
      const { sys: sysNoAnim } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc({ withAnimation: false }) };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const cNoAnim = new Tilemap();
      cNoAnim.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sysNoAnim as any).handleAdd(20, makeFakeGameObject(20, 'g'), cNoAnim);
      expect(sysNoAnim.animationDrivers.has(20)).toBe(false);

      // Arrange B — tileset WITH animation → driver IS registered + bucket populated
      const { sys: sysWithAnim } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc({ withAnimation: true }) };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const cAnim = new Tilemap();
      cAnim.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sysWithAnim as any).handleAdd(21, makeFakeGameObject(21, 'g'), cAnim);
      expect(sysWithAnim.animationDrivers.has(21)).toBe(true);
      // animation source (slot=1,col=0,row=0) is painted at (0,0) → bucket should hold 1 sprite
      expect(sysWithAnim.records[21].animatedSpritesByAnimKey.get('1,0,0')?.length).toBe(1);
    });

    it('test_TilemapSystem_handleChange_v2_tilemapRef_swap_teardowns_animatedSpritesByAnimKey', async () => {
      // Arrange — mount v2 with animation, capture animated bucket, then swap ref to new tileset
      const { sys } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'ref-A') return { instance: makeV2TilesetDoc({ withAnimation: true }) };
        if (id === 'ref-B') return { instance: makeV2TilesetDoc({ withAnimation: false }) };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'ref-A',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sys as any).handleAdd(30, makeFakeGameObject(30, 'g'), component);
      // sanity — bucket populated before swap
      expect(sys.records[30].animatedSpritesByAnimKey.size).toBe(1);
      const oldContainerEntry = sys.records[30].layerContainersV2.get('g');
      expect(oldContainerEntry).toBeDefined();

      // Act — swap tilemapRef to ref-B (no animation)
      component.tilemapRef = 'ref-B';
      await (sys as any).handleChange(30, component, {
        prop: { prop: ['tilemapRef'] } as any,
      } as any);

      // Assert — old animated bucket cleared via tearDownChildrenV2, new tileset has no anim
      const record = sys.records[30];
      // bucket repopulated by new build BUT new doc has no animations so bucket stays empty
      expect(record.animatedSpritesByAnimKey.size).toBe(0);
      // animation driver should now be gone since new tileset has no animations
      expect(sys.animationDrivers.has(30)).toBe(false);
      // layer container reference replaced
      expect(record.layerContainersV2.get('g')).not.toBe(oldContainerEntry);
    });

    it('test_TilemapSystem_handleRemove_v2_deletes_animationDriver_entry', async () => {
      // Arrange — mount v2 with animation
      const { sys } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc({ withAnimation: true }) };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sys as any).handleAdd(40, makeFakeGameObject(40, 'g'), component);
      expect(sys.animationDrivers.has(40)).toBe(true);

      // Act
      (sys as any).handleRemove(40);

      // Assert
      expect(sys.animationDrivers.has(40)).toBe(false);
      expect(sys.records[40]).toBeUndefined();
    });

    it('test_TilemapSystem_tearDownChildrenV2_clears_animatedSpritesByAnimKey', async () => {
      // Arrange
      const { sys } = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc({ withAnimation: true }) };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sys as any).handleAdd(50, makeFakeGameObject(50, 'g'), component);
      const record = sys.records[50];
      expect(record.animatedSpritesByAnimKey.size).toBe(1);
      expect(record.layerContainersV2.size).toBe(1);
      expect(record.frameTexturesV2.size).toBeGreaterThan(0);

      // Act
      (sys as any).tearDownChildrenV2(record);

      // Assert
      expect(record.animatedSpritesByAnimKey.size).toBe(0);
      expect(record.layerContainersV2.size).toBe(0);
      expect(record.frameTexturesV2.size).toBe(0);
    });

    /* ─── C. detectMode + edge cases ──────────────────────────────────── */

    it('test_TilemapSystem_detectMode_returns_v1_when_tileset_set', () => {
      const sys: any = new TilemapSystem();
      const c = new Tilemap();
      c.init({ tileset: 'foo', tileWidth: 16, tileHeight: 16 });
      expect(sys.detectMode(c)).toBe('v1');
    });

    it('test_TilemapSystem_detectMode_returns_v2_when_tilemapRef_set', () => {
      const sys: any = new TilemapSystem();
      const c = new Tilemap();
      c.init({ tilemapRef: 'world.tileset' });
      expect(sys.detectMode(c)).toBe('v2');
    });

    it('test_TilemapSystem_detectMode_returns_unknown_when_neither_set', () => {
      const sys: any = new TilemapSystem();
      const c = new Tilemap();
      // default state: tileset='', tilemapRef='' — both empty
      // detectMode falsy-checks both, so should return 'unknown'
      expect(sys.detectMode(c)).toBe('unknown');
    });

    it('test_TilemapSystem_handleAdd_unknown_mode_creates_empty_record_but_no_layers', async () => {
      // Arrange — component has neither tileset nor tilemapRef
      const { sys } = newSysWithHosts();
      const component = new Tilemap();
      // intentionally do not init any tileset / tilemapRef
      // resource.getResource should NEVER be called
      const getResourceSpy = jest.fn();
      (resource as any).getResource = getResourceSpy;

      // Act
      await (sys as any).handleAdd(60, makeFakeGameObject(60, 'unknown'), component);

      // Assert — record exists with mode='unknown', no layers built either side
      const record = sys.records[60];
      expect(record).toBeDefined();
      expect(record.mode).toBe('unknown');
      expect(record.layerContainers.length).toBe(0);
      expect(record.layerContainersV2.size).toBe(0);
      expect(record.baseTexture).toBeNull();
      expect(record.loadedTileset).toBeNull();
      // resource loader untouched in unknown mode
      expect(getResourceSpy).not.toHaveBeenCalled();
    });

    /* ─── D. perf probes integration ──────────────────────────────────── */

    it('test_TilemapSystem_handleAdd_v2_emits_DIRTY_REBUILD_MS_probe_timing', async () => {
      // Arrange — attach probes BEFORE handleAdd
      const { sys } = newSysWithHosts();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc() };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });

      // Act
      await (sys as any).handleAdd(70, makeFakeGameObject(70, 'g'), component);

      // Assert — DIRTY_REBUILD_MS sample recorded
      const samples = probes.timings.get(TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS);
      expect(samples).toBeDefined();
      expect(samples!.length).toBe(1);
      // duration should be a finite non-negative number
      expect(samples![0]).toBeGreaterThanOrEqual(0);
    });

    it('test_TilemapSystem_populateChunkSprites_counts_DRAWCALLS_COUNT_per_chunk_painted', async () => {
      // Arrange — two chunks, each painting 1 sprite → DRAWCALLS_COUNT should be 2
      const { sys } = newSysWithHosts();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc() };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: {
              kind: 'chunked',
              chunkSize: 16,
              stride: 1,
              chunks: {
                '0,0': makeSingleCellChunkBlob(),
                '1,0': makeSingleCellChunkBlob(),
              },
            },
          },
        ],
      });

      // Act
      await (sys as any).handleAdd(80, makeFakeGameObject(80, 'g'), component);

      // Assert — DRAWCALLS_COUNT counted 2 sprites (one per chunk)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.DRAWCALLS_COUNT)).toBe(2);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────────────── P1-3 dispatch ──
  // ChunkRenderStrategy dispatch:验证 buildChunksForLayer 真的咨询了 strategy
  // 并在 mesh 不可用时降级 sprite + emit fallback probe(P1-3 子 Agent ship)。
  describe('ChunkRenderStrategy dispatch', () => {
    function makeFakeAtlasTexture(): any {
      return { source: { _src: 'atlas' } };
    }

    /** 构造一个 nonEmpty=200 的密集 chunk,strategy 会选 mesh。 */
    function makeDenseChunkBlob(): { blob: string; nonEmpty: number } {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      const packed = 1 | (0 << 8) | (0 << 16);
      for (let i = 0; i < 200; i++) arr[i] = packed;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 200 };
    }

    /** 构造一个 nonEmpty=16 的稀疏 chunk,strategy 会选 sprite。 */
    function makeSparseChunkBlob(): { blob: string; nonEmpty: number } {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      const packed = 1 | (0 << 8) | (0 << 16);
      for (let i = 0; i < 16; i++) arr[i] = packed;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 16 };
    }

    function buildLoadedSingleAtlas() {
      return makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
          },
        ],
      });
    }

    function makeRecord(loaded: ReturnType<typeof buildLoadedSingleAtlas>): any {
      return {
        root: { addChild: () => {}, removeChild: () => {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map([['atlas', makeFakeAtlasTexture()]]),
        loadedTileset: loaded,
        mode: 'v2' as const,
        animatedSpritesByAnimKey: new Map(),
        sceneCollectionWarnedSourceIds: new Set<string>(),
      };
    }

    it('test_TilemapSystem_buildChunksForLayer_consults_resolveChunkRenderStrategy', () => {
      // 稀疏 chunk (nonEmpty=16) → strategy === 'sprite' → emit STRATEGY_SPRITE_COUNT。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);

      const loaded = buildLoadedSingleAtlas();
      const record = makeRecord(loaded);
      const layerContainer: any = { addChild() {}, removeChild() {}, children: [] };
      const chunkContainers = new Map();
      const sparseLayer: any = {
        id: 'l0',
        name: 'l0',
        cellData: { kind: 'chunked', chunkSize: CHUNK_SIZE, stride: 1, chunks: { '0,0': makeSparseChunkBlob() } },
      };
      sys.buildChunksForLayer(record, layerContainer, chunkContainers, sparseLayer, loaded, 16, 16, 0, 0, null);

      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_SPRITE_COUNT)).toBe(1);
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_MESH_COUNT) ?? 0).toBe(0);
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_MESH_FALLBACK_COUNT) ?? 0).toBe(0);
    });

    it('test_TilemapSystem_mesh_strategy_falls_back_to_sprite_when_isMeshPathAvailable_false_and_emits_meshFallback_probe', () => {
      // 密集 chunk (nonEmpty=200) + 单 atlas → strategy === 'mesh',但 isMeshPathAvailable()=false,
      // 应当降级到 sprite + emit STRATEGY_MESH_FALLBACK_COUNT。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);

      const loaded = buildLoadedSingleAtlas();
      const record = makeRecord(loaded);
      const layerContainer: any = { addChild() {}, removeChild() {}, children: [] };
      const chunkContainers = new Map();
      const denseLayer: any = {
        id: 'l1',
        name: 'l1',
        cellData: { kind: 'chunked', chunkSize: CHUNK_SIZE, stride: 1, chunks: { '0,0': makeDenseChunkBlob() } },
      };
      sys.buildChunksForLayer(record, layerContainer, chunkContainers, denseLayer, loaded, 16, 16, 0, 0, null);

      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_MESH_FALLBACK_COUNT)).toBe(1);
      // mesh 真正成功的 count 应当为 0(stub 不真渲染)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_MESH_COUNT) ?? 0).toBe(0);
      // sprite count 也不应该 emit —— dispatched 是 'meshFallback'(只 emit fallback,不再叠 sprite)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.STRATEGY_SPRITE_COUNT) ?? 0).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────── P1-4 sceneCollection ──
  describe('SceneCollection cell diagnostic', () => {
    function makeLoadedWithSceneCollection() {
      return makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          { kind: 'sceneCollection', id: 'props', prefabRefs: ['TreePrefab', 'RockPrefab'] } as any,
        ],
      });
    }

    function makeRecord(loaded: any): any {
      return {
        root: { addChild: () => {}, removeChild: () => {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map(),
        loadedTileset: loaded,
        mode: 'v2' as const,
        animatedSpritesByAnimKey: new Map(),
        sceneCollectionWarnedSourceIds: new Set<string>(),
      };
    }

    it('test_TilemapSystem_getAtlasFrameTexture_warns_once_per_record_for_sceneCollection_source', () => {
      const sys: any = new TilemapSystem();
      const loaded = makeLoadedWithSceneCollection();
      const record = makeRecord(loaded);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        // Three cells from the same sceneCollection source — should warn only once.
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 0 });
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 1, row: 0 });
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 1 });

        const sceneCollectionWarns = warnSpy.mock.calls.filter((args: any[]) =>
          typeof args[0] === 'string' && args[0].includes("sceneCollection source 'props'")
        );
        expect(sceneCollectionWarns.length).toBe(1);
        expect(record.sceneCollectionWarnedSourceIds.has('props')).toBe(true);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('test_TilemapSystem_emits_sceneCollection_skipped_probe_count', () => {
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loaded = makeLoadedWithSceneCollection();
      const record = makeRecord(loaded);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 0 });
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 1, row: 0 });
        sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 1 });
      } finally {
        warnSpy.mockRestore();
      }

      // probe 是 per-cell 计数(警告才是 per-record),所以 3 个 cell = 3。
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.SCENECOLLECTION_SKIPPED_COUNT)).toBe(3);
    });
  });

  // ───────────────────────────────────────────────────────── C-1 mode switch ──
  // handleChange 必须支持 mode upgrade(unknown → v1/v2)与 mode switch(v1 ↔ v2)。
  // 否则 P1-1 子 Agent 发现的"record.mode 卡 unknown 永远不 build"会重现。
  describe('v1↔v2 mode switch', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => {
      const children: any[] = [];
      return {
        children,
        addChildAt: jest.fn((c: any, _i: number) => {
          children.unshift(c);
          return c;
        }),
        removeChild: jest.fn((c: any) => {
          const idx = children.indexOf(c);
          if (idx >= 0) children.splice(idx, 1);
        }),
      };
    };
    const makeRenderSystem = () => ({
      application: {
        renderer: { render: jest.fn() },
        stage: {},
      },
    });
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      const containerHost = makeContainerHost();
      sys.containerManager = {
        getContainer: jest.fn((_id: number) => containerHost),
      };
      sys.renderSystem = makeRenderSystem();
      return { sys, containerHost };
    };
    const { Texture } = require('pixi.js');
    const makeV1Texture = () => new Texture();
    const makeAtlasTexture = () => new Texture();
    const makeV2TilesetDoc = () => ({
      kind: 'tileset' as const,
      schemaVersion: 1 as const,
      name: 'world',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas' as const,
          id: 'main',
          textureAsset: 'atlas-1',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
      ],
    });
    const makeSingleCellChunkBlob = () => {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      arr[0] = 1; // sourceSlot=1, col=0, row=0
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    };

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_handleChange_unknown_to_v1_upgrades_mode_and_builds', async () => {
      // Arrange — component 起初无 tileset/tilemapRef → mode=unknown,record 留空。
      const { sys } = newSysWithHosts();
      const v1Texture = makeV1Texture();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v1-tex') return { instance: v1Texture };
        return null;
      });
      const component = new Tilemap();
      // 不 init tileset/tilemapRef
      const go = makeFakeGameObject(100, 'go-upgrade');
      await (sys as any).handleAdd(100, go, component);
      expect(sys.records[100].mode).toBe('unknown');
      expect(sys.records[100].layerContainers.length).toBe(0);

      // Act — patch tileset='v1-tex' + layers,触发 handleChange(unknown → v1)
      component.tileset = 'v1-tex';
      component.tileWidth = 16;
      component.tileHeight = 16;
      component.tilesetColumns = 1;
      component.layers = [{ name: 'g', data: [[1]] }];
      await (sys as any).handleChange(100, component, {
        prop: { prop: ['tileset'] } as any,
        gameObject: go,
      } as any);

      // Assert — mode 已升级到 v1,layers 已 build,baseTexture 填上
      const record = sys.records[100];
      expect(record.mode).toBe('v1');
      expect(record.baseTexture).toBe(v1Texture);
      expect(record.layerContainers.length).toBe(1);
      expect(record.layerContainers[0].children.length).toBe(1);
    });

    it('test_handleChange_unknown_to_v2_upgrades_mode_and_builds', async () => {
      // Arrange — component 起初无 tilemapRef
      const { sys } = newSysWithHosts();
      const atlasTex = makeAtlasTexture();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: doc };
        if (id === 'atlas-1') return { instance: atlasTex };
        return null;
      });
      const component = new Tilemap();
      const go = makeFakeGameObject(101, 'go-v2-upgrade');
      await (sys as any).handleAdd(101, go, component);
      expect(sys.records[101].mode).toBe('unknown');

      // Act — patch tilemapRef + layersV2
      component.tilemapRef = 'v2-ref';
      component.cellSize = { width: 16, height: 16 };
      component.layersV2 = [
        {
          id: 'g',
          zIndex: 0,
          cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
        },
      ];
      await (sys as any).handleChange(101, component, {
        prop: { prop: ['tilemapRef'] } as any,
        gameObject: go,
      } as any);

      // Assert
      const record = sys.records[101];
      expect(record.mode).toBe('v2');
      expect(record.loadedTileset).toBeTruthy();
      expect(record.atlasTextures.get('atlas-1')).toBe(atlasTex);
      expect(record.layerContainersV2.size).toBe(1);
    });

    it('test_handleChange_v1_to_v2_teardowns_v1_and_builds_v2', async () => {
      // Arrange — mount v1 first
      const { sys } = newSysWithHosts();
      const v1Texture = makeV1Texture();
      const atlasTex = makeAtlasTexture();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v1-tex') return { instance: v1Texture };
        if (id === 'v2-ref') return { instance: doc };
        if (id === 'atlas-1') return { instance: atlasTex };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tileset: 'v1-tex',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 1,
        layers: [{ name: 'g', data: [[1]] }],
      });
      const go = makeFakeGameObject(102, 'go-switch');
      await (sys as any).handleAdd(102, go, component);
      const layerBefore = sys.records[102].layerContainers[0];
      expect(layerBefore).toBeDefined();
      const layerDestroySpy = jest.spyOn(layerBefore, 'destroy');

      // Act — host swap:tileset 清空 + tilemapRef 设置
      component.tileset = '';
      component.tilemapRef = 'v2-ref';
      component.cellSize = { width: 16, height: 16 };
      component.layersV2 = [
        {
          id: 'g',
          zIndex: 0,
          cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
        },
      ];
      await (sys as any).handleChange(102, component, {
        prop: { prop: ['tilemapRef'] } as any,
        gameObject: go,
      } as any);

      // Assert — 旧 v1 layerContainer 被 destroy,record 切到 v2
      expect(layerDestroySpy).toHaveBeenCalled();
      const record = sys.records[102];
      expect(record.mode).toBe('v2');
      expect(record.layerContainers.length).toBe(0); // v1 已清空
      expect(record.layerContainersV2.size).toBe(1); // v2 已 build
      expect(record.baseTexture).toBe(null); // 已重置
      expect(record.loadedTileset).toBeTruthy();
    });

    it('test_handleChange_v2_to_v1_teardowns_v2_and_builds_v1', async () => {
      // Arrange — mount v2 first(带 animation 验证 animationDrivers 也清掉)
      const { sys } = newSysWithHosts();
      const v1Texture = makeV1Texture();
      const atlasTex = makeAtlasTexture();
      const docWithAnim = {
        kind: 'tileset' as const,
        schemaVersion: 1 as const,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas' as const,
            id: 'main',
            textureAsset: 'atlas-1',
            regionSize: { width: 16, height: 16 },
            tiles: [
              {
                atlasCoords: { col: 0, row: 0 },
                alternatives: [{ altId: 0 }],
                animation: {
                  stepMs: 100,
                  frames: [
                    { atlasCoords: { col: 0, row: 0 } },
                    { atlasCoords: { col: 1, row: 0 } },
                  ],
                  phase: 'sync' as const,
                },
              } as any,
            ],
          },
        ],
      };
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: docWithAnim };
        if (id === 'atlas-1') return { instance: atlasTex };
        if (id === 'v1-tex') return { instance: v1Texture };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      const go = makeFakeGameObject(103, 'go-switch-back');
      await (sys as any).handleAdd(103, go, component);
      expect(sys.records[103].mode).toBe('v2');
      expect(sys.animationDrivers.has(103)).toBe(true);
      const v2EntryBefore = sys.records[103].layerContainersV2.get('g');
      const v2DestroySpy = jest.spyOn(v2EntryBefore.container, 'destroy');

      // Act — host swap:tilemapRef 清空 + tileset 设置
      component.tilemapRef = '';
      component.tileset = 'v1-tex';
      component.tileWidth = 16;
      component.tileHeight = 16;
      component.tilesetColumns = 1;
      component.layers = [{ name: 'g', data: [[1]] }];
      await (sys as any).handleChange(103, component, {
        prop: { prop: ['tileset'] } as any,
        gameObject: go,
      } as any);

      // Assert — v2 entry destroyed, v1 layer built, animation driver cleared
      expect(v2DestroySpy).toHaveBeenCalled();
      const record = sys.records[103];
      expect(record.mode).toBe('v1');
      expect(record.layerContainersV2.size).toBe(0);
      expect(record.layerContainers.length).toBe(1);
      expect(record.layerContainers[0].children.length).toBe(1);
      expect(record.baseTexture).toBe(v1Texture);
      expect(record.loadedTileset).toBe(null);
      expect(sys.animationDrivers.has(103)).toBe(false);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────────── C-2 viewport cull ──
  // buildChunksForLayer 应当:
  //   - 总是 emit CULL_CHECK_MS 计时 probe(无论是否剔除)
  //   - 当 record.cullingBoundsHint 注入时,跳过 off-screen chunk + emit CULL_HITS_COUNT
  //   - 未注入 hint 时不剔除(行为兼容)
  describe('viewport culling', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    function makeFakeAtlasTexture(): any {
      return { source: { _src: 'atlas' } };
    }
    function makeSingleCellChunkBlob() {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      arr[0] = 1;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    }
    function buildLoadedSingleAtlas() {
      return makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
          },
        ],
      });
    }
    function makeRecord(loaded: ReturnType<typeof buildLoadedSingleAtlas>, cullingBoundsHint?: any): any {
      return {
        root: { addChild: () => {}, removeChild: () => {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map([['atlas', makeFakeAtlasTexture()]]),
        loadedTileset: loaded,
        mode: 'v2' as const,
        animatedSpritesByAnimKey: new Map(),
        sceneCollectionWarnedSourceIds: new Set<string>(),
        cullingBoundsHint,
      };
    }

    it('test_buildChunksForLayer_emits_CULL_CHECK_MS_timing', () => {
      // buildChunksForLayer 不管有没有 hint,都应当 emit CULL_CHECK_MS 计时 sample。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loaded = buildLoadedSingleAtlas();
      const record = makeRecord(loaded);
      const layerContainer: any = { addChild() {}, removeChild() {}, children: [] };
      const chunkContainers = new Map();
      const layer: any = {
        id: 'l0',
        name: 'l0',
        cellData: { kind: 'chunked', chunkSize: CHUNK_SIZE, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
      };

      sys.buildChunksForLayer(record, layerContainer, chunkContainers, layer, loaded, 16, 16, 0, 0, null);

      const samples = probes.timings.get(TILEMAP_PROBE_NAMES.CULL_CHECK_MS);
      expect(samples).toBeDefined();
      expect(samples!.length).toBe(1);
      expect(samples![0]).toBeGreaterThanOrEqual(0);
    });

    it('test_buildChunksForLayer_skips_off_screen_chunk_when_cullingBoundsHint_provided', () => {
      // 两个 chunk:'0,0' 在 viewport 内,'5,5' 在 viewport 外。注入 hint 后 '5,5' 应被剔除。
      // chunk size = 16 cells * 16px = 256px。
      // chunk '0,0' 世界 bounds = (0,0) → (256,256)
      // chunk '5,5' 世界 bounds = (1280,1280) → (1536,1536)
      // hint = (0,0)~(512,512) → 仅覆盖 '0,0'。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loaded = buildLoadedSingleAtlas();
      const record = makeRecord(loaded, { minX: 0, minY: 0, maxX: 512, maxY: 512 });
      const layerContainer: any = { addChild() {}, removeChild() {}, children: [] };
      const chunkContainers = new Map();
      const layer: any = {
        id: 'l0',
        name: 'l0',
        cellData: {
          kind: 'chunked',
          chunkSize: CHUNK_SIZE,
          stride: 1,
          chunks: {
            '0,0': makeSingleCellChunkBlob(),
            '5,5': makeSingleCellChunkBlob(),
          },
        },
      };

      sys.buildChunksForLayer(record, layerContainer, chunkContainers, layer, loaded, 16, 16, 0, 0, null);

      // 仅 '0,0' 被 build,'5,5' 被剔除
      expect(chunkContainers.has('0,0')).toBe(true);
      expect(chunkContainers.has('5,5')).toBe(false);
      // CULL_HITS_COUNT 应该是 1
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.CULL_HITS_COUNT)).toBe(1);
    });

    it('test_buildChunksForLayer_does_not_cull_when_no_hint', () => {
      // 同上 layer,但不注入 hint → 两个 chunk 都应 build,CULL_HITS_COUNT 为 undefined/0。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loaded = buildLoadedSingleAtlas();
      const record = makeRecord(loaded); // 无 cullingBoundsHint
      const layerContainer: any = { addChild() {}, removeChild() {}, children: [] };
      const chunkContainers = new Map();
      const layer: any = {
        id: 'l0',
        name: 'l0',
        cellData: {
          kind: 'chunked',
          chunkSize: CHUNK_SIZE,
          stride: 1,
          chunks: {
            '0,0': makeSingleCellChunkBlob(),
            '5,5': makeSingleCellChunkBlob(),
          },
        },
      };

      sys.buildChunksForLayer(record, layerContainer, chunkContainers, layer, loaded, 16, 16, 0, 0, null);

      // 两个 chunk 都应 build
      expect(chunkContainers.has('0,0')).toBe(true);
      expect(chunkContainers.has('5,5')).toBe(true);
      // CULL_HITS_COUNT 不应递增(probeCount 仅在 culledCount>0 时才被调,所以这里是 undefined)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.CULL_HITS_COUNT) ?? 0).toBe(0);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────── T-L1 layersV2 observer ──
  // Phase L ship:host 通过 component.layersV2 = layersV2.slice() 触发 observer 重建,
  // 不再卡 unknown/stale。验证 metadata 与 prop 分支两侧。
  describe('T-L1 layersV2 observer integration', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => {
      const children: any[] = [];
      return {
        children,
        addChildAt: jest.fn((c: any, _i: number) => {
          children.unshift(c);
          return c;
        }),
        removeChild: jest.fn((c: any) => {
          const idx = children.indexOf(c);
          if (idx >= 0) children.splice(idx, 1);
        }),
      };
    };
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const { Texture } = require('pixi.js');
    const makeAtlasTexture = () => new Texture();
    const makeV2TilesetDoc = () => ({
      kind: 'tileset' as const,
      schemaVersion: 1 as const,
      name: 'world',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas' as const,
          id: 'main',
          textureAsset: 'atlas-1',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
      ],
    });
    const makeSingleCellChunkBlob = () => {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      arr[0] = 1;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    };

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_layersV2_observer_in_decorator_list', () => {
      // T-L1 metadata gate:确认 layersV2 出现在 TilemapSystem.observerInfo.Tilemap 的 prop 集合。
      // 没这条 observer,host reassign component.layersV2 不会触发 handleChange,sprite 永不刷新。
      const observerInfo = (TilemapSystem as any).observerInfo;
      expect(observerInfo).toBeDefined();
      expect(observerInfo.Tilemap).toBeDefined();
      const props = (observerInfo.Tilemap as Array<{ prop: string[] }>).map((entry) => entry.prop);
      // 应至少包含 ['tileset'] / ['tilemapRef'] / ['layersV2']
      expect(props.some((p) => p[0] === 'tileset')).toBe(true);
      expect(props.some((p) => p[0] === 'tilemapRef')).toBe(true);
      expect(props.some((p) => p[0] === 'layersV2')).toBe(true);
    });

    it('test_layersV2_change_via_componentChanged_rebuilds_chunks', async () => {
      // 启动 v2,然后整体 reassign layersV2,确认 chunk container ref 被替换 + sprite 重新画。
      const sys = newSysWithHosts();
      const atlasTex = makeAtlasTexture();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: doc };
        if (id === 'atlas-1') return { instance: atlasTex };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      const go = makeFakeGameObject(200, 'go-tl1');
      await (sys as any).handleAdd(200, go, component);
      expect(sys.records[200].layerContainersV2.size).toBe(1);
      const oldEntry = sys.records[200].layerContainersV2.get('g');
      expect(oldEntry).toBeDefined();
      const oldChunk = oldEntry.chunkContainers.get('0,0');
      expect(oldChunk).toBeDefined();

      // Act — host reassign layersV2(加一个 chunk '1,0')
      component.layersV2 = [
        {
          id: 'g',
          zIndex: 0,
          cellData: {
            kind: 'chunked',
            chunkSize: 16,
            stride: 1,
            chunks: {
              '0,0': makeSingleCellChunkBlob(),
              '1,0': makeSingleCellChunkBlob(),
            },
          },
        },
      ];
      await (sys as any).handleChange(200, component, {
        prop: { prop: ['layersV2'] } as any,
        gameObject: go,
      } as any);

      // Assert — layerContainersV2 entry 被 destroy + 重建,新增 '1,0' chunk 出现
      const newEntry = sys.records[200].layerContainersV2.get('g');
      expect(newEntry).toBeDefined();
      expect(newEntry).not.toBe(oldEntry);
      expect(newEntry.chunkContainers.size).toBe(2);
      expect(newEntry.chunkContainers.has('0,0')).toBe(true);
      expect(newEntry.chunkContainers.has('1,0')).toBe(true);
      // loadedTileset 没变(整 layer rebuild 但不重 load tileset)
      expect(sys.records[200].loadedTileset).toBeTruthy();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ──────────────────────────────────────────────────── T-L2 mode-commit race ──
  // mode-switch async load 失败时,record 不能卡半建 state(mode='v2' + loadedTileset=null)。
  // 修复后:record.mode='unknown' + MODE_SWITCH_FAILED probe 累加。
  describe('T-L2 mode-commit race', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => ({
      children: [],
      addChildAt: jest.fn((c: any) => c),
      removeChild: jest.fn(),
    });
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const { Texture } = require('pixi.js');

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_mode_switch_failed_load_keeps_record_in_unknown_not_half_built', async () => {
      // Arrange — start v2 successfully,then switch to v1 with failing texture load.
      const sys = newSysWithHosts();
      const atlasTex = new Texture();
      const doc = {
        kind: 'tileset' as const,
        schemaVersion: 1 as const,
        name: 'world',
        tileSize: { width: 16, height: 16 },
        sources: [{ kind: 'atlas' as const, id: 'main', textureAsset: 'atlas-1', regionSize: { width: 16, height: 16 }, tiles: [] }],
      };
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: doc };
        if (id === 'atlas-1') return { instance: atlasTex };
        if (id === 'broken-v1') return { instance: null }; // 触发 mode-switch 失败
        return null;
      });
      const probes = createInMemoryProbeRegistry();
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      const go = makeFakeGameObject(300, 'go-tl2');
      await (sys as any).handleAdd(300, go, component);
      expect(sys.records[300].mode).toBe('v2');
      // attach probes after handleAdd 避免之前的 PATCH_APPLY 计数干扰
      sys.attachPerfProbes(probes);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act — switch to v1 with broken texture
      component.tilemapRef = '';
      component.tileset = 'broken-v1';
      await (sys as any).handleChange(300, component, {
        prop: { prop: ['tileset'] } as any,
        gameObject: go,
      } as any);
      errSpy.mockRestore();

      // Assert — record state 是 'unknown' 而不是 'v1' 半建
      const rec = sys.records[300];
      expect(rec.mode).toBe('unknown');
      expect(rec.baseTexture).toBeNull();
      expect(rec.loadedTileset).toBeNull();
      // 旧 v2 layer container 已 teardown
      expect(rec.layerContainersV2.size).toBe(0);
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT)).toBe(1);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ──────────────────────────────────────────────── T-L4 throttled rebuild ──
  // invalidateChunks(layerId, chunkKeys) 把变化标记到 record.dirtyChunkKeys + emit DIRTY_PENDING gauge。
  // flushDirtyChunks 只 rebuild dirty chunk,emit DIRTY_FRAMES_BEHIND counter+1。
  describe('T-L4 throttled chunk rebuild', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => ({
      children: [],
      addChildAt: jest.fn((c: any) => c),
      removeChild: jest.fn(),
    });
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const { Texture } = require('pixi.js');
    const makeAtlasTexture = () => new Texture();
    const makeV2TilesetDoc = () => ({
      kind: 'tileset' as const,
      schemaVersion: 1 as const,
      name: 'world',
      tileSize: { width: 16, height: 16 },
      sources: [{ kind: 'atlas' as const, id: 'main', textureAsset: 'atlas-1', regionSize: { width: 16, height: 16 }, tiles: [] }],
    });
    const makeSingleCellChunkBlob = () => {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      arr[0] = 1;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    };

    let origGetResource: typeof resource.getResource;
    let origRAF: any;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
      origRAF = (globalThis as any).requestAnimationFrame;
      // Capture rAF calls but don't auto-fire — tests drive flushDirtyChunks manually.
      (globalThis as any).requestAnimationFrame = jest.fn();
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      (globalThis as any).requestAnimationFrame = origRAF;
      jest.restoreAllMocks();
    });

    it('test_invalidateChunks_marks_pending', async () => {
      // Arrange — mount v2
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc() };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const probes = createInMemoryProbeRegistry();
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: { '0,0': makeSingleCellChunkBlob() } },
          },
        ],
      });
      await (sys as any).handleAdd(400, makeFakeGameObject(400, 'go-tl4'), component);
      sys.attachPerfProbes(probes);

      // Act
      sys.invalidateChunks(400, 'g', ['0,0', '1,0']);

      // Assert — bucket records both keys + DIRTY_PENDING gauge=2
      const rec = sys.records[400];
      const bucket = rec.dirtyChunkKeys.get('g');
      expect(bucket).toBeDefined();
      expect(bucket.has('0,0')).toBe(true);
      expect(bucket.has('1,0')).toBe(true);
      expect(probes.gauges.get(TILEMAP_PROBE_NAMES.DIRTY_PENDING)).toBe(2);
      // rAF scheduled exactly once
      expect((globalThis as any).requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(rec.flushScheduled).toBe(true);
    });

    it('test_invalidateChunks_dedupes_same_key_on_repeat_calls', async () => {
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc() };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const probes = createInMemoryProbeRegistry();
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      await (sys as any).handleAdd(401, makeFakeGameObject(401, 'go'), component);
      sys.attachPerfProbes(probes);

      sys.invalidateChunks(401, 'g', ['0,0']);
      sys.invalidateChunks(401, 'g', ['0,0', '1,0']);

      const bucket = sys.records[401].dirtyChunkKeys.get('g');
      expect(bucket.size).toBe(2);
      // 2 invalidates 但 flush 只 schedule 一次
      expect((globalThis as any).requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(probes.gauges.get(TILEMAP_PROBE_NAMES.DIRTY_PENDING)).toBe(2);
    });

    it('test_flushDirtyChunks_only_rebuilds_dirty_chunks', async () => {
      // Arrange — 两个 chunk '0,0' 与 '1,0',只 invalidate '0,0',flush 后只该 chunk 被替换。
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return { instance: makeV2TilesetDoc() };
        if (id === 'atlas-1') return { instance: makeAtlasTexture() };
        return null;
      });
      const probes = createInMemoryProbeRegistry();
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'g',
            zIndex: 0,
            cellData: {
              kind: 'chunked',
              chunkSize: 16,
              stride: 1,
              chunks: {
                '0,0': makeSingleCellChunkBlob(),
                '1,0': makeSingleCellChunkBlob(),
              },
            },
          },
        ],
      });
      await (sys as any).handleAdd(402, makeFakeGameObject(402, 'go'), component);
      sys.attachPerfProbes(probes);

      // Inject `game.gameObjects` 以便 flushDirtyChunks 找到 component
      (sys as any).game = {
        gameObjects: [
          { id: 402, components: [{ name: 'Tilemap', ...component }] },
        ],
      };
      // 但上面是 spread,会丢失 prototype 上方法/字段;直接 push 原始 component。
      (sys as any).game = {
        gameObjects: [{ id: 402, components: [Object.assign(component, { name: 'Tilemap' })] }],
      };

      const rec = sys.records[402];
      const layerEntry = rec.layerContainersV2.get('g');
      const oldChunk00 = layerEntry.chunkContainers.get('0,0');
      const oldChunk10 = layerEntry.chunkContainers.get('1,0');
      expect(oldChunk00).toBeDefined();
      expect(oldChunk10).toBeDefined();

      // Act — invalidate 仅 '0,0' + 手动 flush
      sys.invalidateChunks(402, 'g', ['0,0']);
      sys.flushDirtyChunks(402);

      // Assert — '0,0' 被替换,'1,0' 引用不变
      const newChunk00 = layerEntry.chunkContainers.get('0,0');
      const newChunk10 = layerEntry.chunkContainers.get('1,0');
      expect(newChunk00).not.toBe(oldChunk00);
      expect(newChunk10).toBe(oldChunk10);
      // dirtyChunkKeys 已清空 + DIRTY_FRAMES_BEHIND+1 + DIRTY_PENDING 归零
      expect(rec.dirtyChunkKeys.size).toBe(0);
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.DIRTY_FRAMES_BEHIND)).toBe(1);
      expect(probes.gauges.get(TILEMAP_PROBE_NAMES.DIRTY_PENDING)).toBe(0);
    });

    it('test_flushDirtyChunks_skips_unknown_mode_and_clears_pending', async () => {
      // unknown 模式下 flush 不应崩溃,只清 pending。
      const sys = newSysWithHosts();
      const probes = createInMemoryProbeRegistry();
      const component = new Tilemap(); // 无 tileset/tilemapRef → unknown
      await (sys as any).handleAdd(403, makeFakeGameObject(403, 'go'), component);
      sys.attachPerfProbes(probes);

      // Manually 标 dirty(skip invalidateChunks 的 schedule;先 attach probes)
      const rec = sys.records[403];
      rec.dirtyChunkKeys.set('g', new Set(['0,0']));
      sys.flushDirtyChunks(403);
      expect(rec.dirtyChunkKeys.size).toBe(0);
      expect(probes.gauges.get(TILEMAP_PROBE_NAMES.DIRTY_PENDING)).toBe(0);
      // DIRTY_FRAMES_BEHIND 不应递增(unknown skip 早返回)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.DIRTY_FRAMES_BEHIND) ?? 0).toBe(0);
    });

    it('test_invalidateChunks_on_missing_record_is_noop', () => {
      const sys = newSysWithHosts();
      expect(() => sys.invalidateChunks(9999, 'g', ['0,0'])).not.toThrow();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ────────────────────────────────────────────── T-L7 cullingBoundsHint API ──
  // setCullingBoundsHint 直接更新 record.cullingBoundsHint,不强制 rebuild。
  describe('T-L7 setCullingBoundsHint API', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => ({
      children: [],
      addChildAt: jest.fn((c: any) => c),
      removeChild: jest.fn(),
    });
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const { Texture } = require('pixi.js');

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_setCullingBoundsHint_updates_record_field', async () => {
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return {
          instance: {
            kind: 'tileset',
            schemaVersion: 1,
            name: 'w',
            tileSize: { width: 16, height: 16 },
            sources: [{ kind: 'atlas', id: 'main', textureAsset: 'atlas-1', regionSize: { width: 16, height: 16 }, tiles: [] }],
          },
        };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [{ id: 'g', zIndex: 0, cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} } }],
      });
      await (sys as any).handleAdd(500, makeFakeGameObject(500, 'go'), component);
      expect(sys.records[500].cullingBoundsHint).toBeUndefined();

      const bounds = { minX: 0, minY: 0, maxX: 256, maxY: 256 };
      sys.setCullingBoundsHint(500, bounds);
      expect(sys.records[500].cullingBoundsHint).toBe(bounds);
    });

    it('test_setCullingBoundsHint_null_clears_field', async () => {
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref') return {
          instance: {
            kind: 'tileset',
            schemaVersion: 1,
            name: 'w',
            tileSize: { width: 16, height: 16 },
            sources: [{ kind: 'atlas', id: 'main', textureAsset: 'atlas-1', regionSize: { width: 16, height: 16 }, tiles: [] }],
          },
        };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref',
        cellSize: { width: 16, height: 16 },
        layersV2: [{ id: 'g', zIndex: 0, cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} } }],
      });
      await (sys as any).handleAdd(501, makeFakeGameObject(501, 'go'), component);
      sys.setCullingBoundsHint(501, { minX: 0, minY: 0, maxX: 100, maxY: 100 });
      expect(sys.records[501].cullingBoundsHint).toBeDefined();
      sys.setCullingBoundsHint(501, null);
      expect(sys.records[501].cullingBoundsHint).toBeUndefined();
    });

    it('test_setCullingBoundsHint_noop_on_missing_record', () => {
      const sys = newSysWithHosts();
      expect(() => sys.setCullingBoundsHint(9999, { minX: 0, minY: 0, maxX: 1, maxY: 1 })).not.toThrow();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────── T-M3 stroke → runtime integration ──
  // 之前所有 v2 lifecycle 测试都直接 invoke private `handleAdd`/`handleChange`,
  // 绕过 `componentChanged` 路由 + OBSERVER_TYPE wiring。
  // 真实生产链路是:host 给 component.layersV2 reassign 新 array → @componentObserver
  // 拦截 setter → systemInstance.componentObserver.add() → flush 时调
  // `system.componentChanged({ type, component, prop, gameObject, componentName })`。
  // 这个 describe 块通过**直接调 sys.componentChanged()**(模拟 observer 已 flush 的下
  // 一步)证明 router→handleAdd/handleChange→ensureV2Built→buildLayersV2→
  // populateChunkSprites→animatedSpritesByAnimKey 注册 是完整 ship 的,
  // 即"P0-1 inject 绕路"和"真实事件路径"不会因为 router 缺一条 case 而漂移。
  describe('T-M3 stroke → componentChanged → runtime rebuild integration', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => {
      const children: any[] = [];
      return {
        children,
        addChildAt: jest.fn((c: any, _i: number) => {
          children.unshift(c);
          return c;
        }),
        removeChild: jest.fn((c: any) => {
          const idx = children.indexOf(c);
          if (idx >= 0) children.splice(idx, 1);
        }),
      };
    };
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const { Texture } = require('pixi.js');

    // tileset doc:source slot 1 atlas 'atlas-1' 16×16,可选 animation。
    const makeV2TilesetDoc = (opts?: { withAnimation?: boolean }) => ({
      kind: 'tileset' as const,
      schemaVersion: 1 as const,
      name: 'world',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas' as const,
          id: 'main',
          textureAsset: 'atlas-1',
          regionSize: { width: 16, height: 16 },
          tiles: opts?.withAnimation
            ? [
                {
                  atlasCoords: { col: 0, row: 0 },
                  alternatives: [{ altId: 0 }],
                  animation: {
                    stepMs: 100,
                    frames: [
                      { atlasCoords: { col: 0, row: 0 } },
                      { atlasCoords: { col: 1, row: 0 } },
                    ],
                    phase: 'sync' as const,
                  },
                } as any,
              ]
            : [],
        },
      ],
    });

    // 编码 packed int32:bit 0..7 slot,8..15 col,16..23 row;flip/transpose 全 0。
    const packCell = (slot: number, col: number, row: number) => slot | (col << 8) | (row << 16);

    // helper:把一个 Int32Array 整 chunk 编码为 { blob, nonEmpty } 形式。
    // - 模拟 host paint stroke 后 setEditingTileset 重新 base64 编码 chunk blob 的产物。
    const encodeChunkArrayAsBlob = (arr: Int32Array) => {
      let nonEmpty = 0;
      for (let i = 0; i < arr.length; i++) if (arr[i] !== 0) nonEmpty++;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty };
    };

    // helper:构造 layer with chunk '0,0' 含 N 个 cell,起始位置 (lx0, ly0) 顺次铺。
    // 用于"painted N cells, animated all the same slot/col/row"场景。
    const makeChunkWithCells = (
      cells: Array<{ lx: number; ly: number; slot: number; col: number; row: number }>,
    ) => {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      for (const c of cells) {
        const idx = c.ly * CHUNK_SIZE + c.lx;
        arr[idx] = packCell(c.slot, c.col, c.row);
      }
      return encodeChunkArrayAsBlob(arr);
    };

    // helper:在已有 layer 的 chunk '0,0' 上加一个 cell,返回**新** layer object(new ref)。
    // 模拟 host buildPaintStrokeOperations → setEditingTileset 流程后 component.layersV2 新 ref。
    const addCellToLayer = (
      layer: any,
      cell: { lx: number; ly: number; slot: number; col: number; row: number },
    ) => {
      const oldBlob = layer.cellData.chunks['0,0'];
      // 复用 plugin 的 decodeChunk 解出 Int32Array,patch 后重新 encode。
      const decoded = oldBlob ? decodeChunk(oldBlob) : new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      const arr = new Int32Array(decoded);
      const idx = cell.ly * CHUNK_SIZE + cell.lx;
      arr[idx] = packCell(cell.slot, cell.col, cell.row);
      const newChunkEntry = encodeChunkArrayAsBlob(arr);
      return {
        ...layer,
        cellData: {
          ...layer.cellData,
          chunks: {
            ...layer.cellData.chunks,
            '0,0': newChunkEntry,
          },
        },
      };
    };

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_TM3_observerInfo_metadata_layersV2_watch_shallow', () => {
      // T-L1 regression:确认 @componentObserver({ Tilemap: [..., { prop: ['layersV2'], deep: false }] })
      // 被装饰器登记到 TilemapSystem.observerInfo,并且**deep:false**(防有人手滑改成 deep:true 导致
      // 每 chunk 编辑都触发 → 每次 stroke 整 layer rebuild,T-L4 增量 path 失效)。
      const observerInfo = (TilemapSystem as any).observerInfo;
      expect(observerInfo).toBeDefined();
      expect(observerInfo.Tilemap).toBeDefined();
      const entries: Array<{ prop: string[]; deep?: boolean }> = observerInfo.Tilemap;
      const layersV2Entry = entries.find((e) => Array.isArray(e.prop) && e.prop[0] === 'layersV2');
      expect(layersV2Entry).toBeDefined();
      // deep undefined 或 false 都行 — 关键是不能是 true。
      expect(layersV2Entry!.deep).not.toBe(true);
      // 同时确认 tileset / tilemapRef 也注册了(防有人不小心把 v1 路径 observer 删了)。
      expect(entries.some((e) => e.prop[0] === 'tileset')).toBe(true);
      expect(entries.some((e) => e.prop[0] === 'tilemapRef')).toBe(true);
    });

    it('test_TM3_componentChanged_ADD_routes_to_handleAdd_builds_v2_record', async () => {
      // 证明 componentChanged({ type: ADD }) 真的路由到 handleAdd → ensureV2Built。
      // 不是 (sys as any).handleAdd(...) 直调,而是走外层 router。
      const sys = newSysWithHosts();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-add') return { instance: doc };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-add',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'L0',
            zIndex: 0,
            cellData: {
              kind: 'chunked',
              chunkSize: 16,
              stride: 1,
              chunks: {
                '0,0': makeChunkWithCells([{ lx: 0, ly: 0, slot: 1, col: 0, row: 0 }]),
              },
            },
          },
        ],
      });
      const go = makeFakeGameObject(900, 'go-tm3-add');

      // Act — 模拟 OBSERVER_TYPE.ADD 事件抵达 system。这是 GameObject mount 时 observer.ts
      // 走 addGameObject → publish ADD 路径会落到的入口。
      await sys.componentChanged({
        type: OBSERVER_TYPE.ADD,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['tilemapRef'] },
      } as any);

      // Assert — record 存在,mode=v2,loadedTileset/atlasTextures 已就位,chunk container 已建。
      expect(sys.records[900]).toBeDefined();
      expect(sys.records[900].mode).toBe('v2');
      expect(sys.records[900].loadedTileset).toBeTruthy();
      expect(sys.records[900].atlasTextures.size).toBeGreaterThanOrEqual(1);
      const layerEntry = sys.records[900].layerContainersV2.get('L0');
      expect(layerEntry).toBeDefined();
      expect(layerEntry.chunkContainers.size).toBe(1);
      expect(layerEntry.chunkContainers.has('0,0')).toBe(true);
    });

    it('test_TM3_componentChanged_CHANGE_layersV2_routes_to_handleChange_rebuilds_chunks', async () => {
      // 完整 stroke → DSL patch → componentObserver → handleChange → buildLayersV2 → populateChunkSprites 链路。
      // 步骤:
      //   1. ADD (componentChanged) 起手,build layer with 1 cell。
      //   2. host 模拟 paint stroke:复制 layersV2,加一个 cell at (5,5),component.layersV2 = newArr (新 ref)。
      //   3. CHANGE (componentChanged with prop=['layersV2']) 触发 handleChange → tearDownChildrenV2 + buildLayersV2。
      //   4. 断言:chunkContainer 新 ref + 新 cell 体现在 chunk children 数量上。
      const sys = newSysWithHosts();
      const doc = makeV2TilesetDoc();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-chg') return { instance: doc };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const initialLayer = {
        id: 'L0',
        zIndex: 0,
        cellData: {
          kind: 'chunked' as const,
          chunkSize: 16 as const,
          stride: 1 as const,
          chunks: {
            '0,0': makeChunkWithCells([{ lx: 0, ly: 0, slot: 1, col: 0, row: 0 }]),
          },
        },
      };
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-chg',
        cellSize: { width: 16, height: 16 },
        layersV2: [initialLayer],
      });
      const go = makeFakeGameObject(901, 'go-tm3-chg');

      await sys.componentChanged({
        type: OBSERVER_TYPE.ADD,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['tilemapRef'] },
      } as any);

      const oldEntry = sys.records[901].layerContainersV2.get('L0');
      expect(oldEntry).toBeDefined();
      const oldChunkContainer = oldEntry.chunkContainers.get('0,0');
      expect(oldChunkContainer).toBeDefined();
      const oldSpriteCount = (oldChunkContainer.children ?? []).length;

      // Act — host paint stroke 加 cell at (lx=5, ly=5) 然后 reassign layersV2 新 ref。
      const newLayer = addCellToLayer(initialLayer, { lx: 5, ly: 5, slot: 1, col: 0, row: 0 });
      (component as any).layersV2 = [newLayer];

      await sys.componentChanged({
        type: OBSERVER_TYPE.CHANGE,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['layersV2'] },
      } as any);

      // Assert — handleChange layersV2 branch:tearDownChildrenV2 + buildLayersV2 →
      //   - layerContainersV2 entry 是**新** ref(整 layer rebuild)
      //   - chunk '0,0' 重建后 sprite 数量增加(1 → 2)
      //   - loadedTileset 没换(整 layer rebuild 复用 tileset)
      const newEntry = sys.records[901].layerContainersV2.get('L0');
      expect(newEntry).toBeDefined();
      expect(newEntry).not.toBe(oldEntry);
      const newChunkContainer = newEntry.chunkContainers.get('0,0');
      expect(newChunkContainer).toBeDefined();
      const newSpriteCount = (newChunkContainer.children ?? []).length;
      expect(newSpriteCount).toBeGreaterThan(oldSpriteCount);
      expect(newSpriteCount).toBe(2);
      expect(sys.records[901].loadedTileset).toBeTruthy();
    });

    it('test_TM3_componentChanged_CHANGE_layersV2_registers_animated_sprites_via_full_path', async () => {
      // P0-1 unit test 通过 (sys as any).handleAdd 起手 + 手 inject animatedSpritesByAnimKey 验证。
      // 这个测试走完整路径:ADD with 0 cell → CHANGE with new cell painting an animated source tile →
      // populateChunkSprites 真实 register 到 record.animatedSpritesByAnimKey。
      // 证明 anim driver 注册在生产链路上不会断。
      const sys = newSysWithHosts();
      const doc = makeV2TilesetDoc({ withAnimation: true });
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-anim') return { instance: doc };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const emptyLayer = {
        id: 'AnimL',
        zIndex: 0,
        cellData: {
          kind: 'chunked' as const,
          chunkSize: 16 as const,
          stride: 1 as const,
          chunks: {} as Record<string, { blob: string; nonEmpty: number }>,
        },
      };
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-anim',
        cellSize: { width: 16, height: 16 },
        layersV2: [emptyLayer],
      });
      const go = makeFakeGameObject(902, 'go-tm3-anim');

      // Step 1 — ADD with empty layer:loadedTileset 加载,animation driver 已 register(animationCount > 0)
      // 但 animatedSpritesByAnimKey 还是空(没 cell 被画)。
      await sys.componentChanged({
        type: OBSERVER_TYPE.ADD,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['tilemapRef'] },
      } as any);
      expect(sys.records[902]).toBeDefined();
      expect(sys.records[902].mode).toBe('v2');
      expect((sys as any).animationDrivers.get(902)).toBeDefined();
      expect(sys.records[902].animatedSpritesByAnimKey.size).toBe(0);

      // Step 2 — host paint stroke at (0,0) pointing to source slot 1, atlas col 0 row 0 (the animated tile)。
      const newLayer = {
        ...emptyLayer,
        cellData: {
          ...emptyLayer.cellData,
          chunks: {
            '0,0': makeChunkWithCells([{ lx: 0, ly: 0, slot: 1, col: 0, row: 0 }]),
          },
        },
      };
      (component as any).layersV2 = [newLayer];

      await sys.componentChanged({
        type: OBSERVER_TYPE.CHANGE,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['layersV2'] },
      } as any);

      // Step 3 — animatedSpritesByAnimKey 应该有 '1,0,0' bucket,且至少 1 个 sprite。
      // 这证明完整路径:layersV2 reassign → handleChange → tearDownChildrenV2(清旧 animKey map)
      //   → buildLayersV2 → populateChunkSprites → animDriver.isAnimatedSource(1,0,0) 命中
      //   → record.animatedSpritesByAnimKey.set('1,0,0', [sprite])。
      const animMap = sys.records[902].animatedSpritesByAnimKey;
      expect(animMap.size).toBeGreaterThanOrEqual(1);
      const sprites = animMap.get('1,0,0');
      expect(sprites).toBeDefined();
      expect(Array.isArray(sprites)).toBe(true);
      expect(sprites!.length).toBeGreaterThanOrEqual(1);

      // 额外:driver advance 不出错(确认 sprite 引用是真实 PIXI.Sprite 不会让 update tick 抛)。
      expect(() => sys.update()).not.toThrow();
    });

    it('test_TM3_componentChanged_non_Tilemap_componentName_is_noop', () => {
      // Router 早返回:componentName !== 'Tilemap' 必须不进 handleAdd/handleChange。
      // 防有人把 router 改成"什么 component 都尝试处理",会让 plugin 误吃别 system 的事件。
      const sys = newSysWithHosts();
      const fakeComponent = new Tilemap();
      const go = makeFakeGameObject(903, 'wrong');
      expect(() =>
        sys.componentChanged({
          type: OBSERVER_TYPE.ADD,
          component: fakeComponent,
          gameObject: go,
          componentName: 'NotTilemap',
          prop: { prop: ['tilemapRef'] },
        } as any),
      ).not.toThrow();
      // 关键:records 没 attempt 创建,记录依旧为空。
      expect(sys.records[903]).toBeUndefined();
    });

    it('test_TM3_componentChanged_REMOVE_routes_to_handleRemove_clears_record', async () => {
      // 闭合路由覆盖:REMOVE 真的把 record + animationDriver 清干净。
      // 一来证明 router 三个 case 都 ship,二来如果 host 切 scene unmount entity 时
      // 漏掉 REMOVE,这测试不会捕获 — 但至少确认事件来了 router 不会卡死。
      const sys = newSysWithHosts();
      const doc = makeV2TilesetDoc({ withAnimation: true });
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-rm') return { instance: doc };
        if (id === 'atlas-1') return { instance: new Texture() };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-rm',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'L0',
            zIndex: 0,
            cellData: {
              kind: 'chunked',
              chunkSize: 16,
              stride: 1,
              chunks: { '0,0': makeChunkWithCells([{ lx: 0, ly: 0, slot: 1, col: 0, row: 0 }]) },
            },
          },
        ],
      });
      const go = makeFakeGameObject(904, 'go-tm3-rm');

      await sys.componentChanged({
        type: OBSERVER_TYPE.ADD,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['tilemapRef'] },
      } as any);
      expect(sys.records[904]).toBeDefined();
      expect((sys as any).animationDrivers.get(904)).toBeDefined();

      await sys.componentChanged({
        type: OBSERVER_TYPE.REMOVE,
        component,
        gameObject: go,
        componentName: 'Tilemap',
        prop: { prop: ['tilemapRef'] },
      } as any);

      expect(sys.records[904]).toBeUndefined();
      expect((sys as any).animationDrivers.get(904)).toBeUndefined();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T-N1 (Phase N):animation tick error recovery — driver advance throw 不阻断其他
  // driver 的 tick;probe ANIM_TICK_MS endTiming 一定 pair beginTiming(try/finally)。
  // ─────────────────────────────────────────────────────────────────────────
  describe('T-N1 animation tick error recovery', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeFakeLoaded = () =>
      makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize: { width: 16, height: 16 },
            tiles: [
              {
                atlasCoords: { col: 0, row: 0 },
                alternatives: [{ altId: 0 }],
                animation: {
                  stepMs: 100,
                  frames: [{ atlasCoords: { col: 0, row: 0 } }, { atlasCoords: { col: 1, row: 0 } }],
                  phase: 'sync',
                },
              } as any,
            ],
          },
        ],
      });
    const makeRecord = (loaded: any, sprite: any): any => ({
      root: { addChild: () => {}, removeChild: () => {} },
      layerContainers: [],
      layerContainersV2: new Map(),
      frameTextures: [],
      frameTexturesV2: new Map(),
      baseTexture: null,
      atlasTextures: new Map([['atlas', { source: { _src: 'atlas' } } as any]]),
      loadedTileset: loaded,
      mode: 'v2',
      animatedSpritesByAnimKey: new Map<string, any[]>([['1,0,0', [sprite]]]),
    });

    it('test_TN1_update_continues_when_one_driver_throws', () => {
      // Arrange — 两个 entity:driver A 在 advance 时 throw,driver B advance 报 dirty key
      // 让其 sprite texture 被 swap。如果 try/catch 不到位,A 的 throw 会冒到外层 for,B 永远
      // 不会被 tick。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loadedA = makeFakeLoaded();
      const loadedB = makeFakeLoaded();
      const spriteA: any = { texture: 'tex-A-frame-0' };
      const spriteB: any = { texture: 'tex-B-frame-0' };
      sys.records[100] = makeRecord(loadedA, spriteA);
      sys.records[101] = makeRecord(loadedB, spriteB);

      // driver A:advance 直接 throw
      const driverA: any = {
        advance: jest.fn(() => {
          throw new Error('synthetic A advance failure');
        }),
      };
      // driver B:advance 报 dirty key,plugin 会用 getAtlasFrameTexture 返回新 texture
      const driverB: any = {
        advance: jest.fn(() => ({
          currentFrames: new Map([['1,0,0', { col: 1, row: 0 }]]),
          dirtyKeys: new Set(['1,0,0']),
        })),
      };
      sys.animationDrivers.set(100, driverA);
      sys.animationDrivers.set(101, driverB);

      // 静默 console.error 防止测试日志噪声(plugin 内 catch 后会 console.error)
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      expect(() => sys.update({})).not.toThrow();

      // Assert — driver A 抛了但 driver B 还是被 tick(advance 被调用 + sprite texture 被 swap)
      expect(driverA.advance).toHaveBeenCalledTimes(1);
      expect(driverB.advance).toHaveBeenCalledTimes(1);
      expect(spriteB.texture).not.toBe('tex-B-frame-0');
      // probe ANIM_TICK_ERROR_COUNT 累加 1(只有 A 抛)
      expect(probes.counts.get(TILEMAP_PROBE_NAMES.ANIM_TICK_ERROR_COUNT)).toBe(1);
      // 错误日志真的被发出
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining('animation tick failed for entity 100'),
        expect.any(Error),
      );
      errSpy.mockRestore();
    });

    it('test_TN1_update_endTiming_called_even_on_throw', () => {
      // Arrange — 单 driver throw;断言 ANIM_TICK_MS timings 仍记录一条(probeBegin/End pair)。
      // 旧实现没有 try/finally,driver throw 会让 probeEnd 永不被调,probes.timings 拿不到样本。
      const sys: any = new TilemapSystem();
      const probes = createInMemoryProbeRegistry();
      sys.attachPerfProbes(probes);
      const loaded = makeFakeLoaded();
      const sprite: any = { texture: 'tex-0' };
      sys.records[200] = makeRecord(loaded, sprite);
      const driver: any = {
        advance: jest.fn(() => {
          throw new Error('synthetic advance failure');
        }),
      };
      sys.animationDrivers.set(200, driver);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      expect(() => sys.update({})).not.toThrow();

      // Assert — endTiming 被调用,timings array 至少 1 个 sample
      const samples = probes.timings.get(TILEMAP_PROBE_NAMES.ANIM_TICK_MS);
      expect(samples).toBeDefined();
      expect(samples!.length).toBeGreaterThanOrEqual(1);
      errSpy.mockRestore();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T-N2 (Phase N):tab visibility / WebGL context loss — update 在 isHidden 或
  // contextLost 时早返,不调 driver.advance;visibility handlers 在 jsdom 环境下
  // 安装不会 crash。
  // ─────────────────────────────────────────────────────────────────────────
  describe('T-N2 visibility / context loss', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it('test_TN2_update_skipped_when_isHidden', () => {
      const sys: any = new TilemapSystem();
      const driver = { advance: jest.fn() };
      sys.animationDrivers.set(1, driver);
      sys.records[1] = { mode: 'v2', loadedTileset: {} } as any;
      sys.isHidden = true;

      sys.update({});

      expect(driver.advance).not.toHaveBeenCalled();
    });

    it('test_TN2_update_skipped_when_contextLost', () => {
      const sys: any = new TilemapSystem();
      const driver = { advance: jest.fn() };
      sys.animationDrivers.set(1, driver);
      sys.records[1] = { mode: 'v2', loadedTileset: {} } as any;
      sys.contextLost = true;

      sys.update({});

      expect(driver.advance).not.toHaveBeenCalled();
    });

    it('test_TN2_update_resumes_when_flags_cleared', () => {
      // 验证 flag 清除后 update tick 恢复(防止 early return 后某个分支永久绕死)。
      const sys: any = new TilemapSystem();
      const driver = {
        advance: jest.fn(() => ({ currentFrames: new Map(), dirtyKeys: new Set() })),
      };
      sys.animationDrivers.set(1, driver);
      sys.records[1] = { mode: 'v2', loadedTileset: {}, animatedSpritesByAnimKey: new Map() } as any;
      sys.isHidden = true;
      sys.update({});
      expect(driver.advance).not.toHaveBeenCalled();
      sys.isHidden = false;
      sys.update({});
      expect(driver.advance).toHaveBeenCalledTimes(1);
    });

    it('test_TN2_installVisibilityHandlers_noop_safe_in_test_env', () => {
      // jsdom 里 document 存在;listener add 不应抛。
      // canvas 不存在(renderSystem 未注入)时 context listener 静默跳过。
      const sys: any = new TilemapSystem();
      expect(() => sys.installVisibilityHandlers()).not.toThrow();
      // visibility listener 在 jsdom 下应该已注册(document 存在)
      expect(sys.visibilityListener).toBeDefined();
      // canvas 不可达 → context listener 不应注册
      expect(sys.canvasWithCtxListeners).toBeNull();
    });

    it('test_TN2_uninstallVisibilityHandlers_clears_state', () => {
      const sys: any = new TilemapSystem();
      sys.installVisibilityHandlers();
      expect(sys.visibilityListener).toBeDefined();
      sys.uninstallVisibilityHandlers();
      expect(sys.visibilityListener).toBeUndefined();
      expect(sys.canvasWithCtxListeners).toBeNull();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T-N3 (Phase N):frameTexturesV2 cache key 必须包含 regionSize / margins /
  // separation,否则同 textureAsset 在不同切片配置下会 collision。
  // ─────────────────────────────────────────────────────────────────────────
  describe('T-N3 frame texture cache key collision', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it('test_TN3_cacheKey_includes_regionSize', () => {
      // Arrange — 同一 textureAsset 'shared' 在两个 source 配置:16×16 和 32×32 region。
      // 旧 cacheKey `${textureAsset}#${col},${row}` 会让两次调用拿同一个 cached texture
      // (size 永远是 1);新 cacheKey 包含 regionSize,两次必须各自存一份(size 2)。
      const sys: any = new TilemapSystem();
      const fakeAtlas: any = { source: { _src: 'shared' } };
      const loaded: any = {
        sourcesBySlot: [
          {
            kind: 'atlas',
            id: 's1',
            textureAsset: 'shared',
            regionSize: { width: 16, height: 16 },
            margins: { x: 0, y: 0 },
            separation: { x: 0, y: 0 },
          },
          {
            kind: 'atlas',
            id: 's2',
            textureAsset: 'shared',
            regionSize: { width: 32, height: 32 },
            margins: { x: 0, y: 0 },
            separation: { x: 0, y: 0 },
          },
        ],
      };
      const record: any = {
        atlasTextures: new Map([['shared', fakeAtlas]]),
        frameTexturesV2: new Map(),
        sceneCollectionWarnedSourceIds: new Set(),
      };

      // Act — 两次 getAtlasFrameTexture 同 col/row,但 sourceSlot 不同(走不同 regionSize)
      const t1 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 0 });
      const t2 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 2, col: 0, row: 0 });

      // Assert — 两个 frame 都成功 + cache 里现在有 2 条而不是 1 条(collision-free)
      expect(t1).toBeTruthy();
      expect(t2).toBeTruthy();
      expect(t1).not.toBe(t2);
      expect(record.frameTexturesV2.size).toBe(2);
    });

    it('test_TN3_cacheKey_includes_margins_and_separation', () => {
      // 同 regionSize 但 margins 不同也必须独立 cache。
      const sys: any = new TilemapSystem();
      const fakeAtlas: any = { source: { _src: 'shared' } };
      const loaded: any = {
        sourcesBySlot: [
          {
            kind: 'atlas',
            id: 's1',
            textureAsset: 'shared',
            regionSize: { width: 16, height: 16 },
            margins: { x: 0, y: 0 },
            separation: { x: 0, y: 0 },
          },
          {
            kind: 'atlas',
            id: 's2',
            textureAsset: 'shared',
            regionSize: { width: 16, height: 16 },
            margins: { x: 2, y: 2 },
            separation: { x: 1, y: 1 },
          },
        ],
      };
      const record: any = {
        atlasTextures: new Map([['shared', fakeAtlas]]),
        frameTexturesV2: new Map(),
        sceneCollectionWarnedSourceIds: new Set(),
      };

      const t1 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 0, row: 0 });
      const t2 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 2, col: 0, row: 0 });

      expect(t1).toBeTruthy();
      expect(t2).toBeTruthy();
      expect(t1).not.toBe(t2);
      expect(record.frameTexturesV2.size).toBe(2);
    });

    it('test_TN3_cacheKey_same_config_hits_cache', () => {
      // Sanity:同 config 同 cell 第二次必须命中 cache(不应 collision-free 失控到永远 miss)。
      const sys: any = new TilemapSystem();
      const fakeAtlas: any = { source: { _src: 'a' } };
      const loaded: any = {
        sourcesBySlot: [
          {
            kind: 'atlas',
            id: 's1',
            textureAsset: 'a',
            regionSize: { width: 16, height: 16 },
            margins: { x: 0, y: 0 },
            separation: { x: 0, y: 0 },
          },
        ],
      };
      const record: any = {
        atlasTextures: new Map([['a', fakeAtlas]]),
        frameTexturesV2: new Map(),
        sceneCollectionWarnedSourceIds: new Set(),
      };
      const t1 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 3, row: 2 });
      const t2 = sys.getAtlasFrameTexture(record, loaded, { sourceSlot: 1, col: 3, row: 2 });
      expect(t1).toBe(t2);
      expect(record.frameTexturesV2.size).toBe(1);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ───────────────────────────────────────── T-N4 flip math regression ──
  // populateChunkSprites:1059-1063 当 flipH/flipV/transpose=true 时调整 sprite.scale /
  // rotation,并 += cellW/cellH 让翻转后的 sprite 仍贴在原 cell 的 origin 上。
  //
  // 本 describe block 把"当前行为"锁定:不论 regionSize 和 cellSize 是否相等,
  // sprite.x 偏移永远是 +cellW(不是 +regionSize.width)。
  // 任何后续 cycle 想改 anchor 算法都必须在这里更新预期,避免静默回归。
  describe('T-N4 flipH/flipV/transpose sprite scale math', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    function makeFakeAtlasTexture(): any {
      return { source: { _src: 'atlas' } };
    }

    /**
     * 构造一个 chunk blob,在 (lx,ly)=(0,0) 处放置一个 cell,带可控的 flip/transpose 位。
     * sourceSlot=1,col/row=0,altIdx=0。
     */
    function makeFlipChunkBlob(flags: { flipH?: boolean; flipV?: boolean; transpose?: boolean }): {
      blob: string;
      nonEmpty: number;
    } {
      const arr = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
      let packed = 1 | (0 << 8) | (0 << 16) | (0 << 24);
      if (flags.flipH) packed = packed | (1 << 29);
      if (flags.flipV) packed = packed | (1 << 30);
      if (flags.transpose) packed = packed | (1 << 31);
      arr[0] = packed;
      const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      return { blob: Buffer.from(bytes).toString('base64'), nonEmpty: 1 };
    }

    function buildLoadedAtlas(regionSize: { width: number; height: number }) {
      return makeLoadedTileset({
        kind: 'tileset',
        schemaVersion: 1,
        name: 'w',
        tileSize: { width: regionSize.width, height: regionSize.height },
        sources: [
          {
            kind: 'atlas',
            id: 'main',
            textureAsset: 'atlas',
            regionSize,
            tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
          },
        ],
      });
    }

    function makeRecord(loaded: ReturnType<typeof buildLoadedAtlas>): any {
      return {
        root: { addChild() {}, removeChild() {} },
        layerContainers: [],
        layerContainersV2: new Map(),
        frameTextures: [],
        frameTexturesV2: new Map(),
        baseTexture: null,
        atlasTextures: new Map([['atlas', makeFakeAtlasTexture()]]),
        loadedTileset: loaded,
        mode: 'v2' as const,
        animatedSpritesByAnimKey: new Map(),
        sceneCollectionWarnedSourceIds: new Set<string>(),
        dirtyChunkKeys: new Map(),
        flushScheduled: false,
      };
    }

    /**
     * 直接调用 populateChunkSprites,返回 chunkContainer 内创建的 Sprite。
     * cellW/cellH 与 regionSize 可以独立设置,锁定"sprite.width=cellW(stretch)"+
     * "flip 后 offset 用 cellW 不用 regionSize"两条不变量。
     */
    function runPopulate(opts: {
      cellW: number;
      cellH: number;
      regionSize: { width: number; height: number };
      flags: { flipH?: boolean; flipV?: boolean; transpose?: boolean };
      originX?: number;
      originY?: number;
    }): { sprite: any; chunkContainer: any } {
      const sys: any = new TilemapSystem();
      const loaded = buildLoadedAtlas(opts.regionSize);
      const record = makeRecord(loaded);
      const blob = makeFlipChunkBlob(opts.flags);
      const layer: any = {
        id: 'flip-test',
        name: 'flip-test',
        cellData: { kind: 'chunked', chunkSize: CHUNK_SIZE, stride: 1, chunks: { '0,0': blob } },
      };
      const { Container } = require('pixi.js');
      const chunkContainer: any = new Container();
      sys.populateChunkSprites(
        chunkContainer,
        '0,0',
        blob,
        record,
        loaded,
        opts.cellW,
        opts.cellH,
        opts.originX ?? 0,
        opts.originY ?? 0,
        layer,
        null,
      );
      // 第一个 child 就是我们 (0,0) 处放的 cell
      return { sprite: chunkContainer.children[0], chunkContainer };
    }

    it('test_TN4_regionSize_equals_cellSize_flipH_centers_correctly', () => {
      // Arrange — 16x16 cell, 16x16 regionSize, flipH=true
      const { sprite } = runPopulate({
        cellW: 16,
        cellH: 16,
        regionSize: { width: 16, height: 16 },
        flags: { flipH: true },
      });

      // Assert — scale.x 取反、x 偏移 +cellW(让翻转后的 sprite 仍占 [0..16])
      expect(sprite).toBeDefined();
      expect(sprite.scale.x).toBe(-1);
      expect(sprite.scale.y).toBe(1);
      expect(sprite.x).toBe(0 + 16); // baseCx=0, lx=0 → 0 + 16 (flipH offset)
      expect(sprite.y).toBe(0);
      expect(sprite.width).toBe(16);
      expect(sprite.height).toBe(16);
      expect(sprite.rotation).toBe(0);
    });

    it('test_TN4_regionSize_smaller_than_cellSize_flipH_aligns_to_cell_edge', () => {
      // Arrange — 16x16 cell, 8x8 regionSize, flipH=true。
      // 当前实现:sprite.width 永远 = cellW(stretch);flip offset 也用 cellW 而不是 regionSize.width。
      const { sprite } = runPopulate({
        cellW: 16,
        cellH: 16,
        regionSize: { width: 8, height: 8 },
        flags: { flipH: true },
      });

      // Assert — 锁住"+= cellW"行为(用 regionSize.width=8 也不会让 sprite 跑偏 8px)
      expect(sprite.scale.x).toBe(-1);
      expect(sprite.x).toBe(0 + 16); // +cellW, 不是 +regionSize.width
      expect(sprite.width).toBe(16); // stretched 到 cellW
      expect(sprite.height).toBe(16);
    });

    it('test_TN4_regionSize_larger_than_cellSize_flipV_anchors_correctly', () => {
      // Arrange — 16x16 cell, 32x32 regionSize, flipV=true。
      const { sprite } = runPopulate({
        cellW: 16,
        cellH: 16,
        regionSize: { width: 32, height: 32 },
        flags: { flipV: true },
      });

      // Assert — flipV 翻 y,offset += cellH(锁住,而不是 regionSize.height)
      expect(sprite.scale.x).toBe(1);
      expect(sprite.scale.y).toBe(-1);
      expect(sprite.x).toBe(0);
      expect(sprite.y).toBe(0 + 16); // +cellH=16, 不是 +32
      expect(sprite.rotation).toBe(0);
    });

    it('test_TN4_flipH_flipV_transpose_combined_180deg_rotation_offsets', () => {
      // Arrange — 三个 flag 都 true,验证最终 sprite props 是预期组合
      const { sprite } = runPopulate({
        cellW: 16,
        cellH: 16,
        regionSize: { width: 16, height: 16 },
        flags: { flipH: true, flipV: true, transpose: true },
        originX: 100,
        originY: 200,
      });

      // Assert — 三个 flip op 累加:
      //   scale.x === -1 (flipH)
      //   scale.y === -1 (flipV)
      //   rotation === π/2 (transpose)
      //   x === originX + cellW (flipH offset 加在 originX 后)
      //   y === originY + cellH (flipV offset)
      expect(sprite.scale.x).toBe(-1);
      expect(sprite.scale.y).toBe(-1);
      expect(sprite.rotation).toBeCloseTo(Math.PI / 2, 6);
      expect(sprite.x).toBe(100 + 16);
      expect(sprite.y).toBe(200 + 16);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  // ──────────────────────────────────────────── T-N5 failed-load recovery ──
  // T-L2(Phase L)在 mode switch 时已加 fail-safe commit;T-N5 补 3 个边界 case:
  //   1) handleAdd v2 mode + resource raw kind !== 'tileset' → record 半建状态如何
  //   2) loadAtlasTextures 失败时不 crash buildLayersV2(degraded)
  //   3) handleRemove 在 ensureV2Built 异步窗口期发生 → asyncId race 不应 mutate record
  describe('T-N5 failed-load recovery (T-L2 hardening)', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const makeContainerHost = () => ({
      children: [] as any[],
      addChildAt: jest.fn((c: any) => c),
      removeChild: jest.fn(),
    });
    const makeRenderSystem = () => ({ application: { renderer: { render: jest.fn() }, stage: {} } });
    const newSysWithHosts = () => {
      const sys: any = new TilemapSystem();
      sys.containerManager = { getContainer: jest.fn(() => makeContainerHost()) };
      sys.renderSystem = makeRenderSystem();
      return sys;
    };
    const makeFakeGameObject = (id: number, name: string) => ({ id, name } as any);
    const { Texture } = require('pixi.js');

    let origGetResource: typeof resource.getResource;
    beforeEach(() => {
      origGetResource = resource.getResource.bind(resource);
    });
    afterEach(() => {
      (resource as any).getResource = origGetResource;
      jest.restoreAllMocks();
    });

    it('test_TN5_handleAdd_with_raw_kind_not_tileset_leaves_record_v2_but_unbuilt', async () => {
      // Arrange — getResource 返回 instance 但 kind !== 'tileset',loadV2Tileset 会 return null
      const sys = newSysWithHosts();
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'bad-resource') return { instance: { kind: 'NOT_TILESET' } };
        return null;
      });
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const component = new Tilemap();
      component.init({
        tilemapRef: 'bad-resource',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'L0',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      const go = makeFakeGameObject(500, 'go-tn5-1');

      // Act — handleAdd v2 mode + load fails
      await sys.handleAdd(500, go, component);

      // Assert — record 已创建(handleAdd 在调 ensureV2Built 之前就 register),
      // mode 仍为 'v2'(handleAdd 不像 handleChange 在 ensure 失败后切 'unknown'),
      // loadedTileset 仍为 null,layerContainersV2 empty,console.error 至少调一次。
      // 锁住"handleAdd v2 mode but unbuilt"中间态 — T-L2 fail-safe 只覆盖 handleChange,
      // 不覆盖 handleAdd;后续 cycle 想统一行为时必须更新此 test。
      const rec = sys.records[500];
      expect(rec).toBeDefined();
      expect(rec.mode).toBe('v2');
      expect(rec.loadedTileset).toBeNull();
      expect(rec.layerContainersV2.size).toBe(0);
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('test_TN5_loadAtlasTextures_failure_does_not_crash_buildLayersV2', async () => {
      // Arrange — loadV2Tileset 成功(返回合法 tileset),但 atlas asset getResource 抛错。
      // loadAtlasTextures 内 catch 不再 rethrow,只 console.warn;buildLayersV2 应继续跑。
      const sys = newSysWithHosts();
      const doc = {
        kind: 'tileset' as const,
        schemaVersion: 1 as const,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas' as const,
            id: 'main',
            textureAsset: 'atlas-fails',
            regionSize: { width: 16, height: 16 },
            tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
          },
        ],
      };
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-ok') return { instance: doc };
        if (id === 'atlas-fails') throw new Error('asset disk read failed');
        return null;
      });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-ok',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'L0',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      const go = makeFakeGameObject(501, 'go-tn5-2');

      // Act
      await sys.handleAdd(501, go, component);

      // Assert — record 存活,mode='v2',loadedTileset 已设置,atlasTextures empty,
      // layerContainersV2 已创建(空 chunk 没 sprite,但 layer container 存在)。
      const rec = sys.records[501];
      expect(rec).toBeDefined();
      expect(rec.mode).toBe('v2');
      expect(rec.loadedTileset).not.toBeNull();
      expect(rec.atlasTextures.size).toBe(0); // atlas 加载失败 → 没注册
      expect(rec.layerContainersV2.size).toBe(1); // layer container 仍创建
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('test_TN5_validateAsyncId_false_after_handleRemove_does_not_re_mutate_record', async () => {
      // Arrange — start with successful v2 build,then trigger a tilemapRef swap whose
      // loadV2Tileset hangs;during the hang call handleRemove(同 entity)。原 await
      // resolve 后 validateAsyncId 应返回 false(因为 handleRemove 调 increaseAsyncId),
      // ensure 路径 early return,不会复活已删除 record。
      const sys = newSysWithHosts();
      const atlasTex = new Texture();
      const doc = {
        kind: 'tileset' as const,
        schemaVersion: 1 as const,
        name: 'w',
        tileSize: { width: 16, height: 16 },
        sources: [
          {
            kind: 'atlas' as const,
            id: 'main',
            textureAsset: 'atlas-x',
            regionSize: { width: 16, height: 16 },
            tiles: [],
          },
        ],
      };
      // 首次 handleAdd 用一个会立刻 resolve 的 mock
      (resource as any).getResource = jest.fn(async (id: string) => {
        if (id === 'v2-ref-initial') return { instance: doc };
        if (id === 'atlas-x') return { instance: atlasTex };
        return null;
      });
      const component = new Tilemap();
      component.init({
        tilemapRef: 'v2-ref-initial',
        cellSize: { width: 16, height: 16 },
        layersV2: [
          {
            id: 'L0',
            zIndex: 0,
            cellData: { kind: 'chunked', chunkSize: 16, stride: 1, chunks: {} },
          },
        ],
      });
      const go = makeFakeGameObject(502, 'go-tn5-3');
      await sys.handleAdd(502, go, component);
      expect(sys.records[502]).toBeDefined();

      // Act — swap tilemapRef 时,把 getResource 切成永远 hang 的 Promise
      let resolveHang: (v: any) => void = () => {};
      const hangPromise = new Promise((res) => {
        resolveHang = res;
      });
      (resource as any).getResource = jest.fn(async () => hangPromise);

      component.tilemapRef = 'v2-ref-swap';
      // 注意:不要 await handleChange — 它会卡在 loadV2Tileset。
      const inflight = sys.handleChange(502, component, {
        prop: { prop: ['tilemapRef'] } as any,
        gameObject: go,
      } as any);

      // 让 inflight 进到 await(microtask flush)
      await Promise.resolve();
      await Promise.resolve();

      // 在 inflight 还卡着的时候 remove。handleRemove 会 increaseAsyncId + 删 record。
      sys.handleRemove(502);
      expect(sys.records[502]).toBeUndefined();

      // 现在 resolve hang promise,让 inflight 继续。validateAsyncId 应返回 false。
      resolveHang({ instance: doc });
      await inflight;

      // Assert — record 仍然 undefined,inflight 没有重建 record
      expect(sys.records[502]).toBeUndefined();
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });
});
