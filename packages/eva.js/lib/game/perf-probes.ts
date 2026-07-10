/**
 * Engine-level performance probes for {@link Game}.
 *
 * 设计:
 * - 不修改 Game.ts 源码,通过 monkey-patch 各 System 生命周期收集阶段时长。
 * - 通过 Ticker 的物理帧 prologue/epilogue 收集整帧时长，每个 RAF 只产出一个样本。
 * - 滑动窗口(sampleSize)给出 RAF FPS / 平均帧 / average frame。
 * - 每帧 budget 检查,连续 sustainedFrames 帧超标才告警(避免噪音)。
 * - 多次 install/uninstall 必须可重入,uninstall 必须把所有 patch 还原干净。
 * - headless(jest)友好:performance.now() 在 jsdom / Node 都有,不行才退到 Date.now。
 *
 * 详细背景见 ADR-0013。
 */

import type Game from './Game';
import type System from '../core/System';
import type { FrameParams } from './Ticker';

/** Now() — 优先 performance.now(),否则 Date.now()。每次解析以支持运行时 clock instrumentation。 */
const now = (): number => {
  const perf: { now?: () => number } | undefined = (globalThis as any).performance;
  if (perf && typeof perf.now === 'function') {
    return perf.now();
  }
  return Date.now();
};

/**
 * 单帧采样数据。
 */
export interface PerfFrame {
  /** Ticker 给出的物理帧计数 */
  frameCount: number;
  /** 当前物理帧的 RAF FPS */
  fps: number;
  /** 本帧总耗时(systems update+lateUpdate + gameObjects 循环),毫秒 */
  frameMs: number;
  /** 各 System 本帧的逻辑阶段与一次物理 frameUpdate 时长,毫秒 */
  systems: {
    name: string;
    updateMs: number;
    lateUpdateMs: number;
    frameUpdateMs?: number;
  }[];
  /** 所有 System 的 frameUpdate 时长之和,毫秒 */
  frameUpdateMs?: number;
  /** 本帧 gameObjects 循环耗时,毫秒(估算 = frameMs - sum(systems)) */
  gameObjectsMs: number;
  /** 本帧 game.gameObjects 数量 */
  gameObjectCount: number;
  /** 当前 RAF 间隔；baseline 帧为 0 */
  rafDeltaTime?: number;
  /** 当前物理帧执行的固定逻辑更新次数 */
  updatesThisFrame?: number;
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
  /** 卸载所有 hook，并按 ownership 还原 System 方法 */
  uninstall(): void;
}

/** 默认值集中放,跟 ADR-0013 一致。 */
const DEFAULT_SAMPLE_SIZE = 60;
const DEFAULT_MAX_FRAME_MS = 16.67;
const DEFAULT_MIN_FPS = 30;
const DEFAULT_SUSTAINED_FRAMES = 60;

/** 单个 system 的 patch 记录。uninstall 时还原。 */
type PatchedSystemMethodName = 'update' | 'lateUpdate' | 'frameStart' | 'frameUpdate';
type TimedSystemMethodName = 'update' | 'lateUpdate' | 'frameUpdate';

interface MethodPatchRecord {
  original?: (...args: any[]) => any;
  wrapper?: (...args: any[]) => any;
  hadOwn: boolean;
}

interface SystemPatchRecord {
  system: System;
  methods: Record<PatchedSystemMethodName, MethodPatchRecord>;
}

