import { SpineSystem as SpineSystemBase } from '@eva/spine-base';
import pixiSpine from './pixi-spine';
export default class SpineSystem extends SpineSystemBase {
  init() {
    super.init({ pixiSpine });
  }
}
