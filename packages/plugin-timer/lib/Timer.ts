import { Component, decorators } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';

export interface TimerParams {
  /** 倒计时,毫秒 */
  wait: number;
  /** 一次性还是循环 */
  oneShot?: boolean;
  /** 是否自动开始 */
  autostart?: boolean;
  /** timeout 后 emit 的信号名 */
  signal?: string;
  /** 每次 tick(每个 dt)同时 emit 的信号(可选,例如 countdown:tick) */
  tickSignal?: string;
  /** tick 信号最小间隔(毫秒,默认 0 = 每帧) */
  tickInterval?: number;
}

/**
 * Timer 组件 — Godot Timer 等价物。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "Timer",
 *   "props": {
 *     "wait": 30000,
 *     "oneShot": true,
 *     "autostart": true,
 *     "signal": "game:timeup",
 *     "tickSignal": "countdown:tick",
 *     "tickInterval": 100
 *   }
 * }
 * ```
 *
 * 行为:
 * - `start()`、`stop()`、`pause()`、`resume()`、`reset()` API
 * - 计时基于 Component.update(dt) 而不是 setInterval,
 *   当页面隐藏时由 plugin-tick 的 wall fallback 接管
 * - 每次 tick emit `timer:tick`(若 `tickSignal` 配置),
 *   timeout emit `timer:timeout` 与 `signal`(若配置)
 */
@decorators.componentObserver({})
export class Timer extends Component<TimerParams> {
  static componentName = 'Timer';

  wait = 1000;
  oneShot = true;
  autostart = false;
  signal?: string;
  tickSignal?: string;
  tickInterval = 0;

  private elapsed = 0;
  private tickAcc = 0;
  private running = false;

  /** 已经运行的累计毫秒数 */
  get timeElapsed(): number {
    return this.elapsed;
  }

  /** 距离 timeout 还剩多少毫秒(<= 0 表示已触发) */
  get timeLeft(): number {
    return Math.max(0, this.wait - this.elapsed);
  }

  init(params?: TimerParams) {
    if (params) {
      this.wait = params.wait ?? 1000;
      this.oneShot = params.oneShot ?? true;
      this.autostart = params.autostart ?? false;
      this.signal = params.signal;
      this.tickSignal = params.tickSignal;
      this.tickInterval = params.tickInterval ?? 0;
    }
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
    this.elapsed = 0;
    this.tickAcc = 0;
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.running = true;
  }

  reset() {
    this.elapsed = 0;
    this.tickAcc = 0;
  }

  awake() {
    if (this.autostart) this.start();
  }

  update(e: { deltaTime: number }) {
    if (!this.running) return;
    const dt = e.deltaTime;
    this.elapsed += dt;
    this.tickAcc += dt;
    if (this.tickSignal && this.tickAcc >= this.tickInterval) {
      getSignalBus().emit(this.tickSignal, {
        elapsed: this.elapsed,
        left: this.timeLeft,
      });
      this.tickAcc = 0;
    }
    if (this.elapsed >= this.wait) {
      const bus = getSignalBus();
      bus.emit('timer:timeout', { component: this });
      if (this.signal) bus.emit(this.signal, { component: this });
      if (this.oneShot) {
        this.stop();
      } else {
        // 循环:保留余数,不丢精度
        this.elapsed = this.elapsed - this.wait;
      }
    }
  }
}
