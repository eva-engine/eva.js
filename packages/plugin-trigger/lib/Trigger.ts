import { Component, decorators } from '@eva/eva.js';
import { getSignalBus, SignalHandle } from '@eva/plugin-signal-bus';
import type { TriggerParams, TriggerRule, TriggerAction } from './types';

declare const mx: any;

/**
 * Trigger 组件 — 把信号映射成 DSL 动作。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "Trigger",
 *   "props": {
 *     "rules": [
 *       { "on": "input:fire:press",
 *         "do": [
 *           { "type": "emit", "signal": "rocket:spawn" },
 *           { "type": "incStore", "key": "shotsFired" }
 *         ] },
 *       { "on": "rocket:hit",
 *         "guard": "ctx.allowedScene === true",
 *         "do": [
 *           { "type": "incStore", "key": "score" },
 *           { "type": "emit", "signal": "monster:hurt" }
 *         ] }
 *     ]
 *   }
 * }
 * ```
 *
 * 这是 plugin-state-machine 的"无状态弟弟":只配 input → output,不维护 state。
 * 适合写 80% 的"按钮按下→记分"业务,大幅减少自定义 Component 数量。
 */
@decorators.componentObserver({})
export class Trigger extends Component<TriggerParams> {
  static componentName = 'Trigger';

  private rules: TriggerRule[] = [];
  private subs: SignalHandle[] = [];
  ctx: Record<string, any> = {};

  init(params?: TriggerParams) {
    if (!params) return;
    this.rules = params.rules ?? [];
    this.ctx = params.context ?? {};
  }

  awake() {
    const bus = getSignalBus();
    for (const rule of this.rules) {
      const h = bus.on(rule.on, (payload: any) => {
        if (rule.guard && !this.evalGuard(rule.guard, payload)) return;
        for (const a of rule.do) this.exec(a, payload);
      });
      this.subs.push(h);
    }
  }

  private exec(action: TriggerAction, payload: any) {
    try {
      switch (action.type) {
        case 'emit':
          getSignalBus().emit(action.signal, action.payload ?? payload);
          break;
        case 'setStore':
          if (typeof mx !== 'undefined' && mx?.store?.update) {
            mx.store.update(action.key, () => action.value);
          }
          break;
        case 'incStore':
          if (typeof mx !== 'undefined' && mx?.store?.update) {
            mx.store.update(action.key, (v: number) => (v ?? 0) + (action.delta ?? 1));
          }
          break;
        case 'log':
          // eslint-disable-next-line no-console
          console.log('[trigger]', action.message, payload);
          break;
        case 'callMethod':
          this.callMethod(action.entity, action.component, action.method, action.args ?? []);
          break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[plugin-trigger] action failed', action, err);
    }
  }

  private callMethod(entity: string, compName: string, method: string, args: any[]) {
    const game: any = (this as any).gameObject?.scene?.game;
    if (!game) return;
    const stack: any[] = [...(game.scene?.gameObjects ?? [])];
    while (stack.length) {
      const go = stack.pop();
      if (!go) continue;
      if (go.name === entity) {
        const comps: any[] = go.components ?? [];
        const c = comps.find((c) => c?.constructor?.componentName === compName);
        if (c && typeof c[method] === 'function') {
          c[method](...args);
        }
        return;
      }
      if (go.transform?.children?.length) {
        for (const ch of go.transform.children) stack.push(ch.gameObject);
      }
    }
  }

  private evalGuard(guard: string, payload: any): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const fn = new Function('payload', 'ctx', `return (${guard});`);
      return Boolean(fn(payload, this.ctx));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-trigger] bad guard "${guard}":`, err);
      return false;
    }
  }

  onDestroy() {
    for (const h of this.subs) h.dispose();
    this.subs = [];
  }
}
