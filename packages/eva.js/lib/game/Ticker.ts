import { UpdateParams } from '../core/Component';
import Timeline from '../timeline/index';

interface TickerOptions {
  autoStart?: boolean;
  frameRate?: number;
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

  /** 目标帧率，表示每秒调用 RAF 的次数 */
  frameRate: number;

  /** 全局时间线管理器 */
  private timeline: Timeline;

  /** 两帧之间的时间间隔（毫秒） */
  private _frameDuration: number;

  /** 每帧调用的回调函数集合 */
  private _tickers: Set<unknown>;

  /** requestAnimationFrame 的句柄 ID */
  _requestId: number | null;

  /** 上一帧的渲染时间 */
  private _lastFrameTime: number;

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
    this._frameDuration = 1000 / options.frameRate;
    this.autoStart = options.autoStart;
    this.frameRate = options.frameRate;

    this.timeline = new Timeline({ originTime: 0, playbackRate: 1.0 });
    this._lastFrameTime = this.timeline.currentTime;

    this._tickers = new Set();
    this._requestId = null;

    this._ticker = () => {
      if (this._started) {
        this._requestId = requestAnimationFrame(this._ticker);
        this.update();
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
  update() {
    const currentTime = this.timeline.currentTime;

    // 限制单次 RAF 回调最多补帧数，避免长时间挂起后卡顿
    const maxCatchUpFrames = 5;
    let frames = 0;

    while (currentTime - this._lastFrameTime >= this._frameDuration && frames < maxCatchUpFrames) {
      this._lastFrameTime += this._frameDuration;
      frames++;

      const options: UpdateParams = {
        deltaTime: this._frameDuration,
        time: this._lastFrameTime,
        currentTime: this._lastFrameTime,
        frameCount: ++this._frameCount,
        fps: this.frameRate,
      };

      for (const func of this._tickers) {
        if (typeof func === 'function') {
          func(options);
        }
      }
    }

    // 如果补帧达到上限仍有剩余时间差，重新同步避免持续追帧
    if (currentTime - this._lastFrameTime >= this._frameDuration) {
      this._lastFrameTime = currentTime;
    }
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

  /**
   * 启动主循环
   *
   * 如果已经启动则忽略。启动后时间线播放速率设为 1.0。
   */
  start() {
    if (this._started) return;
    this._started = true;
    this.timeline.playbackRate = 1.0;
    this._requestId = requestAnimationFrame(this._ticker);
  }

  /**
   * 暂停主循环
   *
   * 将时间线播放速率设为 0，停止帧更新。
   */
  pause() {
    this._started = false;
    if (this._requestId !== null) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
    this.timeline.playbackRate = 0;
  }

  /**
   * 设置时间线播放速率
   * @param rate - 播放速率（1.0 为正常速度）
   */
  setPlaybackRate(rate: number) {
    this.timeline.playbackRate = rate;
  }
}

export default Ticker;
