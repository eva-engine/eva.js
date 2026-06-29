/**
 * Host-side stop-gap for ADR-0019 plugin-matterjs `registerBodySource` API.
 *
 * Until the matter-side `registerBodySource` PR lands (ADR-0019 Phase 1), the
 * tilemap plugin cannot push BodyDefinition[] directly into Matter.World.
 * This module gives the host a thin adapter: pull BodyDefinition[] out of the
 * tilemap record, hand them to a host-supplied registrar that knows how to
 * create one Matter.Body per def (typically by spawning child GameObjects with
 * Physics components, since that path is already wired through plugin-matterjs).
 *
 * Once ADR-0019 ships, this adapter is replaced by a direct registry handshake
 * inside system.ts and this file becomes deprecated; the deprecation is one
 * import-line change for hosts.
 */

import { buildTileMapStaticBodies, type TileMapStaticBodyInput } from "./tilemap-static-body";
import type { BodyDefinition, BodySourceContext } from "./body-source-registry";
import { TILEMAP_PROBE_NAMES, type PerfProbeRegistry } from "../probes";

export interface TileMapStaticBodyHostBuildResult {
	bodies: BodyDefinition[];
	/** Per-cell body count summary for diagnostics + perf probe `tilemap.bodies.total` gauge. */
	totalBodyCount: number;
	/** Bodies grouped by layerId (from BodyDefinition.metadata.layerId). */
	bodiesByLayerId: Map<string, BodyDefinition[]>;
}

/**
 * Build BodyDefinition[] for a TileMap entity and group by physics layer.
 *
 * The host is expected to call this after `system.handleAdd` resolves and the
 * record has its `loadedTileset`. The host passes:
 *   - chunksByKey from `decodeChunk(layer.cellData.chunks[key])`
 *   - physicsByCellKey derived from `loadedTileset.raw.sources[i].tiles[j].alternatives[k].physics`
 *
 * This keeps the runtime plugin agnostic of how the host actually registers bodies
 * with Matter (child GameObject + Physics component vs. direct Matter.Composite.add).
 */
export function buildTileMapStaticBodyDefinitions(
	input: TileMapStaticBodyInput,
	ctx: BodySourceContext,
	/**
	 * T-L3 (Phase L):optional probe registry。当 host 注入时,本函数会:
	 *   - PHYSICS_REBAKE_MS:wrap 整个 buildTileMapStaticBodies 调用计时
	 *   - BODIES_TOTAL:emit gauge,反映当前生成的 body 总数
	 *   - BODIES_CREATED:counter+totalBodyCount,统计累计 created
	 * 不注入时 silent no-op,保持与现有 caller 行为兼容。
	 * BODIES_DESTROYED 暂未 emit(无清晰 destroy point),Cycle 2 再补。
	 */
	probes?: PerfProbeRegistry
): TileMapStaticBodyHostBuildResult {
	probes?.beginTiming(TILEMAP_PROBE_NAMES.PHYSICS_REBAKE_MS);
	let bodies: BodyDefinition[];
	try {
		bodies = buildTileMapStaticBodies(input, ctx);
	} finally {
		probes?.endTiming(TILEMAP_PROBE_NAMES.PHYSICS_REBAKE_MS);
	}
	const bodiesByLayerId = new Map<string, BodyDefinition[]>();
	for (const b of bodies) {
		const layerId = (b.metadata?.layerId as string | undefined) ?? "<unlabeled>";
		let bucket = bodiesByLayerId.get(layerId);
		if (!bucket) {
			bucket = [];
			bodiesByLayerId.set(layerId, bucket);
		}
		bucket.push(b);
	}
	const totalBodyCount = bodies.length;
	probes?.gauge(TILEMAP_PROBE_NAMES.BODIES_TOTAL, totalBodyCount);
	if (totalBodyCount > 0) {
		probes?.count(TILEMAP_PROBE_NAMES.BODIES_CREATED, totalBodyCount);
	}
	return { bodies, totalBodyCount, bodiesByLayerId };
}

/**
 * Extract `physicsByCellKey` Map from a LoadedTileset's raw atlas tile data.
 *
 * Each tile alternative may carry `physics: Array<{ layerId, polygons, oneWay, friction, restitution }>`.
 * The returned Map is keyed by `${slot},${col},${row},${altIdx}` matching the cell-packed
 * id format used by `buildTileMapStaticBodies`.
 */
export function extractPhysicsByCellKey(
	tilesetRaw: {
		sources: Array<{
			kind: string;
			tiles?: Array<{
				atlasCoords: { col: number; row: number };
				alternatives: Array<{
					altId: number;
					physics?: Array<{
						layerId: string;
						polygons: Array<{ points: Array<{ x: number; y: number }>; origin?: "center" | "topLeft" }>;
						oneWay?: boolean;
						friction?: number;
						restitution?: number;
					}>;
				}>;
			}>;
		}>;
	}
): TileMapStaticBodyInput["physicsByCellKey"] {
	const out: TileMapStaticBodyInput["physicsByCellKey"] = new Map();
	for (let slotIdx = 0; slotIdx < tilesetRaw.sources.length; slotIdx++) {
		const src = tilesetRaw.sources[slotIdx];
		if (!src || src.kind !== "atlas" || !src.tiles) continue;
		const slot = slotIdx + 1; // 1-based to match unpackSlot
		for (const tile of src.tiles) {
			const { col, row } = tile.atlasCoords;
			for (const alt of tile.alternatives) {
				if (!alt.physics || alt.physics.length === 0) continue;
				const key = `${slot},${col},${row},${alt.altId & 0x1f}`;
				out.set(key, alt.physics);
			}
		}
	}
	return out;
}

/**
 * Status flag — true once ADR-0019 lands and this host stop-gap can be removed.
 *
 * Hosts can branch on this to switch from the child-GameObject workaround to a
 * direct registry handshake. Until then, importing this module signals "I am
 * using the pre-ADR-0019 path".
 */
export const ADR_0019_NATIVE_REGISTRY_AVAILABLE = false;
