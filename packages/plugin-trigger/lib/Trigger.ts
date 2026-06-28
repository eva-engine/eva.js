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
          this.callMethod(action.entity, action.component, action.method, action.args ?? [], action.ref);
          break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[plugin-trigger] action failed', action, err);
    }
  }

  /**
   * 按 (entity, componentName[, ref]) 查找并调用方法。
   *
   * ADR-0024B:加 `ref` 字段后修复 alert-chase.json 等模板"同 entity 多
   * BehaviorScript / Trigger 静默 dedup"的 hidden broken state。匹配规则:
   *   - 无 ref:按 `(entity, componentName)` 取首个命中(legacy 行为)
   *   - 有 ref:按 `(entity, componentName, ref)` 三元组定位,匹配 instance.ref /
   *           instance.name / constructor.ref 字段(优先 instance.ref,与
   *           ADR-0021 BehaviorScript first-class 一致)
   */
  private callMethod(entity: string, compName: string, method: string, args: any[], ref?: string) {
    const game: any = (this as any).gameObject?.scene?.game;
    if (!game) return;
    const stack: any[] = [...(game.scene?.gameObjects ?? [])];
    while (stack.length) {
      const go = stack.pop();
      if (!go) continue;
      if (go.name === entity) {
        const comps: any[] = go.components ?? [];
        const c = this.findComponentByRef(comps, compName, ref);
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

  /**
   * 从 comps 列表里取出符合 (componentName, ref) 的 Component 实例。
   *
   * `ref` 可选 - 未传时取首个 componentName 匹配的实例(legacy);传入时按
   * 三元组定位,匹配优先级 instance.ref → instance.name → constructor.ref。
   */
  private findComponentByRef(
    comps: any[],
    componentName: string,
    ref?: string,
  ): any {
    if (!ref) {
      return comps.find((c) => c?.constructor?.componentName === componentName);
    }
    return comps.find((c) => {
      if (c?.constructor?.componentName !== componentName) return false;
      // 优先 instance.ref(ADR-0021 BehaviorScript first-class)
      if (typeof c.ref === 'string' && c.ref === ref) return true;
      // fallback:instance.name(自定义 Component 习惯字段)
      if (typeof c.name === 'string' && c.name === ref) return true;
      // fallback:constructor.ref(静态标签)
      if (c?.constructor?.ref === ref) return true;
      return false;
    });
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
