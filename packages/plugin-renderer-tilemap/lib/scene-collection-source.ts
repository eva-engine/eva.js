/**
 * SceneCollection source(H2)。
 *
 * 与 atlas source 并列;一个 sceneCollection source 的 tile 对应一个 prefab name,
 * runtime 在 buildLayer 时不 instantiate sprite,而是 instantiate prefab(走 host 注入
 * 的 prefab factory)。
 *
 * 本文件只 ship 解析 helper + 实例化接口,真实 prefab instantiation 留给 host
 * (DSLRenderer 通常已经有 prefab → GameObject 的 builder)。
 */

import type { TilesetSourceRaw } from "./tileset-types";

export interface SceneCollectionPrefabRef {
	sourceId: string;
	prefabName: string;
	/**
	 * 在 source 内的索引(等价 atlas 的 atlasCoords;UI 上以 0-based 列出)。
	 */
	index: number;
}

/**
 * 把 sceneCollection source 展开成 prefab ref 数组。
 */
export function expandSceneCollectionSource(src: TilesetSourceRaw): SceneCollectionPrefabRef[] {
	if (src.kind !== "sceneCollection") return [];
	return src.prefabRefs.map((p, i) => ({ sourceId: src.id, prefabName: p, index: i }));
}

/**
 * 给定 packed cell + source 列表,查这个 cell 对应的 prefab name(如果是 scene-collection
 * source);atlas source 返回 null。
 */
export function resolveCellPrefabName(packed: number, sourcesBySlot: TilesetSourceRaw[]): string | null {
	const slot = packed & 0xff;
	if (slot === 0) return null;
	const src = sourcesBySlot[slot - 1];
	if (!src || src.kind !== "sceneCollection") return null;
	const col = (packed >>> 8) & 0xff;
	// scene-collection 只用 col 作为 index(row 保留 0)
	return src.prefabRefs[col] ?? null;
}
