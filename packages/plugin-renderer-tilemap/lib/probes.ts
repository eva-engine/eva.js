/**
 * Tilemap performance probes(Sprint C B3,关联 ADR-0013)。
 *
 * 提供 11 个 probe(11 计时器 / 计数器),host 可通过 installTilemapPerfProbes(game)
 * 把它们注册到 ADR-0013 的 installPerfProbes 命令式 API 中。
 *
 * 当前不直接依赖 ADR-0013 的 perf 包(避免循环依赖),改为暴露 PerfProbeRegistry
 * 接口,host 注入。这样:
 *   - Phase B 门禁:budgetCoverage 通过这 11 个 probe 计入
 *   - 测试场景:host 可注入 in-memory 收集器 verify metrics
 */

export interface PerfProbeRegistry {
  /** 计时 probe — 调 begin → 操作 → end,记录耗时。 */
  beginTiming(name: string): void;
  endTiming(name: string): void;
  /** 计数 probe — 累加。 */
  count(name: string, delta?: number): void;
  /** 距离值 probe — gauge,记录当前瞬时值。 */
  gauge(name: string, value: number): void;
  /** 分布 probe — histogram(可选)。 */
  histogram?(name: string, value: number): void;
}

/** Probe 名称常量,与 ADR-0018 §4.6 表对齐。 */
export const TILEMAP_PROBE_NAMES = {
  DIRTY_REBUILD_MS: 'tilemap.dirtyRebuild.ms',
  CULL_CHECK_MS: 'tilemap.cullCheck.ms',
  ANIM_TICK_MS: 'tilemap.animTick.ms',
  DRAWCALLS_COUNT: 'tilemap.drawcalls.count',
  DRAWCALLS_BY_ATLAS: 'tilemap.drawcalls.byAtlas',
  PHYSICS_REBAKE_MS: 'tilemap.physicsRebake.ms',
  GPU_UPLOAD_MS: 'tilemap.gpuUpload.ms',
  GPU_UPLOAD_BYTES: 'tilemap.gpuUpload.bytes',
  AUTOTILE_MS: 'tilemap.autotile.ms',
  PATCH_APPLY_MS: 'tilemap.patchApply.ms',
  DIRTY_PENDING: 'tilemap.dirty.pending',
  DIRTY_FRAMES_BEHIND: 'tilemap.dirty.framesBehind',
  BODIES_TOTAL: 'tilemap.bodies.total',
  BODIES_CREATED: 'tilemap.bodies.created',
  BODIES_DESTROYED: 'tilemap.bodies.destroyed',
  /**
   * ChunkRenderStrategy dispatch counters(P1-3, ADR-0018 §Phase 4).
   * 每构建一个 chunk emit 一次,分别记录 sprite / mesh / mesh-降级-sprite 的次数。
   */
  STRATEGY_SPRITE_COUNT: 'tilemap.strategy.sprite.count',
  STRATEGY_MESH_COUNT: 'tilemap.strategy.mesh.count',
  STRATEGY_MESH_FALLBACK_COUNT: 'tilemap.strategy.meshFallback.count',
  /**
   * SceneCollection cell skip counter(P1-4, ADR-0018 §H2).
   * 当 TileMap chunk 内含 sceneCollection source 的 cell 时,runtime 暂时跳过(不渲染),
   * 每跳过一次累加 1。配合每条 record 一次性 console.warn,提示需要 prefab placeholder 实现。
   */
  SCENECOLLECTION_SKIPPED_COUNT: 'tilemap.sceneCollection.skipped.count',
  /**
   * Viewport culling hits counter(C-2, ADR-0018 §Phase 4)。
   * 每次 buildChunksForLayer 跳过一个 off-screen chunk 时累加 1。
   * 当前 record-level `cullingBoundsHint` 由 host 注入(可选),未注入时该 probe 永远为 0。
   * 真正的 camera-driven viewport 接入留下 cycle(参考 RendererSystem.application.renderer.view)。
   */
  CULL_HITS_COUNT: 'tilemap.cull.hits',
  /**
   * Mode-switch failure counter(T-L2, Phase L)。
   * 当 handleChange 内部 v1↔v2 mode 切换时,新 mode 的 asset 加载失败导致旧 mode 已 teardown
   * 又 build 不出来的情况:record.mode='unknown',probe 累加 1。host 看到 >0 表示 tilemap 资源
   * 异常,需要诊断 tilemapRef/tileset 引用是否有效。
   */
  MODE_SWITCH_FAILED_COUNT: 'tilemap.modeSwitch.failed',
  /**
   * Animation tick error counter(T-N1, Phase N)。
   *
   * update() 内每帧 advance 每个 animation driver。某个 driver advance / 后续 sprite swap
   * throw 时,本 probe +1 并 console.error 之,但不影响其他 entity 的 tick(try/catch 局部
   * 包裹,外层 try/finally 确保 ANIM_TICK_MS endTiming 一定被调)。host 看到该 probe >0 表示
   * tilemap 有 entity 的 animation pipeline 异常,需要诊断。
   */
  ANIM_TICK_ERROR_COUNT: 'tilemap.animTick.error.count',
  /**
   * WebGL context lost counter(T-N2, Phase N)。
   *
   * Eva runtime 监听 canvas 的 `webglcontextlost`,触发时本 probe +1,并把 record-level
   * `contextLost = true` 暂停 tilemap update tick;`webglcontextrestored` 时清掉该标志。
   * host 看到 >0 即知 WebGL 异常,通常需要在 restored 后 force re-add tilemap component
   * 重新建几何。
   */
  CONTEXT_LOST_COUNT: 'tilemap.context.lost',
} as const;

