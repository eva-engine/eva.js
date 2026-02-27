import { System } from '@eva/eva.js';

/**
 * 过渡动画系统
 *
 * TransitionSystem 是一个轻量级系统，主要用于注册 Transition 插件到游戏中。
 * 实际的动画逻辑由 Transition 组件自身的 update 方法处理。
 *
 * @example
 * ```typescript
 * game.addSystem(new TransitionSystem());
 * ```
 */
export default class TransitionSystem extends System {
  /** 系统名称 */
  static systemName = 'transition';
  /** 系统实例名称 */
  readonly name = 'transition';
}
