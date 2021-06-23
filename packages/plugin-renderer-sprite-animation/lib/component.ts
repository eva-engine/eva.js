import {Component, decorators} from '@eva/eva.js';
import {SpriteAnimation as SpriteAnimationEngine} from '@eva/renderer-adapter';

export interface SpriteAnimationParams {
  resource: string;
  autoPlay: boolean;
  speed: number;
}

export default class SpriteAnimation extends Component {
  static componentName: string = 'SpriteAnimation';
  @decorators.IDEProp resource: string = '';
  @decorators.IDEProp autoPlay: boolean = true;
  @decorators.IDEProp speed: number = 100;
  _animate: SpriteAnimationEngine;
  private waitPlay: boolean = false;
  private waitStop: boolean = false;
  private times: number = Infinity;
  private count: number = 0;
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
    this.on('onLoop', () => {
      if (++this.count >= this.times) {
        this.animate.stop();
        this.emit('onComplete');
      }
    });
  }
  play(times = Infinity) {
    if (times === 0) {
      return;
    }
    this.times = times;
    if (!this.animate) {
      this.waitPlay = true;
    } else {
      this.animate.play();
      this.count = 0;
    }
  }
  stop() {
    if (!this.animate) {
      this.waitStop = true;
    } else {
      this.animate.stop();
    }
  }
  set animate(val) {
    this._animate = val;
    if (this.waitPlay) {
      this.waitPlay = false;
      this.play(this.times);
    }
    if (this.waitStop) {
      this.waitStop = false;
      this.stop();
    }
  }
  get animate() {
    return this._animate;
  }
  gotoAndPlay(frameNumber) {
    this.animate.gotoAndPlay(frameNumber);
  }
  gotoAndStop(frameNumber) {
    this.animate.gotoAndStop(frameNumber);
  }
}
