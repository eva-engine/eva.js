/**
 * DecompositionCache(C1,关联 ADR-0019)。
 *
 * TileSet 上每 alt tile 可能有任意 polygon collision shape。Matter.js 要求 convex,
 * concave 需 poly-decomp。decompose 是 O(n²),不能每 paint stroke 重做。
 *
 * 这里在 TileSet load 时把每 alt tile 的 polygon list 一次性 decompose 成 convex parts,
 * 后续 stroke 只走 translate;decompose 结果按 (sourceSlot, col, row, altIdx, layerId) key 缓存。
 *
 * 当前 cycle:cache 数据结构 + key 生成 + LRU eviction skeleton 实现完毕,真 poly-decomp
 * 在 Phase 3 落地时接入 npm `poly-decomp` 包。
 */

export interface ConvexPart {
	/** 顶点列表(局部坐标,相对 tile 中心或左上)。 */
	vertices: Array<{ x: number; y: number }>;
}

export interface CachedDecomposition {
	parts: ConvexPart[];
	/** 物理材质参数,Phase 3 时由 plugin-matterjs 消费。 */
	friction?: number;
	restitution?: number;
	oneWay?: boolean;
}

export interface DecompositionCacheKey {
	sourceSlot: number;
	col: number;
	row: number;
	altIdx: number;
	layerId: string;
}

export function cacheKeyOf(k: DecompositionCacheKey): string {
	return `${k.sourceSlot},${k.col},${k.row},${k.altIdx},${k.layerId}`;
}

export class DecompositionCache {
	private readonly maxEntries: number;
	private cache = new Map<string, CachedDecomposition>();
	private accessOrder = new Map<string, number>();
	private accessCounter = 0;

	constructor(maxEntries = 1000) {
		this.maxEntries = maxEntries;
	}

	get(key: DecompositionCacheKey): CachedDecomposition | undefined {
		const k = cacheKeyOf(key);
		const cached = this.cache.get(k);
		if (cached) this.accessOrder.set(k, ++this.accessCounter);
		return cached;
	}

	set(key: DecompositionCacheKey, value: CachedDecomposition): void {
		const k = cacheKeyOf(key);
		this.cache.set(k, value);
		this.accessOrder.set(k, ++this.accessCounter);
		if (this.cache.size > this.maxEntries) this.evictLRU();
	}

	has(key: DecompositionCacheKey): boolean {
		return this.cache.has(cacheKeyOf(key));
	}

	clear(): void {
		this.cache.clear();
		this.accessOrder.clear();
		this.accessCounter = 0;
	}

	get size(): number {
		return this.cache.size;
	}

	private evictLRU(): void {
		let oldestKey: string | undefined;
		let oldestAccess = Infinity;
		for (const [k, c] of this.accessOrder) {
			if (c < oldestAccess) {
				oldestAccess = c;
				oldestKey = k;
			}
		}
		if (oldestKey) {
			this.cache.delete(oldestKey);
			this.accessOrder.delete(oldestKey);
		}
	}
}

/**
 * 把局部 polygon 平移到目标 cell 的世界坐标。
 * Phase 3 在 chunk rebuild 时调用,把 cached convex parts 复用到任意 cell 位置。
 */
export function translateConvexParts(
	parts: ConvexPart[],
	dx: number,
	dy: number
): ConvexPart[] {
	return parts.map((p) => ({
		vertices: p.vertices.map((v) => ({ x: v.x + dx, y: v.y + dy })),
	}));
}

/**
 * 判定 polygon 是否为 convex(简单凸多边形)。
 *
 * 算法:遍历每一对相邻边,计算 cross product;如所有非零 cross 同号即 convex。
 * collinear(cross=0)被视为退化情况,不影响判定。
 *
 * 此函数 export 出去让 host UI 可以在用户绘制 polygon 时做 pre-check,
 * 在视觉层提示 concave warning,避免落入 decomposePolygon 的 throw。
 */
export function isConvex(polygon: Array<{ x: number; y: number }>): boolean {
	if (polygon.length < 3) return true;
	let sign = 0;
	const n = polygon.length;
	for (let i = 0; i < n; i++) {
		const a = polygon[i]!;
		const b = polygon[(i + 1) % n]!;
		const c = polygon[(i + 2) % n]!;
		const ex1 = b.x - a.x;
		const ey1 = b.y - a.y;
		const ex2 = c.x - b.x;
		const ey2 = c.y - b.y;
		const cross = ex1 * ey2 - ey1 * ex2;
		if (cross !== 0) {
			if (sign === 0) sign = cross > 0 ? 1 : -1;
			else if ((cross > 0 ? 1 : -1) !== sign) return false;
		}
	}
	return true;
}

/**
 * 暂时占位的 polygon → convex parts 函数。
 * Phase 3 落地 npm `poly-decomp` 时替换实现;当前假设输入已 convex,
 * 输入 concave polygon(L/T/U/凹槽)会 throw,防止静默产出错误 Matter body。
 *
 * Host 应在 paint 前用 isConvex 做 pre-check,把 concave 提示给用户,避免触发 throw。
 */
export function decomposePolygon(polygon: Array<{ x: number; y: number }>): ConvexPart[] {
	if (polygon.length < 3) return [];
	if (!isConvex(polygon)) {
		const err = new Error(
			`decomposePolygon: input polygon (${polygon.length} vertices) is non-convex. ` +
				`This is a placeholder implementation that assumes convex input — concave polygons silently produce ` +
				`invalid Matter.js bodies. Real concave decomposition requires the 'poly-decomp' npm dependency ` +
				`(see ADR-0019 Phase 1). If you need concave physics tiles right now, split into convex parts manually.`
		);
		if (typeof console !== 'undefined') console.error('[Tilemap]', err.message);
		throw err;
	}
	return [{ vertices: polygon.slice() }];
}
