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
