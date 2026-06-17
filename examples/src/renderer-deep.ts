/**
 * renderer-deep — 自定义 Renderer 子类 / RendererManager / ContainerManager
 *
 * 这个 demo 深度演示 @eva/plugin-renderer 里平时不会被翻到的能力:
 *   1. 继承 Renderer 抽象基类,写一个 StarRenderer 子类(画 5 角星)
 *   2. 通过 RendererSystem.rendererManager.register() 注册自定义 Renderer
 *   3. 自定义 Star Component(带 static componentName / init / 可观察字段),
 *      被 StarRenderer 通过 @decorators.componentObserver 监听
 *   4. 用 ContainerManager.getContainer / addContainer / removeContainer
 *      操作底层 PIXI.Container
 *   5. 用 RendererSystem.getBounds(go, { coordinateSpace }) 取三种空间 bounds
 *   6. 键盘 1/2/3/4 控制 resize / setResolution / resizeRenderer / resizeByScene
 *   7. 探活 registerKtx2CompressedTexture API 是否存在(不真传 KTX2)
 *
 * 注意:
 *   - 不引入 @eva/plugin-renderer-text。所有文字走 DOM overlay。
 *   - canvas 默认 750×1000。
 */

import {
  Game,
  GameObject,
  Component,
  ComponentChanged,
  OBSERVER_TYPE,
  decorators,
} from '@eva/eva.js';
import {
  RendererSystem,
  Renderer,
  registerKtx2CompressedTexture,
} from '@eva/plugin-renderer';
// 类型只在文档/IDE 中提示用,运行时通过 RendererSystem.rendererManager / .containerManager 访问。
// 这两个 export 同样从 @eva/plugin-renderer 导出:
//   import { RendererManager, ContainerManager } from '@eva/plugin-renderer';
import { Graphics as GraphicsEngine } from '@eva/renderer-adapter';

export const name = 'renderer-deep — 自定义 Renderer 子类 / RendererManager / ContainerManager';

// ============================================================================
// 1. 自定义 Component:Star
// ============================================================================
//
// Component 只是数据容器,不参与渲染。componentName 必须等于装饰器
// componentObserver 的 key,Renderer 才能被分发到 componentChanged。
class Star extends Component<Partial<StarParams>> {
  static componentName = 'Star';

  // 这两个字段也可以用 @decorators.IDEProp,这里走最朴素路径,
  // observer 字段在 StarRenderer 上声明。
  points = 5;
  outerR = 60;
  innerR = 26;
  color = 0xffd166;

  init(params: Partial<StarParams> = {}) {
    if (params.points !== undefined) this.points = params.points;
    if (params.outerR !== undefined) this.outerR = params.outerR;
    if (params.innerR !== undefined) this.innerR = params.innerR;
    if (params.color !== undefined) this.color = params.color;
  }
}

interface StarParams {
  points: number;
  outerR: number;
  innerR: number;
  color: number;
}

// ============================================================================
// 2. 自定义 Renderer 子类:StarRenderer
// ============================================================================
//
// Renderer 是 System 的子类(packages/plugin-renderer/lib/Renderer.ts)。
// 钩子:
//   - init(params)              系统初始化时调一次,这里把自己注册进 RendererManager
//   - componentChanged(changed) ADD / REMOVE / 字段变化时被分发
//   - rendererUpdate(gameObject) 每帧每个携带被监听 component 的 GameObject 都会被调到
//
// componentObserver 声明监听哪些 Component 的哪些 prop。
// 这里 Star 监听整个 component 的 ADD/REMOVE 以及 'color' / 'outerR' 字段。
@decorators.componentObserver({
  Star: ['color', 'outerR', 'innerR', 'points'],
})
class StarRenderer extends Renderer {
  static systemName = 'StarRenderer';

  // 调用次数计数,DOM overlay 会显示出来
  componentChangedCount = 0;
  rendererUpdateCount = 0;

  init() {
    // RendererManager 在 RendererSystem.init 里被构造好。
    // 这里把自己 register 进去后,才会收到 componentChanged 分发。
    const renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    renderSystem.rendererManager.register(this);
    log(`[StarRenderer.init] 注册到 RendererManager,renderers.length=${renderSystem.rendererManager.renderers.length}`);
  }

