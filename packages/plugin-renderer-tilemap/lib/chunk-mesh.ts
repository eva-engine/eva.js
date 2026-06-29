/**
 * ChunkMesh 渲染路径(Sprint C B1 — 框架已铺,shader 在 Cycle 2 落地)。
 *
 * Phase 4 真实 PIXI.Mesh + 自定义 vert/frag 在 PIXI v8 上需要 ProgramSource + GeometrySystem,
 * 改动量较大,需要单独的 bench。本 cycle 先 ship 接口形态 + sprite-entity fallback,
 * 让 ChunkRenderer 策略层可以选择"mesh-path",当 mesh 不可用时自动回退 sprite。
 *
 * 单一职责:
 *   - 描述 "一个 chunk 通过 Mesh 渲染" 的契约
 *   - 提供降级到 sprite 路径的 builder
 *
 * 真实 Mesh shader 实现见 ADR-0018 §Phase 4 — 在浏览器 PIXI WebGL 稳定后接入。
 */

import { Container } from 'pixi.js';

export interface ChunkMeshConfig {
  chunkKey: string;
  chunkX: number;
  chunkY: number;
  cellWidth: number;
  cellHeight: number;
  /** Atlas 纹理 — Mesh shader 通过 uTexture 采样。 */
  atlas: unknown;
  /** Cell record array (256 ints) — 用于 vertex attribute upload。 */
  cells: Int32Array;
  /** Tile region width / height in atlas (regionSize)。 */
  regionWidth: number;
  regionHeight: number;
  /** atlas margins / separation,用于 UV 计算。 */
  margins?: { x: number; y: number };
  separation?: { x: number; y: number };
}

/**
 * 创建一个 chunk 的 Mesh-path render container。
 *
 * 当前实现:返回 Container stub。Cycle 2 接入真实 PIXI.Mesh + 自定义 shader 时
 * 替换内部实现即可,调用方接口不变(返回 Container,由 ChunkRenderer 加到 stage)。
 *
 * 接口稳定保证:
 *   - 返回 Container 必须有 children 数组(Container 默认即有)
 *   - 返回的 Container 在 destroy() 时正确释放纹理
 */
export function buildChunkMesh(_config: ChunkMeshConfig): Container {
  const container = new Container();
  container.label = `chunk-mesh-stub-${_config.chunkKey}`;
  // Mesh path 在 Cycle 2 实际接入。当前返回 empty container —— ChunkRenderer 会通过
  // resolveChunkRenderStrategy 看到 mesh 不可用而降级到 sprite 路径。
  return container;
}

/** 返回 true 表示当前环境支持 Mesh path(需要 WebGL2 + Program shader)。 */
export function isMeshPathAvailable(): boolean {
  // Cycle 2 落地后改为真实探测。当前一律 false,触发 sprite-entity 路径。
  return false;
}

/**
 * 估算单 chunk Mesh path 占用 GPU memory(单位 KB)。
 * 用于 perf probes,Mesh path 上线后 budget 监控参考。
 */
export function estimateChunkMeshMemoryKB(config: ChunkMeshConfig): number {
  // vertex buffer:每 cell 4 vertices × (xy + uv + flags) ≈ 32B/cell
  // index buffer:6 indices/cell × 2B = 12B/cell
  // cells = 256
  const cellsBytes = 256 * (32 + 12);
  // atlas texture allocation 不算 chunk 私有
  void config;
  return Math.ceil(cellsBytes / 1024);
}
