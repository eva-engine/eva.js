import { resolveChunkRenderStrategy, estimateSpriteNodes } from '../lib/chunk-renderer';

describe('resolveChunkRenderStrategy', () => {
  it('returns explicit preference', () => {
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 1, atlasesInChunk: 1, totalChunksVisible: 1, preference: 'mesh' })).toBe('mesh');
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 250, atlasesInChunk: 1, totalChunksVisible: 1, preference: 'sprite' })).toBe('sprite');
  });

  it('falls back to sprite when multiple atlases share a chunk', () => {
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 250, atlasesInChunk: 2, totalChunksVisible: 5 })).toBe('sprite');
  });

  it('upgrades to mesh on dense single-atlas chunks', () => {
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 200, atlasesInChunk: 1, totalChunksVisible: 5 })).toBe('mesh');
  });

  it('stays on sprite for sparse chunks', () => {
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 16, atlasesInChunk: 1, totalChunksVisible: 5 })).toBe('sprite');
  });

  it('auto preference behaves the same as no preference', () => {
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 16, atlasesInChunk: 1, totalChunksVisible: 5, preference: 'auto' })).toBe('sprite');
    expect(resolveChunkRenderStrategy({ nonEmptyCellsInChunk: 200, atlasesInChunk: 1, totalChunksVisible: 5, preference: 'auto' })).toBe('mesh');
  });
});

describe('estimateSpriteNodes', () => {
  it('returns 1 container + n sprites', () => {
    expect(estimateSpriteNodes(0)).toBe(1);
    expect(estimateSpriteNodes(256)).toBe(257);
  });
});
