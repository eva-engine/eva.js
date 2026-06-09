export interface PersistenceParams {
  /** localStorage 命名空间;实际 key = `${ns}:${storeKey}` */
  namespace: string;
  /** 哪些 store keys 需要持久化 */
  keys: string[];
  /** 自动加载(awake 时把 storage 写回 mx.store) */
  autoload?: boolean;
  /** 自动保存:键变化时写 storage(默认 true) */
  autosave?: boolean;
  /** 保存触发节流(ms),默认 200 */
  saveDebounceMs?: number;
}
