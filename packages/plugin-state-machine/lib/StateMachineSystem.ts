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
  /**
   * 是否在 game `sceneChanged` 时自动对所有 StateMachine 实例调 `reset()`(ADR-0024B)。
   *
   * **默认 false**(向后兼容,与 ADR-0011/0017 "framework 不自动 reset"契约一致)。
   *
   * 设为 true 时,System 在 sceneChanged 后会:
   *   1. 先 emit `'fsm:scene-switch'` 观测信号(保持既有契约)
   *   2. 再 walk 当前 game.gameObjects,找所有 StateMachine Component 调 `reset()`
   *
   * 注意:scene-scoped 实体上的 FSM 会随 scene 销毁,reset 主要影响 globalEntities
   * 上的 FSM。这是 ctx.fsm.attach(BehaviorContext)在 detach 时的 fallback —
   * BehaviorScript 控制更细粒度的 attach handle 时不需要开启 autoReset。
   */
  autoResetOnSceneSwitch?: boolean;
}

export class StateMachineSystem extends System<StateMachineSystemParams> {
  static systemName = 'StateMachine';
  readonly name = 'StateMachine';

  private emitSceneSwitch = true;
  private autoResetOnSceneSwitch = false;
  private sceneChangedHandler: ((payload: unknown) => void) | null = null;

  init(params?: StateMachineSystemParams) {
    if (params?.emitSceneSwitch === false) this.emitSceneSwitch = false;
    if (params?.autoResetOnSceneSwitch === true) this.autoResetOnSceneSwitch = true;
  }

  awake() {
    if (!this.emitSceneSwitch && !this.autoResetOnSceneSwitch) return;
    if (!this.game) return;
    this.sceneChangedHandler = (raw: unknown) => {
      // game.emit('sceneChanged', { scene, mode, params }) — 透传整包,
      // 同时把 scene 抽到顶层方便消费方判断
      const scene =
        raw && typeof raw === 'object' && 'scene' in (raw as Record<string, unknown>)
          ? (raw as { scene?: unknown }).scene
          : undefined;
      if (this.emitSceneSwitch) {
        const payload: FsmSceneSwitchPayload = { scene, raw };
        getSignalBus().emit(FSM_SCENE_SWITCH_SIGNAL, payload);
      }
      if (this.autoResetOnSceneSwitch) {
        this.resetAllStateMachines();
      }
    };
    this.game.on('sceneChanged', this.sceneChangedHandler);
  }

  /**
   * 遍历 game.gameObjects 找所有 StateMachine Component 调 reset()。
   * 仅在 `autoResetOnSceneSwitch === true` 时被 awake 钩子调用。
   *
   * 注意:walk 失败时 swallow error 不抛(scene 切换 latency 路径不应被
   * 单个 FSM 异常阻断,fsm.reset 内部已有 fail-safe console.warn)。
   */
  private resetAllStateMachines() {
    if (!this.game) return;
    const gameObjects: any[] = (this.game as any).gameObjects ?? [];
    for (const go of gameObjects) {
      if (!go || typeof go !== 'object') continue;
      const comps: any[] = go.components ?? [];
      for (const comp of comps) {
        if (!comp) continue;
        // duck-typing:同时识别 constructor.componentName 与 instance.name
        const componentName =
          comp?.constructor?.componentName ?? comp?.name ?? '';
        if (componentName !== 'StateMachine') continue;
        if (typeof comp.reset !== 'function') continue;
        try {
          comp.reset();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[plugin-state-machine] auto-reset failed:', err);
        }
      }
    }
  }

  onDestroy() {
    if (this.sceneChangedHandler && this.game) {
      this.game.off('sceneChanged', this.sceneChangedHandler);
    }
    this.sceneChangedHandler = null;
  }
}
