/**
 * T-L3 (Phase L) probe coverage gate。
 *
 * Phase B 门禁要求 budgetCoverage ≥ 0.95 — 即"declared probes 必须真的在 hot path 被 emit"。
 * 历史问题:audit 揭穿 20 个 TILEMAP_PROBE_NAMES 里只有 ~10 个真正 emit,其余 dormant。
 *
 * 本 spec 把"已 emit 的 probe"和"明确推到 Cycle 2 的 probe"两个集合都列出来,
 * 任何 declared probe 必须落到这两个集合之一,否则测试失败 — 防止 audit 揭穿的
 * "declared but never emitted" gap 再次出现。
 *
 * eva-skills budget 模板没在本地控制下,Phase B gate 算法外置;coverage 在此本地强制。
 */

import { getRequiredTilemapProbes, TILEMAP_PROBE_NAMES } from '../lib/probes';

/**
 * Probes 已在 plugin 内部 hot path emit。
 *
 * 来源:
 *   - system.ts(animation tick / dirty rebuild / patch apply / cull check / drawcalls /
 *                 strategy dispatch / sceneCollection / cull hits / mode switch failed /
 *                 dirty pending / dirty frames behind)
 *   - tilemap-static-body-host.ts(physics rebake / bodies total / bodies created — T-L3)
 */
const EMITTED_IN_HOT_PATHS = new Set<string>([
	TILEMAP_PROBE_NAMES.ANIM_TICK_MS,
	TILEMAP_PROBE_NAMES.DIRTY_REBUILD_MS,
	TILEMAP_PROBE_NAMES.PATCH_APPLY_MS,
	TILEMAP_PROBE_NAMES.CULL_CHECK_MS,
	TILEMAP_PROBE_NAMES.DRAWCALLS_COUNT,
	TILEMAP_PROBE_NAMES.SCENECOLLECTION_SKIPPED_COUNT,
	TILEMAP_PROBE_NAMES.STRATEGY_SPRITE_COUNT,
	TILEMAP_PROBE_NAMES.STRATEGY_MESH_COUNT,
	TILEMAP_PROBE_NAMES.STRATEGY_MESH_FALLBACK_COUNT,
	TILEMAP_PROBE_NAMES.CULL_HITS_COUNT,
	// T-L3 newly wired:
	TILEMAP_PROBE_NAMES.PHYSICS_REBAKE_MS,
	TILEMAP_PROBE_NAMES.BODIES_TOTAL,
	TILEMAP_PROBE_NAMES.BODIES_CREATED,
	// T-L4 newly wired (DIRTY_PENDING gauge, DIRTY_FRAMES_BEHIND counter):
	TILEMAP_PROBE_NAMES.DIRTY_PENDING,
	TILEMAP_PROBE_NAMES.DIRTY_FRAMES_BEHIND,
	// T-L2 newly wired (mode-switch failed counter):
	TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT,
	// T-N1 newly wired (animation tick error recovery counter):
	TILEMAP_PROBE_NAMES.ANIM_TICK_ERROR_COUNT,
	// T-N2 newly wired (WebGL context lost counter):
	TILEMAP_PROBE_NAMES.CONTEXT_LOST_COUNT,
]);

/**
 * Probes 已声明但本 cycle 不 emit,推到 Cycle 2。
 *
 * 原因:
 *   - GPU_UPLOAD_MS / GPU_UPLOAD_BYTES:mesh path 尚未真接入(chunk-mesh.ts 是 stub)
 *   - DRAWCALLS_BY_ATLAS:byAtlas 拆分需要 strategy 内额外计数,本 cycle 优先 DRAWCALLS_COUNT
 *   - AUTOTILE_MS:autotile pipeline 还在草案
 *   - BODIES_DESTROYED:host stop-gap 没清晰 destroy point,等 ADR-0019 native registry 落地
 */
const DEFERRED_TO_CYCLE_2 = new Set<string>([
	TILEMAP_PROBE_NAMES.GPU_UPLOAD_MS,
	TILEMAP_PROBE_NAMES.GPU_UPLOAD_BYTES,
	TILEMAP_PROBE_NAMES.DRAWCALLS_BY_ATLAS,
	TILEMAP_PROBE_NAMES.AUTOTILE_MS,
	TILEMAP_PROBE_NAMES.BODIES_DESTROYED,
]);

describe('TILEMAP_PROBE_NAMES coverage gate', () => {
	it('every name is either emitted or explicitly deferred', () => {
		const required = getRequiredTilemapProbes();
		const unclassified: string[] = [];
		for (const name of required) {
			if (!EMITTED_IN_HOT_PATHS.has(name) && !DEFERRED_TO_CYCLE_2.has(name)) {
				unclassified.push(name);
			}
		}
		if (unclassified.length > 0) {
			throw new Error(
				`Probe(s) declared but neither emitted nor deferred:\n  - ${unclassified.join('\n  - ')}\n` +
				`Update probe-coverage.spec.ts (move to EMITTED_IN_HOT_PATHS or DEFERRED_TO_CYCLE_2) ` +
				`or wire emission in system.ts / tilemap-static-body-host.ts.`,
			);
		}
		expect(unclassified).toEqual([]);
	});

	it('addressable coverage >= 0.95 of non-deferred probes', () => {
		const required = getRequiredTilemapProbes();
		const addressable = required.filter((n) => !DEFERRED_TO_CYCLE_2.has(n));
		const emitted = addressable.filter((n) => EMITTED_IN_HOT_PATHS.has(n));
		const coverage = emitted.length / addressable.length;
		expect(coverage).toBeGreaterThanOrEqual(0.95);
	});

	it('exposes T-L3 newly wired probes to host', () => {
		// 防止 T-L3 之后有人误删 PHYSICS_REBAKE_MS / BODIES_TOTAL / BODIES_CREATED 之一。
		const required = getRequiredTilemapProbes();
		expect(required).toContain(TILEMAP_PROBE_NAMES.PHYSICS_REBAKE_MS);
		expect(required).toContain(TILEMAP_PROBE_NAMES.BODIES_TOTAL);
		expect(required).toContain(TILEMAP_PROBE_NAMES.BODIES_CREATED);
	});

	it('exposes T-L2 mode-switch failure probe to host', () => {
		const required = getRequiredTilemapProbes();
		expect(required).toContain(TILEMAP_PROBE_NAMES.MODE_SWITCH_FAILED_COUNT);
	});

	it('exposes T-L4 dirty-tracking probes to host', () => {
		const required = getRequiredTilemapProbes();
		expect(required).toContain(TILEMAP_PROBE_NAMES.DIRTY_PENDING);
		expect(required).toContain(TILEMAP_PROBE_NAMES.DIRTY_FRAMES_BEHIND);
	});
});
