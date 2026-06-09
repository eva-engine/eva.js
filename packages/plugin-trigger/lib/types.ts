/** 单条 action,DSL 描述时只填 type + 字段 */
export type TriggerAction =
  | { type: 'emit'; signal: string; payload?: any }
  | { type: 'setStore'; key: string; value: any }
  | { type: 'incStore'; key: string; delta?: number }
  | { type: 'log'; message: string }
  | { type: 'callMethod'; entity: string; component: string; method: string; args?: any[] };

export interface TriggerRule {
  /** 监听的信号名 */
  on: string;
  /** 命中后执行的动作列表 */
  do: TriggerAction[];
  /** 可选:JS 表达式;以 (payload, ctx) 为变量,假则跳过 */
  guard?: string;
}

export interface TriggerParams {
  rules: TriggerRule[];
  /** ctx 变量,可在 guard 中读 */
  context?: Record<string, any>;
}
