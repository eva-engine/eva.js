import {createNowTime, formatDelay} from './utils';

const _nowtime = createNowTime();

const defaultOptions = {
  originTime: 0,
  playbackRate: 1.0,
};

const _timeMark = Symbol('timeMark'),
  _playbackRate = Symbol('playbackRate'),
  _timers = Symbol('timers'),
  _originTime = Symbol('originTime'),
  _setTimer = Symbol('setTimer'),
  _parent = Symbol('parent');

class Timeline {
  constructor(options, parent) {
    if (options instanceof Timeline) {
      parent = options;
      options = {};
    }

    options = Object.assign({}, defaultOptions, options);

    if (parent) {
      this[_parent] = parent;
    }

    const nowtime = options.nowtime || _nowtime;
    if (!parent) {
      const createTime = nowtime();
      Object.defineProperty(this, 'globalTime', {
        get() {
          return nowtime() - createTime;
        },
      });
    } else {
      Object.defineProperty(this, 'globalTime', {
        get() {
          return parent.currentTime;
        },
      });
    }

    // timeMark records the reference points on timeline
    // Each time we change the playbackRate or currentTime or entropy
    // A new timeMark will be generated
    // timeMark sorted by entropy
    // If you reset entropy, all the timeMarks behind the new entropy
    // should be dropped
    this[_timeMark] = [
      {
        globalTime: this.globalTime,
        localTime: -options.originTime,
        entropy: -options.originTime,
        playbackRate: options.playbackRate,
        globalEntropy: 0,
      },
    ];

    if (this[_parent]) {
      this[_timeMark][0].globalEntropy = this[_parent].entropy;
    }

    this[_originTime] = options.originTime;
    this[_playbackRate] = options.playbackRate;
    this[_timers] = new Map();
  }

  get parent() {
    return this[_parent];
  }

  get lastTimeMark() {
    return this[_timeMark][this[_timeMark].length - 1];
  }

  markTime({time = this.currentTime, entropy = this.entropy, playbackRate = this.playbackRate} = {}) {
    const timeMark = {
      globalTime: this.globalTime,
      localTime: time,
      entropy,
      playbackRate,
      globalEntropy: this.globalEntropy,
    };
    this[_timeMark].push(timeMark);
  }

  get currentTime() {
    const {localTime, globalTime} = this.lastTimeMark;
    return localTime + (this.globalTime - globalTime) * this.playbackRate;
  }

  set currentTime(time) {
    const from = this.currentTime,
      to = time,
      timers = this[_timers];

    this.markTime({time});
    Array.from(Object.entries(timers)).forEach(([id, timer]) => {
      if (!timers.has(id)) return; // Need check because it maybe clearTimeout by former handler().
      const {isEntropy, delay, heading} = timer.time,
        {handler, startTime} = timer;

      if (!isEntropy) {
        const endTime = startTime + delay;
        if (
          delay === 0 ||
          (heading !== false && (to - from) * delay <= 0) ||
          (from <= endTime && endTime <= to) ||
          (from >= endTime && endTime >= to)
        ) {
          handler();
          this.clearTimeout(id);
        }
      } else if (delay === 0) {
        handler();
        this.clearTimeout(id);
      }
    });
    this.updateTimers();
  }

  // Both currentTime and entropy should be influenced by playbackRate.
  // If current playbackRate is negative, the currentTime should go backwards
  // while the entropy remain to go forwards.
  // Both of the initial values is set to -originTime
  get entropy() {
    const {entropy, globalEntropy} = this.lastTimeMark;
    return entropy + Math.abs((this.globalEntropy - globalEntropy) * this.playbackRate);
  }

  get globalEntropy() {
    return this[_parent] ? this[_parent].entropy : this.globalTime;
  }

  // get globalTime() {
  //   if(this[_parent]) {
  //     return this[_parent].currentTime;
  //   }

  //   return nowtime();
  // }

  // change entropy will NOT cause currentTime changing but may influence the pass
  // and the future of the timeline. (It may change the result of seek***Time)
  // While entropy is set, all the marks behind will be droped
  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  set entropy(entropy) {
    if (this.entropy > entropy) {
      const idx = this.seekTimeMark(entropy);
      this[_timeMark].length = idx + 1;
    }
    this.markTime({entropy});
    this.updateTimers();
  }

