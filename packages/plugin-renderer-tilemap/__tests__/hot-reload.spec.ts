import { computeAffectedChunks, diffTilesetDocuments, diffTilesetForChunkRebuild } from '../lib/hot-reload';
import type { TilesetDocumentRaw } from '../lib/tileset-types';

function ts(sources: TilesetDocumentRaw['sources']): TilesetDocumentRaw {
  return { kind: 'tileset', schemaVersion: 1, name: 'world', tileSize: { width: 16, height: 16 }, sources };
}

function tile(col: number, row: number, extra = 0) {
  return {
    atlasCoords: { col, row },
    alternatives: [{ altId: 0, _extra: extra }],
  } as any;
}

describe('diffTilesetDocuments', () => {
  it('detects added source', () => {
    const prev = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [] }]);
    const next = ts([
      { kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [] },
      { kind: 'atlas', id: 'extra', textureAsset: 'b', regionSize: { width: 16, height: 16 }, tiles: [] },
    ]);
    const d = diffTilesetDocuments(prev, next);
    expect(d.addedSources.map((s) => s.id)).toEqual(['extra']);
  });

  it('detects removed source + its tiles', () => {
    const prev = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [tile(0, 0), tile(1, 0)] }]);
    const next = ts([]);
    const d = diffTilesetDocuments(prev, next);
    expect(d.removedSourceIds).toEqual(['main']);
    expect(d.removedTilesByKey.has('main/0,0')).toBe(true);
    expect(d.removedTilesByKey.has('main/1,0')).toBe(true);
  });

  it('detects added tile in existing source', () => {
    const prev = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [tile(0, 0)] }]);
    const next = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [tile(0, 0), tile(1, 0)] }]);
    const d = diffTilesetDocuments(prev, next);
    expect(d.addedTilesByKey.has('main/1,0')).toBe(true);
  });

  it('detects changed tile content', () => {
    const prev = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [tile(0, 0, 1)] }]);
    const next = ts([{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [tile(0, 0, 2)] }]);
    const d = diffTilesetDocuments(prev, next);
    expect(d.changedTilesByKey.has('main/0,0')).toBe(true);
  });

  // ADR-0018 / Phase M cleanup: `diffTilesetDocuments` was renamed to
  // `diffTilesetForChunkRebuild` to avoid collision with @ali/eva-dsl's
  // document-level detailed diff of the same name. Old export is kept as a
  // deprecated alias; this guards against future drift between the two.
  it('diffTilesetForChunkRebuild is the canonical name and diffTilesetDocuments is an alias of it', () => {
    expect(diffTilesetForChunkRebuild).toBe(diffTilesetDocuments);
  });
});

describe('computeAffectedChunks', () => {
  it('marks chunk dirty when it contains a changed tile', () => {
    const arr = new Int32Array(256);
    arr[0] = 1 | (0 << 8) | (0 << 16); // slot=1 col=0 row=0
    const dirty = computeAffectedChunks(
      { '0,0': arr },
      new Map([[1, 'main']]),
      { addedSources: [], removedSourceIds: [], changedSourceIds: [], addedTilesByKey: new Set(), removedTilesByKey: new Set(), changedTilesByKey: new Set(['main/0,0']) }
    );
    expect(Array.from(dirty)).toEqual(['0,0']);
  });

  it('clean chunks remain clean', () => {
    const arr = new Int32Array(256);
    arr[0] = 1 | (5 << 8); // col=5
    const dirty = computeAffectedChunks(
      { '0,0': arr },
      new Map([[1, 'main']]),
      { addedSources: [], removedSourceIds: [], changedSourceIds: [], addedTilesByKey: new Set(), removedTilesByKey: new Set(), changedTilesByKey: new Set(['main/0,0']) }
    );
    expect(dirty.size).toBe(0);
  });
});
