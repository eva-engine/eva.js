import { AnimatedSprite } from 'pixi.js';

export default class SpriteAnimation {
  animatedSprite: AnimatedSprite;
  constructor({ frames }) {
    this.animatedSprite = new AnimatedSprite(frames);
  }
  play() {
    this.animatedSprite.play();
  }
  stop() {
    this.animatedSprite.stop();
  }
  gotoAndPlay(frameNumber) {
    this.animatedSprite.gotoAndPlay(frameNumber);
  }
  gotoAndStop(frameNumber) {
    this.animatedSprite.gotoAndStop(frameNumber);
  }
  set speed(val) {
    this.animatedSprite.animationSpeed = val;
  }
  get speed() {
    return this.animatedSprite.animationSpeed;
  }
}
