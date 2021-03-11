import {Tween, Easing} from '@tweenjs/tween.js';

interface CacheItem {
  property: Record<string, any>;
  key: string;
}

type Cache = Record<string, CacheItem>;

const easingMap = {
  linear: Easing.Linear.None,
  'ease-in': Easing.Quadratic.In,
  'ease-out': Easing.Quadratic.Out,
  'ease-in-out': Easing.Quadratic.InOut,
  'bounce-in': Easing.Bounce.In,
  'bounce-out': Easing.Bounce.Out,
  'bounce-in-out': Easing.Bounce.InOut,
  none: p => ~~p,
};

export default class Animation {
  private tweens = [];
  private timelines = [];
  private finishCount = 0;
  private callbacks = new Map();

  stoped: boolean;
  currIteration: number = 0;
  iteration: number;
  checkFinishFunc: Function;
  objectCache: Record<string, Cache> = {};

  constructor(timelines) {
    this.timelines = timelines;
  }
  play(iteration = 1) {
    this.stoped = false;
    this.start();
    this.currIteration = 0;
    this.iteration = iteration;
  }
  start() {
    this.finishCount = 0;
    this.tweens.length = 0;
    this.init();
    this.tweens.forEach(tween => tween.start());
  }
  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks.set(eventName, []);
    }
    this.callbacks.get(eventName).push(callback);
  }
  emit(eventName) {
    const callbacks = this.callbacks.get(eventName);
    if (!callbacks || !callbacks.length) return;
    callbacks.forEach(fn => fn());
  }
  checkFinish() {
    if (++this.finishCount == this.tweens.length) {
      if (++this.currIteration == this.iteration) {
        this.emit('finish');
      } else {
        if (this.stoped) return;
        this.start();
      }
    }
  }
  getObjectCache(component, name): CacheItem {
    const key = `${component.gameObject.id}${component.name}`;
    if (!this.objectCache[key]) {
      // @ts-ignore
      this.objectCache[key] = {};
    }
    if (this.objectCache[key][name]) {
      return this.objectCache[key][name];
    }
    const keys = name.split('.');
    const keyIndex = keys.length - 1;
    let property = component;
    for (let i = 0; i < keyIndex; i++) {
      property = property[keys[i]];
    }
    this.objectCache[key][name] = {property, key: keys[keyIndex]};
    return this.objectCache[key][name];
  }
  doAnim({component, name, value}) {
    const {property, key} = this.getObjectCache(component, name);
    property[key] = value;
  }
  init() {
    this.checkFinishFunc = this.checkFinish.bind(this);

    let lastTween;
    this.timelines.forEach((timeline, i) => {
      for (let j = 0; j < timeline.values.length - 1; j++) {
        const frame = timeline.values[j];
        const nextFrame = timeline.values[j + 1];

        const tween = new Tween({value: frame.value});
        tween.to({value: nextFrame.value});
        tween.duration(nextFrame.time - frame.time);
        tween.easing(easingMap[frame.tween]);
        tween.onUpdate(props => {
          this.doAnim({
            component: timeline.component,
            name: timeline.name,
            value: props.value,
          });
        });

        if (j === 0) {
          this.tweens[i] = tween;
        } else {
          lastTween.chain(tween);
        }
        lastTween = tween;
      }

      lastTween && lastTween.onComplete(() => this.checkFinishFunc());
    });
  }
  stop() {
    this.stoped = true;
    this.tweens.forEach(tween => tween.stop());
  }
  destroy() {
    this.stop();
    this.tweens = null;
    this.timelines = null;
    this.objectCache = null;
    this.callbacks.clear();
    this.callbacks = null;
  }
}
