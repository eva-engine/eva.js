/**
 * TileAnimation driver (Phase 3).
 *
 * 纯计算层:输入 TilesetDocumentRaw 的 atlas.tiles[].animation,以及当前
 * 时间(performance.now() 风格的 ms);输出每个 tile 当前应处的 atlasCoords。
 *
 * Phase 3 v1 只支持 sync phase;randomStart 留接口,实现为按 sourceSlot+col+row
 * 派生确定性 phase offset(避免 Date.now / Math.random,见 memory)。
 *
 * 运行时 System 在 update() 时调用 advance(now),拿到 dirtyTilesByKey,
 * 然后只重建那些 tile 所在的 chunk;不每帧重建整个 layer。
 */

import type { TilesetDocumentRaw } from './tileset-types';

export interface TileAnimationKey {
	sourceSlot: number;
	col: number;
	row: number;
}

export interface TileAnimationFrame {
	col: number;
	row: number;
	durationMs: number;
}

export interface CompiledTileAnimation {
	sourceSlot: number;
	col: number;
	row: number;
	frames: TileAnimationFrame[];
	totalDurationMs: number;
	phase: 'sync' | 'randomStart';
	phaseOffsetMs: number;
}

export interface AdvanceResult {
	/** key = `${slot},${col},${row}` → 当前帧 atlas (col,row) */
	currentFrames: Map<string, { col: number; row: number }>;
	/** key set:相比上次 advance() 改变了 currentFrame 的 tiles。 */
	dirtyKeys: Set<string>;
}

export class TileAnimationDriver {
	private animations: CompiledTileAnimation[] = [];
	private lastFrameIdxByKey = new Map<string, number>();

	loadFromTileset(raw: TilesetDocumentRaw): void {
		this.animations = [];
		this.lastFrameIdxByKey.clear();
		for (let slotIdx = 0; slotIdx < raw.sources.length; slotIdx++) {
			const src = raw.sources[slotIdx]!;
			if (src.kind !== 'atlas') continue;
			const slot = slotIdx + 1;
			for (const tile of src.tiles) {
				const anim = (tile as { animation?: unknown }).animation as
					| {
							stepMs: number;
							frames: Array<{ atlasCoords: { col: number; row: number }; durationFactor?: number }>;
							phase?: 'sync' | 'randomStart';
					  }
					| null
					| undefined;
				if (!anim || !anim.frames || anim.frames.length === 0) continue;
				const frames = anim.frames.map((f) => ({
					col: f.atlasCoords.col,
					row: f.atlasCoords.row,
					durationMs: anim.stepMs * (f.durationFactor ?? 1),
				}));
				const totalDurationMs = frames.reduce((s, f) => s + f.durationMs, 0);
				if (totalDurationMs <= 0) continue;
				const phaseOffsetMs =
					anim.phase === 'randomStart'
						? deterministicPhaseOffset(slot, tile.atlasCoords.col, tile.atlasCoords.row, totalDurationMs)
						: 0;
				this.animations.push({
					sourceSlot: slot,
					col: tile.atlasCoords.col,
					row: tile.atlasCoords.row,
					frames,
					totalDurationMs,
					phase: anim.phase ?? 'sync',
					phaseOffsetMs,
				});
			}
		}
	}

	get animationCount(): number {
		return this.animations.length;
	}

	/** True when (slot,col,row) is the source tile of an animation in this driver. */
	isAnimatedSource(slot: number, col: number, row: number): boolean {
		for (const a of this.animations) {
			if (a.sourceSlot === slot && a.col === col && a.row === row) return true;
		}
		return false;
	}

	advance(nowMs: number): AdvanceResult {
		const currentFrames = new Map<string, { col: number; row: number }>();
		const dirtyKeys = new Set<string>();
		for (const anim of this.animations) {
			const key = `${anim.sourceSlot},${anim.col},${anim.row}`;
			const t = ((nowMs + anim.phaseOffsetMs) % anim.totalDurationMs + anim.totalDurationMs) % anim.totalDurationMs;
			let acc = 0;
			let idx = 0;
			for (; idx < anim.frames.length; idx++) {
				acc += anim.frames[idx]!.durationMs;
				if (t < acc) break;
			}
			if (idx >= anim.frames.length) idx = anim.frames.length - 1;
			const frame = anim.frames[idx]!;
			currentFrames.set(key, { col: frame.col, row: frame.row });
			const prev = this.lastFrameIdxByKey.get(key);
			if (prev !== idx) {
				dirtyKeys.add(key);
				this.lastFrameIdxByKey.set(key, idx);
			}
		}
		return { currentFrames, dirtyKeys };
	}

	reset(): void {
		this.lastFrameIdxByKey.clear();
	}
}

/** 派生 phase offset。避免 Math.random / Date.now;只用 tile coordinates。 */
function deterministicPhaseOffset(slot: number, col: number, row: number, total: number): number {
	// Mulberry32-ish single iteration on a hashed seed
	let h = slot * 73856093 ^ col * 19349663 ^ row * 83492791;
	h = (h ^ (h >>> 13)) * 1274126177;
	h = h ^ (h >>> 16);
	const t = ((h >>> 0) / 0xffffffff);
	return Math.floor(t * total);
}
