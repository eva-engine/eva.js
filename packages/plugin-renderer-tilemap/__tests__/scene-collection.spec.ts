import { expandSceneCollectionSource, resolveCellPrefabName } from '../lib/scene-collection-source';

describe('expandSceneCollectionSource', () => {
  it('returns refs for sceneCollection sources', () => {
    const refs = expandSceneCollectionSource({
      kind: 'sceneCollection',
      id: 'props',
      prefabRefs: ['TreePrefab', 'RockPrefab', 'BushPrefab'],
    });
    expect(refs).toEqual([
      { sourceId: 'props', prefabName: 'TreePrefab', index: 0 },
      { sourceId: 'props', prefabName: 'RockPrefab', index: 1 },
      { sourceId: 'props', prefabName: 'BushPrefab', index: 2 },
    ]);
  });

  it('returns empty for atlas sources', () => {
    expect(
      expandSceneCollectionSource({
        kind: 'atlas',
        id: 'main',
        textureAsset: 'a',
        regionSize: { width: 16, height: 16 },
        tiles: [],
      })
    ).toEqual([]);
  });
});

describe('resolveCellPrefabName', () => {
  const sources = [
    { kind: 'sceneCollection', id: 'props', prefabRefs: ['TreePrefab', 'RockPrefab'] },
  ] as any;

  it('returns prefab name for valid scene-collection cell', () => {
    const packed = 1 | (1 << 8); // slot=1 col=1
    expect(resolveCellPrefabName(packed, sources)).toBe('RockPrefab');
  });

  it('returns null when slot 0 (empty)', () => {
    expect(resolveCellPrefabName(0, sources)).toBeNull();
  });

  it('returns null when slot is atlas (not sceneCollection)', () => {
    const atlasSources = [{ kind: 'atlas', id: 'main', textureAsset: 'a', regionSize: { width: 16, height: 16 }, tiles: [] }] as any;
    expect(resolveCellPrefabName(1, atlasSources)).toBeNull();
  });

  it('returns null when col index out of prefab list', () => {
    const packed = 1 | (5 << 8);
    expect(resolveCellPrefabName(packed, sources)).toBeNull();
  });
});
