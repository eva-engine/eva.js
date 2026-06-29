import {
  DecompositionCache,
  cacheKeyOf,
  decomposePolygon,
  isConvex,
  translateConvexParts,
} from '../lib/physics/decomposition-cache';

describe('cacheKeyOf', () => {
  it('produces stable string key', () => {
    expect(cacheKeyOf({ sourceSlot: 1, col: 2, row: 3, altIdx: 0, layerId: 'solid' })).toBe('1,2,3,0,solid');
  });
});

describe('DecompositionCache', () => {
  it('set/get round-trips', () => {
    const c = new DecompositionCache();
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'solid' }, {
      parts: [{ vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }] }],
    });
    const got = c.get({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'solid' });
    expect(got).toBeDefined();
    expect(got!.parts).toHaveLength(1);
  });

  it('has() reflects presence', () => {
    const c = new DecompositionCache();
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'solid' })).toBe(false);
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'solid' }, { parts: [] });
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'solid' })).toBe(true);
  });

  it('LRU evicts oldest entry beyond maxEntries', () => {
    const c = new DecompositionCache(2);
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' }, { parts: [] });
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'b' }, { parts: [] });
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'c' }, { parts: [] });
    expect(c.size).toBe(2);
    // 'a' should have been evicted (was set first, never accessed since)
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' })).toBe(false);
  });

  it('get updates access order — recently-used survives eviction', () => {
    const c = new DecompositionCache(2);
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' }, { parts: [] });
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'b' }, { parts: [] });
    c.get({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' }); // bump 'a'
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'c' }, { parts: [] });
    // 'b' should be the oldest now
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' })).toBe(true);
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'b' })).toBe(false);
    expect(c.has({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'c' })).toBe(true);
  });

  it('clear empties everything', () => {
    const c = new DecompositionCache();
    c.set({ sourceSlot: 1, col: 0, row: 0, altIdx: 0, layerId: 'a' }, { parts: [] });
    c.clear();
    expect(c.size).toBe(0);
  });
});

describe('decomposePolygon (placeholder)', () => {
  let errSpy: jest.SpyInstance;
  beforeEach(() => {
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it('returns empty for degenerate polygons', () => {
    expect(decomposePolygon([])).toEqual([]);
    expect(decomposePolygon([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toEqual([]);
  });

  it('test_decomposePolygon_convex_input_returns_one_part', () => {
    const parts = decomposePolygon([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.vertices).toHaveLength(3);
  });

  it('test_decomposePolygon_square_convex_returns_one_part', () => {
    const parts = decomposePolygon([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.vertices).toHaveLength(4);
  });

  it('test_decomposePolygon_non_convex_throws', () => {
    // L-shape: ccw winding, has a reflex vertex at (5,5)
    const lShape = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(() => decomposePolygon(lShape)).toThrow(/non-convex/);
    expect(errSpy).toHaveBeenCalled();
  });

  it('test_decomposePolygon_collinear_points_treated_as_convex', () => {
    // Triangle with an extra collinear vertex on one edge — degenerate but not concave.
    const parts = decomposePolygon([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.vertices).toHaveLength(4);
  });

  it('test_decomposePolygon_concave_pentagon_throws', () => {
    // Arrow-like concave: indent on the top side.
    const arrow = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 5, y: 5 },
      { x: 0, y: 10 },
    ];
    expect(() => decomposePolygon(arrow)).toThrow(/non-convex/);
  });
});

describe('isConvex', () => {
  it('test_isConvex_exported_for_pre_check', () => {
    const triangle = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }];
    const lShape = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(isConvex(triangle)).toBe(true);
    expect(isConvex(lShape)).toBe(false);
  });

  it('returns true for degenerate (< 3 vertices)', () => {
    expect(isConvex([])).toBe(true);
    expect(isConvex([{ x: 0, y: 0 }])).toBe(true);
    expect(isConvex([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(true);
  });

  it('returns true for convex square (cw and ccw)', () => {
    const ccw = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const cw = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(isConvex(ccw)).toBe(true);
    expect(isConvex(cw)).toBe(true);
  });

  it('returns true when all points collinear', () => {
    expect(isConvex([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }])).toBe(true);
  });

  it('returns false for T-shape (concave)', () => {
    // T-shape with reflex vertices.
    const tShape = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 30 },
      { x: 10, y: 30 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(isConvex(tShape)).toBe(false);
  });
});

describe('translateConvexParts', () => {
  it('shifts every vertex by (dx, dy)', () => {
    const parts = [{ vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }] }];
    const out = translateConvexParts(parts, 10, 20);
    expect(out[0]!.vertices[0]).toEqual({ x: 10, y: 20 });
    expect(out[0]!.vertices[1]).toEqual({ x: 11, y: 20 });
  });

  it('does not mutate input', () => {
    const parts = [{ vertices: [{ x: 0, y: 0 }] }];
    translateConvexParts(parts, 5, 5);
    expect(parts[0]!.vertices[0]).toEqual({ x: 0, y: 0 });
  });
});
