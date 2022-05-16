import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';
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
  @Field() resource: string = '';
  @Field() autoPlay: boolean = true;
  @Field({ step: 10 }) speed: number = 100;
  @Field() forwards: boolean = false;
  _animate: SpriteAnimationEngine;
  private waitPlay: boolean = false;
  private waitStop: boolean = false;
  private times: number = Infinity;
  private count: number = 0;
  private complete: boolean = false;
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
    this.on('loop', () => {
      if (++this.count >= this.times) {
        if (this.forwards) {
          this.gotoAndStop(this.totalFrames - 1);
        } else {
          this.animate.stop();
        }
        this.complete = true;
        this.emit('complete');
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
      if (this.complete) {
        this.gotoAndStop(0);
      }
      this.animate.play();
      this.count = 0;
      this.complete = false;
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
    return this.animate?.animatedSprite?.currentFrame;
  }
  get totalFrames() {
    return this.animate?.animatedSprite?.totalFrames;
  }
}
