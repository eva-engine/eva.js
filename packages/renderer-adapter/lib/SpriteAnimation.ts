import {extras} from 'pixi.js';

export default class SpriteAnimation {
  animatedSprite: extras.AnimatedSprite;
  constructor({frames}) {
    this.animatedSprite = new extras.AnimatedSprite(frames);
  }
  play() {
    this.animatedSprite.play();
  }
  stop() {
    this.animatedSprite.stop();
  }
  set speed(val) {
    this.animatedSprite.animationSpeed = val;
  }
  get speed() {
    return this.animatedSprite.animationSpeed;
  }
}
