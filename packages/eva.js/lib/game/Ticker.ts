import { UpdateParams } from '../core/Component';
import { createNowTime } from '../timeline/utils';

interface TickerOptions {
  autoStart?: boolean;
  frameRate?: number;
}

export interface FrameParams {
  readonly rafTime: number;
  readonly rafDeltaTime: number;
  readonly rafFps: number;
  readonly rafFrameCount: number;
  readonly updatesThisFrame: number;
  readonly interpolationAlpha: number;
  readonly simulationTime: number;
  readonly playbackRate: number;
}

export type FrameCallback = (frame: FrameParams) => void;

interface FrameCallbackEntry {
  fn: FrameCallback;
  priority: number;
  order: number;
}

/** Ticker 的默认配置选项 */
const defaultOptions: Partial<TickerOptions> = {
  autoStart: true,
  frameRate: 60,
};

/**
 * 时钟管理器类
 *
 * Ticker 负责管理游戏的主循环，基于 requestAnimationFrame 实现帧率控制。
 * 它协调所有需要在每帧执行的回调函数，确保游戏以稳定的帧率运行。
 *
 * @example
 * ```typescript
 * const ticker = new Ticker({ frameRate: 60, autoStart: true });
 *
 * ticker.add((frameInfo) => {
 *   console.log('FPS:', frameInfo.fps);
 *   console.log('Delta Time:', frameInfo.deltaTime);
 * });
 *
 * ticker.start();
 * ```
 */
class Ticker {
  /** 是否自动启动时钟 */
  autoStart: boolean;

  /** 目标逻辑帧率 */
  frameRate: number;

  /** 固定逻辑步长（毫秒） */
  private _frameDuration: number;

  /** 每帧调用的回调函数集合 */
  private _tickers: Set<unknown>;

  /** requestAnimationFrame 的句柄 ID */
  _requestId: number | null;

  /** 上一次物理帧时间；null 表示下一帧仅建立 baseline */
  private _lastRafTime: number | null;

  /** 尚未消费的缩放游戏时间 */
  private _accumulator: number;

  /** 已执行的固定逻辑时间 */
  private _simulationTime: number;

  /** 物理帧计数 */
  private _rafFrameCount: number;

  /** 配置的逻辑播放速率 */
  private _playbackRate: number;

  /** 手动 update() 使用的单调时钟 */
  private _now: () => number;

  private _frameStartCallbacks: Map<FrameCallback, FrameCallbackEntry>;

  private _frameCallbacks: Map<FrameCallback, FrameCallbackEntry>;

  private _frameStartSnapshot: FrameCallback[];

  private _frameSnapshot: FrameCallback[];

  private _frameStartSnapshotDirty: boolean;

  private _frameSnapshotDirty: boolean;

  private _frameCallbackOrder: number;

  /** 从时钟开始以来的帧计数 */
  private _frameCount: number;

  /** 主时钟方法的句柄 */
  private _ticker: (time?: number) => void;

  /**
   * 时钟的运行状态
   * @defaultValue false
   */
  private _started: boolean;

  /**
   * 构造一个新的时钟管理器
   * @param options - 时钟配置选项
   * @param options.autoStart - 是否自动启动
   * @param options.frameRate - 目标帧率
   */
  constructor(options?: TickerOptions) {
    options = Object.assign({}, defaultOptions, options);

    this._frameCount = 0;
    this._rafFrameCount = 0;
    this._frameDuration = 1000 / options.frameRate;
    this.autoStart = options.autoStart;
    this.frameRate = options.frameRate;
    this._lastRafTime = null;
    this._accumulator = 0;
    this._simulationTime = 0;
    this._playbackRate = 1;
    this._now = createNowTime();

    this._tickers = new Set();
    this._frameStartCallbacks = new Map();
    this._frameCallbacks = new Map();
    this._frameStartSnapshot = [];
    this._frameSnapshot = [];
    this._frameStartSnapshotDirty = false;
    this._frameSnapshotDirty = false;
    this._frameCallbackOrder = 0;
    this._requestId = null;
    this._started = false;

    this._ticker = (time?: number) => {
      if (this._started) {
        this._requestId = requestAnimationFrame(this._ticker);
        this.update(time);
      }
    };

    if (this.autoStart) {
      this.start();
    }
  }

