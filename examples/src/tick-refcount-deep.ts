import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { TickerSystem, getTickerSystem } from '@eva/plugin-tick';

export const name = 'tick-refcount-deep — ref-count / 多 owner / RAF→WallTick fallback';

/**
 * 这个 demo 把 @eva/plugin-tick 的核心卖点全部摊开:
 *
 * 1. ref-count API:addRef / pauseRef / resumeRef / release / getRefStats
 *    用 3 个 owner 对象注册到同一个进程级 GLOBAL_TICKER,演示 owner 状态
 *    切换如何驱动 RAF 起停。
 *
 * 2. 多 group / priority 调度:三个色块分别挂 'physics' / 'logic' / 'late',
 *    顺序由 GROUP_ORDER 决定(physics 先于 logic 先于 late)。
 *
 * 3. RAF → WallTick 自动 fallback:
 *    a) 键 7 通过 Object.defineProperty(document, 'hidden') + 派发
 *       visibilitychange 事件,模拟"标签页隐藏",ticker 内部 handler
 *       会切到 setInterval(16) 模式;
 *    b) 键 8 反向恢复;
 *    c) 也可用 forceWallMode / forceRafMode 显式覆盖。
 *
 * 4. TickHandle.dispose():键 9 创建一个一次性 handle 然后立即 dispose,
 *    控制台打印 entries 数量变化。
 *
 * 5. 全程不用 setInterval(setInterval 仅由 ticker 内部 wall 模式持有);
 *    游戏逻辑刷帧 = ticker.add;DOM overlay 由独立 raf 刷,与游戏帧解耦,
 *    这样即便 ticker stop 了 overlay 仍能展示\"refCount=0 / mode=stopped\"。
 */
