import { UpdateParams } from '../core/Component';
import Timeline from '../timeline/index';

interface TickerOptions {
  autoStart?: boolean;
  frameRate?: number;
}

/** Default Ticker Options */
const defaultOptions: Partial<TickerOptions> = {
  autoStart: true,
  frameRate: 60,
};

/**
 * Timeline tool
 */
class Ticker {
  /** Whether or not ticker should auto start */
  autoStart: boolean;

  /** FPS, The number of times that raf method is called per second */
  frameRate: number;

  /** Global Timeline **/
  private timeline: Timeline;

  /** Time between two frame */
  private _frameDuration: number;

  /** Ticker is a function will called in each raf */
  private _tickers: Set<unknown>;

  /** raf handle id */
  _requestId: number;

  /** Last frame render time */
  private _lastFrameTime: number;

  /** Frame count since from ticker beigning */
  private _frameCount: number;

  // private _activeWithPause: boolean;

  /** Main ticker method handle */
  private _ticker: (time?: number) => void;

  /** Represents the status of the Ticker, If ticker has started, the value is true */
  private _started: boolean;

  private _timeoutList: {
    timeoutId: number;
    startTime: number;
    endTime: number;
    callback: Function;
    delay: number;
    args?: any[];
  }[] = []
  private _timeoutId: number = 0

  private _frameDelayList: {
    execFrameNumber: number;
    callback: Function;
    frameDelayId: number;
  }[] = []

  private _frameDelayId: number = 0

  public time: UpdateParams = {
    deltaTime: 0,
    time: 0,
    currentTime: 0,
    frameCount: 0,
    fps: 0,
  }

  /**
   * @param autoStart - auto start game
   * @param frameRate - game frame rate
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

  setFrameDelay(callback, frameCount: number) {
    if (frameCount < 1 || !frameCount) {
      throw 'frameCount must greater than 0'
    }
    const frameDelayInfo = {
      frameDelayId: this._frameDelayId++,
      callback,
      execFrameNumber: this.time.frameCount + frameCount
    }
    this._frameDelayList.push(frameDelayInfo)
    return frameDelayInfo.frameDelayId;
  }

  resolveFrameDelay() {
    const index = this._frameDelayList.findIndex(event => event.execFrameNumber <= this.time.frameCount)
    if (index === -1) return;
    const needResolve = this._frameDelayList.splice(0, index + 1)
    for (const delayInfo of needResolve) {
      try {
        delayInfo.callback()
      } catch (e) {
        throw e
      }
    }
  }

  clearFrameDelay(frameDelayId: number) {
    const index = this._frameDelayList.findIndex(event => event.frameDelayId === frameDelayId)
    if (index === -1) return
    this._frameDelayList.splice(index, 1)
  }

  setTimeout(callback, delay, ...args) {
    const delayInfo = {
      timeoutId: this._timeoutId++,
      startTime: this.time.currentTime,
      endTime: this.time.currentTime + delay,
      callback,
      delay,
      args
    }
    const index = this._timeoutList.findIndex(event => delayInfo.endTime >= event.endTime)
    this._timeoutList.splice(index + 1, 0, delayInfo)

    return delayInfo.timeoutId
  }

  clearTimeout(timeoutId: number) {
    const index = this._timeoutList.findIndex(event => event.timeoutId === timeoutId)
    if (index === -1) return
    this._timeoutList.splice(index, 1)
  }

  private resolveSetTimeout() {
    const index = this._timeoutList.findIndex(event => event.endTime <= this.time.currentTime + 0.0001)
    if (index === -1) return;
    const needResolve = this._timeoutList.splice(0, index + 1)
    for (const delayInfo of needResolve) {
      try {
        delayInfo.callback(...delayInfo.args)
      } catch (e) {
        throw e
      }
    }
  }

  /** Main loop, all _tickers will called in this method */
  update() {
    const currentTime = this.timeline.currentTime;

    const durationTime = currentTime - this._lastFrameTime;
    if (durationTime >= this._frameDuration) {
      const frameTime = currentTime - (durationTime % this._frameDuration);
      const deltaTime = frameTime - this._lastFrameTime;
      this._lastFrameTime = frameTime;

      const options: UpdateParams = {
        deltaTime,
        time: frameTime,
        currentTime: frameTime,
        frameCount: ++this._frameCount,
        fps: Math.round(1000 / deltaTime),
      };
      this.time = options

      for (const func of this._tickers) {
        if (typeof func === 'function') {
          func(options);
        }
      }

      this.resolveFrameDelay()
      this.resolveSetTimeout()
    }
  }

  /** Add ticker function */
  add(fn) {
    this._tickers.add(fn);
  }

  /** Remove ticker function */
  remove(fn) {
    this._tickers.delete(fn);
  }

  /** Start main loop */
  start() {
    if (this._started) return;
    this._started = true;
    this.timeline.playbackRate = 1.0;
    this._requestId = requestAnimationFrame(this._ticker);
  }

  /** Pause main loop */
  pause() {
    this._started = false;
    this.timeline.playbackRate = 0;
  }
  setPlaybackRate(rate: number) {
    this.timeline.playbackRate = rate
  }
}

export default Ticker;
