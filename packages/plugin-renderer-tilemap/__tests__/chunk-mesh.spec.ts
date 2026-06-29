import {
  buildChunkMesh,
  estimateChunkMeshMemoryKB,
  isMeshPathAvailable,
} from '../lib/chunk-mesh';

jest.mock('pixi.js', () => {
  class Container {
    children: any[] = [];
    label: string = '';
    addChild(c: any) {
      this.children.push(c);
      return c;
    }
    destroy() {}
  }
  return { Container };
});

describe('chunk-mesh stub (Cycle 2 接入真实 shader 前)', () => {
  it('isMeshPathAvailable returns false in current build', () => {
    expect(isMeshPathAvailable()).toBe(false);
  });

  it('buildChunkMesh returns a labeled Container stub', () => {
    const c = buildChunkMesh({
      chunkKey: '0,0',
      chunkX: 0,
      chunkY: 0,
      cellWidth: 16,
      cellHeight: 16,
      atlas: null,
      cells: new Int32Array(256),
      regionWidth: 16,
      regionHeight: 16,
    });
    expect(c).toBeDefined();
    expect((c as any).label).toBe('chunk-mesh-stub-0,0');
    expect(Array.isArray((c as any).children)).toBe(true);
  });

  it('estimateChunkMeshMemoryKB stays within expected bound', () => {
    const kb = estimateChunkMeshMemoryKB({
      chunkKey: '0,0',
      chunkX: 0,
      chunkY: 0,
      cellWidth: 16,
      cellHeight: 16,
      atlas: null,
      cells: new Int32Array(256),
      regionWidth: 16,
      regionHeight: 16,
    });
    expect(kb).toBeGreaterThan(0);
    expect(kb).toBeLessThan(20);
  });
});
