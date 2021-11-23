import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
import { SpriteAnimation as SpriteAnimationEngine } from '@eva/renderer-adapter';

export interface SpriteAnimationParams {
  resource: string;
  autoPlay?: boolean;
  speed?: number;
  /** Stop at last frame */
  forwards?: boolean;
}

export default class SpriteAnimation extends Component<SpriteAnimationParams> {
  static componentName: string = 'SpriteAnimation';
  @type('string') resource: string = '';
  @type('boolean') autoPlay: boolean = true;
  @type('number') @step(10) speed: number = 100;
  @type('boolean') forwards: boolean = false;
  _animate: SpriteAnimationEngine;
  private waitPlay: boolean = false;
  private waitStop: boolean = false;
  private times: number = Infinity;
  private count: number = 0;
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
    this.on('loop', () => {
      if (++this.count >= this.times) {
        if (this.forwards) {
          this.animate.animatedSprite.loop = false
        } else {
          this.animate.stop();
          this.emit('complete');
        }
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
      if (times === 1 && this.forwards) {
        this.animate.animatedSprite.loop = false
      }
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
  get currentFrame() {
    return this.animate?.animatedSprite?.currentFrame
  }
  get totalFrames() {
    return this.animate?.animatedSprite?.totalFrames
  }
}