interface SystemTimes {
  updateMs: number;
  lateUpdateMs: number;
  frameUpdateMs: number;
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
 * - install 之后再 addSystem 的 System 会在 systemAdded 事件中同步 patch；prologue 仍作兜底。
 * - 同一 game 多次 install:旧 handle 应先 uninstall;否则两套 hook 会串扰。
 * - uninstall 后 install 必须能正常工作。
 */
export function installPerfProbes(game: Game, options: PerfProbeOptions = {}): PerfProbesHandle {
  const sampleSize = options.sampleSize ?? DEFAULT_SAMPLE_SIZE;
  const warnOnViolation = options.warnOnViolation ?? true;

  // 预算字段填默认值(只补 maxFrameMs / minFps / sustainedFrames;system / gameObjects 不强制)
  const budget: Required<Pick<PerfBudget, 'maxFrameMs' | 'minFps' | 'sustainedFrames'>> & PerfBudget = {
    maxFrameMs: options.budget?.maxFrameMs ?? DEFAULT_MAX_FRAME_MS,
    minFps: options.budget?.minFps ?? DEFAULT_MIN_FPS,
    sustainedFrames: options.budget?.sustainedFrames ?? DEFAULT_SUSTAINED_FRAMES,
    maxSystemMs: options.budget?.maxSystemMs,
    maxGameObjects: options.budget?.maxGameObjects,
  };

  // ---------- 内部状态 ----------
  // 当前帧累计的 systems 时长(在 epilogue 中清零并组装成 PerfFrame)
  const currentSystemTimes = new Map<System, SystemTimes>();
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

  function getSystemTimes(system: System): SystemTimes {
    let slot = currentSystemTimes.get(system);
    if (!slot) {
      slot = { updateMs: 0, lateUpdateMs: 0, frameUpdateMs: 0 };
      currentSystemTimes.set(system, slot);
    }
    return slot;
  }

  function patchMethod(
    system: System,
    method: PatchedSystemMethodName,
    timedMethod?: TimedSystemMethodName,
  ): MethodPatchRecord {
    const hadOwn = Object.prototype.hasOwnProperty.call(system, method);
    const original = (system as any)[method];
    if (typeof original !== 'function') {
      return { original: undefined, wrapper: undefined, hadOwn };
    }

    const wrapper = function patchedSystemMethod(this: System, ...args: any[]) {
      if (!timedMethod) {
        return original.apply(this, args);
      }
      const t0 = now();
      try {
        return original.apply(this, args);
      } finally {
        const key = `${timedMethod}Ms` as keyof SystemTimes;
        getSystemTimes(system)[key] += Math.max(0, now() - t0);
      }
    };
    (system as any)[method] = wrapper;
    return { original, wrapper, hadOwn };
  }

  function patchSystem(system: System): void {
    if (patched.has(system)) return;
    patched.set(system, {
      system,
      methods: {
        update: patchMethod(system, 'update', 'update'),
        lateUpdate: patchMethod(system, 'lateUpdate', 'lateUpdate'),
        // frameStart 仅用于透传和 ownership，不虚构 frameStartMs。
        frameStart: patchMethod(system, 'frameStart'),
        frameUpdate: patchMethod(system, 'frameUpdate', 'frameUpdate'),
      },
    });
  }

  function unpatchSystem(record: SystemPatchRecord): void {
    const { system, methods } = record;
    for (const method of Object.keys(methods) as PatchedSystemMethodName[]) {
      const { original, wrapper, hadOwn } = methods[method];
      // 只回收仍由本探针持有的 wrapper；用户后装的方法必须原样保留。
      if (!wrapper || (system as any)[method] !== wrapper) continue;
      if (hadOwn) {
        (system as any)[method] = original;
      } else {
        delete (system as any)[method];
      }
    }
  }

  const systemAddedHook = (system: System) => {
    if (!uninstalled) patchSystem(system);
  };

  // ---------- ticker hook 安插 ----------

  /**
   * Prologue:在每帧 ticker callback 开始时记录 frameStart。
   * Epilogue:结算 frameMs / gameObjectsMs,写入 lastFrame、滑动窗口、跑 violation 检测。
   */
  const prologueHook = (_frame: FrameParams) => {
    frameStart = now();
    // 清空当前帧累计
    currentSystemTimes.clear();
    // 把新加入的 system 也 patch 上(install 之后 addSystem 的)
    for (const sys of game.systems ?? []) {
      if (!patched.has(sys)) patchSystem(sys);
    }
  };

  const epilogueHook = (frame: FrameParams) => {
    const frameEnd = now();
    const frameMs = Math.max(0, frameEnd - frameStart);
    const systems = (game.systems ?? []).map(sys => {
      const slot = currentSystemTimes.get(sys) ?? {
        updateMs: 0,
        lateUpdateMs: 0,
        frameUpdateMs: 0,
      };
      const sysName =
        (sys as any).name || (sys as any).constructor?.systemName || (sys as any).constructor?.name || 'UnknownSystem';
      return {
        name: sysName as string,
        updateMs: slot.updateMs,
        lateUpdateMs: slot.lateUpdateMs,
        frameUpdateMs: slot.frameUpdateMs,
      };
    });
    const frameUpdateMs = systems.reduce((acc, s) => acc + (s.frameUpdateMs ?? 0), 0);
    const sysSum = systems.reduce((acc, s) => acc + s.updateMs + s.lateUpdateMs + (s.frameUpdateMs ?? 0), 0);
    const gameObjectsMs = Math.max(0, frameMs - sysSum);
    const gameObjectCount = (game.gameObjects ?? []).length;

    const frameCount = frame && typeof frame.rafFrameCount === 'number' ? frame.rafFrameCount : 0;
    const rafDeltaTime = frame && typeof frame.rafDeltaTime === 'number' ? frame.rafDeltaTime : 0;
    const fps = rafDeltaTime > 0 ? (Number.isFinite(frame.rafFps) ? frame.rafFps : 1000 / rafDeltaTime) : 0;

    const sample: PerfFrame = {
      frameCount,
      fps,
      frameMs,
      systems,
      frameUpdateMs,
      gameObjectsMs,
      gameObjectCount,
      rafDeltaTime,
      updatesThisFrame: frame?.updatesThisFrame ?? 0,
    };
    window.push(sample);
    if (window.length > sampleSize) window.shift();
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
    if (typeof budget.minFps === 'number' && (sample.rafDeltaTime ?? 0) > 0) {
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
          const total = s.updateMs + s.lateUpdateMs + (s.frameUpdateMs ?? 0);
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
              `[perf-probes] sustained violation ${c.name}: actual=${c.actual.toFixed(2)} threshold=${c.threshold}`,
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
  // 捕获安装时 ticker，避免 game.ticker 后续替换时卸载到错误实例。
  const ticker = game.ticker;
  if (ticker) {
    ticker.addFrameStart(prologueHook, -Infinity);
    ticker.addFrame(epilogueHook, Infinity);
  }
  game.on('systemAdded', systemAddedHook);

  // 立即 patch 所有现有 systems
  for (const sys of game.systems ?? []) {
    patchSystem(sys);
  }

  // ---------- Handle ----------

  function average(): PerfFrame | null {
    if (window.length === 0) return null;
    const n = window.length;
    let sumFrameMs = 0;
    let sumGoMs = 0;
    let sumGoCount = 0;
    let sumFrameUpdateMs = 0;
    let sumRafDeltaTime = 0;
    let rafIntervalCount = 0;
    let fallbackFps = 0;
    let fallbackFpsCount = 0;
    let sumUpdatesThisFrame = 0;
    let lastFrameCount = 0;
    // systems 平均:按 name 聚合(取最后一帧的 system 列表作为 schema,避免 system 注册不一致)
    const last = window[n - 1];
    const sysAvg = new Map<string, { updateMs: number; lateUpdateMs: number; frameUpdateMs: number; n: number }>();
    for (const f of window) {
      sumFrameMs += f.frameMs;
      sumGoMs += f.gameObjectsMs;
      sumGoCount += f.gameObjectCount;
      sumFrameUpdateMs += f.frameUpdateMs ?? 0;
      sumUpdatesThisFrame += f.updatesThisFrame ?? 0;
      lastFrameCount = f.frameCount;
      if (typeof f.rafDeltaTime === 'number') {
        if (f.rafDeltaTime > 0) {
          sumRafDeltaTime += f.rafDeltaTime;
          rafIntervalCount++;
        }
      } else {
        fallbackFps += f.fps;
        fallbackFpsCount++;
      }
      for (const s of f.systems) {
        const slot = sysAvg.get(s.name) ?? {
          updateMs: 0,
          lateUpdateMs: 0,
          frameUpdateMs: 0,
          n: 0,
        };
        slot.updateMs += s.updateMs;
        slot.lateUpdateMs += s.lateUpdateMs;
        slot.frameUpdateMs += s.frameUpdateMs ?? 0;
        slot.n += 1;
        sysAvg.set(s.name, slot);
      }
    }
    const systems = last.systems.map(s => {
      const slot = sysAvg.get(s.name) ?? {
        updateMs: 0,
        lateUpdateMs: 0,
        frameUpdateMs: 0,
        n: 1,
      };
      return {
        name: s.name,
        updateMs: slot.updateMs / slot.n,
        lateUpdateMs: slot.lateUpdateMs / slot.n,
        frameUpdateMs: slot.frameUpdateMs / slot.n,
      };
    });
    const fps =
      rafIntervalCount > 0
        ? (1000 * rafIntervalCount) / sumRafDeltaTime
        : fallbackFpsCount > 0
        ? fallbackFps / fallbackFpsCount
        : 0;
    return {
      frameCount: lastFrameCount,
      fps,
      frameMs: sumFrameMs / n,
      systems,
      frameUpdateMs: sumFrameUpdateMs / n,
      gameObjectsMs: sumGoMs / n,
      gameObjectCount: sumGoCount / n,
      rafDeltaTime: sumRafDeltaTime / Math.max(1, rafIntervalCount),
      updatesThisFrame: sumUpdatesThisFrame / n,
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

      if (ticker) {
        ticker.removeFrameStart(prologueHook);
        ticker.removeFrame(epilogueHook);
      }
      game.off('systemAdded', systemAddedHook);

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
