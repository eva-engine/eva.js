import {System} from '@eva/eva.js';
import TWEEN from '@tweenjs/tween.js';

export default class TransitionSystem extends System {
  static systemName = 'transition';
  readonly name = 'transition';

  update() {
    TWEEN.update();
  }

  // remove all active tweens
  onDestroy() {
    TWEEN.removeAll();
  }
}
