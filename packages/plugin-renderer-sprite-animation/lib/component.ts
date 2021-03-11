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
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
  }
  play() {
    if (!this.animate) {
      this.waitPlay = true;
    } else {
      this.animate.play();
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
}
