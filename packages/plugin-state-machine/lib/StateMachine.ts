import { Component, decorators } from '@eva/eva.js';
import { getSignalBus, SignalHandle } from '@eva/plugin-signal-bus';
import type { StateMachineParams, StateConfig } from './types';

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
      this.enter(params.initial, '__init__');
    }
  }

  /** 主动迁移(代码侧也能调) */
  goto(to: string, reason: string = 'manual') {
    if (!this.states[to]) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-state-machine] no such state: ${to}`);
      return;
    }
    if (this.current === to) return;
    const from = this.current;
    if (from && this.states[from]?.onExit) {
      getSignalBus().emit(this.states[from].onExit!, { from, to, reason });
    }
    this.cleanupSubs();
    this.enter(to, reason);
  }

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