/** 创建一个内存收集器(测试用)。 */
export function createInMemoryProbeRegistry(): PerfProbeRegistry & {
  timings: Map<string, number[]>;
  counts: Map<string, number>;
  gauges: Map<string, number>;
} {
  const inFlight = new Map<string, number>();
  const timings = new Map<string, number[]>();
  const counts = new Map<string, number>();
  const gauges = new Map<string, number>();

  return {
    beginTiming(name) {
      inFlight.set(name, nowMs());
    },
    endTiming(name) {
      const t0 = inFlight.get(name);
      if (t0 === undefined) return;
      inFlight.delete(name);
      const dur = nowMs() - t0;
      if (!timings.has(name)) timings.set(name, []);
      timings.get(name)!.push(dur);
    },
    count(name, delta = 1) {
      counts.set(name, (counts.get(name) ?? 0) + delta);
    },
    gauge(name, value) {
      gauges.set(name, value);
    },
    histogram(name, value) {
      this.count(`${name}.histN`);
      this.count(`${name}.histSum`, value);
    },
    timings,
    counts,
    gauges,
  };
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  // performance.now 不可用时返回 0(测试环境必有 performance,此分支几乎不走)
  return 0;
}

/**
 * Adapter:把 host 端 installPerfProbes 的 API 适配到 PerfProbeRegistry。
 *
 * ADR-0013 的 installPerfProbes 暴露 `game.perfProbes?.{begin,end,count,gauge}` 等
 * 命名空间。这里只做转发,host 决定具体接入哪个版本。
 */
export function adaptGamePerfProbes(game: { perfProbes?: Partial<PerfProbeRegistry> }): PerfProbeRegistry | null {
  const p = game?.perfProbes;
  if (!p) return null;
  return {
    beginTiming: p.beginTiming ?? (() => {}),
    endTiming: p.endTiming ?? (() => {}),
    count: p.count ?? (() => {}),
    gauge: p.gauge ?? (() => {}),
    histogram: p.histogram,
  };
}

/**
 * Coverage 计算 — Phase B 门禁要求 budgetCoverage ≥ 0.95。
 * 这里返回当前 hot-path 涉及的 probe 名字集合,host 用它对比 installPerfProbes 实际
 * 注册的 probe set。
 */
export function getRequiredTilemapProbes(): string[] {
  return Object.values(TILEMAP_PROBE_NAMES);
}
