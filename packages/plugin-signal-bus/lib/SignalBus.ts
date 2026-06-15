import type {
  SignalSchema,
  SignalListener,
  SignalHandle,
  SignalTransport,
  SignalBusOptions,
  SignalSubscribeOptions,
  TypedSignalBus,
  SignalBusDebugSnapshot,
} from './types';

type AnyListener = (payload?: unknown) => void;

/**
 * SignalBus:命名空间事件总线。
 *
 * 替代每个游戏自造 EventBus.ts。约定:
 * - 信号名采用冒号分隔的命名空间,例如 `monster:hit`、`game:over`、`score:change`
 * - 通过 schema 注册的信号在 manifest 中可见,便于 LLM / Editor 自动补全
 * - 同一名字多次 emit 是允许的,监听器拷贝快照后再 fire,
 *   防止订阅者在回调里 off/on 引发遍历崩溃
 * - 可选 transport:传入后所有 emit/on/off 走外部总线(mx.event/EventEmitter),
 *   **绝不双发**——历史上正是 nian "1 次点击 spawn 2 颗子弹"的根因
 * - 类型化:通过 `bus.typed<P>()` 拿到泛型 facade,emit/on 编译期检查 payload shape
 */
export class SignalBus {
  private listeners: Map<string, Set<SignalListener>> = new Map();
  private schemas: Map<string, SignalSchema> = new Map();
  private transport: SignalTransport | null;
  private logErrors: boolean;
  /**
   * transport 模式下,fn -> wrapped 映射。off 时通过 fn 反查 wrapped 才能从 transport 注销。
   * 用 WeakMap 避免持有 fn 引用导致内存泄漏。
   */
  private wrappedMap: WeakMap<SignalListener, AnyListener> = new WeakMap();
  /**
   * scope:'scene' 的订阅句柄,sceneChanged 时统一 dispose。
   * SignalBusSystem.awake 内 hook game.on('sceneChanged') 调用 disposeSceneScoped()。
   */
  private sceneScopedHandles: Set<SignalHandle> = new Set();

  constructor(opts: SignalBusOptions = {}) {
    this.transport = opts.transport ?? null;
    this.logErrors = opts.logListenerErrors !== false;
  }

  /** 声明信号 schema(可选,但建议),后续 manifest 会展示 */
  register(schema: SignalSchema) {
    this.schemas.set(schema.name, schema);
  }

  /** 批量声明 */
  registerMany(schemas: SignalSchema[]) {
    for (const s of schemas) this.register(s);
  }

  on<T = any>(
    name: string,
    fn: SignalListener<T>,
    opts?: SignalSubscribeOptions,
  ): SignalHandle {
    let handle: SignalHandle;
    if (this.transport) {
      const wrapped: AnyListener = (payload) => fn(payload as T);
      this.wrappedMap.set(fn as SignalListener, wrapped);
      this.transport.on(name, wrapped);
      handle = {
        dispose: () => {
          this.transport?.off(name, wrapped);
          this.wrappedMap.delete(fn as SignalListener);
          this.sceneScopedHandles.delete(handle);
        },
      };
    } else {
      let set = this.listeners.get(name);
      if (!set) {
        set = new Set();
        this.listeners.set(name, set);
      }
      set.add(fn as SignalListener);
      handle = {
        dispose: () => {
          const s = this.listeners.get(name);
          if (s) s.delete(fn as SignalListener);
          this.sceneScopedHandles.delete(handle);
        },
      };
    }
    if (opts?.scope === 'scene') this.sceneScopedHandles.add(handle);
    return handle;
  }

  once<T = any>(
    name: string,
    fn: SignalListener<T>,
    opts?: SignalSubscribeOptions,
  ): SignalHandle {
    const h = this.on<T>(
      name,
      (payload: T) => {
        h.dispose();
        fn(payload);
      },
      opts,
    );
    return h;
  }

  /**
   * 由 SignalBusSystem 在 game `sceneChanged` 事件中调用,清理所有 scope:'scene' 订阅。
   * 普通业务代码不需要直接调用。
   */
  disposeSceneScoped() {
    if (this.sceneScopedHandles.size === 0) return;
    const snap = Array.from(this.sceneScopedHandles);
    this.sceneScopedHandles.clear();
    for (const h of snap) h.dispose();
  }

  off(name: string, fn?: SignalListener) {
    if (this.transport) {
      if (fn) {
        const wrapped = this.wrappedMap.get(fn);
        if (wrapped) {
          this.transport.off(name, wrapped);
          this.wrappedMap.delete(fn);
        }
      }
      // transport 模式下 off(name) 无 fn 是 no-op:外部总线一般不暴露"清空一个 name"
      // 的 API,且我们没有持有该 name 下所有 fn 的索引。需要清空请用 clear()。
      return;
    }

    const s = this.listeners.get(name);
    if (!s) return;
    if (!fn) {
      s.clear();
      return;
    }
    s.delete(fn);
  }

  emit<T = any>(name: string, payload?: T) {
    if (this.transport) {
      this.transport.emit(name, payload);
      return;
    }

    const s = this.listeners.get(name);
    if (!s) return;
    // 快照,允许 listener 在回调内做 off/on
    const snap = Array.from(s);
    for (const fn of snap) {
      try {
        fn(payload as T);
      } catch (err) {
        if (this.logErrors) {
          // console.error 而不是 console.warn — 故意让错误显眼,不要给上游业务"以为没事"的错觉
          // eslint-disable-next-line no-console
          console.error(`[plugin-signal-bus] listener of "${name}" threw`, err);
        }
      }
    }
  }

  clear() {
    this.listeners.clear();
    // transport 模式下:无法穷举外部 listener,清本地 wrappedMap 没意义,跳过
  }

  /** 获取所有已注册的 schema(供 manifest / inspector) */
  getSchemas(): SignalSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * 类型化 facade。零成本 cast,运行时仍是同一 SignalBus 实例。
   * 用法:
   *   type Events = { 'fire': { x:number } };
   *   const tbus = bus.typed<Events>();
   *   tbus.emit('fire', { x: 1 });   // ✅
   *   tbus.emit('fire', { y: 1 });   // ❌ 编译错
   */
  typed<P extends Record<string, unknown>>(): TypedSignalBus<P> {
    return this as unknown as TypedSignalBus<P>;
  }

  /**
   * Phase 4 internal:供 @eva/plugin-devtools 的 __gameDebug.listSignals 实现。
   * 不挂全局,签名稳定。
   */
  __getDebugSnapshot(): SignalBusDebugSnapshot {
    const signals: Array<{ name: string; listenerCount: number }> = [];
    for (const [name, set] of this.listeners) {
      signals.push({ name, listenerCount: set.size });
    }
    return {
      signals,
      schemas: this.getSchemas(),
      transport: this.transport ? 'external' : 'local',
    };
  }
}

let GLOBAL_BUS: SignalBus | null = null;

export function getSignalBus(): SignalBus {
  if (!GLOBAL_BUS) GLOBAL_BUS = new SignalBus();
  return GLOBAL_BUS;
}

/**
 * 仅供 SignalBusSystem 在 init 时根据 DSL params 重建全局单例。
 * 测试场景也可用此重置 GLOBAL_BUS。普通业务代码不要直接调用。
 */
export function __setGlobalSignalBus(bus: SignalBus | null) {
  GLOBAL_BUS = bus;
}
