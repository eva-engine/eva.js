/**
 * Autotile peering-bit index (Phase 2).
 *
 * 在 TileSet load 时构建,把每个 alt tile 的 peering bits 编进 hash key
 * 实现 O(1) 邻居匹配。
 *
 * 数据模型:
 * - 一个 terrainSet 有最多 8 个方向(Godot corners+sides),每个方向上当前
 *   邻居的 terrain id 取值 0..255。
 * - 把 8 个方向打包成一个 BigInt 作 exact-match key:每 byte 一个方向。
 * - 通配 (`undefined` neighbor) 用 0xff 哨兵表示;查询时构造 actual neighborhood
 *   也用 0xff 表示"无邻居 / 空 cell"。
 * - exact 命中优先;否则在 wildcard 桶里按 Hamming 距离打分,取最小者(同分则
 *   按 probability 加权随机 - 注意此处仅返回候选,不做 RNG)。
 *
 * 这里只暴露纯函数 + 数据结构,RNG/decision 留给 AutotileCommand 调用方。
 */

export const NEIGHBOR_DIRECTIONS = [
	"topLeft",
	"top",
	"topRight",
	"right",
	"bottomRight",
	"bottom",
	"bottomLeft",
	"left",
] as const;

export type NeighborDirection = (typeof NEIGHBOR_DIRECTIONS)[number];

/**
 * 4-bit-per-direction × 8 directions = 32-bit number 作 hash key。
 * terrain id 范围 0..14;15 (0xf) 作 NO_NEIGHBOR / wildcard 哨兵。
 * v1 限制最多 15 个 terrain per terrain set,足够 Godot 47-tile Wang 集。
 */
export const NO_NEIGHBOR = 0xf;
export const MAX_TERRAIN_ID = 14;

export interface PeeringBitsRecord {
	[direction: string]: number;
}

export interface AutotileCandidate {
	sourceSlot: number;
	col: number;
	row: number;
	altIdx: number;
	probability: number;
	terrain: number;
}

export interface PeeringBitMatchResult {
	candidates: AutotileCandidate[];
	exactMatch: boolean;
	bestHammingDistance: number;
}

/** 8 dirs × 4 bits = 32-bit number key. terrain id 限制 0..14。 */
function packBits(values: number[]): number {
	let key = 0;
	for (let i = 0; i < 8; i++) {
		const v = (values[i] ?? NO_NEIGHBOR) & 0xf;
		key |= v << (i * 4);
	}
	return key >>> 0;
}

function readNibble(key: number, slot: number): number {
	return (key >>> (slot * 4)) & 0xf;
}

/**
 * Build the index from a TileSet's terrainSet candidates.
 *
 * `candidates` is the flat list of all (sourceSlot, col, row, altIdx) belonging
 * to the given terrainSet, each with optional peeringBits + probability.
 */
export class PeeringBitIndex {
	private exact = new Map<number, AutotileCandidate[]>();
	private wildcards: Array<{ key: number; mask: number; candidate: AutotileCandidate }> = [];

	constructor(public readonly terrainSetIndex: number) {}

	add(candidate: AutotileCandidate, bits: PeeringBitsRecord | undefined): void {
		const present: number[] = [];
		const mask: number[] = [];
		for (let i = 0; i < 8; i++) {
			const dir = NEIGHBOR_DIRECTIONS[i]!;
			const v = bits?.[dir];
			if (v === undefined) {
				present.push(NO_NEIGHBOR);
				mask.push(0); // wildcard nibble
			} else {
				present.push(v & 0xf);
				mask.push(0xf); // exact nibble required
			}
		}
		const key = packBits(present);
		const maskKey = packBits(mask);
		const isFullExact = mask.every((m) => m === 0xf);
		if (isFullExact) {
			const list = this.exact.get(key) ?? [];
			list.push(candidate);
			this.exact.set(key, list);
		} else {
			this.wildcards.push({ key, mask: maskKey, candidate });
		}
	}

	/**
	 * Match an `actual` neighborhood:8 byte values, NO_NEIGHBOR for "empty".
	 *
	 * Returns the set of best-matching candidates (Hamming distance 0 = exact).
	 * If no candidate matches at any distance, returns empty list.
	 */
	match(actual: number[]): PeeringBitMatchResult {
		const key = packBits(actual);
		const exact = this.exact.get(key);
		if (exact && exact.length > 0) {
			return { candidates: exact.slice(), exactMatch: true, bestHammingDistance: 0 };
		}

		let bestDist = Infinity;
		let pool: AutotileCandidate[] = [];
		for (const { key: candKey, mask, candidate } of this.wildcards) {
			let dist = 0;
			let viable = true;
			for (let slot = 0; slot < 8; slot++) {
				const m = readNibble(mask, slot);
				if (m === 0) continue; // wildcard slot
				const a = readNibble(key, slot);
				const b = readNibble(candKey, slot);
				if (a !== b) {
					dist++;
					if (dist > bestDist) {
						viable = false;
						break;
					}
				}
			}
			if (!viable) continue;
			if (dist < bestDist) {
				bestDist = dist;
				pool = [candidate];
			} else if (dist === bestDist) {
				pool.push(candidate);
			}
		}

		// Also consider exact buckets with masked dirs - matters when the actual
		// has NO_NEIGHBOR slots that the exact entries can satisfy via wildcards.
		// (Not needed in v1 — exact entries by definition have no wildcards.)

		return { candidates: pool, exactMatch: false, bestHammingDistance: bestDist === Infinity ? -1 : bestDist };
	}

	get exactBucketCount(): number {
		return this.exact.size;
	}

	get wildcardCount(): number {
		return this.wildcards.length;
	}
}

/**
 * Probability-weighted picker — deterministic when seed is provided.
 */
export function pickAutotileCandidate(
	candidates: AutotileCandidate[],
	rng: () => number
): AutotileCandidate | null {
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0]!;
	const totalProb = candidates.reduce((sum, c) => sum + (c.probability > 0 ? c.probability : 1), 0);
	const t = rng() * totalProb;
	let acc = 0;
	for (const c of candidates) {
		acc += c.probability > 0 ? c.probability : 1;
		if (t < acc) return c;
	}
	return candidates[candidates.length - 1]!;
}
