/**
 * TileMapStaticBody(G2)。
 *
 * 走 chunked cellData,把每 painted cell 配的 physics polygons 通过 DecompositionCache
 * 转 convex parts + translate 到 cell world 位置,产出 BodyDefinition[] 给
 * BodySourceRegistry。
 */

import {
	cacheKeyOfNum,
	DecompositionCache,
	decomposePolygon,
	translateConvexParts,
	type ConvexPart,
} from "./decomposition-cache-shim";
import type { BodyDefinition, BodySourceContext } from "./body-source-registry";

export interface TileMapStaticBodyInput {
	/** 已 hydrate 的 chunked cells:`chunkKey → Int32Array(256)`。 */
	chunksByKey: Record<string, Int32Array>;
	/** TileSet alt tile 的 physics 数据。 */
	physicsByCellKey: Map<string, Array<{ layerId: string; polygons: Array<{ points: Array<{ x: number; y: number }>; origin?: "center" | "topLeft" }>; oneWay?: boolean; friction?: number; restitution?: number }>>;
	cellWidth: number;
	cellHeight: number;
	mapOriginX: number;
	mapOriginY: number;
	cache: DecompositionCache;
}

const CHUNK_SIZE = 16;

function unpackSlot(packed: number): number {
	return packed & 0xff;
}
function unpackCol(packed: number): number {
	return (packed >>> 8) & 0xff;
}
function unpackRow(packed: number): number {
	return (packed >>> 16) & 0xff;
}
function unpackAlt(packed: number): number {
	return (packed >>> 24) & 0x1f;
}

/**
 * Build BodyDefinition[] for an entire TileMap layer。
 *
 * 每 cell 引用 TileSet 中对应 tile 的 physics polygons:
 *   - 在 cache 里查 cached convex parts(load 时已 decompose)
 *   - 没缓存就 decomposePolygon stub(当前 polygon=convex 直接返回)
 *   - translate 到 cell world 位置
 */
export function buildTileMapStaticBodies(input: TileMapStaticBodyInput, ctx: BodySourceContext): BodyDefinition[] {
	const out: BodyDefinition[] = [];
	for (const [chunkKey, arr] of Object.entries(input.chunksByKey)) {
		const [ckxStr, ckyStr] = chunkKey.split(",");
		const ckx = Number.parseInt(ckxStr!, 10);
		const cky = Number.parseInt(ckyStr!, 10);
		if (!Number.isFinite(ckx) || !Number.isFinite(cky)) continue;
		for (let ly = 0; ly < CHUNK_SIZE; ly++) {
			for (let lx = 0; lx < CHUNK_SIZE; lx++) {
				const packed = arr[ly * CHUNK_SIZE + lx]!;
				const slot = unpackSlot(packed);
				if (slot === 0) continue;
				const col = unpackCol(packed);
				const row = unpackRow(packed);
				const altIdx = unpackAlt(packed);
				const physicsKey = `${slot},${col},${row},${altIdx}`;
				const physicsEntries = input.physicsByCellKey.get(physicsKey);
				if (!physicsEntries || physicsEntries.length === 0) continue;
				const cellWorldX = input.mapOriginX + (ckx * CHUNK_SIZE + lx) * input.cellWidth + ctx.worldX;
				const cellWorldY = input.mapOriginY + (cky * CHUNK_SIZE + ly) * input.cellHeight + ctx.worldY;
				for (const entry of physicsEntries) {
					for (const poly of entry.polygons) {
						const cacheKeyNum = cacheKeyOfNum(slot, col, row, altIdx);
						let parts = input.cache.getNum(cacheKeyNum)?.parts;
						if (!parts) {
							parts = decomposePolygon(poly.points);
							input.cache.setNum(cacheKeyNum, { parts });
						}
						const translated = translateConvexParts(parts, cellWorldX, cellWorldY);
						for (let pi = 0; pi < translated.length; pi++) {
							out.push({
								id: `tile-${chunkKey}-${lx}-${ly}-${entry.layerId}-${pi}`,
								vertices: translated[pi]!.vertices,
								centerX: cellWorldX + input.cellWidth / 2,
								centerY: cellWorldY + input.cellHeight / 2,
								isStatic: true,
								oneWay: entry.oneWay,
								friction: entry.friction,
								restitution: entry.restitution,
								metadata: { layerId: entry.layerId, chunkKey, cellLocal: [lx, ly] },
							});
						}
					}
				}
			}
		}
	}
	return out;
}

void {} as ConvexPart; // re-export type silence
