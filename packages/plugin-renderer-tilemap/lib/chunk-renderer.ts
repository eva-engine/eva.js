/**
 * Chunk render strategy(Phase 4).
 *
 * 当前 system.ts 直接走 sprite-entity 路径(每非空 cell 一个 PIXI.Sprite),
 * 简单可靠。Phase 4 引入 strategy 接口为后续 Mesh 路径预留位置:
 *   - sprite:Phase 1 MVP 路径,适合 < 4096 个 cell / chunk 数 < 30 的场景
 *   - mesh: 单 chunk 一次 draw call,适合 200×200 60% 填充等高密度
 *   - auto: 按 chunk 内非空 cell 数与 atlas 数动态选择
 *
 * 这里只 ship strategy interface + sprite 实现 + auto-pick 阈值;实际 PIXI.Mesh
 * shader 在下一轮 cycle 落地(见 ADR-0018 §11 未决问题 2)。
 */

export type ChunkRenderStrategyKind = 'sprite' | 'mesh' | 'auto';

export interface ChunkRenderStrategyContext {
	nonEmptyCellsInChunk: number;
	atlasesInChunk: number;
	totalChunksVisible: number;
	preference?: ChunkRenderStrategyKind;
}

/**
 * 决定单个 chunk 走哪条渲染路径。
 *
 * 阈值来源于 ADR-0018 §10 风险登记册(Phase 4 P2-7 改造):
 * - 单 chunk 非空 cell 数 >= 192 (75%) 且单 atlas → mesh
 * - 多 atlas → sprite(等 texture-array 支持后再切 mesh)
 * - 否则 sprite 简单稳定
 */
export function resolveChunkRenderStrategy(ctx: ChunkRenderStrategyContext): ChunkRenderStrategyKind {
	if (ctx.preference && ctx.preference !== 'auto') return ctx.preference;
	if (ctx.atlasesInChunk > 1) return 'sprite';
	if (ctx.nonEmptyCellsInChunk >= 192) return 'mesh';
	return 'sprite';
}

/**
 * 估算单个 chunk 在 sprite 路径下的额外 PIXI 节点开销(用于 perf-probe)。
 */
export function estimateSpriteNodes(nonEmptyCellsInChunk: number): number {
	// 1 Container + N Sprites
	return 1 + nonEmptyCellsInChunk;
}
