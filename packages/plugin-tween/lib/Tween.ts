import { Component, decorators } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { Easing } from './easing';
import { bindPath, PathBinding } from './path';
import type { TweenParams, TweenStep, EasingName } from './types';

interface RunningStep {
  binding: PathBinding;
  from: number;
  to: number;
  duration: number;
  easing: (t: number) => number;
  delay: number;
  elapsed: number;
  done: boolean;
}

/**
 * Tween 组件 — Godot Tween 等价物。
 *
 * 与 plugin-transition 区别:
 * - 不限制 target 类型(transform/Component/store 都行)
 * - 内置 sequence 与 parallel 编排
 * - 完成 emit 命名信号
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "Tween",
 *   "props": {
 *     "step": {
 *       "target": "components.RocketAimer.currentAngleDeg",
 *       "from": -60, "to": 60, "duration": 1500, "easing": "easeInOutQuad"
 *     },
 *     "yoyo": true, "loop": -1, "autostart": true
 *   }
 * }
 * ```
 */
@decorators.componentObserver({})
export class Tween extends Component<TweenParams> {
  static componentName = 'Tween';

  private steps: TweenStep[] = [];
  private parallel = false;
  private yoyo = false;
  private loop = 0;
  private autostart = false;
  private signal?: string;

  private running: RunningStep[] = [];
  private isPlaying = false;
  private playedLoops = 0;
  private cursor = 0; // sequence 当前 step
  private direction: 1 | -1 = 1;

  init(params?: TweenParams) {
    if (!params) return;
    this.steps = params.step ? [params.step] : (params.steps ?? []);
    this.parallel = params.parallel ?? false;
    this.yoyo = params.yoyo ?? false;
    this.loop = params.loop ?? 0;
    this.autostart = params.autostart ?? false;
    this.signal = params.signal;
  }

  awake() {
    if (this.autostart) this.play();
  }

  /** 重新开始 */
  play() {
    this.buildRunning();
    this.isPlaying = true;
    this.playedLoops = 0;
    this.cursor = 0;
    this.direction = 1;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    if (this.running.length) this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    this.running = [];
  }

  private buildRunning() {
    this.running = [];
    for (const s of this.steps) {
      const binding = bindPath(this.gameObject, s.target);
      if (!binding) {
        // eslint-disable-next-line no-console
        console.warn(`[plugin-tween] binding miss: ${s.target}`);
        continue;
      }
      const from = s.from ?? binding.read();
      this.running.push({
        binding,
        from,
        to: s.to,
        duration: Math.max(1, s.duration),
        easing: Easing[(s.easing ?? 'linear') as EasingName] ?? Easing.linear,
        delay: s.delay ?? 0,
        elapsed: 0,
        done: false,
      });
    }
  }

  update(e: { deltaTime: number }) {
    if (!this.isPlaying || this.running.length === 0) return;
    const dt = e.deltaTime;

    if (this.parallel) {
      this.advanceParallel(dt);
    } else {
      this.advanceSequence(dt);
    }
  }

  private advanceParallel(dt: number) {
    let allDone = true;
    for (const r of this.running) {
      if (r.done) continue;
      this.tickStep(r, dt);
      if (!r.done) allDone = false;
    }
    if (allDone) this.onCycleEnd();
  }

  private advanceSequence(dt: number) {
    while (dt > 0 && this.cursor < this.running.length) {
      const r = this.running[this.cursor];
      if (r.done) {
        this.cursor++;
        continue;
      }
      const before = r.elapsed;
      this.tickStep(r, dt);
      const used = r.elapsed - before;
      dt -= used;
      if (!r.done) break;
      this.cursor++;
    }
    if (this.cursor >= this.running.length) this.onCycleEnd();
  }

  private tickStep(r: RunningStep, dt: number) {
    if (r.delay > 0) {
      const used = Math.min(r.delay, dt);
      r.delay -= used;
      // 把延时算进 elapsed 不合适,留给 sequence 减 dt
      // 这里直接消耗 dt 后返回
      return;
    }
    r.elapsed += dt;
    const t = Math.min(1, r.elapsed / r.duration);
    const v = r.from + (r.to - r.from) * r.easing(t);
    r.binding.write(v);
    if (t >= 1) {
      r.done = true;
    }
  }

  private onCycleEnd() {
    this.playedLoops++;
    const shouldLoop = this.loop === -1 || this.playedLoops <= this.loop;
    if (this.yoyo) {
      this.direction = (this.direction === 1 ? -1 : 1) as 1 | -1;
      // yoyo:反向重置
      for (const r of this.running) {
        const a = r.from;
        r.from = r.to;
        r.to = a;
        r.elapsed = 0;
        r.done = false;
      }
      this.cursor = 0;
      if (!shouldLoop && this.direction === 1) {
        this.finish();
      }
      return;
    }
    if (shouldLoop) {
      for (const r of this.running) {
        r.elapsed = 0;
        r.done = false;
      }
      this.cursor = 0;
      return;
    }
    this.finish();
  }

  private finish() {
    this.isPlaying = false;
    if (this.signal) getSignalBus().emit(this.signal, { component: this });
    getSignalBus().emit('tween:finish', { component: this });
  }
}
