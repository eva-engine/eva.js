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
  /**
   * owner → 该 owner 的所有订阅 handle。
   *
   * 用 WeakMap 持有 owner key,不阻止 GC;owner 被回收后 Set 失效,
   * 内存可自然释放。
   *
   * Component / GameObject 在 onDestroy 时调用 `disposeByOwner(this)`
   * 即可一把清空,解决"业务代码裸 on 不存 handle"的泄漏。
   */
  private ownerMap: WeakMap<object, Set<SignalHandle>> = new WeakMap();

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
    const owner = opts?.owner;
    // ADR-0016 P2-7: dev-mode 双订阅检测。同一 fn 引用第二次 on(同 name)是
    // 90% 概率是 leak — 业务忘了 dispose 或 onAwake 被重入(scene 切换 / hot reload)。
    // 同 owner 同 name 不同 fn 也警告 — 大概率是 closure 重复创建。
    // prod 构建被 dead-code-eliminated。
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      this._devDoubleSubscriptionWarn(name, fn as SignalListener, owner);
    }
    if (this.transport) {
      // 隐藏炸弹修复:同一 fn 第二次 on 时,wrappedMap.set 会静默覆盖旧 wrapped,
      // 导致老 wrapped 永远没法 transport.off,泄漏在外部总线里。先把旧 wrapped
      // 从 transport 注销,再注册新 wrapped。
      const prev = this.wrappedMap.get(fn as SignalListener);
      if (prev) this.transport.off(name, prev);
      const wrapped: AnyListener = (payload) => fn(payload as T);
      this.wrappedMap.set(fn as SignalListener, wrapped);
      this.transport.on(name, wrapped);
      handle = {
        dispose: () => {
          this.transport?.off(name, wrapped);
          // 仅当 wrappedMap 当前仍指向 wrapped 时才 delete,避免误清后续重新 on 的映射
          if (this.wrappedMap.get(fn as SignalListener) === wrapped) {
            this.wrappedMap.delete(fn as SignalListener);
          }
          this.sceneScopedHandles.delete(handle);
          if (owner) this._removeOwnerHandle(owner, handle);
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
          if (owner) this._removeOwnerHandle(owner, handle);
        },
      };
    }
    if (opts?.scope === 'scene') this.sceneScopedHandles.add(handle);
    if (owner) {
      let set = this.ownerMap.get(owner);
      if (!set) {
        set = new Set();
        this.ownerMap.set(owner, set);
      }
      set.add(handle);
    }
    return handle;
  }

  /** 内部:从 ownerMap 中清理一个 handle(handle.dispose 调) */
  private _removeOwnerHandle(owner: object, handle: SignalHandle) {
    const set = this.ownerMap.get(owner);
    if (!set) return;
    set.delete(handle);
    if (set.size === 0) this.ownerMap.delete(owner);
  }

  /**
   * 内部:dev-mode 双订阅检测。**仅在 `__DEV__` 构建下被调用**,prod 走 DCE。
   *
   * 三种 case:
   * 1. 同 fn 引用第二次 on(同 name)— 90% leak,警告
   * 2. 同 owner 同 name 不同 fn — 大概率是 closure 重复创建,警告
   * 3. 不同 owner 同 name 不同 fn — 正常,不警告
   *
   * 仅 console.warn,不 throw,不影响订阅本身。
   */
  private _devDoubleSubscriptionWarn(name: string, fn: SignalListener, owner: object | undefined) {
    // case 1: 同 fn 同 name 已存在
    if (this.transport) {
      if (this.wrappedMap.has(fn)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[plugin-signal-bus] duplicate subscription detected (transport mode): same fn reference on '${name}'. ` +
            `Likely a leak — old wrapper will be auto-unregistered. Pass { owner } and call disposeByOwner on cleanup.`,
        );
        return;
      }
    } else {
      const existing = this.listeners.get(name);
      if (existing && existing.has(fn)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[plugin-signal-bus] duplicate subscription detected: same fn reference on '${name}'. ` +
            `Set has dedup'd silently — old handle still alive. Likely a leak.`,
        );
        return;
      }
    }
    // case 2: 同 owner 同 name 已订阅(不同 fn,closure 重建嫌疑)
    if (owner) {
      const ownerSet = this.ownerMap.get(owner);
      if (ownerSet && ownerSet.size > 0) {
        // 探测 ownerSet 中是否已有针对同名 signal 的 handle — 当前 SignalHandle
        // 设计没保存 name,无法精确判断;退化为"同 owner 已有 N 个订阅"的弱信号。
        // 阈值 8:正常 Component 不会订阅 8 个以上 signal,超过通常是 leak。
        if (ownerSet.size >= 8) {
          // eslint-disable-next-line no-console
          console.warn(
            `[plugin-signal-bus] owner has ${ownerSet.size} active subscriptions before adding '${name}'. ` +
              `Did you forget disposeByOwner() between scene switches or onAwake re-entries?`,
          );
        }
      }
    }
  }

  /**
   * 批量取消某个 owner 注册过的所有订阅。
   *
   * Component / GameObject 在 `onDestroy` 时调用即可一次性清空泄漏,
   * 不再需要业务代码逐个 handle.dispose 或维护 disposer 数组。
   *
   * 没有任何订阅的 owner 调用此方法是 no-op,不会抛错。
   *
   * @example
   *   class Foo extends Component {
   *     onAwake() {
   *       getSignalBus().on('a', this.onA, { owner: this });
   *       getSignalBus().on('b', this.onB, { owner: this });
   *     }
   *     onDestroy() {
   *       // 一行清空所有订阅
   *       getSignalBus().disposeByOwner(this);
   *     }
   *   }
   */
  disposeByOwner(owner: object): void {
    if (!owner) return;
    const set = this.ownerMap.get(owner);
    if (!set || set.size === 0) {
      this.ownerMap.delete(owner);
      return;
    }
    // 先快照后清空,避免 handle.dispose 内回调再 mutate ownerMap 引发遍历崩溃
    const snap = Array.from(set);
    this.ownerMap.delete(owner);
    for (const h of snap) {
      try {
        h.dispose();
      } catch (err) {
        if (this.logErrors) {
          // eslint-disable-next-line no-console
          console.error('[plugin-signal-bus] handle.dispose threw in disposeByOwner', err);
        }
      }
    }
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
