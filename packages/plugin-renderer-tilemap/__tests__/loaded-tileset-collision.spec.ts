import { makeLoadedTileset } from '../lib/tileset-types';

describe('makeLoadedTileset collision detection', () => {
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('test_makeLoadedTileset_warns_when_two_sources_share_textureAsset_different_regionSize', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'a',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
        {
          kind: 'atlas',
          id: 'b',
          textureAsset: 'shared.png',
          regionSize: { width: 32, height: 32 },
          tiles: [],
        },
      ],
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const msg = warnSpy.mock.calls[0]![0] as string;
    expect(msg).toContain("'a'");
    expect(msg).toContain("'b'");
    expect(msg).toContain('shared.png');
  });

  it('test_makeLoadedTileset_does_not_warn_when_sources_share_textureAsset_with_identical_geometry', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'a',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
        {
          kind: 'atlas',
          id: 'b',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
      ],
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('test_makeLoadedTileset_does_not_warn_when_distinct_textureAssets', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'a',
          textureAsset: 'one.png',
          regionSize: { width: 16, height: 16 },
          tiles: [],
        },
        {
          kind: 'atlas',
          id: 'b',
          textureAsset: 'two.png',
          regionSize: { width: 32, height: 32 },
          tiles: [],
        },
      ],
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when shared textureAsset differs only in margins', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'a',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          margins: { x: 0, y: 0 },
          tiles: [],
        },
        {
          kind: 'atlas',
          id: 'b',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          margins: { x: 2, y: 2 },
          tiles: [],
        },
      ],
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('warns when shared textureAsset differs only in separation', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        {
          kind: 'atlas',
          id: 'a',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          separation: { x: 0, y: 0 },
          tiles: [],
        },
        {
          kind: 'atlas',
          id: 'b',
          textureAsset: 'shared.png',
          regionSize: { width: 16, height: 16 },
          separation: { x: 1, y: 1 },
          tiles: [],
        },
      ],
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('does not warn for sceneCollection sources (no textureAsset)', () => {
    makeLoadedTileset({
      kind: 'tileset',
      schemaVersion: 1,
      name: 'w',
      tileSize: { width: 16, height: 16 },
      sources: [
        { kind: 'sceneCollection', id: 'sc1', prefabRefs: [] },
        { kind: 'sceneCollection', id: 'sc2', prefabRefs: [] },
      ],
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
