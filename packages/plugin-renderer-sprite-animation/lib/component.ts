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
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
  }
  play(times = this.times) {
    this.times = times;
    if (!this.animate) {
      this.waitPlay = true;
    } else {
      this.animate.play();
      let count = 0;
      this.on('onLoop', () => {
        console.log(count);
        if (++count >= times) {
          this.animate.stop();
          this.emit('onComplete')
        }
      });
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
      this.play();
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
    this.animate.gotoAndPlay(frameNumber)
  }
  gotoAndStop(frameNumber) {
    this.animate.gotoAndStop(frameNumber)
  }
}
