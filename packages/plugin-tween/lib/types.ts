export type EasingName =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';

export interface TweenStep {
  /** 目标路径,例如:
   *  - "transform.position.x"
   *  - "transform.rotation"
   *  - "components.RocketAimer.currentAngleDeg"
   *  - "store.score" (走 mx.store)
   */
  target: string;
  from?: number;
  to: number;
  duration: number;
  easing?: EasingName;
  delay?: number;
}

export interface TweenParams {
  /** 单步 = 一次性 to;steps = 多步序列 */
  step?: TweenStep;
  steps?: TweenStep[];
  /** 是否并行执行 steps(默认 sequence) */
  parallel?: boolean;
  yoyo?: boolean;
  /** -1 = 无限循环 */
  loop?: number;
  /** 是否自动开始 */
  autostart?: boolean;
  /** 完成后 emit 的信号 */
  signal?: string;
}
