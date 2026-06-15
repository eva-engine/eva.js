/**
 * Engine-level performance probes for {@link Game}.
 *
 * 设计:
 * - 不修改 Game.ts 源码,通过 monkey-patch 各 `system.update / lateUpdate`
 *   收集 systems 阶段时长;通过夹在 ticker._tickers 头尾的 prologue/epilogue
 *   hook 收集整帧时长,gameObjects 时长 = frameMs - sum(systems 时长)。
 * - 滑动窗口(sampleSize)给出真实 FPS / 平均帧 / average frame。
 * - 每帧 budget 检查,连续 sustainedFrames 帧超标才告警(避免噪音)。
 * - 多次 install/uninstall 必须可重入,uninstall 必须把所有 patch 还原干净。
 * - headless(jest)友好:performance.now() 在 jsdom / Node 都有,不行才退到 Date.now。
 *
 * 详细背景见 ADR-0013。
 */

import type Game from './Game';
import type System from '../core/System';

/** Now() — 优先 performance.now(),否则 Date.now()。 */
const now: () => number = (() => {
  const perf: { now?: () => number } | undefined = (globalThis as any).performance;
  if (perf && typeof perf.now === 'function') {
    return perf.now.bind(perf) as () => number;
  }
  return () => Date.now();
})();

/**
 * 单帧采样数据。
 */
export interface PerfFrame {
  /** Ticker 给出的 frameCount */
  frameCount: number;
  /** 滑动窗口估算的真实 FPS(基于 frameMs 累计) */
  fps: number;
  /** 本帧总耗时(systems update+lateUpdate + gameObjects 循环),毫秒 */
  frameMs: number;
  /** 各 system 本帧的 update / lateUpdate 时长,毫秒 */
  systems: { name: string; updateMs: number; lateUpdateMs: number }[];
  /** 本帧 gameObjects 循环耗时,毫秒(估算 = frameMs - sum(systems)) */
  gameObjectsMs: number;
  /** 本帧 game.gameObjects 数量 */
  gameObjectCount: number;
}

/**
 * 性能预算配置。任一字段缺省即不检查该项。
 */
export interface PerfBudget {
  /** 单帧总耗时上限(ms),默认 16.67 */
  maxFrameMs?: number;
  /** 各 system 单独上限 — key 为 system.constructor.systemName 或 system.name */
  maxSystemMs?: { [name: string]: number };
  /** gameObject 数量上限(瞬时) */
  maxGameObjects?: number;
  /** 真实 FPS 下限,默认 30 */
  minFps?: number;
  /** 连续 N 帧超标才告警,默认 60 */
  sustainedFrames?: number;
}

/**
 * installPerfProbes 选项。
 */
export interface PerfProbeOptions {
  budget?: PerfBudget;
  /** 滑动窗口大小(帧),默认 60(约 1 秒) */
  sampleSize?: number;
  /** 触发 violation 时是否 console.warn,默认 true */
  warnOnViolation?: boolean;
}

/** Violation 回调 payload。 */
export interface PerfViolation {
  name: string;
  actual: number;
  threshold: number;
  frame: PerfFrame;
}

/** Probe 句柄。 */
export interface PerfProbesHandle {
  /** 最近一帧采样,无则返回 null */
  current(): PerfFrame | null;
  /** 滑动窗口平均(每帧字段独立平均),无则返回 null */
  average(): PerfFrame | null;
  /** 本次 install 周期内累计违规计数 */
  violations(): { name: string; count: number; last: number }[];
  /** 订阅每帧采样,返回 dispose 句柄 */
  onFrame(fn: (frame: PerfFrame) => void): () => void;
  /** 订阅 violation 触发,返回 dispose 句柄 */
  onViolation(fn: (v: PerfViolation) => void): () => void;
  /** 卸载所有 hook,把 system update 和 ticker._tickers 还原 */
  uninstall(): void;
}

/** 默认值集中放,跟 ADR-0013 一致。 */
const DEFAULT_SAMPLE_SIZE = 60;
const DEFAULT_MAX_FRAME_MS = 16.67;
const DEFAULT_MIN_FPS = 30;
const DEFAULT_SUSTAINED_FRAMES = 60;

/** 单个 system 的 patch 记录。uninstall 时还原。 */
interface SystemPatchRecord {
  system: System;
  origUpdate?: System['update'];
  origLateUpdate?: System['lateUpdate'];
  hadOwnUpdate: boolean;
  hadOwnLateUpdate: boolean;
}

/** Violation 状态机:每个 violation 字段独立追踪。 */
interface ViolationCounter {
  consec: number; // 当前连续超标帧数
  count: number; // 累计触发 onViolation 次数
  last: number; // 最近 actual 值
}

