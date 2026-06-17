import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import {
  SignalBus,
  SignalBusSystem,
  getSignalBus,
  __setGlobalSignalBus,
} from '@eva/plugin-signal-bus';
import type {
  SignalTransport,
  SignalHandle,
} from '@eva/plugin-signal-bus';

export const name =
  'signal-bus-deep — transport / scope:scene / typed / once / off / clear';

/**
 * SignalBus 深度演示 demo。覆盖三大卖点 + once/off/clear/SignalHandle.dispose。
 *
 * 键盘:
 *   1 → transport 防双发
 *   2 → scope:'scene' 切场景自动清理
 *   3 → typed<P>() 类型化 facade
 *   4 → once 只触发一次
 *   5 → off / SignalHandle.dispose 取消订阅
 *   6 → clear 全清空
 */
export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem({
        signals: [
          { name: 'transport:fire', description: '走 transport 还是本地?' },
          { name: 'scene:tick', description: 'scope:scene 订阅,切场景应自动清理' },
          { name: 'typed:fire', description: 'typed<P>() facade emit' },
          { name: 'once:hit', description: 'once 只触发一次' },
          { name: 'off:tick', description: 'off / dispose 取消订阅' },
          { name: 'clear:tick', description: 'clear 后所有信号都没人接' },
        ],
      }),
    ],
  });

  // ---------- 视觉指示色块(每个 demo 一行) ----------
  const groups: Array<{ label: string; cells: Graphics[]; row: number }> = [];
  function makeRow(row: number, count: number, colorOff: string) {
    const cells: Graphics[] = [];
    for (let i = 0; i < count; i++) {
      const go = new GameObject(`row-${row}-${i}`, {
        position: { x: 60 + i * 60, y: 60 + row * 80 },
      });
      const g = go.addComponent(new Graphics());
      (g.graphics as any).clear().rect(-22, -22, 44, 44).fill(colorOff);
      game.scene.addChild(go);
      cells.push(g);
    }
    return cells;
  }

  groups.push({ label: '1 transport', cells: makeRow(0, 6, '#444'), row: 0 });
  groups.push({ label: '2 scope:scene', cells: makeRow(1, 6, '#444'), row: 1 });
  groups.push({ label: '3 typed', cells: makeRow(2, 6, '#444'), row: 2 });
  groups.push({ label: '4 once', cells: makeRow(3, 6, '#444'), row: 3 });
  groups.push({ label: '5 off', cells: makeRow(4, 6, '#444'), row: 4 });
  groups.push({ label: '6 clear', cells: makeRow(5, 6, '#444'), row: 5 });

  function flash(rowIdx: number, color: string) {
    const cells = groups[rowIdx].cells;
    let i = 0;
    const tick = () => {
      if (i >= cells.length) return;
      (cells[i].graphics as any).clear().rect(-22, -22, 44, 44).fill(color);
      i++;
      setTimeout(tick, 50);
    };
    tick();
  }
  function reset(rowIdx: number) {
    for (const g of groups[rowIdx].cells) {
      (g.graphics as any).clear().rect(-22, -22, 44, 44).fill('#444');
    }
  }

  // ---------- DOM overlay(标题 + 控制提示 + 触发日志) ----------
  const title = document.createElement('div');
  title.style.cssText =
    'position:fixed;top:8px;left:8px;color:#fff;font:14px/1.4 monospace;background:rgba(0,0,0,.6);padding:6px 10px;border-radius:4px;z-index:10';
  title.innerHTML =
    '<b>signal-bus-deep</b><br>' +
    '1 transport / 2 scope:scene / 3 typed / 4 once / 5 off / 6 clear';
  document.body.appendChild(title);

  const labelLayer = document.createElement('div');
  labelLayer.style.cssText =
    'position:fixed;left:8px;top:60px;color:#9ad;font:12px/1.4 monospace;z-index:10;pointer-events:none';
  labelLayer.innerHTML = groups
    .map((g) => `<div style="height:80px;line-height:80px">${g.label}</div>`)
    .join('');
  document.body.appendChild(labelLayer);

  const logBox = document.createElement('div');
  logBox.style.cssText =
    'position:fixed;right:8px;top:8px;width:380px;max-height:96vh;overflow:auto;color:#0f0;font:11px/1.4 monospace;background:rgba(0,0,0,.75);padding:8px;border-radius:4px;z-index:10';
  logBox.innerHTML = '<b style="color:#fff">listener log</b><br>';
  document.body.appendChild(logBox);

  const logLines: string[] = [];
  function log(line: string) {
    logLines.push(line);
    if (logLines.length > 20) logLines.shift();
    logBox.innerHTML =
      '<b style="color:#fff">listener log</b><br>' +
      logLines.map((l) => `<div>${l}</div>`).join('');
    // eslint-disable-next-line no-console
    console.log('[signal-bus-deep]', line);
  }

  // ============================================================
  // demo 1: transport 防双发
  // ============================================================
  // 思路:做一个 mock mx.event(SignalTransport),把它接到一颗独立 SignalBus 上。
  // 同一个 listener fn 通过 bus.on 注册 → SignalBus 内部把它 wrapped 注册到 transport。
  // bus.emit 路由到 transport.emit → transport 触发 wrapped → fn 触发 1 次。
  // 关键验证:emit 不会走"本地 Map 直接触发 fn 一次 + transport 再触发 wrapped 一次"。
  function makeMockTransport(label: string): SignalTransport & {
    listeners: Map<string, Set<(p?: unknown) => void>>;
  } {
    const listeners = new Map<string, Set<(p?: unknown) => void>>();
    return {
      listeners,
      emit(name, payload) {
        log(`  [${label}.emit] ${name} payload=${JSON.stringify(payload)}`);
        const set = listeners.get(name);
        if (!set) return;
        for (const fn of Array.from(set)) fn(payload);
      },
      on(name, fn) {
        let set = listeners.get(name);
        if (!set) {
          set = new Set();
          listeners.set(name, set);
        }
        set.add(fn);
      },
      off(name, fn) {
        listeners.get(name)?.delete(fn);
      },
    };
  }

  function runTransportDemo() {
    log('--- demo 1: transport ---');
    reset(0);
    const transport = makeMockTransport('mock-mx');
    const tBus = new SignalBus({ transport });
    let hits = 0;
    const handler = (p: { value: number }) => {
      hits++;
      log(`  handler#1 fired hits=${hits} payload=${JSON.stringify(p)}`);
    };
    tBus.on<{ value: number }>('transport:fire', handler);
    log('  emit transport:fire {value:1} (期望 handler 命中 1 次)');
    tBus.emit('transport:fire', { value: 1 });
    log(`  >>> total hits=${hits} (应为 1,不是 2)`);
    flash(0, hits === 1 ? '#5cb85c' : '#d9534f');

    // 反证:把同一个 fn 直接挂到 transport.listeners 也能触发,
    // 但 SignalBus 内部 listeners Map 此时不会重复触发。
    log('  内部 listeners Map size = ' + (tBus as any).listeners.size +
        ' (transport 模式下应为 0)');
  }

  // ============================================================
  // demo 2: scope:'scene' 自动清理
  // ============================================================
  // bus.on(name, fn, { scope: 'scene' }) 注册的句柄存入 sceneScopedHandles。
  // 调 bus.disposeSceneScoped()(SignalBusSystem 在 sceneChanged 时自动调用)
  // 这些句柄被批量 dispose,后续 emit 不再命中。
  function runSceneDemo() {
    log('--- demo 2: scope:scene ---');
    reset(1);
    const bus = getSignalBus();
    let sceneHits = 0;
    let gameHits = 0;
    bus.on<{ tick: number }>('scene:tick', (p) => {
      sceneHits++;
      log(`  scene-handler fired (scope:scene) hits=${sceneHits} tick=${p.tick}`);
    }, { scope: 'scene' });
    bus.on<{ tick: number }>('scene:tick', (p) => {
      gameHits++;
      log(`  game-handler fired (scope:game default) hits=${gameHits} tick=${p.tick}`);
    });

    log('  emit scene:tick {tick:1} (期望 scene+game 各命中 1)');
    bus.emit('scene:tick', { tick: 1 });
    log('  ⇒ 模拟切场景: bus.disposeSceneScoped()');
    bus.disposeSceneScoped();
    log('  emit scene:tick {tick:2} (期望仅 game 命中)');
    bus.emit('scene:tick', { tick: 2 });

    const ok = sceneHits === 1 && gameHits === 2;
    log(`  >>> sceneHits=${sceneHits} gameHits=${gameHits} (应 1/2)`);
    flash(1, ok ? '#5cb85c' : '#d9534f');

    // 清掉 game 监听不影响后面 demo
    bus.off('scene:tick');
  }

  // ============================================================
  // demo 3: typed<P>() facade
  // ============================================================
  // 编译期类型化 emit/on,运行时仍是同一 SignalBus。
  function runTypedDemo() {
    log('--- demo 3: typed<P>() ---');
    reset(2);
    type Events = {
      'typed:fire': { x: number; y: number };
    };
    const bus = getSignalBus();
    const tbus = bus.typed<Events>();
    let payload: Events['typed:fire'] | null = null;
    const h = tbus.on('typed:fire', (p) => {
      payload = p;
      log(`  typed handler fired x=${p.x} y=${p.y}`);
    });
    tbus.emit('typed:fire', { x: 10, y: 20 });
    h.dispose();
    const ok = payload && payload.x === 10 && payload.y === 20;
    log(`  >>> typed payload received=${JSON.stringify(payload)} ok=${ok}`);
    flash(2, ok ? '#5cb85c' : '#d9534f');
  }

  // ============================================================
  // demo 4: once
  // ============================================================
  function runOnceDemo() {
    log('--- demo 4: once ---');
    reset(3);
    const bus = getSignalBus();
    let hits = 0;
    bus.once<{ n: number }>('once:hit', (p) => {
      hits++;
      log(`  once-handler fired hits=${hits} payload=${JSON.stringify(p)}`);
    });
    bus.emit('once:hit', { n: 1 });
    bus.emit('once:hit', { n: 2 });
    bus.emit('once:hit', { n: 3 });
    log(`  >>> hits=${hits} (应为 1)`);
    flash(3, hits === 1 ? '#5cb85c' : '#d9534f');
  }

  // ============================================================
  // demo 5: off + SignalHandle.dispose
  // ============================================================
  function runOffDemo() {
    log('--- demo 5: off / SignalHandle.dispose ---');
    reset(4);
    const bus = getSignalBus();
    let aHits = 0;
    let bHits = 0;
    const fnA = (p: { i: number }) => {
      aHits++;
      log(`  handler-A fired hits=${aHits} i=${p.i}`);
    };
    bus.on<{ i: number }>('off:tick', fnA);
    const handleB: SignalHandle = bus.on<{ i: number }>('off:tick', (p) => {
      bHits++;
      log(`  handler-B fired hits=${bHits} i=${p.i}`);
    });

    bus.emit('off:tick', { i: 1 });
    log('  ⇒ bus.off("off:tick", fnA)');
    bus.off('off:tick', fnA);
    bus.emit('off:tick', { i: 2 });
    log('  ⇒ handleB.dispose()');
    handleB.dispose();
    bus.emit('off:tick', { i: 3 });

    const ok = aHits === 1 && bHits === 2;
    log(`  >>> aHits=${aHits} bHits=${bHits} (应 1/2)`);
    flash(4, ok ? '#5cb85c' : '#d9534f');
  }

  // ============================================================
  // demo 6: clear
  // ============================================================
  function runClearDemo() {
    log('--- demo 6: clear ---');
    reset(5);
    // 用一个独立 bus 演示,避免污染全局
    const bus = new SignalBus();
    let aHits = 0;
    let bHits = 0;
    bus.on('clear:tick', () => {
      aHits++;
      log(`  A fired hits=${aHits}`);
    });
    bus.on('other:tick', () => {
      bHits++;
      log(`  B fired hits=${bHits}`);
    });
    bus.emit('clear:tick');
    bus.emit('other:tick');
    log('  ⇒ bus.clear()');
    bus.clear();
    bus.emit('clear:tick');
    bus.emit('other:tick');
    const ok = aHits === 1 && bHits === 1;
    log(`  >>> aHits=${aHits} bHits=${bHits} (应 1/1,clear 后再 emit 不命中)`);
    flash(5, ok ? '#5cb85c' : '#d9534f');
  }

  // ============================================================
  // 键盘控制
  // ============================================================
  log('ready. 按 1-6 触发对应 demo,默认全部演示一遍。');

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '1': runTransportDemo(); break;
      case '2': runSceneDemo(); break;
      case '3': runTypedDemo(); break;
      case '4': runOnceDemo(); break;
      case '5': runOffDemo(); break;
      case '6': runClearDemo(); break;
    }
  });

  // 自动演示一轮(带间隔避免 log 撞车)
  const auto = [runTransportDemo, runSceneDemo, runTypedDemo, runOnceDemo, runOffDemo, runClearDemo];
  for (let i = 0; i < auto.length; i++) {
    setTimeout(auto[i], 500 + i * 800);
  }

  // 防止全局 bus 残留 listener 影响其他 demo
  window.addEventListener('beforeunload', () => {
    getSignalBus().clear();
    __setGlobalSignalBus(null);
  });
}
