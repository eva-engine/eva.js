import { System } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import type { FsmSceneSwitchPayload } from './types';

/** scene 切换观测信号:框架不自动 reset 任何 FSM,只 emit 让消费方决定 */
export const FSM_SCENE_SWITCH_SIGNAL = 'fsm:scene-switch';

/**
 * StateMachineSystem — 仅用于注册 + scene 切换观测。
 *
 * StateMachine 自身在 Component.update 中驱动。本 System 不主动 tick FSM。
 *
 * 跨 scene 行为:
 * - 挂在 globalEntities 上的 FSM 实例不会被销毁,`current` 保留旧值。
 * - 业务可能希望"切场景后回到 initial 重发 onEnter",但**这是消费方语义**,
 *   框架不能擅自 reset(否则关卡内 FSM 在 retry-scene 时全部清空,反而越权)。
 * - 因此本 System 只在 game `sceneChanged` 时 emit `'fsm:scene-switch'` 信号,
 *   消费方根据自己语义在监听器内调 `fsmComponent.reset()`。
 *
 * 默认行为可通过 `params.emitSceneSwitch = false` 关闭(纯静默注册)。
 */
interface StateMachineSystemParams {
  /**
   * 是否在 game `sceneChanged` 时 emit `'fsm:scene-switch'` 信号。默认 true。
   * 关闭后挂载该 System 与原版空 System 等价。
   */
  emitSceneSwitch?: boolean;
}

export class StateMachineSystem extends System<StateMachineSystemParams> {
  static systemName = 'StateMachine';
  readonly name = 'StateMachine';

  private emitSceneSwitch = true;
  private sceneChangedHandler: ((payload: unknown) => void) | null = null;

  init(params?: StateMachineSystemParams) {
    if (params?.emitSceneSwitch === false) this.emitSceneSwitch = false;
  }

  awake() {
    if (!this.emitSceneSwitch) return;
    if (!this.game) return;
    this.sceneChangedHandler = (raw: unknown) => {
      // game.emit('sceneChanged', { scene, mode, params }) — 透传整包,
      // 同时把 scene 抽到顶层方便消费方判断
      const scene =
        raw && typeof raw === 'object' && 'scene' in (raw as Record<string, unknown>)
          ? (raw as { scene?: unknown }).scene
          : undefined;
      const payload: FsmSceneSwitchPayload = { scene, raw };
      getSignalBus().emit(FSM_SCENE_SWITCH_SIGNAL, payload);
    };
    this.game.on('sceneChanged', this.sceneChangedHandler);
  }

  onDestroy() {
    if (this.sceneChangedHandler && this.game) {
      this.game.off('sceneChanged', this.sceneChangedHandler);
    }
    this.sceneChangedHandler = null;
  }
}
