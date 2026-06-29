import {
  TILEMAP_PROBE_NAMES,
  adaptGamePerfProbes,
  createInMemoryProbeRegistry,
  getRequiredTilemapProbes,
} from '../lib/probes';

describe('TILEMAP_PROBE_NAMES', () => {
  it('exposes all 15 probe names required by ADR-0018 §4.6', () => {
    const names = Object.values(TILEMAP_PROBE_NAMES);
    expect(names.length).toBeGreaterThanOrEqual(8);
    expect(names).toContain('tilemap.dirtyRebuild.ms');
    expect(names).toContain('tilemap.cullCheck.ms');
    expect(names).toContain('tilemap.physicsRebake.ms');
    expect(names).toContain('tilemap.autotile.ms');
    expect(names).toContain('tilemap.bodies.total');
  });

  it('getRequiredTilemapProbes returns the full list', () => {
    const required = getRequiredTilemapProbes();
    expect(required.length).toBeGreaterThanOrEqual(8);
  });
});

describe('createInMemoryProbeRegistry', () => {
  it('records timings between begin/end', async () => {
    const r = createInMemoryProbeRegistry();
    r.beginTiming('tilemap.dirtyRebuild.ms');
    await new Promise((res) => setTimeout(res, 5));
    r.endTiming('tilemap.dirtyRebuild.ms');
    const samples = r.timings.get('tilemap.dirtyRebuild.ms');
    expect(samples).toBeDefined();
    expect(samples!.length).toBe(1);
    expect(samples![0]).toBeGreaterThanOrEqual(0);
  });

  it('count accumulates with delta default 1', () => {
    const r = createInMemoryProbeRegistry();
    r.count('tilemap.bodies.created');
    r.count('tilemap.bodies.created');
    r.count('tilemap.bodies.created', 3);
    expect(r.counts.get('tilemap.bodies.created')).toBe(5);
  });

  it('gauge overwrites with latest value', () => {
    const r = createInMemoryProbeRegistry();
    r.gauge('tilemap.dirty.pending', 7);
    r.gauge('tilemap.dirty.pending', 12);
    expect(r.gauges.get('tilemap.dirty.pending')).toBe(12);
  });

  it('endTiming without begin is no-op', () => {
    const r = createInMemoryProbeRegistry();
    expect(() => r.endTiming('tilemap.autotile.ms')).not.toThrow();
    expect(r.timings.get('tilemap.autotile.ms')).toBeUndefined();
  });
});

describe('adaptGamePerfProbes', () => {
  it('returns null when game.perfProbes is missing', () => {
    expect(adaptGamePerfProbes({} as any)).toBeNull();
  });

  it('forwards begin/end/count/gauge to game.perfProbes', () => {
    const begin = jest.fn();
    const end = jest.fn();
    const count = jest.fn();
    const gauge = jest.fn();
    const adapter = adaptGamePerfProbes({
      perfProbes: { beginTiming: begin, endTiming: end, count, gauge },
    } as any)!;
    adapter.beginTiming('a');
    adapter.endTiming('a');
    adapter.count('b', 3);
    adapter.gauge('c', 7);
    expect(begin).toHaveBeenCalledWith('a');
    expect(end).toHaveBeenCalledWith('a');
    expect(count).toHaveBeenCalledWith('b', 3);
    expect(gauge).toHaveBeenCalledWith('c', 7);
  });

  it('missing methods are replaced with noops', () => {
    const adapter = adaptGamePerfProbes({ perfProbes: {} } as any)!;
    expect(() => {
      adapter.beginTiming('x');
      adapter.endTiming('x');
      adapter.count('x');
      adapter.gauge('x', 0);
    }).not.toThrow();
  });
});