  fork(options) {
    return new Timeline(options, this);
  }

  seekGlobalTime(seekEntropy) {
    const idx = this.seekTimeMark(seekEntropy),
      timeMark = this[_timeMark][idx];

    const {entropy, playbackRate, globalTime} = timeMark;

    return globalTime + (seekEntropy - entropy) / Math.abs(playbackRate);
  }

  seekLocalTime(seekEntropy) {
    const idx = this.seekTimeMark(seekEntropy),
      timeMark = this[_timeMark][idx];

    const {localTime, entropy, playbackRate} = timeMark;

    if (playbackRate > 0) {
      return localTime + (seekEntropy - entropy);
    }
    return localTime - (seekEntropy - entropy);
  }

  seekTimeMark(entropy) {
    const timeMark = this[_timeMark];

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
    return this[_playbackRate];
  }

  set playbackRate(rate) {
    if (rate !== this.playbackRate) {
      this.markTime({playbackRate: rate});
      this[_playbackRate] = rate;
      this.updateTimers();
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

  updateTimers() {
    const timers = Array.from(this[_timers].entries());
    timers.forEach(([id, timer]) => {
      this[_setTimer](timer.handler, timer.time, id);
    });
  }

  clearTimeout(id) {
    const timer = this[_timers].get(id);

    if (timer && timer.timerID != null) {
      if (this[_parent]) {
        this[_parent].clearTimeout(timer.timerID);
      } else {
        clearTimeout(timer.timerID);
      }
    }
    this[_timers].delete(id);
  }

  clearInterval(id) {
    return this.clearTimeout(id);
  }

  clear() {
    // clear all running timers
    const timers = this[_timers];
    Array.from(Object.keys(timers)).forEach(id => {
      this.clearTimeout(id);
    });
  }

  /*
    setTimeout(func, {delay: 100, isEntropy: true})
    setTimeout(func, {entropy: 100})
    setTimeout(func, 100})
   */
  setTimeout(handler, time = {delay: 0}) {
    return this[_setTimer](handler, time);
  }

  setInterval(handler, time = {delay: 0}) {
    const that = this;
    const id = this[_setTimer](function step() {
      // reset timer before handler cause we may clearTimeout in handler()
      that[_setTimer](step, time, id);
      handler();
    }, time);

    return id;
  }

  [_setTimer](handler, time, id = Symbol('timerID')) {
    time = formatDelay(time);

    const timer = this[_timers].get(id);
    let delay,
      timerID = null,
      startTime,
      startEntropy;

    if (timer) {
      this.clearTimeout(id);
      if (time.isEntropy) {
        delay = (time.delay - (this.entropy - timer.startEntropy)) / Math.abs(this.playbackRate);
      } else {
        delay = (time.delay - (this.currentTime - timer.startTime)) / this.playbackRate;
      }
      startTime = timer.startTime;
      startEntropy = timer.startEntropy;
    } else {
      delay = time.delay / (time.isEntropy ? Math.abs(this.playbackRate) : this.playbackRate);
      startTime = this.currentTime;
      startEntropy = this.entropy;
    }

    const parent = this[_parent],
      globalTimeout = parent ? parent.setTimeout.bind(parent) : setTimeout;

    const heading = time.heading;
    // console.log(heading, parent, delay)
    if (!parent && heading === false && delay < 0) {
      delay = Infinity;
    }

    // if playbackRate is zero, delay will be infinity.
    // For wxapp bugs, cannot use Number.isFinite yet.
    if (isFinite(delay) || parent) {
      // eslint-disable-line no-restricted-globals
      delay = Math.ceil(delay);
      if (globalTimeout !== setTimeout) {
        delay = {delay, heading};
      }
      timerID = globalTimeout(() => {
        this[_timers].delete(id);
        handler();
      }, delay);
    }

    this[_timers].set(id, {
      timerID,
      handler,
      time,
      startTime,
      startEntropy,
    });

    return id;
  }
}

export default Timeline;
