/**
 * timer-control-deep — @eva/plugin-timer 命令式控制深度演示。
 *
 * 覆盖能力:
 * 1) 命令式 API:start / stop / pause / resume / reset(以 Timer.ts 源码为准)
 * 2) 自定义 signal + 内置 'timer:timeout' 同时触发(信号双发)
 * 3) loop 周期触发(源码字段是 oneShot:false,不是 loop:true)
 * 4) tickSignal + tickInterval(每 N ms 推进一次进度)
 * 5) 进度条 Graphics 实时绘制
 *
 * 注意:
 *  - Timer 源码没有 isRunning / isPaused getter,running 是 private。
 *    本 demo 在外层用 lastAction 推断 running/paused 显示状态,源码 getter 只有
 *    timeElapsed / timeLeft。
 *  - TimerParams 没有 onComplete 字段,等价做法是 bus.on(signal, ...) 或
 *    bus.on('timer:timeout', ...)。
 *  - 任务卡里写的 duration/loop/elapsed/remaining/isRunning/isPaused 是同义概念,
 *    DSL 真实字段是 wait/oneShot/timeElapsed/timeLeft + 外层推断状态。
 */

import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { Timer, TimerSystem } from '@eva/plugin-timer';

export const name =
  'timer-control-deep — start/stop/pause/resume/reset 全控制 + timer:timeout 信号';

type RunState = 'idle' | 'running' | 'paused' | 'stopped';

interface TimerHandle {
  label: string;
  comp: Timer;
  signal: string;
  loop: boolean;
  /** 外层推断的状态(源码 running 是 private,没有 getter) */
  state: RunState;
  /** 已触发 timeout 次数(loop 计数) */
  timeoutCount: number;
  /** 自定义 signal 触发次数 */
  customSignalCount: number;
  /** onComplete 回调命中次数(用 signal 模拟) */
  onCompleteHits: number;
}

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new TimerSystem(),
    ],
  });

  const bus = getSignalBus();

  // ---------------------------------------------------------------- Timer #1
  // 一次性 5s,autostart:false。展示命令式控制 + 自定义 signal。
  const timer1Comp = new Timer({
    wait: 5000,
    oneShot: true,
    autostart: false,
    signal: 'demo:timer:done',
    tickSignal: 'demo:timer:tick',
    tickInterval: 50,
  });
  const t1Go = new GameObject('timer1');
  t1Go.addComponent(timer1Comp);
  game.scene.addChild(t1Go);

  const timer1: TimerHandle = {
    label: 'timer1 (oneShot, manual)',
    comp: timer1Comp,
    signal: 'demo:timer:done',
    loop: false,
    state: 'idle',
    timeoutCount: 0,
    customSignalCount: 0,
    onCompleteHits: 0,
  };

  // ---------------------------------------------------------------- Timer #2
  // 循环 1.5s,autostart:true。源码:oneShot:false 即 loop。
  const timer2Comp = new Timer({
    wait: 1500,
    oneShot: false,
    autostart: true,
    signal: 'demo:loop:tick',
    tickSignal: 'demo:loop:tick:progress',
    tickInterval: 50,
  });
  const t2Go = new GameObject('timer2');
  t2Go.addComponent(timer2Comp);
  game.scene.addChild(t2Go);

  const timer2: TimerHandle = {
    label: 'timer2 (loop=oneShot:false, autostart)',
    comp: timer2Comp,
    signal: 'demo:loop:tick',
    loop: true,
    state: 'running',
    timeoutCount: 0,
    customSignalCount: 0,
    onCompleteHits: 0,
  };

  // ----------------------------------------------------------- Progress bars
  const BAR_W = 600;
  const bar1Bg = new GameObject('bar1-bg', { position: { x: 75, y: 220 } });
  (bar1Bg.addComponent(new Graphics()).graphics as any).rect(0, 0, BAR_W, 60).fill('#2a3142');
  game.scene.addChild(bar1Bg);
  const bar1Fg = new GameObject('bar1-fg', { position: { x: 75, y: 220 } });
  const bar1FgG = bar1Fg.addComponent(new Graphics());
  game.scene.addChild(bar1Fg);

  const bar2Bg = new GameObject('bar2-bg', { position: { x: 75, y: 360 } });
  (bar2Bg.addComponent(new Graphics()).graphics as any).rect(0, 0, BAR_W, 40).fill('#2a3142');
  game.scene.addChild(bar2Bg);
  const bar2Fg = new GameObject('bar2-fg', { position: { x: 75, y: 360 } });
  const bar2FgG = bar2Fg.addComponent(new Graphics());
  game.scene.addChild(bar2Fg);

  function drawBar(g: Graphics, ratio: number, color: string, h: number) {
    const w = Math.max(0, Math.min(BAR_W, BAR_W * ratio));
    (g.graphics as any).clear().rect(0, 0, w, h).fill(color);
  }

  // 进度条 50ms 刷一次
  const refreshTimer = window.setInterval(() => {
    const t1 = timer1.comp;
    const t2 = timer2.comp;
    drawBar(bar1FgG, t1.timeElapsed / t1.wait, '#ff7a45', 60);
    drawBar(bar2FgG, t2.timeElapsed / t2.wait, '#52c41a', 40);
    renderOverlay();
  }, 50);

  // ------------------------------------------------------------------ signal
  // 内置 'timer:timeout':所有 Timer 实例 timeout 都会发,payload.component 区分
  bus.on('timer:timeout', (p: any) => {
    const c: Timer = p?.component;
    if (c === timer1.comp) {
      timer1.timeoutCount += 1;
      // oneShot:true → timeout 后 stop(),状态归 stopped
      if (!timer1.loop) timer1.state = 'stopped';
    } else if (c === timer2.comp) {
      timer2.timeoutCount += 1;
    }
  });

  // 自定义 signal:只有对应 Timer 触发
  bus.on('demo:timer:done', () => {
    timer1.customSignalCount += 1;
    // 把 signal 当作 onComplete 等价物使用(源码无 onComplete 字段)
    timer1.onCompleteHits += 1;
    console.log('[timer1] demo:timer:done → onComplete equivalent fired', {
      timeElapsed: timer1.comp.timeElapsed,
      timeLeft: timer1.comp.timeLeft,
    });
  });
  bus.on('demo:loop:tick', () => {
    timer2.customSignalCount += 1;
  });

  // ---------------------------------------------------------------- keyboard
  window.addEventListener('keydown', e => {
    const before = snapshot(timer1);
    if (e.key === '1') {
      timer1.comp.start();
      timer1.state = 'running';
      logAction('start', timer1, before);
    } else if (e.key === '2') {
      timer1.comp.stop();
      timer1.state = 'stopped';
      logAction('stop', timer1, before);
    } else if (e.key === '3') {
      timer1.comp.pause();
      timer1.state = 'paused';
      logAction('pause', timer1, before);
    } else if (e.key === '4') {
      timer1.comp.resume();
      // resume 只在已 paused 上有效;否则保持当前
      timer1.state = timer1.state === 'paused' ? 'running' : timer1.state;
      logAction('resume', timer1, before);
    } else if (e.key === '5') {
      timer1.comp.reset();
      // reset 只清 elapsed,不改 running 状态
      logAction('reset', timer1, before);
    }
  });

  // ----------------------------------------------------------------- Overlay
  const panel = createOverlay(canvas);

  function renderOverlay() {
    const lines: string[] = [];
    lines.push('timer-control-deep — Timer 命令式 API + signal 演示');
    lines.push('');
    lines.push('Keys: [1]start [2]stop [3]pause [4]resume [5]reset (作用于 timer1)');
    lines.push('');
    lines.push('源码字段 ↔ 任务卡同义词:');
    lines.push('  wait↔duration, oneShot↔!loop, timeElapsed↔elapsed, timeLeft↔remaining');
    lines.push('  isRunning/isPaused 源码无 getter,demo 用 lastAction 推断');
    lines.push('  TimerParams 无 onComplete 字段,等价于 bus.on(signal,...)');
    lines.push('');
    lines.push(formatRow(['name', 'wait', 'elapsed', 'remaining', 'state', 'signal', 'loop']));
    lines.push(formatRow(['---', '---', '---', '---', '---', '---', '---']));
    lines.push(rowFor(timer1));
    lines.push(rowFor(timer2));
    lines.push('');
    lines.push(`timer1: timer:timeout 命中 ${timer1.timeoutCount} 次`);
    lines.push(`timer1: 自定义 signal '${timer1.signal}' 命中 ${timer1.customSignalCount} 次`);
    lines.push(`timer1: onComplete(等价) 命中 ${timer1.onCompleteHits} 次`);
    lines.push('');
    lines.push(`timer2: timer:timeout 命中 ${timer2.timeoutCount} 次  (loop 周期)`);
    lines.push(`timer2: 自定义 signal '${timer2.signal}' 命中 ${timer2.customSignalCount} 次`);
    panel.textContent = lines.join('\n');
  }

  function rowFor(t: TimerHandle) {
    return formatRow([
      t.label.split(' ')[0],
      String(t.comp.wait),
      Math.round(t.comp.timeElapsed).toString(),
      Math.round(t.comp.timeLeft).toString(),
      t.state,
      t.signal,
      String(t.loop),
    ]);
  }

  // 清理(examples 框架切页时不一定调用,放到 window 上方便手动调试)
  (window as any).__timerControlDeepCleanup = () => {
    window.clearInterval(refreshTimer);
  };
}

