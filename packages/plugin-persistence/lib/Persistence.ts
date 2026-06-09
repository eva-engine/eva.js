import { Component, decorators } from '@eva/eva.js';
import { getSignalBus, SignalHandle } from '@eva/plugin-signal-bus';
import type { PersistenceParams } from './types';

declare const mx: any;

/**
 * Persistence 组件 — mx.store 关键 keys ↔ localStorage 自动同步。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "Persistence",
 *   "props": {
 *     "namespace": "nian",
 *     "keys": ["highScore", "completedTutorial"],
 *     "autoload": true,
 *     "autosave": true
 *   }
 * }
 * ```
 *
 * 设计:
 * - autoload:awake 时把 localStorage 中已有的值写回 mx.store。
 * - autosave:监听 `store:change:{key}` 信号,debounce 后写 localStorage。
 *   要求宿主在 store update 时 emit 这个信号(也可以用 SignalBus.emit 包一层)。
 * - 提供命令式 save() / load() / clear() 给手动调用。
 */
@decorators.componentObserver({})
export class Persistence extends Component<PersistenceParams> {
  static componentName = 'Persistence';

  private namespace = '';
  private keys: string[] = [];
  private autoload = true;
  private autosave = true;
  private saveDebounceMs = 200;
  private saveTimer: any = null;
  private subs: SignalHandle[] = [];

  init(params?: PersistenceParams) {
    if (!params) return;
    this.namespace = params.namespace;
    this.keys = params.keys ?? [];
    this.autoload = params.autoload ?? true;
    this.autosave = params.autosave ?? true;
    this.saveDebounceMs = params.saveDebounceMs ?? 200;
  }

  awake() {
    if (this.autoload) this.load();
    if (this.autosave) {
      const bus = getSignalBus();
      for (const k of this.keys) {
        this.subs.push(
          bus.on(`store:change:${k}`, () => this.scheduleSave())
        );
      }
    }
  }

  load() {
    if (typeof localStorage === 'undefined') return;
    if (typeof mx === 'undefined' || !mx?.store?.update) return;
    for (const k of this.keys) {
      try {
        const raw = localStorage.getItem(this.fullKey(k));
        if (raw == null) continue;
        const v = JSON.parse(raw);
        mx.store.update({ [k]: v });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[plugin-persistence] load "${k}" failed`, err);
      }
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    if (typeof mx === 'undefined' || !mx?.store?.get) return;
    for (const k of this.keys) {
      try {
        const v = mx.store.get(k);
        if (v === undefined) continue;
        localStorage.setItem(this.fullKey(k), JSON.stringify(v));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[plugin-persistence] save "${k}" failed`, err);
      }
    }
  }

  clear() {
    if (typeof localStorage === 'undefined') return;
    for (const k of this.keys) {
      try {
        localStorage.removeItem(this.fullKey(k));
      } catch {}
    }
  }

  private scheduleSave() {
    if (this.saveTimer != null) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.save();
    }, this.saveDebounceMs);
  }

  private fullKey(k: string): string {
    return `${this.namespace}:${k}`;
  }

  onDestroy() {
    for (const h of this.subs) h.dispose();
    this.subs = [];
    if (this.saveTimer != null) clearTimeout(this.saveTimer);
    this.saveTimer = null;
    // 退出前同步刷盘
    this.save();
  }
}
