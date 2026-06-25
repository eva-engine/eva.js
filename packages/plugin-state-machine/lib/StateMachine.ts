import { Component, decorators } from '@eva/eva.js';
import { getSignalBus, SignalHandle } from '@eva/plugin-signal-bus';
import type { StateMachineParams, StateConfig, GotoOptions, FsmResetPayload } from './types';

/** 全局信号名:任意 reset() 都会 emit,供观测与跨实例联动 */
export const FSM_RESET_SIGNAL = 'fsm:reset';

/**
 * StateMachine 组件 — 简易有限状态机。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "StateMachine",
 *   "props": {
 *     "initial": "moving",
 *     "states": {
 *       "moving":   { "onEnter": "monster:state-moving",
 *                     "transitions": [
 *                       { "on": "monster:hit", "to": "knockback" },
 *                       { "after": 3000, "to": "resting" }
 *                     ] },
 *       "resting":  { "transitions": [{ "after": 1000, "to": "moving" }] },
 *       "knockback":{ "transitions": [{ "after": 800, "to": "resting" }] }
 *     },
 *     "signalChange": "monster:state-change"
 *   }
 * }
 * ```
 *
 * 行为:
 * - 进入状态:emit `onEnter` + `signalChange` { from, to }
 * - `transitions[i].on`: 监听信号,信号触发即迁移
 * - `transitions[i].after`: 进入状态 N ms 后自动迁移
 * - `transitions[i].guard`: JS 表达式,以 `ctx` 为变量,假则跳过该规则
 *
 * 不主动 emit 任何 lifecycle 信号超出上述列表;复杂语义请组合多个规则。
 */
@decorators.componentObserver({})
export class StateMachine extends Component<StateMachineParams> {
  static componentName = 'StateMachine';

  private states: Record<string, StateConfig> = {};
  private current: string = '';
  private signalChange?: string;
  private elapsedInState = 0;
  private subs: SignalHandle[] = [];

  /** 上下文,guard 可读 */
  ctx: Record<string, any> = {};

  init(params?: StateMachineParams) {
    if (!params) return;
    this.states = params.states ?? {};
    this.signalChange = params.signalChange;
    this.ctx = params.context ?? {};
    if (params.initial && this.states[params.initial]) {
      this.initialState = params.initial;
      this.enter(params.initial, '__init__');
    }
  }

  /**
   * 主动迁移(代码侧也能调)。
   *
   * 第二参向后兼容两种形式:
   * - `goto('idle', 'manual')` 旧签名,等价于 `{ reason: 'manual' }`
   * - `goto('idle', { reason: 'manual', force: true })` 新签名,`force:true` 时
   *   即便 `current === to` 也走 exit→enter,用于"重入同 state 重新初始化定时器/订阅"
   */
  goto(to: string, opts: string | GotoOptions = 'manual') {
    const { reason, force } = this.normalizeGotoOpts(opts);
    if (!this.states[to]) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-state-machine] no such state: ${to}`);
      return;
    }
    if (this.current === to && !force) return;
    const from = this.current;
    if (from && this.states[from]?.onExit) {
      getSignalBus().emit(this.states[from].onExit!, { from, to, reason });
    }
    this.cleanupSubs();
    this.enter(to, reason);
  }

  private normalizeGotoOpts(opts: string | GotoOptions): {
    reason: string;
    force: boolean;
  } {
    if (typeof opts === 'string') return { reason: opts, force: false };
    return {
      reason: opts.reason ?? 'manual',
      force: opts.force === true,
    };
  }

  /**
   * 显式 reset:强制回到 initial 并重发 onEnter,清掉所有挂在旧 state 上的订阅。
   *
   * 为什么独立于 goto:
   * - 跨 scene 切换时,挂在 globalEntities 上的 FSM 实例不会被销毁;
   *   `current` 保留旧值,旧 state 的 signal subs 仍生效,业务想"重置到 initial
   *   重发 onEnter"时用 `goto(initial)` 会被 short-circuit。
   * - `reset()` 走的是 `current = '' → enter(initial)`,绕过 short-circuit,
   *   并 emit `'fsm:reset'` 让消费方观测。
   * - 如果原 state 配了 `onExit`,会先 emit 一次再清订阅。
   *
   * 框架不会自动调 reset —— 跨 scene 是否要 reset 是消费方语义。
   * StateMachineSystem 只在 sceneChanged 时 emit `'fsm:scene-switch'` 提醒。
   */
  reset(payload?: any) {
    const initial = this.initialState;
    if (!initial) {
      // eslint-disable-next-line no-console
      console.warn('[plugin-state-machine] reset() called but no valid initial state');
      return;
    }
    const fromState = this.current;
    // 1. 先发 onExit(如果当前 state 有)
    if (fromState && this.states[fromState]?.onExit) {
      getSignalBus().emit(this.states[fromState].onExit!, {
        from: fromState,
        to: initial,
        reason: 'reset',
      });
    }
    // 2. 清订阅 + 把 current 拉回空串,让 enter() 不被 short-circuit
    this.cleanupSubs();
    this.current = '';
    // 3. 重发 onEnter(走 enter() 标准路径)
    this.enter(initial, 'reset');
    // 4. emit 全局观测信号
    const resetPayload: FsmResetPayload = {
      entityId: this.gameObject?.name,
      fsmName: StateMachine.componentName,
      fromState,
      payload,
    };
    getSignalBus().emit(FSM_RESET_SIGNAL, resetPayload);
  }

  /** reset() 用的 initial state 引用;init 时缓存一次,后续不变 */
  private initialState: string = '';

  get state(): string {
    return this.current;
  }

  private enter(to: string, reason: string) {
    const from = this.current;
    this.current = to;
    this.elapsedInState = 0;
    const cfg = this.states[to];
    if (!cfg) return;
    if (cfg.onEnter) getSignalBus().emit(cfg.onEnter, { from, to, reason });
    if (this.signalChange) getSignalBus().emit(this.signalChange, { from, to, reason });
    // 订阅本 state 的 on 信号
    const bus = getSignalBus();
    for (const t of cfg.transitions ?? []) {
      if (!t.on) continue;
      const target = t.to;
      const guard = t.guard;
      const h = bus.on(t.on, () => {
        if (this.current !== to) return; // 已经离开
        if (guard && !this.evalGuard(guard)) return;
        this.goto(target, t.on!);
      });
      this.subs.push(h);
    }
  }

  private cleanupSubs() {
    for (const h of this.subs) h.dispose();
    this.subs = [];
  }

  private evalGuard(guard: string): boolean {
    try {
      // 简单 expression eval,只暴露 ctx
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const fn = new Function('ctx', `return (${guard});`);
      return Boolean(fn(this.ctx));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-state-machine] bad guard "${guard}":`, err);
      return false;
    }
  }

  update(e: { deltaTime: number }) {
    this.elapsedInState += e.deltaTime;
    const cfg = this.states[this.current];
    if (!cfg?.transitions) return;
    for (const t of cfg.transitions) {
      if (t.after == null) continue;
      if (this.elapsedInState < t.after) continue;
      if (t.guard && !this.evalGuard(t.guard)) continue;
      this.goto(t.to, `after:${t.after}`);
      return;
    }
  }

  onDestroy() {
    this.cleanupSubs();
  }
}
