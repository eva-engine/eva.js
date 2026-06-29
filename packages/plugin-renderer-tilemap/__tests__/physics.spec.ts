import { DecompositionCache } from '../lib/physics/decomposition-cache';
import { cacheKeyOfNum } from '../lib/physics/decomposition-cache-shim';
import {
  TILEMAP_BODY_SOURCE_REGISTRY,
  type BodyDefinition,
  type BodySourceContext,
} from '../lib/physics/body-source-registry';
import { buildTileMapStaticBodies } from '../lib/physics/tilemap-static-body';

// helper:1 packed int for a cell
function packCell(slot: number, col: number, row: number, altIdx = 0): number {
  return slot | (col << 8) | (row << 16) | (altIdx << 24);
}

describe('cacheKeyOfNum', () => {
  it('packs slot/col/row/altIdx into a unique number', () => {
    const k1 = cacheKeyOfNum(1, 0, 0, 0);
    const k2 = cacheKeyOfNum(1, 0, 0, 1);
    const k3 = cacheKeyOfNum(2, 0, 0, 0);
    expect(k1).not.toBe(k2);
    expect(k1).not.toBe(k3);
  });
});

describe('TILEMAP_BODY_SOURCE_REGISTRY', () => {
  beforeEach(() => {
    TILEMAP_BODY_SOURCE_REGISTRY.clear();
  });

  it('register/has/unregister round-trip', () => {
    const builder = () => [];
    expect(TILEMAP_BODY_SOURCE_REGISTRY.has('Solid')).toBe(false);
    TILEMAP_BODY_SOURCE_REGISTRY.register('Solid', builder);
    expect(TILEMAP_BODY_SOURCE_REGISTRY.has('Solid')).toBe(true);
    expect(TILEMAP_BODY_SOURCE_REGISTRY.listRegisteredNames()).toContain('Solid');
    TILEMAP_BODY_SOURCE_REGISTRY.unregister('Solid');
    expect(TILEMAP_BODY_SOURCE_REGISTRY.has('Solid')).toBe(false);
  });

  it('build forwards ctx to builder and returns BodyDefinition[]', () => {
    const fakeBody: BodyDefinition = {
      id: 'b1',
      vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
      centerX: 5,
      centerY: 5,
      isStatic: true,
    };
    TILEMAP_BODY_SOURCE_REGISTRY.register('Solid', (ctx: BodySourceContext) => {
      expect(ctx.worldX).toBe(100);
      return [fakeBody];
    });
    const out = TILEMAP_BODY_SOURCE_REGISTRY.build('Solid', { worldX: 100, worldY: 200 });
    expect(out).toEqual([fakeBody]);
  });

  it('build returns null when name missing', () => {
    expect(TILEMAP_BODY_SOURCE_REGISTRY.build('Nope', { worldX: 0, worldY: 0 })).toBeNull();
  });
});

describe('buildTileMapStaticBodies', () => {
  it('emits one BodyDefinition per polygon per painted cell with physics', () => {
    const arr = new Int32Array(256);
    arr[0] = packCell(1, 0, 0); // cell (0,0) → slot=1 col=0 row=0
    arr[3] = packCell(1, 1, 0); // cell (3,0) → slot=1 col=1 row=0
    const cache = new DecompositionCache();
    const physicsByCellKey = new Map([
      [
        '1,0,0,0',
        [{ layerId: 'solid', polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }] }] }],
      ],
      [
        '1,1,0,0',
        [{ layerId: 'solid', polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }] }] }],
      ],
    ]);

    const bodies = buildTileMapStaticBodies(
      {
        chunksByKey: { '0,0': arr },
        physicsByCellKey,
        cellWidth: 16,
        cellHeight: 16,
        mapOriginX: 0,
        mapOriginY: 0,
        cache,
      },
      { worldX: 0, worldY: 0 }
    );
    expect(bodies).toHaveLength(2);
    expect(bodies[0]!.isStatic).toBe(true);
    expect(bodies[0]!.vertices).toHaveLength(3);
    // 第二个 cell 在 col=3,所以 centerX = 3*16 + 8 = 56
    expect(bodies[1]!.centerX).toBe(56);
  });

  it('skips cells without physics entries', () => {
    const arr = new Int32Array(256);
    arr[0] = packCell(1, 0, 0);
    const bodies = buildTileMapStaticBodies(
      {
        chunksByKey: { '0,0': arr },
        physicsByCellKey: new Map(),
        cellWidth: 16,
        cellHeight: 16,
        mapOriginX: 0,
        mapOriginY: 0,
        cache: new DecompositionCache(),
      },
      { worldX: 0, worldY: 0 }
    );
    expect(bodies).toEqual([]);
  });

  it('respects mapOrigin + worldX/Y in centerX/centerY', () => {
    const arr = new Int32Array(256);
    arr[0] = packCell(1, 0, 0);
    const bodies = buildTileMapStaticBodies(
      {
        chunksByKey: { '0,0': arr },
        physicsByCellKey: new Map([
          ['1,0,0,0', [{ layerId: 'solid', polygons: [{ points: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 16, y: 16 }] }] }]],
        ]),
        cellWidth: 16,
        cellHeight: 16,
        mapOriginX: 100,
        mapOriginY: 200,
        cache: new DecompositionCache(),
      },
      { worldX: 1000, worldY: 2000 }
    );
    expect(bodies[0]!.centerX).toBe(1108); // 0 + 0*16 + 1000 + 100 + 8
    expect(bodies[0]!.centerY).toBe(2208); // 0 + 0*16 + 2000 + 200 + 8
  });
});
