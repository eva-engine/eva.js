import { System } from '@eva/eva.js';

/**
 * Tween 没有跨实体编排,System 仅用于注册 plugin。
 */
export class TweenSystem extends System {
  static systemName = 'Tween';
  readonly name = 'Tween';
}
