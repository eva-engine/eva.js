/** 单条 action,DSL 描述时只填 type + 字段 */
export type TriggerAction =
  | { type: 'emit'; signal: string; payload?: any }
  | { type: 'setStore'; key: string; value: any }
  | { type: 'incStore'; key: string; delta?: number }
  | { type: 'log'; message: string }
  | {
      type: 'callMethod';
      entity: string;
      component: string;
      method: string;
      args?: any[];
      /**
       * 同 entity 上同 componentName 多实例时的实例区分符(ADR-0024B / ADR-0015)。
       *
       * 默认按 `(entity, componentName)` 二元组定位 — 同名多实例时取首个命中。
       * 设 `ref` 后按 `(entity, componentName, ref)` 三元组定位,匹配
       * `BehaviorScript` 的 ADR-0021 `ref` 字段或自定义 Component 的 `name` /
       * `static ref` 字段。
       *
       * 修复 alert-chase.json 模板"同 entity 多 BehaviorScript 静默 dedup"的
       * hidden broken state。
       */
      ref?: string;
    };

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
