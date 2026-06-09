import type { SignalSchema, SignalListener, SignalHandle } from './types';

/**
 * SignalBus:命名空间事件总线。
 *
 * 替代每个游戏自造 EventBus.ts。约定:
 * - 信号名采用冒号分隔的命名空间,例如 `monster:hit`、`game:over`、`score:change`
 * - 通过 schema 注册的信号在 manifest 中可见,便于 LLM / Editor 自动补全
 * - 同一名字多次 emit 是允许的,监听器拷贝快照后再 fire,
 *   防止订阅者在回调里 off/on 引发遍历崩溃
 */
export class SignalBus {
  private listeners: Map<string, Set<SignalListener>> = new Map();
  private schemas: Map<string, SignalSchema> = new Map();

  /** 声明信号 schema(可选,但建议),后续 manifest 会展示 */
  register(schema: SignalSchema) {
    this.schemas.set(schema.name, schema);
  }

  /** 批量声明 */
  registerMany(schemas: SignalSchema[]) {
    for (const s of schemas) this.register(s);
  }

  on<T = any>(name: string, fn: SignalListener<T>): SignalHandle {
    let set = this.listeners.get(name);
    if (!set) {
      set = new Set();
      this.listeners.set(name, set);
    }
    set.add(fn as SignalListener);
    return {
      dispose: () => {
        const s = this.listeners.get(name);
        if (s) s.delete(fn as SignalListener);
      },
    };
  }

  once<T = any>(name: string, fn: SignalListener<T>): SignalHandle {
    const h = this.on<T>(name, (payload: T) => {
      h.dispose();
      fn(payload);
    });
    return h;
  }

  off(name: string, fn?: SignalListener) {
    const s = this.listeners.get(name);
    if (!s) return;
    if (!fn) {
      s.clear();
      return;
    }
    s.delete(fn);
  }

  emit<T = any>(name: string, payload?: T) {
    const s = this.listeners.get(name);
    if (!s) return;
    // 快照,允许 listener 在回调内做 off/on
    const snap = Array.from(s);
    for (const fn of snap) {
      try {
        fn(payload as T);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[plugin-signal-bus] listener of "${name}" threw`, err);
      }
    }
  }

  clear() {
    this.listeners.clear();
  }

  /** 获取所有已注册的 schema(供 manifest / inspector) */
  getSchemas(): SignalSchema[] {
    return Array.from(this.schemas.values());
  }
}

let GLOBAL_BUS: SignalBus | null = null;

export function getSignalBus(): SignalBus {
  if (!GLOBAL_BUS) GLOBAL_BUS = new SignalBus();
  return GLOBAL_BUS;
}
