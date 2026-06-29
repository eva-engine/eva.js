/**
 * 把 DecompositionCache(string-key)适配出 numeric-key 接口供 TileMapStaticBody 用。
 * numeric key = (slot << 24) | (altIdx << 18) | (row << 9) | col。
 * 这套 packed key 不需要 layerId(同 cell 跨 layer 的 physics 几何相同)。
 */

import { DecompositionCache, cacheKeyOf, decomposePolygon, translateConvexParts } from "./decomposition-cache";
import type { CachedDecomposition, ConvexPart } from "./decomposition-cache";

export function cacheKeyOfNum(slot: number, col: number, row: number, altIdx: number): number {
	return (((slot & 0xff) << 24) | ((altIdx & 0x3f) << 18) | ((row & 0x1ff) << 9) | (col & 0x1ff)) >>> 0;
}

declare module "./decomposition-cache" {
	interface DecompositionCache {
		getNum(key: number): CachedDecomposition | undefined;
		setNum(key: number, value: CachedDecomposition): void;
	}
}

DecompositionCache.prototype.getNum = function (this: DecompositionCache, key: number): CachedDecomposition | undefined {
	return this.get({ sourceSlot: (key >>> 24) & 0xff, altIdx: (key >>> 18) & 0x3f, row: (key >>> 9) & 0x1ff, col: key & 0x1ff, layerId: "__num__" });
};
DecompositionCache.prototype.setNum = function (this: DecompositionCache, key: number, value: CachedDecomposition): void {
	this.set({ sourceSlot: (key >>> 24) & 0xff, altIdx: (key >>> 18) & 0x3f, row: (key >>> 9) & 0x1ff, col: key & 0x1ff, layerId: "__num__" }, value);
};

export { DecompositionCache, cacheKeyOf, decomposePolygon, translateConvexParts };
export type { CachedDecomposition, ConvexPart };