  /**
   * 主循环更新方法
   *
   * 使用补帧循环：当实际时间跨越多个帧间隔时，循环执行多次固定步长更新，
   * 确保在 RAF 被节流（如低电量模式）时游戏时间仍与真实时间同步。
   * 设置最大补帧数上限，避免长时间挂起后一次性执行过多更新。
   */
  update(rafTime?: number) {
    const measuredTime = rafTime === undefined ? this._now() : rafTime;
    const currentRafTime = this._lastRafTime === null ? measuredTime : Math.max(this._lastRafTime, measuredTime);
    const rafDeltaTime = this._lastRafTime === null ? 0 : currentRafTime - this._lastRafTime;
    this._lastRafTime = currentRafTime;
    this._rafFrameCount++;

    this._accumulator += Math.max(0, rafDeltaTime * this._playbackRate);
    const epsilon = this._frameDuration * 1e-9;
    const availableUpdates = Math.floor((this._accumulator + epsilon) / this._frameDuration);
    const updatesThisFrame = Math.min(availableUpdates, 5);
    const droppedUpdates = availableUpdates - updatesThisFrame;

    this._accumulator -= availableUpdates * this._frameDuration;
    if (Math.abs(this._accumulator) < epsilon) {
      this._accumulator = 0;
    }

    const frameBase = {
      rafTime: currentRafTime,
      rafDeltaTime,
      rafFps: rafDeltaTime > 0 ? 1000 / rafDeltaTime : 0,
      rafFrameCount: this._rafFrameCount,
      updatesThisFrame,
      interpolationAlpha: this._accumulator / this._frameDuration,
      playbackRate: this._playbackRate,
    };

    const frameStart: FrameParams = {
      ...frameBase,
      simulationTime: this._simulationTime,
    };
    this._callFrameCallbacks(this._getFrameStartSnapshot(), frameStart);

    for (let updateIndex = 0; updateIndex < updatesThisFrame; updateIndex++) {
      this._simulationTime += this._frameDuration;
      const options: UpdateParams = {
        deltaTime: this._frameDuration,
        time: this._simulationTime,
        currentTime: this._simulationTime,
        frameCount: ++this._frameCount,
        fps: this.frameRate,
      };

      for (const func of this._tickers) {
        if (typeof func === 'function') {
          func(options);
        }
      }
    }

    this._simulationTime += droppedUpdates * this._frameDuration;

    const frame: FrameParams = {
      ...frameBase,
      simulationTime: this._simulationTime,
    };
    this._callFrameCallbacks(this._getFrameSnapshot(), frame);
  }

  /**
   * 添加每帧执行的回调函数
   * @param fn - 回调函数，每帧会接收帧信息参数
   */
  add(fn) {
    this._tickers.add(fn);
  }

  /**
   * 移除回调函数
   * @param fn - 要移除的回调函数
   */
  remove(fn) {
    this._tickers.delete(fn);
  }

  addFrameStart(fn: FrameCallback, priority = 0) {
    this._addFrameCallback(this._frameStartCallbacks, fn, priority);
    this._frameStartSnapshotDirty = true;
  }

  removeFrameStart(fn: FrameCallback) {
    if (this._frameStartCallbacks.delete(fn)) {
      this._frameStartSnapshotDirty = true;
    }
  }

  addFrame(fn: FrameCallback, priority = 0) {
    this._addFrameCallback(this._frameCallbacks, fn, priority);
    this._frameSnapshotDirty = true;
  }

  removeFrame(fn: FrameCallback) {
    if (this._frameCallbacks.delete(fn)) {
      this._frameSnapshotDirty = true;
    }
  }

  private _addFrameCallback(callbacks: Map<FrameCallback, FrameCallbackEntry>, fn: FrameCallback, priority: number) {
    const existing = callbacks.get(fn);
    if (existing) {
      existing.priority = priority;
      return;
    }
    callbacks.set(fn, { fn, priority, order: this._frameCallbackOrder++ });
  }

  private _getFrameStartSnapshot() {
    if (this._frameStartSnapshotDirty) {
      this._frameStartSnapshot = this._createFrameSnapshot(this._frameStartCallbacks);
      this._frameStartSnapshotDirty = false;
    }
    return this._frameStartSnapshot;
  }

  private _getFrameSnapshot() {
    if (this._frameSnapshotDirty) {
      this._frameSnapshot = this._createFrameSnapshot(this._frameCallbacks);
      this._frameSnapshotDirty = false;
    }
    return this._frameSnapshot;
  }

  private _createFrameSnapshot(callbacks: Map<FrameCallback, FrameCallbackEntry>) {
    return Array.from(callbacks.values())
      .sort((a, b) => a.priority - b.priority || a.order - b.order)
      .map(entry => entry.fn);
  }

  private _callFrameCallbacks(callbacks: FrameCallback[], frame: FrameParams) {
    for (const callback of callbacks) {
      callback(frame);
    }
  }

  /**
   * 启动主循环
   *
   * 如果已经启动则忽略。恢复时下一物理帧重建墙钟 baseline。
   */
  start() {
    if (this._started) return;
    this._started = true;
    this._lastRafTime = null;
    this._requestId = requestAnimationFrame(this._ticker);
  }

  /**
   * 暂停主循环
   *
   * 取消 RAF，但保留已配置的播放速率。
   */
  pause() {
    this._started = false;
    if (this._requestId !== null) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
    this._lastRafTime = null;
  }

  /**
   * 设置时间线播放速率
   * @param rate - 播放速率（1.0 为正常速度）
   * @throws RangeError 当播放速率不是有限非负数时抛出
   */
  setPlaybackRate(rate: number) {
    if (!Number.isFinite(rate) || rate < 0) {
      throw new RangeError('playback rate must be a finite, non-negative number');
    }
    this._playbackRate = rate;
  }
}

export default Ticker;
