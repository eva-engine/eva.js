import { extras } from 'pixi.js';

export default class SpriteAnimation {
  animatedSprite: extras.AnimatedSprite;
  constructor({ frames }) {
    this.animatedSprite = new extras.AnimatedSprite(frames);
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
