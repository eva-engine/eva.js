import { UpdateParams } from '../core/Component';

interface TickerOptions {
  autoStart: boolean;
  frameRate: number;
}

/** Default Ticker Options */
const defaultOptions: TickerOptions = {
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

  /** Time between two frame */
  private _frameDuration: number;

  /** Ticker is a function will called in each raf */
  private _tickers: Set<unknown>;

  /** Block time */
  private _blockTime: number;

  /** raf handle id */
  _requestId: number;

  /** Last frame render time */
  private _lastTime: number;

  /** Frame count since from ticker beigning */
  private _frameCount: number;

  private _activeWithPause: boolean;

  /** Main ticker method handle */
  private _ticker: (time?: any) => void;

  /** Represents the status of the Ticker, If ticker has started, the value is true */
  private _started: boolean;

  /** Last stop time */
  private _lastStopTime: number;

  /**
   * @param autoStart - auto start game
   * @param frameRate - game frame rate
   */
  constructor(options?: TickerOptions) {
    options = Object.assign({}, defaultOptions, options);

    this._frameDuration = 1000 / options.frameRate;
    this.autoStart = options.autoStart;
    this.frameRate = options.frameRate;

    this._tickers = new Set();
    this._requestId = null;
    this._blockTime = 0;
    this._lastTime = Date.now();
    this._frameCount = 0;

    this._activeWithPause = false;

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
    const time = Date.now();
    if (time - this._lastTime >= this._frameDuration) {
      const durationTime = time - this._lastTime;
      const frameTime = time - (durationTime % this._frameDuration);
      const deltaTime = frameTime - this._lastTime;
      this._lastTime = frameTime;
      const e: UpdateParams = {
        deltaTime,
        frameCount: ++this._frameCount,
        time: time - this._blockTime,
        fps: Math.round(1000 / deltaTime),
      };
      for (const func of this._tickers) {
        if (typeof func === 'function') {
          func(e);
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
    if (this._started) {
      return;
    }
    if (this._lastStopTime > 0) {
      this._blockTime = this._blockTime + Date.now() - this._lastStopTime;
      this._lastStopTime = 0;
    }
    this._started = true;

    this._lastTime = Date.now();
    this._requestId = requestAnimationFrame(this._ticker);
  }

  /** Pause main loop */
  pause() {
    this._started = false;
    this._lastStopTime = Date.now();
  }

  active() {
    if (!this._activeWithPause) {
      this.start();
    }
    this._activeWithPause = false;
  }
  background() {
    if (!this._started) {
      this._activeWithPause = true;
    } else {
      this.pause();
    }
  }
}

export default Ticker;
