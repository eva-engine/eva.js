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

/** goto() 第二参可选 options;旧调用 goto(to, 'reason') 保留向后兼容 */
export interface GotoOptions {
  /** 迁移原因,落到 onEnter / onExit / signalChange payload 的 reason 字段 */
  reason?: string;
  /**
   * 即便 current === to 也强制走 exit→enter 一遍。
   * 默认 false(no-op short-circuit)。常用于"重入同一 state 重新初始化定时器/订阅"。
   */
  force?: boolean;
}

/**
 * 全局信号 `'fsm:reset'` 的 payload。
 * 任意 StateMachine.reset() 调用都会 emit 这条信号,便于消费方观测。
 */
export interface FsmResetPayload {
  /** gameObject.name(在 framework 层是实体身份的最小可得线索) */
  entityId: string | undefined;
  /** 组件名(目前固定 'StateMachine',为未来子类预留) */
  fsmName: string;
  /** reset 前所处的 state(可能是 '' / initial / 任意业务 state) */
  fromState: string;
  /** 调用方透传的 payload(reset() 入参) */
  payload?: any;
}

/**
 * 全局信号 `'fsm:scene-switch'` 的 payload。
 * StateMachineSystem 在 game `sceneChanged` 时 emit,**框架不自动 reset**,
 * 消费方根据自己语义决定是否手动 reset 挂在 globalEntities 上的 FSM。
 */
export interface FsmSceneSwitchPayload {
  /** 新 scene 标识(无法稳定取到时为 undefined) */
  scene?: unknown;
  /** game.emit('sceneChanged', payload) 的原始 payload 透传 */
  raw?: unknown;
}
