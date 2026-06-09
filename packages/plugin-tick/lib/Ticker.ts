import type { TickHook, TickGroup, TickHandle } from './types';

interface Entry {
  fn: TickHook;
  group: TickGroup;
  priority: number;
  paused: boolean;
}

const GROUP_ORDER: TickGroup[] = ['physics', 'logic', 'late'];

/**
 * Ticker:可靠的帧调度器。
 *
 * 设计目标:消除每个 Component / Plugin 自己写 setInterval+performance.now
 * 的重复劳动,统一一个时间源、一个 dt 上限、一个 group 顺序。
 *
 * 三个分组按固定顺序触发:`physics` → `logic` → `late`,
 * 同组内按 `priority` 升序;dt 单位 ms,且夹紧在 [0, 50] 内,
 * 防止页面切回时一次性补发大 dt 把游戏震飞。
 *
 * 实现细节:
 * - 优先用 `requestAnimationFrame`(主路径,与 Eva.js Ticker 一致)
 * - tab 隐藏 / `requestAnimationFrame` 被节流时,自动 fallback 到
 *   `setInterval(16)`(WallTick),保证倒计时这种用户感知强的逻辑不停。
 *   切回前台再回到 RAF。
 */
export class Ticker {
  private entries: Entry[] = [];
  private last: number = 0;
  private rafId: number | null = null;
  private intervalId: any = null;
  private started = false;
  private mode: 'raf' | 'wall' = 'raf';

  /** 单帧 dt 上限,单位 ms */
  static readonly MAX_DT = 50;
  /** WallTick 间隔,单位 ms */
  static readonly WALL_INTERVAL = 16;

  start() {
    if (this.started) return;
    this.started = true;
    this.last = this.now();
    this.bindVisibility();
    this.switchToRaf();
  }

  stop() {
    this.started = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  add(fn: TickHook, group: TickGroup = 'logic', priority: number = 0): TickHandle {
    const entry: Entry = { fn, group, priority, paused: false };
    this.entries.push(entry);
    this.entries.sort((a, b) => {
      const ga = GROUP_ORDER.indexOf(a.group);
      const gb = GROUP_ORDER.indexOf(b.group);
      if (ga !== gb) return ga - gb;
      return a.priority - b.priority;
    });
    return {
      dispose: () => {
        const i = this.entries.indexOf(entry);
        if (i >= 0) this.entries.splice(i, 1);
      },
    };
  }

  /** 强制切换到 wall 模式(用于测试或主动覆盖 RAF) */
  forceWallMode() {
    this.switchToWall();
  }

  /** 强制切换到 RAF 模式 */
  forceRafMode() {
    this.switchToRaf();
  }

  private now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private bindVisibility() {
    if (typeof document === 'undefined') return;
    const handler = () => {
      if (!this.started) return;
      if (document.hidden) {
        // 切到 wall,避免 RAF 节流导致 timer 停跑
        this.switchToWall();
      } else {
        // 回到前台,恢复 RAF
        this.switchToRaf();
      }
    };
    document.addEventListener('visibilitychange', handler);
  }

  private switchToRaf() {
    if (!this.started) return;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof requestAnimationFrame === 'undefined') {
      this.switchToWall();
      return;
    }
    this.mode = 'raf';
    this.last = this.now();
    const loop = () => {
      if (!this.started || this.mode !== 'raf') return;
      this.tickOnce();
      this.rafId = requestAnimationFrame(loop);
    };
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(loop);
  }

  private switchToWall() {
    if (!this.started) return;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.mode = 'wall';
    this.last = this.now();
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (!this.started || this.mode !== 'wall') return;
      this.tickOnce();
    }, Ticker.WALL_INTERVAL);
  }

  private tickOnce() {
    const cur = this.now();
    let dt = cur - this.last;
    this.last = cur;
    if (dt < 0) dt = 0;
    if (dt > Ticker.MAX_DT) dt = Ticker.MAX_DT;
    // 复制一份,fn 内部 dispose 不影响本帧迭代
    const snap = this.entries.slice();
    for (const e of snap) {
      if (e.paused) continue;
      try {
        e.fn(dt, cur);
      } catch (err) {
        // 单个回调异常不能拖垮整帧
        // eslint-disable-next-line no-console
        console.error('[plugin-tick] tick handler error', err);
      }
    }
  }
}
