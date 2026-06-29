/**
 * Build packed vertex/index buffers for a chunk mesh(G3)。
 *
 * 输入:Int32Array(256 packed cells)+ atlas region info。
 * 输出:Float32Array (vertex data) + Uint16Array (indices)。
 *
 * 每非空 cell 4 vertices × 8 floats(2 pos + 2 uv + 4 flags) = 32 floats = 128B。
 * 6 indices/quad × 2B = 12B index。
 */

import { unpackCell, isEmptyCellValue } from "../chunk-codec";

const CHUNK_SIZE = 16;
const VERTS_PER_QUAD = 4;
const FLOATS_PER_VERT = 8;

export interface ChunkGeometryAtlasInfo {
	regionWidth: number;
	regionHeight: number;
	textureWidth: number;
	textureHeight: number;
	margins: { x: number; y: number };
	separation: { x: number; y: number };
}

export interface ChunkGeometryResult {
	vertexData: Float32Array;
	indices: Uint16Array;
	quadCount: number;
}

/**
 * Build geometry for a chunk。chunkX/Y 是 chunk 在世界坐标的左上(已含 mapOrigin)。
 */
export function buildChunkGeometry(args: {
	cells: Int32Array;
	chunkWorldX: number;
	chunkWorldY: number;
	cellWidth: number;
	cellHeight: number;
	atlasInfo: ChunkGeometryAtlasInfo;
}): ChunkGeometryResult {
	const { cells, chunkWorldX, chunkWorldY, cellWidth, cellHeight, atlasInfo } = args;
	if (cells.length !== CHUNK_SIZE * CHUNK_SIZE) {
		throw new Error(`buildChunkGeometry: cells length ${cells.length} != ${CHUNK_SIZE * CHUNK_SIZE}`);
	}
	let nonEmpty = 0;
	for (let i = 0; i < cells.length; i++) if (!isEmptyCellValue(cells[i]!)) nonEmpty++;
	const vertexData = new Float32Array(nonEmpty * VERTS_PER_QUAD * FLOATS_PER_VERT);
	const indices = new Uint16Array(nonEmpty * 6);
	let v = 0;
	let i = 0;
	let quadIdx = 0;
	for (let ly = 0; ly < CHUNK_SIZE; ly++) {
		for (let lx = 0; lx < CHUNK_SIZE; lx++) {
			const packed = cells[ly * CHUNK_SIZE + lx]!;
			if (isEmptyCellValue(packed)) continue;
			const cell = unpackCell(packed);
			const x0 = chunkWorldX + lx * cellWidth;
			const y0 = chunkWorldY + ly * cellHeight;
			const x1 = x0 + cellWidth;
			const y1 = y0 + cellHeight;
			const u0 = (atlasInfo.margins.x + cell.col * (atlasInfo.regionWidth + atlasInfo.separation.x)) / atlasInfo.textureWidth;
			const u1 = u0 + atlasInfo.regionWidth / atlasInfo.textureWidth;
			const v0 = (atlasInfo.margins.y + cell.row * (atlasInfo.regionHeight + atlasInfo.separation.y)) / atlasInfo.textureHeight;
			const v1 = v0 + atlasInfo.regionHeight / atlasInfo.textureHeight;
			const fh = cell.flipH ? 1 : 0;
			const fv = cell.flipV ? 1 : 0;
			const tr = cell.transpose ? 1 : 0;
			const animPhase = 0;
			// 4 vertices (TL, TR, BR, BL)
			const writeVert = (x: number, y: number, u: number, vv: number) => {
				vertexData[v++] = x;
				vertexData[v++] = y;
				vertexData[v++] = u;
				vertexData[v++] = vv;
				vertexData[v++] = fh;
				vertexData[v++] = fv;
				vertexData[v++] = tr;
				vertexData[v++] = animPhase;
			};
			writeVert(x0, y0, u0, v0);
			writeVert(x1, y0, u1, v0);
			writeVert(x1, y1, u1, v1);
			writeVert(x0, y1, u0, v1);
			const base = quadIdx * VERTS_PER_QUAD;
			indices[i++] = base;
			indices[i++] = base + 1;
			indices[i++] = base + 2;
			indices[i++] = base;
			indices[i++] = base + 2;
			indices[i++] = base + 3;
			quadIdx++;
		}
	}
	return { vertexData, indices, quadCount: quadIdx };
}
