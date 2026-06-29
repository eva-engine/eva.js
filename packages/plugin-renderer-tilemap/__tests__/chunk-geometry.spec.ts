import { buildChunkGeometry } from '../lib/chunk/chunk-geometry';

function packCell(slot: number, col: number, row: number, altIdx = 0, flipH = false, flipV = false, transpose = false): number {
  return (
    slot |
    (col << 8) |
    (row << 16) |
    (altIdx << 24) |
    (flipH ? 1 << 29 : 0) |
    (flipV ? 1 << 30 : 0) |
    (transpose ? 1 << 31 : 0)
  );
}

describe('buildChunkGeometry', () => {
  const atlasInfo = {
    regionWidth: 16,
    regionHeight: 16,
    textureWidth: 64,
    textureHeight: 32,
    margins: { x: 0, y: 0 },
    separation: { x: 0, y: 0 },
  };

  it('throws when cells.length !== 256', () => {
    expect(() =>
      buildChunkGeometry({
        cells: new Int32Array(10),
        chunkWorldX: 0,
        chunkWorldY: 0,
        cellWidth: 16,
        cellHeight: 16,
        atlasInfo,
      })
    ).toThrow(/cells length/);
  });

  it('empty chunk → empty buffers', () => {
    const result = buildChunkGeometry({
      cells: new Int32Array(256),
      chunkWorldX: 0,
      chunkWorldY: 0,
      cellWidth: 16,
      cellHeight: 16,
      atlasInfo,
    });
    expect(result.quadCount).toBe(0);
    expect(result.vertexData.length).toBe(0);
    expect(result.indices.length).toBe(0);
  });

  it('one cell → 4 verts + 6 indices + correct positions/UVs', () => {
    const cells = new Int32Array(256);
    cells[0] = packCell(1, 1, 0); // atlas col=1 row=0
    const result = buildChunkGeometry({
      cells,
      chunkWorldX: 100,
      chunkWorldY: 200,
      cellWidth: 16,
      cellHeight: 16,
      atlasInfo,
    });
    expect(result.quadCount).toBe(1);
    expect(result.vertexData.length).toBe(32); // 4 × 8
    expect(result.indices.length).toBe(6);
    // TL vertex position (x=100, y=200)
    expect(result.vertexData[0]).toBe(100);
    expect(result.vertexData[1]).toBe(200);
    // UV TL = (col*16 / 64, row*16 / 32) = (0.25, 0)
    expect(result.vertexData[2]).toBeCloseTo(0.25);
    expect(result.vertexData[3]).toBe(0);
  });

  it('multiple cells → contiguous index buffer', () => {
    const cells = new Int32Array(256);
    cells[0] = packCell(1, 0, 0);
    cells[16] = packCell(1, 1, 0); // (0, 1)
    const result = buildChunkGeometry({
      cells,
      chunkWorldX: 0,
      chunkWorldY: 0,
      cellWidth: 16,
      cellHeight: 16,
      atlasInfo,
    });
    expect(result.quadCount).toBe(2);
    expect(result.indices).toEqual(new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]));
  });

  it('flip flags pack into per-vertex attribute', () => {
    const cells = new Int32Array(256);
    cells[0] = packCell(1, 0, 0, 0, true, false, false);
    const result = buildChunkGeometry({
      cells,
      chunkWorldX: 0,
      chunkWorldY: 0,
      cellWidth: 16,
      cellHeight: 16,
      atlasInfo,
    });
    // 4 verts × 8 floats; flipH at index 4
    expect(result.vertexData[4]).toBe(1);
    expect(result.vertexData[5]).toBe(0);
    expect(result.vertexData[6]).toBe(0);
  });
});
