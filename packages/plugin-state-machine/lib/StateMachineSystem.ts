import { System } from '@eva/eva.js';

/**
 * StateMachineSystem — 仅用于注册;StateMachine 自身在 Component.update 中驱动。
 *
 * 之所以保留这个空 System,是因为 Eva.js 的注册习惯是 component + system 成对出现,
 * 而且未来如果要加全局调度(例如 group: physics 在 HitArea 之后才能切状态)可以扩展这里。
 */
export class StateMachineSystem extends System {
  static systemName = 'StateMachine';
  readonly name = 'StateMachine';
}
