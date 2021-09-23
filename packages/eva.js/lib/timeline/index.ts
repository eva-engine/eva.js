import { createNowTime } from './utils';

interface TimelineOptions {
  originTime?: number;
  playbackRate?: number;
}

interface TimeMark {
  globalTime: number;
  localTime: number;
  entropy: number;
  playbackRate: number;
  globalEntropy: number;
}

type NowTimeFactor = () => number;

const _nowtime: NowTimeFactor = createNowTime();

const defaultOptions: TimelineOptions = {
  originTime: 0,
  playbackRate: 1.0,
};

class Timeline {
  private _timeMark: TimeMark[];
  private _playbackRate: number;
  private _parent: Timeline;
  private _createTime: number;

  constructor(options: TimelineOptions | Timeline, parent?: Timeline) {
    if (options instanceof Timeline) {
      parent = options;
      options = {};
    }

    options = Object.assign({}, defaultOptions, options) as TimelineOptions;

    if (parent) {
      this._parent = parent;
    }

    this._createTime = _nowtime();

    this._timeMark = [
      {
        globalTime: this.globalTime,
        localTime: -options.originTime,
        entropy: -options.originTime,
        playbackRate: options.playbackRate,
        globalEntropy: 0,
      },
    ];

    if (this._parent) {
      this._timeMark[0].globalEntropy = this._parent.entropy;
    }

    this._playbackRate = options.playbackRate;
  }

  get globalTime() {
    return this.parent ? this.parent.currentTime : _nowtime() - this._createTime
  }

  get parent() {
    return this._parent;
  }

  get lastTimeMark() {
    return this._timeMark[this._timeMark.length - 1];
  }

  markTime({ time = this.currentTime, entropy = this.entropy, playbackRate = this.playbackRate } = {}) {
    const timeMark = {
      globalTime: this.globalTime,
      localTime: time,
      entropy,
      playbackRate,
      globalEntropy: this.globalEntropy,
    };
    this._timeMark.push(timeMark);
  }

  get currentTime() {
    const { localTime, globalTime } = this.lastTimeMark;
    return localTime + (this.globalTime - globalTime) * this.playbackRate;
  }

  set currentTime(time) {
    this.markTime({ time });
  }

  get globalEntropy() {
    return this._parent ? this._parent.entropy : this.globalTime;
  }

  get entropy() {
    const { entropy, globalEntropy } = this.lastTimeMark;
    return entropy + Math.abs((this.globalEntropy - globalEntropy) * this.playbackRate);
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  set entropy(entropy) {
    if (this.entropy > entropy) {
      const idx = this.seekTimeMark(entropy);
      this._timeMark.length = idx + 1;
    }
    this.markTime({ entropy });
  }

  fork(options) {
    return new Timeline(options, this);
  }

  seekGlobalTime(seekEntropy) {
    const idx = this.seekTimeMark(seekEntropy),
      timeMark = this._timeMark[idx];

    const { entropy, playbackRate, globalTime } = timeMark;

    return globalTime + (seekEntropy - entropy) / Math.abs(playbackRate);
  }

  seekLocalTime(seekEntropy) {
    const idx = this.seekTimeMark(seekEntropy),
      timeMark = this._timeMark[idx];

    const { localTime, entropy, playbackRate } = timeMark;

    if (playbackRate > 0) {
      return localTime + (seekEntropy - entropy);
    }
    return localTime - (seekEntropy - entropy);
  }

  seekTimeMark(entropy) {
    const timeMark = this._timeMark;

    let l = 0,
      r = timeMark.length - 1;

    if (entropy <= timeMark[l].entropy) {
      return l;
    }
    if (entropy >= timeMark[r].entropy) {
      return r;
    }

    let m = Math.floor((l + r) / 2); // binary search

    while (m > l && m < r) {
      if (entropy === timeMark[m].entropy) {
        return m;
      }
      if (entropy < timeMark[m].entropy) {
        r = m;
      } else if (entropy > timeMark[m].entropy) {
        l = m;
      }
      m = Math.floor((l + r) / 2);
    }

    return l;
  }

  get playbackRate() {
    return this._playbackRate;
  }

  set playbackRate(rate) {
    if (rate !== this.playbackRate) {
      this.markTime({ playbackRate: rate });
      this._playbackRate = rate;
    }
  }

  get paused() {
    if (this.playbackRate === 0) return true;
    let parent = this.parent;
    while (parent) {
      if (parent.playbackRate === 0) return true;
      parent = parent.parent;
    }
    return false;
  }
}

export default Timeline;