// -------------------------------------------------------------------- helpers
function snapshot(t: TimerHandle) {
  return {
    timeElapsed: Math.round(t.comp.timeElapsed),
    timeLeft: Math.round(t.comp.timeLeft),
    state: t.state,
  };
}

function logAction(
  action: 'start' | 'stop' | 'pause' | 'resume' | 'reset',
  t: TimerHandle,
  before: ReturnType<typeof snapshot>,
) {
  console.log(`[${t.label}] ${action}`, {
    before,
    after: snapshot(t),
  });
}

function formatRow(cols: string[]) {
  const widths = [22, 6, 8, 10, 9, 24, 6];
  return cols.map((c, i) => c.padEnd(widths[i] ?? 8)).join(' ');
}

function createOverlay(canvas: HTMLCanvasElement) {
  const panel = document.createElement('pre');
  panel.style.position = 'fixed';
  panel.style.left = '16px';
  panel.style.top = '16px';
  panel.style.margin = '0';
  panel.style.padding = '12px';
  panel.style.width = '560px';
  panel.style.maxWidth = 'calc(100vw - 32px)';
  panel.style.background = 'rgba(12, 18, 28, 0.86)';
  panel.style.color = '#e8edf4';
  panel.style.font = '12px/1.55 Menlo, Consolas, monospace';
  panel.style.whiteSpace = 'pre';
  panel.style.pointerEvents = 'none';
  panel.style.zIndex = '10';
  canvas.insertAdjacentElement('afterend', panel);
  return panel;
}
