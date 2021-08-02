import { UpdateParams } from '../core/Component';
import Timeline from 'sprite-timeline';

interface TickerOptions {
  autoStart?: boolean;
  frameRate?: number;
}

/** Default Ticker Options */
const defaultOptions: Partial<TickerOptions> = {
  autoStart: true,
  frameRate: 60
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
  private _ticker: (time?: any) => void;

  /** Represents the status of the Ticker, If ticker has started, the value is true */
  private _started: boolean;

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
        time: currentTime,
        currentTime: currentTime,
        frameCount: ++this._frameCount,
        fps: Math.round(1000 / deltaTime)
      };

      for (const func of this._tickers) {
        if (typeof func === 'function') {
          func(options);
        }
      }
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
}

export default Ticker;
