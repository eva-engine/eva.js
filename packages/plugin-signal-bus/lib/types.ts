/** 信号 payload 的可选 schema 描述,用于 manifest / inspector */
export interface SignalSchema {
  name: string;
  description?: string;
  payload?: Record<string, 'number' | 'string' | 'boolean' | 'object'>;
}

/** 信号回调签名 */
export type SignalListener<T = any> = (payload: T) => void;

/** 监听句柄,调用 dispose() 取消订阅 */
export interface SignalHandle {
  dispose(): void;
}

/**
 * 外部传输层。传入 transport 后,所有 emit/on/off 走 transport,
 * 不再走本地 listener Map(防双发——nian 早期"1 次点击 spawn 2 颗子弹"的根因)。
 */
export interface SignalTransport {
  emit(name: string, payload?: unknown): void;
  on(name: string, fn: (payload?: unknown) => void): void;
  off(name: string, fn: (payload?: unknown) => void): void;
}

export interface SignalBusOptions {
  /** 外部 transport(通常是 mx.event 或 EventEmitter 实例)。null/undefined 走本地 fallback。 */
  transport?: SignalTransport | null;
  /** listener 抛错时是否 console.error。默认 true。设 false 仅适用 unit test 内主动构造的预期错误。 */
  logListenerErrors?: boolean;
}

/**
 * 订阅作用域:'game' 跨 scene 保留(默认),'scene' 在 sceneChanged 时自动 dispose。
 *
 * D1 决策:默认 game 单例。需要 scene 边界自动清理时显式传 { scope: 'scene' },
 * 避免 fulu/nian 这类多 scene 游戏跨场景残留 listener。
 */
export type SignalScope = 'game' | 'scene';

export interface SignalSubscribeOptions {
  scope?: SignalScope;
}

/**
 * 类型化 bus facade,由 SignalBus.typed<P>() 返回。零成本 cast,运行时仍是同一 SignalBus 实例。
 */
export interface TypedSignalBus<P extends Record<string, unknown>> {
  emit<K extends keyof P & string>(name: K, payload: P[K]): void;
  on<K extends keyof P & string>(
    name: K,
    fn: (payload: P[K]) => void,
    opts?: SignalSubscribeOptions,
  ): SignalHandle;
  once<K extends keyof P & string>(
    name: K,
    fn: (payload: P[K]) => void,
    opts?: SignalSubscribeOptions,
  ): SignalHandle;
  off<K extends keyof P & string>(name?: K, fn?: (payload: P[K]) => void): void;
}

/**
 * Phase 4 预留契约:供未来 @eva/plugin-devtools 的 __gameDebug.listSignals 钩子使用。
 * 现仅定义类型,SignalBus 提供 __getDebugSnapshot() internal API 实现 listSignals。
 */
export interface GameDebugHook {
  listSignals?(): Array<{ name: string; listenerCount: number }>;
}

export interface SignalBusDebugSnapshot {
  signals: Array<{ name: string; listenerCount: number }>;
  schemas: SignalSchema[];
  transport: 'local' | 'external';
}
