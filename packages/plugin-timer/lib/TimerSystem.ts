import { System } from '@eva/eva.js';

/**
 * Timer 没有跨实体的协调逻辑,System 仅用于注册 plugin。
 * 实际计时逻辑在 `Timer.update` 内。
 */
export class TimerSystem extends System {
  static systemName = 'Timer';
  readonly name = 'Timer';
}