export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000, backgroundColor: '#0e1116' }),
      new GraphicsSystem(),
      new TickerSystem(),
    ],
  });

  // ---------------- ticker + owner 表 ----------------
  // getTickerSystem() 返回进程级单例,且会幂等 addRef 一个 STANDALONE_OWNER。
  // 这意味着即使我们把 ownerA/B/C 全 release,GLOBAL_TICKER 仍然有
  // STANDALONE_OWNER 这个 active ref,RAF 不会真的停。这正是设计预期:
  // 让独立脚本(examples、第三方代码)始终拿得到帧。下面 stats 行会显示
  // active=4(3 个业务 owner + standalone)/ total=4。
  const ticker = getTickerSystem();

  // owner 必须是 object(Map<object, ...> 的限制),用普通对象做 key。
  const owners: Record<'A' | 'B' | 'C', { id: string }> = {
    A: { id: 'ownerA' },
    B: { id: 'ownerB' },
    C: { id: 'ownerC' },
  };
  ticker.addRef(owners.A);
  ticker.addRef(owners.B);
  ticker.addRef(owners.C);

  // 自己维护一份 lifecycle 计数,因为 plugin-tick 的 getRefStats() 只暴露
  // { total, active },没有 totalAdded / totalReleased。
  const lifecycle = {
    totalAdded: 3, // 已经 addRef 三次
    totalReleased: 0,
    totalPaused: 0,
    totalResumed: 0,
  };

  // ---------------- 三个色块 + 三个 group ----------------
  type OwnerKey = 'A' | 'B' | 'C';
  const blockSpec: Array<{
    key: OwnerKey;
    color: string;
    group: 'physics' | 'logic' | 'late';
    priority: number;
    speed: number;
    y: number;
  }> = [
    { key: 'A', color: '#ff6b6b', group: 'physics', priority: 0, speed: 220, y: 220 },
    { key: 'B', color: '#4dabf7', group: 'logic',   priority: 0, speed: 320, y: 480 },
    { key: 'C', color: '#69db7c', group: 'late',    priority: 0, speed: 420, y: 740 },
  ];

  // 每个 owner 的运行状态(running / paused / released),DOM 显示用。
  const ownerStatus: Record<OwnerKey, 'running' | 'paused' | 'released'> = {
    A: 'running',
    B: 'running',
    C: 'running',
  };

  // 把 ticker.add 返回的 handle 也存起来,release 时一并 dispose,
  // 否则即便 owner ref 释放,update 回调本身仍挂在 entries 里(是两套独立机制)。
  const handles: Partial<Record<OwnerKey, { dispose(): void }>> = {};

  const blocks: Record<OwnerKey, GameObject> = {} as any;

  for (const spec of blockSpec) {
    const go = new GameObject(`block-${spec.key}`, { position: { x: 60, y: spec.y } });
    const g = go.addComponent(new Graphics());
    (g.graphics as any).rect(-40, -40, 80, 80).fill(spec.color);
    game.scene.addChild(go);
    blocks[spec.key] = go;

    const owner = owners[spec.key];
    let dir = 1;
    const handle = ticker.add(
      (dt: number) => {
        // 每一帧执行前再次 check ref:如果 owner 自己被 pauseRef / release,
        // ticker 内部不会自动跳过这条 entry —— ref-count 控制的是整个 RAF,
        // 而 entry 是否参与帧由 entry.paused 决定(本 demo 不用 entry.paused,
        // 只用 ref + dispose 这一对来演示)。
        // 所以这里我们手动检查 ownerStatus,精确演示 \"暂停 owner = 这个 entry 不动\"。
        if (ownerStatus[spec.key] !== 'running') return;
        go.transform.position.x += (spec.speed * dt) / 1000 * dir;
        if (go.transform.position.x > 690) {
          go.transform.position.x = 690;
          dir = -1;
        }
        if (go.transform.position.x < 60) {
          go.transform.position.x = 60;
          dir = 1;
        }
      },
      spec.group,
      spec.priority,
    );
    handles[spec.key] = handle;
  }

  // ---------------- DOM overlay ----------------
  const panel = document.createElement('pre');
  panel.style.position = 'fixed';
  panel.style.left = '16px';
  panel.style.top = '16px';
  panel.style.margin = '0';
  panel.style.padding = '12px';
  panel.style.width = '420px';
  panel.style.maxWidth = 'calc(100vw - 32px)';
  panel.style.background = 'rgba(12, 18, 28, 0.86)';
  panel.style.color = '#e8edf4';
  panel.style.font = '12px/1.55 Menlo, Consolas, monospace';
  panel.style.whiteSpace = 'pre-wrap';
  panel.style.pointerEvents = 'none';
  panel.style.zIndex = '10';
  canvas.insertAdjacentElement('afterend', panel);

  // overlay 自己的 fps 计数:数 raf 间隔。注意这是 \"DOM overlay 的刷新 fps\",
  // 与 ticker 的实际帧率分开统计;ticker 切到 wall 模式时,overlay 仍是 RAF。
  let overlayFps = 0;
  let overlayFrame = 0;
  let overlayLastSecond = performance.now();

  // 每帧也读一下 ticker 的 dt,用来推算 ticker 自己的 fps。
  let tickerFrame = 0;
  let tickerLastSecond = performance.now();
  let tickerFps = 0;
  // 注册一个 'late' priority=999 的 entry 专门用来计 fps,放在最后执行。
  const fpsHandle = ticker.add(
    (_dt: number, time: number) => {
      tickerFrame += 1;
      if (time - tickerLastSecond >= 1000) {
        tickerFps = tickerFrame;
        tickerFrame = 0;
        tickerLastSecond = time;
      }
    },
    'late',
    999,
  );

  function readDriverMode(): string {
    // mode 是 private 字段,但 (ticker as any).mode 在 demo 里读一下没事。
    const m = (ticker as any).mode;
    const started = (ticker as any).started;
    if (!started) return 'stopped';
    return m === 'wall' ? 'WallTick (setInterval 16ms)' : 'RAF (requestAnimationFrame)';
  }

  function render() {
    overlayFrame += 1;
    const now = performance.now();
    if (now - overlayLastSecond >= 1000) {
      overlayFps = overlayFrame;
      overlayFrame = 0;
      overlayLastSecond = now;
    }

    const stats = ticker.getRefStats();
    const driver = readDriverMode();

    panel.textContent = [
      'plugin-tick · ref-count deep demo',
      '------------------------------------',
      `driver mode  : ${driver}`,
      `ticker fps   : ${tickerFps}`,
      `overlay fps  : ${overlayFps}  (RAF independent)`,
      '',
      'getRefStats():',
      `  total      : ${stats.total}    (含 1 个 STANDALONE_OWNER)`,
      `  active     : ${stats.active}`,
      '',
      'lifecycle counters (本 demo 自己累加):',
      `  addRef     : ${lifecycle.totalAdded}`,
      `  pauseRef   : ${lifecycle.totalPaused}`,
      `  resumeRef  : ${lifecycle.totalResumed}`,
      `  release    : ${lifecycle.totalReleased}`,
      '',
      'owners:',
      `  A (physics, prio 0)  : ${ownerStatus.A}`,
      `  B (logic,   prio 0)  : ${ownerStatus.B}`,
      `  C (late,    prio 0)  : ${ownerStatus.C}`,
      '',
      'keys:',
      '  1 / 2  pauseRef / resumeRef ownerA',
      '  3 / 4  pauseRef / resumeRef ownerB',
      '  5      release ownerC (彻底放手)',
      '  6      release all (active → STANDALONE only)',
      '  7 / 8  模拟 tab hidden / visible (RAF↔WallTick)',
      '  9      add() 一次然后立即 dispose(),验证 handle',
      '  0      forceWallMode / forceRafMode 切换 (显式覆盖)',
    ].join('\n');

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // ---------------- 键盘控制 ----------------
  function setOwnerStatus(key: OwnerKey, next: 'running' | 'paused' | 'released') {
    ownerStatus[key] = next;
    if (next === 'released') {
      // 同时 dispose 它的 add() entry,否则即便 ref 释放、ticker 仍跑(还有别的 owner),
      // 这条 update 回调也会继续被调用(只是因为 ownerStatus = released 我们自己跳过)。
      handles[key]?.dispose();
      handles[key] = undefined;
    }
  }

  let pseudoHidden = false;
  function setHidden(v: boolean) {
    // jsdom / 真实浏览器 document.hidden 是只读 getter。Object.defineProperty 覆盖。
    try {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get() { return v; },
      });
    } catch (err) {
      console.warn('[tick-refcount-deep] override document.hidden failed', err);
    }
    pseudoHidden = v;
    document.dispatchEvent(new Event('visibilitychange'));
  }

  let forceWallToggled = false;

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '1':
        ticker.pauseRef(owners.A);
        lifecycle.totalPaused += 1;
        ownerStatus.A = 'paused';
        console.log('[tick-refcount-deep] pauseRef ownerA', ticker.getRefStats());
        break;
      case '2':
        ticker.resumeRef(owners.A);
        lifecycle.totalResumed += 1;
        ownerStatus.A = 'running';
        console.log('[tick-refcount-deep] resumeRef ownerA', ticker.getRefStats());
        break;
      case '3':
        ticker.pauseRef(owners.B);
        lifecycle.totalPaused += 1;
        ownerStatus.B = 'paused';
        console.log('[tick-refcount-deep] pauseRef ownerB', ticker.getRefStats());
        break;
      case '4':
        ticker.resumeRef(owners.B);
        lifecycle.totalResumed += 1;
        ownerStatus.B = 'running';
        console.log('[tick-refcount-deep] resumeRef ownerB', ticker.getRefStats());
        break;
      case '5':
        if (ownerStatus.C !== 'released') {
          ticker.release(owners.C);
          lifecycle.totalReleased += 1;
          setOwnerStatus('C', 'released');
          console.log('[tick-refcount-deep] release ownerC', ticker.getRefStats());
        }
        break;
      case '6': {
        // 全部释放 —— 但 STANDALONE_OWNER 还在,所以 ticker 不会真停。
        // 这正好演示 \"getTickerSystem() 设计目的:独立脚本不会被业务 pause 所拖死\"。
        for (const key of ['A', 'B', 'C'] as OwnerKey[]) {
          if (ownerStatus[key] !== 'released') {
            ticker.release(owners[key]);
            lifecycle.totalReleased += 1;
            setOwnerStatus(key, 'released');
          }
        }
        console.log('[tick-refcount-deep] release all', ticker.getRefStats());
        break;
      }
      case '7':
        setHidden(true);
        console.log('[tick-refcount-deep] simulate tab hidden, expect WallTick. mode =', (ticker as any).mode);
        break;
      case '8':
        setHidden(false);
        console.log('[tick-refcount-deep] simulate tab visible, expect RAF. mode =', (ticker as any).mode);
        break;
      case '9': {
        // 一次性 handle:add 然后立即 dispose,验证 entries 是否减回。
        const before = ((ticker as any).entries as unknown[]).length;
        const h = ticker.add(() => { /* 不做事,只为占位 */ }, 'logic', 0);
        const after = ((ticker as any).entries as unknown[]).length;
        h.dispose();
        const afterDispose = ((ticker as any).entries as unknown[]).length;
        console.log('[tick-refcount-deep] dispose handle', { before, afterAdd: after, afterDispose });
        break;
      }
      case '0':
        if (!forceWallToggled) {
          ticker.forceWallMode();
          forceWallToggled = true;
          console.log('[tick-refcount-deep] forceWallMode, mode =', (ticker as any).mode);
        } else {
          ticker.forceRafMode();
          forceWallToggled = false;
          console.log('[tick-refcount-deep] forceRafMode, mode =', (ticker as any).mode);
        }
        break;
      default:
        break;
    }
  });

  // 启动时先打印一次 stats,作为基线。
  console.log('[tick-refcount-deep] initial stats', ticker.getRefStats(), 'mode =', (ticker as any).mode);

  // 主动用一次 dispose 以演示 fpsHandle 也能被释放(只是这里我们继续保留它做 fps 计数,
  // 真要释放就 fpsHandle.dispose()。下面这行不会执行,只是文档化:
  // fpsHandle.dispose();
  void fpsHandle;
  void pseudoHidden;
}
