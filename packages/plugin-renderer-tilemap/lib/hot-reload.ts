/**
 * TileSet hot reload(H1)。
 *
 * dev mode 用文件 watcher 监听 `.tileset.json` 变化,变化时:
 *   1. 重新 parse JSON → 新 TilesetDocumentRaw
 *   2. diff 与旧版的 sources / tiles
 *   3. 只 mark **受影响 cell 所在 chunk** dirty,不 rebuild 整 layer
 *
 * 本文件只 ship diff 与计算 affected cells 的纯函数。host(dev server 或 VSCode
 * extension)负责文件 watch + 把新 raw 通过 resource.reload() 喂给运行时,运行时
 * 调 `diffTilesetForChunkRebuild` + `computeAffectedChunks` 获取要 rebuild 的
 * chunk set。
 *
 * ## 职责边界:source/tile-level coarse diff(plugin 内部 SSE pipeline 用)
 *
 * 这里的 `diffTilesetForChunkRebuild` 是 **chunk-rebuild 决策粒度** 的 diff:
 * 只关心 "哪些 source 增删改 / 哪些 (col,row) tile key 变了",输出直接喂
 * `computeAffectedChunks` 计算受影响 chunk set。它故意不下沉到 alternatives /
 * animation / customData / physics / terrain 字段级别 — 任意一个变了对 chunk
 * rebuild 的结论都一样(就是 rebuild)。
 *
 * 如果消费方是 **host UX 层**(显示 schema-level changes for AI revision / git-
 * style preview / inspector diff 提示),需要的是 document-level detailed diff
 * — 见 `@ali/eva-dsl` 的 `diffTilesetDocuments`(`libs/dsl/src/editor/tileset-
 * diff.ts`),它会按 alternatives / animation / customData / physics / terrain
 * 分桶报告每个 tile 的具体变化。
 *
 * 同名警告:历史上本文件的 `diffTilesetDocuments` 与 dsl 端同名但职责不同,
 * 已改名为 `diffTilesetForChunkRebuild`;旧名保留 alias 供过渡。
 */

import type { TilesetDocumentRaw, TilesetSourceRaw } from "./tileset-types";

export interface TilesetChunkRebuildDiff {
	addedSources: TilesetSourceRaw[];
	removedSourceIds: string[];
	changedSourceIds: string[];
	addedTilesByKey: Set<string>;
	removedTilesByKey: Set<string>;
	changedTilesByKey: Set<string>;
}

/**
 * @deprecated Use `TilesetChunkRebuildDiff`. Alias kept for transitional
 * compatibility; will be removed once consumers migrate.
 */
export type TilesetDiff = TilesetChunkRebuildDiff;

/**
 * 计算两个 TilesetDocumentRaw 之间的 source/tile-level coarse diff,供
 * `computeAffectedChunks` 决定哪些 chunk 要 rebuild。
 *
 * 不要与 `@ali/eva-dsl` 的 `diffTilesetDocuments` 混淆 — 后者是 document-level
 * detailed diff(per alternative / animation / customData / physics / terrain),
 * 用于 host UX 显示,不是 chunk-rebuild 决策。
 */
export function diffTilesetForChunkRebuild(
	prev: TilesetDocumentRaw,
	next: TilesetDocumentRaw
): TilesetChunkRebuildDiff {
	const prevSources = new Map<string, TilesetSourceRaw>();
	const nextSources = new Map<string, TilesetSourceRaw>();
	for (const s of prev.sources) prevSources.set(s.id, s);
	for (const s of next.sources) nextSources.set(s.id, s);

	const addedSources: TilesetSourceRaw[] = [];
	const removedSourceIds: string[] = [];
	const changedSourceIds: string[] = [];
	for (const id of nextSources.keys()) {
		if (!prevSources.has(id)) addedSources.push(nextSources.get(id)!);
		else if (JSON.stringify(prevSources.get(id)) !== JSON.stringify(nextSources.get(id))) changedSourceIds.push(id);
	}
	for (const id of prevSources.keys()) {
		if (!nextSources.has(id)) removedSourceIds.push(id);
	}

	const addedTilesByKey = new Set<string>();
	const removedTilesByKey = new Set<string>();
	const changedTilesByKey = new Set<string>();

	const indexTiles = (src: TilesetSourceRaw): Map<string, unknown> => {
		const m = new Map<string, unknown>();
		if (src.kind !== "atlas") return m;
		for (const t of src.tiles) m.set(`${src.id}/${t.atlasCoords.col},${t.atlasCoords.row}`, t);
		return m;
	};

	for (const [id, src] of nextSources) {
		const prevSrc = prevSources.get(id);
		if (!prevSrc) {
			const tiles = indexTiles(src);
			for (const k of tiles.keys()) addedTilesByKey.add(k);
			continue;
		}
		const a = indexTiles(prevSrc);
		const b = indexTiles(src);
		for (const k of b.keys()) {
			if (!a.has(k)) addedTilesByKey.add(k);
			else if (JSON.stringify(a.get(k)) !== JSON.stringify(b.get(k))) changedTilesByKey.add(k);
		}
		for (const k of a.keys()) {
			if (!b.has(k)) removedTilesByKey.add(k);
		}
	}

	for (const id of removedSourceIds) {
		const a = indexTiles(prevSources.get(id)!);
		for (const k of a.keys()) removedTilesByKey.add(k);
	}

	return { addedSources, removedSourceIds, changedSourceIds, addedTilesByKey, removedTilesByKey, changedTilesByKey };
}

/**
 * @deprecated Use `diffTilesetForChunkRebuild`. Alias kept for transitional
 * compatibility — the name collided with `@ali/eva-dsl`'s `diffTilesetDocuments`
 * (document-level detailed diff for host UX), which has different semantics.
 */
export const diffTilesetDocuments = diffTilesetForChunkRebuild;

/**
 * 给定 diff 结果 + 文档 chunks(`chunkKey → Int32Array`),返回需要 rebuild 的 chunk key set。
 *
 * 算法:遍历所有 chunks,对每个非空 cell,如果它引用的 atlas (sourceSlot, col, row) 在 changed
 * /removed/added tile set 里,标记该 chunk dirty。
 */
export function computeAffectedChunks(
	chunks: Record<string, Int32Array>,
	sourceIdBySlot: Map<number, string>,
	diff: TilesetChunkRebuildDiff
): Set<string> {
	const dirty = new Set<string>();
	const cellKeyMatches = (cellSlot: number, col: number, row: number): boolean => {
		const sourceId = sourceIdBySlot.get(cellSlot);
		if (!sourceId) return false;
		const k = `${sourceId}/${col},${row}`;
		return diff.changedTilesByKey.has(k) || diff.removedTilesByKey.has(k) || diff.addedTilesByKey.has(k);
	};
	for (const [chunkKey, arr] of Object.entries(chunks)) {
		for (let i = 0; i < arr.length; i++) {
			const packed = arr[i]!;
			const slot = packed & 0xff;
			if (slot === 0) continue;
			const col = (packed >>> 8) & 0xff;
			const row = (packed >>> 16) & 0xff;
			if (cellKeyMatches(slot, col, row)) {
				dirty.add(chunkKey);
				break;
			}
		}
	}
	return dirty;
}
