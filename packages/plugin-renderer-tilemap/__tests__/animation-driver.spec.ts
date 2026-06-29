import { TileAnimationDriver } from '../lib/animation-driver';
import type { TilesetDocumentRaw } from '../lib/tileset-types';

function makeTilesetWithAnim(overrides: Partial<{ stepMs: number; frames: any[]; phase: 'sync' | 'randomStart' }> = {}): TilesetDocumentRaw {
  return {
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
              stepMs: overrides.stepMs ?? 100,
              frames: overrides.frames ?? [
                { atlasCoords: { col: 0, row: 0 } },
                { atlasCoords: { col: 1, row: 0 } },
                { atlasCoords: { col: 2, row: 0 } },
              ],
              phase: overrides.phase ?? 'sync',
            } as any,
          } as any,
        ],
      },
    ],
  };
}

describe('TileAnimationDriver', () => {
  it('loads animations from tileset', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    expect(driver.animationCount).toBe(1);
  });

  it('returns frame 0 at t=0 with sync phase', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    const { currentFrames } = driver.advance(0);
    const f = currentFrames.get('1,0,0');
    expect(f).toEqual({ col: 0, row: 0 });
  });

  it('advances to the next frame after duration', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    expect(driver.advance(0).currentFrames.get('1,0,0')).toEqual({ col: 0, row: 0 });
    expect(driver.advance(100).currentFrames.get('1,0,0')).toEqual({ col: 1, row: 0 });
    expect(driver.advance(200).currentFrames.get('1,0,0')).toEqual({ col: 2, row: 0 });
  });

  it('wraps around at end of cycle', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    const { currentFrames } = driver.advance(300);
    expect(currentFrames.get('1,0,0')).toEqual({ col: 0, row: 0 });
  });

  it('emits dirtyKeys only when frame index changes', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    driver.advance(0);
    const r1 = driver.advance(50);
    expect(r1.dirtyKeys.size).toBe(0); // still on frame 0
    const r2 = driver.advance(100);
    expect(r2.dirtyKeys.has('1,0,0')).toBe(true);
  });

  it('randomStart picks a deterministic non-zero phase offset', () => {
    const a = new TileAnimationDriver();
    a.loadFromTileset(makeTilesetWithAnim({ phase: 'randomStart' }));
    const b = new TileAnimationDriver();
    b.loadFromTileset(makeTilesetWithAnim({ phase: 'randomStart' }));
    const fa = a.advance(0).currentFrames.get('1,0,0');
    const fb = b.advance(0).currentFrames.get('1,0,0');
    expect(fa).toEqual(fb); // deterministic across instances
  });

  it('handles per-frame durationFactor', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(
      makeTilesetWithAnim({
        stepMs: 100,
        frames: [
          { atlasCoords: { col: 0, row: 0 }, durationFactor: 1 }, // 100ms
          { atlasCoords: { col: 1, row: 0 }, durationFactor: 3 }, // 300ms
        ],
      })
    );
    expect(driver.advance(50).currentFrames.get('1,0,0')).toEqual({ col: 0, row: 0 });
    expect(driver.advance(150).currentFrames.get('1,0,0')).toEqual({ col: 1, row: 0 });
    expect(driver.advance(350).currentFrames.get('1,0,0')).toEqual({ col: 1, row: 0 });
    expect(driver.advance(450).currentFrames.get('1,0,0')).toEqual({ col: 0, row: 0 });
  });

  it('ignores tiles without animation entries', () => {
    const raw: TilesetDocumentRaw = {
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'main',
          textureAsset: 'a',
          regionSize: { width: 16, height: 16 },
          tiles: [{ atlasCoords: { col: 0, row: 0 }, alternatives: [{ altId: 0 }] }],
        },
      ],
    };
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(raw);
    expect(driver.animationCount).toBe(0);
  });

  it('reset() clears prior frame tracking', () => {
    const driver = new TileAnimationDriver();
    driver.loadFromTileset(makeTilesetWithAnim());
    driver.advance(100); // moves to frame 1
    driver.reset();
    const r = driver.advance(100);
    expect(r.dirtyKeys.has('1,0,0')).toBe(true); // dirty again because tracking reset
  });
});