  componentChanged(changed: ComponentChanged) {
    this.componentChangedCount += 1;
    const gameObject = changed.gameObject;
    if (!gameObject) return;

    const container = this.containerManager.getContainer(gameObject.id);
    if (!container) {
      log(`[StarRenderer.componentChanged] container 还没就绪,gameObject=${gameObject.name}`);
      return;
    }

    const star = changed.component as Star;

    if (changed.type === OBSERVER_TYPE.ADD) {
      // 第一次挂上时:画一个 PIXI.Graphics 5 角星,扔进 container
      const g = new GraphicsEngine();
      drawStar(g, 0, 0, star.points, star.outerR, star.innerR, star.color);
      // 把 graphics 挂到 container 的子节点(直接写 graphics 引用,
      // 后续 REMOVE 时再 destroy)
      (g as any).__starOwner = gameObject.id;
      container.addChildAt(g, 0);
      log(`[StarRenderer.componentChanged ADD] gameObject=${gameObject.name} graphics 已挂到 container`);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      // 拆除:把所有自己加进去的 graphics 摘下来 + destroy
      const owned: any[] = [];
      for (const child of container.children) {
        if ((child as any).__starOwner === gameObject.id) owned.push(child);
      }
      for (const child of owned) {
        container.removeChild(child);
        child.destroy?.({ children: true });
      }
      log(`[StarRenderer.componentChanged REMOVE] gameObject=${gameObject.name} 已清理 ${owned.length} 个 graphics`);
    } else {
      // 属性变化:重画
      const owned = container.children.filter((c: any) => c.__starOwner === gameObject.id) as any[];
      for (const child of owned) {
        child.clear?.();
        drawStar(child, 0, 0, star.points, star.outerR, star.innerR, star.color);
      }
      log(`[StarRenderer.componentChanged UPDATE] gameObject=${gameObject.name} prop=${String(changed.prop?.prop)} 已重画`);
    }
  }

  rendererUpdate(_gameObject: GameObject) {
    this.rendererUpdateCount += 1;
  }
}

// PIXI Graphics 画 5 角星
function drawStar(
  g: any,
  cx: number,
  cy: number,
  points: number,
  outerR: number,
  innerR: number,
  color: number,
) {
  if (typeof g.beginFill === 'function') g.beginFill(color, 1);
  const step = Math.PI / points;
  g.moveTo(cx, cy - outerR);
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i + 1) * step;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    g.lineTo(x, y);
  }
  g.closePath();
  if (typeof g.endFill === 'function') g.endFill();
}

// ============================================================================
// 3. DOM overlay (替代文字渲染)
// ============================================================================

let overlayEl: HTMLDivElement | null = null;
let logBoxEl: HTMLDivElement | null = null;
const logBuffer: string[] = [];
const MAX_LOG_LINES = 12;

