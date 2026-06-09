/** 单条迁移规则 */
export interface TransitionRule {
  /** 触发该迁移的信号名 */
  on?: string;
  /** 进入该状态后等待 N ms 自动迁移(可与 on 二选一) */
  after?: number;
  /** 目标状态名 */
  to: string;
  /** 可选:JS 表达式字符串,以 ctx 为上下文 */
  guard?: string;
}

export interface StateConfig {
  /** 进入时 emit 的信号 */
  onEnter?: string;
  /** 退出时 emit 的信号 */
  onExit?: string;
  /** 该状态下的迁移规则 */
  transitions?: TransitionRule[];
}

export interface StateMachineParams {
  initial: string;
  states: Record<string, StateConfig>;
  /** 状态切换 emit 信号 */
  signalChange?: string;
  /** 上下文变量,可在 guard 中读 */
  context?: Record<string, any>;
}
