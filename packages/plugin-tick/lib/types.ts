/** 每帧回调签名 */
export type TickHook = (dt: number, time: number) => void;

/** Tick 调度分组 */
export type TickGroup = 'physics' | 'logic' | 'late';

/** 注册返回的句柄,调用 dispose() 即取消 */
export interface TickHandle {
  dispose(): void;
}