function ensureOverlay(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement || document.body;
  if (overlayEl) return;

  // 让 parent 可以承载 absolute overlay
  if (parent !== document.body && getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  overlayEl = document.createElement('div');
  overlayEl.id = 'renderer-deep-overlay';
  Object.assign(overlayEl.style, {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: '#e6edf3',
    font: '13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", monospace',
    background: 'rgba(14, 17, 22, 0.78)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '10px 12px',
    pointerEvents: 'none',
    width: '430px',
    zIndex: '10',
  });
  parent.appendChild(overlayEl);

  logBoxEl = document.createElement('div');
  Object.assign(logBoxEl.style, {
    position: 'absolute',
    left: '12px',
    bottom: '12px',
    color: '#9ad8a3',
    font: '11px/1.4 ui-monospace, monospace',
    background: 'rgba(14,17,22,0.85)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '8px 10px',
    pointerEvents: 'none',
    width: '430px',
    maxHeight: '200px',
    overflow: 'hidden',
    whiteSpace: 'pre',
    zIndex: '10',
  });
  parent.appendChild(logBoxEl);
}

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(msg);
  logBuffer.push(msg);
  while (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
  if (logBoxEl) logBoxEl.textContent = logBuffer.join('\n');
}

function setOverlay(html: string) {
  if (overlayEl) overlayEl.innerHTML = html;
}

// ============================================================================
// 4. 入口
// ============================================================================

export async function init(canvas: HTMLCanvasElement) {
  ensureOverlay(canvas);
  log('[init] renderer-deep 启动');

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: '#0e1116',
      }),
      new StarRenderer(),
    ],
  });

  game.scene.transform.size = { width: 750, height: 1000 };

  const renderSystem = game.getSystem(RendererSystem) as RendererSystem;
  log(
    `[init] RendererSystem ok,application=${!!renderSystem.application}, ` +
      `containerManager=${!!renderSystem.containerManager}, ` +
      `rendererManager.renderers=${renderSystem.rendererManager.renderers.length}`,
  );

  // ---------- 创建 3 颗星星 ----------
  const star1 = new GameObject('star-1', { position: { x: 180, y: 280 } });
  star1.addComponent(new Star({ points: 5, outerR: 90, innerR: 38, color: 0xffd166 }));
  game.scene.addChild(star1);

  const star2 = new GameObject('star-2', {
    position: { x: 380, y: 280 },
    rotation: 0.4,
  });
  star2.addComponent(new Star({ points: 6, outerR: 70, innerR: 30, color: 0x06d6a0 }));
  game.scene.addChild(star2);

  const star3 = new GameObject('star-3', {
    position: { x: 560, y: 280 },
    scale: { x: 1.3, y: 1.3 },
  });
  star3.addComponent(new Star({ points: 5, outerR: 60, innerR: 26, color: 0xef476f }));
  game.scene.addChild(star3);

  // ---------- 5. ContainerManager.getContainer 取出 PIXI.Container 直接操作 ----------
  // 注意:Container 是 RendererSystem.update 在挂载 GameObject 时由 Transform.appendChild
  // 流程触发创建的,所以这里需要等下一帧再访问。
  setTimeout(() => {
    const cm = renderSystem.containerManager;
    const container1 = cm.getContainer(star1.id);
    log(
      `[ContainerManager] star1.id=${star1.id} container=${!!container1} ` +
        `children.length=${container1?.children?.length ?? 0}`,
    );

    // 顺便枚举一下 containerMap 总量(scene + 3 个 star + scene root 等)
    const total = Object.keys(cm.containerMap || {}).length;
    log(`[ContainerManager] containerMap entries=${total}`);

    refreshOverlay();
  }, 50);

  // ---------- 6. 键盘交互 ----------
  const onKey = (e: KeyboardEvent) => {
    if (e.key === '1') {
      // resize 改 logical 设计尺寸
      const rs = renderSystem;
      const beforeW = (rs as any).params.width;
      const beforeH = (rs as any).params.height;
      const newW = beforeW === 750 ? 900 : 750;
      const newH = beforeH === 1000 ? 1200 : 1000;
      rs.resize(newW, newH);
      log(`[key=1 resize] ${beforeW}x${beforeH} -> ${newW}x${newH}`);
    } else if (e.key === '2') {
      const before = renderSystem.application?.renderer?.resolution ?? 1;
      const result = renderSystem.setResolution(2);
      log(`[key=2 setResolution(2)] before=${before} after=${result.resolution} sync=${result.displayResolutionSyncCount}`);
    } else if (e.key === '3') {
      const before = renderSystem.application?.renderer?.resolution ?? 1;
      const result = renderSystem.setResolution(1);
      log(`[key=3 setResolution(1)] before=${before} after=${result.resolution} sync=${result.displayResolutionSyncCount}`);
    } else if (e.key === '4') {
      // resizeByScene 走 multiApps 路径,scene.canvas 必须等于某个 multiApps[i].canvas
      // 单 scene 场景下 multiApps 是空的,这里只能 console.warn。
      // 我们退而求其次,演示 resizeRenderer({ width, height, resolution }) 三件套。
      const result = renderSystem.resizeRenderer({ width: 800, height: 1100, resolution: 1.5, maxResolution: 3 });
      log(
        `[key=4 resizeRenderer] -> width=${result.width} height=${result.height} ` +
          `resolution=${result.resolution} sync=${result.displayResolutionSyncCount}`,
      );
      // 同时演示 resizeByScene 的存在(scene.canvas 不在 multiApps 里时打印 warn)
      try {
        renderSystem.resizeByScene(game.scene, 800, 1100);
        log('[key=4 resizeByScene] scene.canvas 已走 application not found 提示路径(multiApps 为空)');
      } catch (err) {
        log(`[key=4 resizeByScene] 抛错: ${(err as Error).message}`);
      }
    }
    refreshOverlay();
  };
  window.addEventListener('keydown', onKey);

  // ---------- 7. 探活 registerKtx2CompressedTexture ----------
  const ktx2Available = typeof registerKtx2CompressedTexture === 'function';
  log(`[ktx2] registerKtx2CompressedTexture 可用=${ktx2Available}(不真传 KTX2 资源,只验证 export)`);

  // ---------- 8. 演示属性变化触发 componentChanged UPDATE ----------
  setTimeout(() => {
    const star = star1.getComponent(Star) as Star | null;
    if (star) {
      star.color = 0x00b4d8;
      log('[trigger UPDATE] star1.color = 0x00b4d8(蓝),触发 componentChanged');
    }
  }, 1500);

  // ---------- 9. 演示 REMOVE:3 秒后摘掉 star3 ----------
  setTimeout(() => {
    const star = star3.getComponent(Star);
    if (star) {
      star3.removeComponent(star);
      log('[trigger REMOVE] star3 的 Star component 已 removeComponent');
    }
  }, 3000);

  // ---------- overlay 渲染 ----------
  const refreshOverlay = () => {
    const rs = renderSystem;
    const renderer = rs.application?.renderer;
    const cm = rs.containerManager;

    // 三种 coordinate space 的 bounds
    const wb = rs.getBounds(star1, { coordinateSpace: 'world' });
    const cb = rs.getBounds(star1, { coordinateSpace: 'canvas' });
    const db = rs.getBounds(star1, { coordinateSpace: 'design' });

    const fmtBounds = (b: any) =>
      b ? `x=${b.x.toFixed(1)} y=${b.y.toFixed(1)} w=${b.width.toFixed(1)} h=${b.height.toFixed(1)} (${b.source})` : 'null';

    setOverlay(`
      <div style="font-weight:bold;color:#7ee787;margin-bottom:6px">renderer-deep</div>
      <div style="margin-bottom:4px"><b>RendererSystem</b></div>
      <div>params: ${(rs as any).params?.width} × ${(rs as any).params?.height} @ res ${(rs as any).params?.resolution ?? '(auto)'}</div>
      <div>renderer.resolution = ${renderer?.resolution ?? '?'}</div>
      <div>renderer.width × height = ${renderer?.width} × ${renderer?.height}</div>
      <div>multiApps.length = ${rs.multiApps?.length ?? 0}</div>

      <div style="margin-top:8px"><b>RendererManager</b></div>
      <div>renderers.length = ${rs.rendererManager?.renderers?.length ?? 0}</div>
      <div>StarRenderer.componentChangedCount = ${(rs.rendererManager?.renderers?.find((r: any) => r instanceof StarRenderer) as any)?.componentChangedCount ?? 0}</div>
      <div>StarRenderer.rendererUpdateCount = ${(rs.rendererManager?.renderers?.find((r: any) => r instanceof StarRenderer) as any)?.rendererUpdateCount ?? 0}</div>

      <div style="margin-top:8px"><b>ContainerManager</b></div>
      <div>containerMap entries = ${Object.keys(cm?.containerMap || {}).length}</div>
      <div>star1 container.children = ${cm?.getContainer(star1.id)?.children?.length ?? 0}</div>
      <div>star1 bounds (world) = ${fmtBounds(wb)}</div>
      <div>star1 bounds (canvas) = ${fmtBounds(cb)}</div>
      <div>star1 bounds (design) = ${fmtBounds(db)}</div>

      <div style="margin-top:8px"><b>键盘控制</b></div>
      <div>1 = resize(900,1200) ↔ resize(750,1000)</div>
      <div>2 = setResolution(2)</div>
      <div>3 = setResolution(1)</div>
      <div>4 = resizeRenderer + resizeByScene</div>

      <div style="margin-top:6px;color:#9ad8a3">ktx2 export = ${ktx2Available}</div>
    `);
  };

  // 5fps overlay 刷新足够
  setInterval(refreshOverlay, 200);
}