/**
 * 给一个 Game 实例装上性能探针。
 *
 * - 必须在 game 已经 init 之后调用(否则 game.ticker 还没有,会拒绝并打 warn)。
 * - install 之后再 addSystem 的 system,probes 会在每帧 epilogue 自动 patch。
 * - 同一 game 多次 install:旧 handle 应先 uninstall;否则两套 hook 会串扰。
 * - uninstall 后 install 必须能正常工作。
 */
export function installPerfProbes(game: Game, options: PerfProbeOptions = {}): PerfProbesHandle {
  const sampleSize = options.sampleSize ?? DEFAULT_SAMPLE_SIZE;
  const warnOnViolation = options.warnOnViolation ?? true;

  // 预算字段填默认值(只补 maxFrameMs / minFps / sustainedFrames;system / gameObjects 不强制)
  const budget: Required<Pick<PerfBudget, 'maxFrameMs' | 'minFps' | 'sustainedFrames'>> &
    PerfBudget = {
    maxFrameMs: options.budget?.maxFrameMs ?? DEFAULT_MAX_FRAME_MS,
    minFps: options.budget?.minFps ?? DEFAULT_MIN_FPS,
    sustainedFrames: options.budget?.sustainedFrames ?? DEFAULT_SUSTAINED_FRAMES,
    maxSystemMs: options.budget?.maxSystemMs,
    maxGameObjects: options.budget?.maxGameObjects,
  };

  // ---------- 内部状态 ----------
  // 当前帧累计的 systems 时长(在 epilogue 中清零并组装成 PerfFrame)
  const currentSystemTimes = new Map<System, { updateMs: number; lateUpdateMs: number }>();
  // 当前帧的整帧开始时刻(prologue 写,epilogue 读)
  let frameStart = 0;
  // 滑动窗口
  const window: PerfFrame[] = [];
  let lastFrame: PerfFrame | null = null;
  // patch 记录
  const patched = new Map<System, SystemPatchRecord>();
  // 订阅者
  const frameSubs = new Set<(f: PerfFrame) => void>();
  const violationSubs = new Set<(v: PerfViolation) => void>();
  // violation 状态机
  const violationCounters = new Map<string, ViolationCounter>();

  let uninstalled = false;

  // ---------- system patch ----------

  function patchSystem(system: System): void {
    if (patched.has(system)) return;
    const proto = Object.getPrototypeOf(system) ?? {};
    const hadOwnUpdate = Object.prototype.hasOwnProperty.call(system, 'update');
    const hadOwnLateUpdate = Object.prototype.hasOwnProperty.call(system, 'lateUpdate');
    const origUpdate = (system.update as System['update']) ?? (proto.update as System['update']);
    const origLateUpdate =
      (system.lateUpdate as System['lateUpdate']) ?? (proto.lateUpdate as System['lateUpdate']);

    if (typeof origUpdate === 'function') {
      const fn = origUpdate;
      (system as any).update = function patchedUpdate(this: System, e: any) {
        const t0 = now();
        try {
          return fn.call(this, e);
        } finally {
          const dt = now() - t0;
          const slot = currentSystemTimes.get(system) ?? { updateMs: 0, lateUpdateMs: 0 };
          slot.updateMs += dt;
          currentSystemTimes.set(system, slot);
        }
      };
    }

    if (typeof origLateUpdate === 'function') {
      const fn = origLateUpdate;
      (system as any).lateUpdate = function patchedLateUpdate(this: System, e: any) {
        const t0 = now();
        try {
          return fn.call(this, e);
        } finally {
          const dt = now() - t0;
          const slot = currentSystemTimes.get(system) ?? { updateMs: 0, lateUpdateMs: 0 };
          slot.lateUpdateMs += dt;
          currentSystemTimes.set(system, slot);
        }
      };
    }

    patched.set(system, {
      system,
      origUpdate,
      origLateUpdate,
      hadOwnUpdate,
      hadOwnLateUpdate,
    });
  }

  function unpatchSystem(record: SystemPatchRecord): void {
    const { system, origUpdate, origLateUpdate, hadOwnUpdate, hadOwnLateUpdate } = record;
    // 只有当 system 上当前的 update/lateUpdate 还是我们装的 patched 版本时才还原。
    // 如果用户/其他 patch 在我们之上又包了一层,我们不强行覆盖。
    // 简化策略:直接还原成原始引用(或 delete 我们自己写在实例上的属性,让原型链生效)。
    if (typeof origUpdate === 'function') {
      if (hadOwnUpdate) {
        (system as any).update = origUpdate;
      } else {
        delete (system as any).update;
      }
    }
    if (typeof origLateUpdate === 'function') {
      if (hadOwnLateUpdate) {
        (system as any).lateUpdate = origLateUpdate;
      } else {
        delete (system as any).lateUpdate;
      }
    }
  }

  // ---------- ticker hook 安插 ----------

  /**
   * Prologue:在每帧 ticker callback 开始时记录 frameStart。
   * Epilogue:结算 frameMs / gameObjectsMs,写入 lastFrame、滑动窗口、跑 violation 检测。
   */
  const prologueHook = (_e?: any) => {
    frameStart = now();
    // 清空当前帧累计
    currentSystemTimes.clear();
    // 把新加入的 system 也 patch 上(install 之后 addSystem 的)
    for (const sys of game.systems ?? []) {
      if (!patched.has(sys)) patchSystem(sys);
    }
  };

  const epilogueHook = (e?: any) => {
    const frameEnd = now();
    const frameMs = Math.max(0, frameEnd - frameStart);
    const systems = (game.systems ?? []).map((sys) => {
      const slot = currentSystemTimes.get(sys) ?? { updateMs: 0, lateUpdateMs: 0 };
      const sysName =
        (sys as any).name ||
        (sys as any).constructor?.systemName ||
        (sys as any).constructor?.name ||
        'UnknownSystem';
      return {
        name: sysName as string,
        updateMs: slot.updateMs,
        lateUpdateMs: slot.lateUpdateMs,
      };
    });
    const sysSum = systems.reduce((acc, s) => acc + s.updateMs + s.lateUpdateMs, 0);
    const gameObjectsMs = Math.max(0, frameMs - sysSum);
    const gameObjectCount = (game.gameObjects ?? []).length;

    const frameCount = (e && typeof e.frameCount === 'number' ? e.frameCount : 0) as number;

    // 滑动窗口先入,再算 fps
    window.push({
      frameCount,
      fps: 0, // 占位,稍后 patch
      frameMs,
      systems,
      gameObjectsMs,
      gameObjectCount,
    });
    if (window.length > sampleSize) window.shift();

    // 真实 FPS = 1000 * windowSize / sum(frameMs);frameMs 极小时 clamp 到 1000Hz
    const sumFrameMs = window.reduce((acc, f) => acc + f.frameMs, 0);
    const fps =
      sumFrameMs > 0 ? Math.min(1000, (1000 * window.length) / sumFrameMs) : 1000;
    const sample = window[window.length - 1];
    sample.fps = fps;
    lastFrame = sample;

    // 触发 onFrame(snapshot 后再调,避免回调内 dispose 改 Set)
    if (frameSubs.size) {
      for (const fn of Array.from(frameSubs)) {
        try {
          fn(sample);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[perf-probes] onFrame callback error', err);
        }
      }
    }

    // ---------- violation 检测 ----------
    runViolationChecks(sample);
  };

  function runViolationChecks(sample: PerfFrame): void {
    const checks: { name: string; actual: number; threshold: number; over: boolean }[] = [];

    // frameMs
    if (typeof budget.maxFrameMs === 'number') {
      checks.push({
        name: 'frameMs',
        actual: sample.frameMs,
        threshold: budget.maxFrameMs,
        over: sample.frameMs > budget.maxFrameMs,
      });
    }
    // fps
    if (typeof budget.minFps === 'number') {
      checks.push({
        name: 'fps',
        actual: sample.fps,
        threshold: budget.minFps,
        // fps 是越大越好,过低算 over
        over: sample.fps < budget.minFps,
      });
    }
    // gameObjects
    if (typeof budget.maxGameObjects === 'number') {
      checks.push({
        name: 'gameObjects',
        actual: sample.gameObjectCount,
        threshold: budget.maxGameObjects,
        over: sample.gameObjectCount > budget.maxGameObjects,
      });
    }
    // systems
    if (budget.maxSystemMs) {
      for (const s of sample.systems) {
        const limit = budget.maxSystemMs[s.name];
        if (typeof limit === 'number') {
          const total = s.updateMs + s.lateUpdateMs;
          checks.push({
            name: `system:${s.name}`,
            actual: total,
            threshold: limit,
            over: total > limit,
          });
        }
      }
    }

    for (const c of checks) {
      let counter = violationCounters.get(c.name);
      if (!counter) {
        counter = { consec: 0, count: 0, last: c.actual };
        violationCounters.set(c.name, counter);
      }
      counter.last = c.actual;
      if (c.over) {
        counter.consec += 1;
        if (counter.consec >= (budget.sustainedFrames ?? DEFAULT_SUSTAINED_FRAMES)) {
          counter.count += 1;
          counter.consec = 0; // 触发后重置,继续超就再次 emit
          const v: PerfViolation = {
            name: c.name,
            actual: c.actual,
            threshold: c.threshold,
            frame: sample,
          };
          if (warnOnViolation) {
            // eslint-disable-next-line no-console
            console.warn(
              `[perf-probes] sustained violation ${c.name}: actual=${c.actual.toFixed(
                2,
              )} threshold=${c.threshold}`,
            );
          }
          if (violationSubs.size) {
            for (const fn of Array.from(violationSubs)) {
              try {
                fn(v);
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error('[perf-probes] onViolation callback error', err);
              }
            }
          }
        }
      } else {
        counter.consec = 0;
      }
    }
  }

  // ---------- 安装 ticker hook ----------
  // 我们要把 prologue 放第一个、epilogue 放最后一个,夹住 Game.initTicker 注册的主回调。
  // 注意:Set 没有 add-to-front,只能 snapshot+clear+rebuild。

  // 保存 ticker._tickers 的"原始顺序"以便 uninstall 还原。
  const tickerSet: Set<unknown> | null = (() => {
    const ticker: any = (game as any).ticker;
    if (!ticker) return null;
    return ticker._tickers as Set<unknown>;
  })();

  let originalTickerOrder: unknown[] = [];
  if (tickerSet) {
    originalTickerOrder = Array.from(tickerSet);
    tickerSet.clear();
    tickerSet.add(prologueHook);
    for (const fn of originalTickerOrder) {
      tickerSet.add(fn);
    }
    tickerSet.add(epilogueHook);
  }
  // tickerSet 为 null 时,允许 install — uninstall 仍能调通。

  // 立即 patch 所有现有 systems
  for (const sys of game.systems ?? []) {
    patchSystem(sys);
  }

  // ---------- Handle ----------

  function average(): PerfFrame | null {
    if (window.length === 0) return null;
    const n = window.length;
    let sumFrameMs = 0;
    let sumFps = 0;
    let sumGoMs = 0;
    let sumGoCount = 0;
    let lastFrameCount = 0;
    // systems 平均:按 name 聚合(取最后一帧的 system 列表作为 schema,避免 system 注册不一致)
    const last = window[n - 1];
    const sysAvg = new Map<string, { updateMs: number; lateUpdateMs: number; n: number }>();
    for (const f of window) {
      sumFrameMs += f.frameMs;
      sumFps += f.fps;
      sumGoMs += f.gameObjectsMs;
      sumGoCount += f.gameObjectCount;
      lastFrameCount = f.frameCount;
      for (const s of f.systems) {
        const slot = sysAvg.get(s.name) ?? { updateMs: 0, lateUpdateMs: 0, n: 0 };
        slot.updateMs += s.updateMs;
        slot.lateUpdateMs += s.lateUpdateMs;
        slot.n += 1;
        sysAvg.set(s.name, slot);
      }
    }
    const systems = last.systems.map((s) => {
      const slot = sysAvg.get(s.name) ?? { updateMs: 0, lateUpdateMs: 0, n: 1 };
      return {
        name: s.name,
        updateMs: slot.updateMs / slot.n,
        lateUpdateMs: slot.lateUpdateMs / slot.n,
      };
    });
    return {
      frameCount: lastFrameCount,
      fps: sumFps / n,
      frameMs: sumFrameMs / n,
      systems,
      gameObjectsMs: sumGoMs / n,
      gameObjectCount: sumGoCount / n,
    };
  }

  const handle: PerfProbesHandle = {
    current() {
      return lastFrame;
    },
    average,
    violations() {
      const out: { name: string; count: number; last: number }[] = [];
      for (const [name, c] of violationCounters) {
        if (c.count === 0) continue;
        out.push({ name, count: c.count, last: c.last });
      }
      return out;
    },
    onFrame(fn) {
      frameSubs.add(fn);
      return () => {
        frameSubs.delete(fn);
      };
    },
    onViolation(fn) {
      violationSubs.add(fn);
      return () => {
        violationSubs.delete(fn);
      };
    },
    uninstall() {
      if (uninstalled) return;
      uninstalled = true;

      // 还原 ticker 顺序:只移除我们自己装的 prologue/epilogue,保留原顺序 +
      // install 之后用户可能新加的 callback。简单做法是:把 set 全清,
      // 按 [originalTickerOrder, *(set 当前 - prologue - epilogue - originalOrder)] 重 add。
      if (tickerSet) {
        const current = Array.from(tickerSet);
        const additions = current.filter(
          (x) => x !== prologueHook && x !== epilogueHook && !originalTickerOrder.includes(x),
        );
        tickerSet.clear();
        for (const fn of originalTickerOrder) tickerSet.add(fn);
        for (const fn of additions) tickerSet.add(fn);
      }

      // 还原 system patches
      for (const record of patched.values()) {
        unpatchSystem(record);
      }
      patched.clear();

      // 清状态
      window.length = 0;
      lastFrame = null;
      frameSubs.clear();
      violationSubs.clear();
      violationCounters.clear();
      currentSystemTimes.clear();
    },
  };

  return handle;
}
