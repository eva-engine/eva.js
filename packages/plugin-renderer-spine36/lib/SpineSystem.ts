import { SpineSystem as SpineSystemBase } from '@eva/spine-base';
import * as pixiSpine from 'pixi-spine36';
export default class SpineSystem extends SpineSystemBase {
  init() {
    super.init({ pixiSpine });
  }
}
