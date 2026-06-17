/**
 * ai-deep — querySelector 验证 data-* / enabled toggle / Render 联动
 *
 * 这个 demo 不光把 AISystem 跑起来,而是反过来用 document.querySelectorAll
 * 实际把 [data-ai-overlay] 里生成的 DOM 镜像扒出来,把 dataset 表格化显示
 * 在屏幕上,用来验证 plugin-ai 真正给 Agent 看到了什么。
 *
 * 演示能力:
 * 1. AISystem 构造参数:enabled / debug / zIndex 三个都用上
 * 2. 嵌套层级 (root → container → childA / childB-hidden) 的 DOM 镜像
 * 3. Render 组件控制 visible / alpha / zIndex,验证 data-alpha / data-visible
 *    / data-z-index 同步
 * 4. Event 组件挂上后,镜像出现 data-interactive="true"
 * 5. enabled toggle:键 1 removeSystem 真销毁,键 2 addSystem 重建,
 *    [data-ai-overlay] 数量从 N → 0 → N
 * 6. 修改 alpha 实时联动镜像 dataset
 * 7. removeComponent / 销毁实体后 activeIds 清理 DOM
 * 8. 销毁 root,onDestroy 清空所有 [data-ai-overlay]
 */
import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Render, RenderSystem } from '@eva/plugin-renderer-render';
import { Event, EventSystem, HIT_AREA_TYPE } from '@eva/plugin-renderer-event';
import { AISystem } from '@eva/plugin-ai';

export const name = 'ai-deep — querySelector 验证 data-* / enabled toggle / Render 联动';

export async function init(canvas: HTMLCanvasElement) {
  // ============================================================
  // 1. Game + AISystem 启动
  //    构造参数三件:enabled / debug / zIndex 全用上
  // ============================================================
  const game = new Game();
  const aiSystem = new AISystem({
    enabled: true,
    debug: true,
    zIndex: 5000,
  });

  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundAlpha: 1,
        backgroundColor: '#0f1722',
      }),
      new GraphicsSystem(),
      new RenderSystem(),
      new EventSystem(),
      aiSystem,
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = { width: 750, height: 1000 };

  // ============================================================
  // 2. 嵌套层级:root → containerGo → childA / childB-hidden
  //    每个 GameObject 都有清晰的 name,方便 dataset 比对
  // ============================================================

  // root 容器 (画一个深色面板做底)
  const root = new GameObject('root', {
    position: { x: 60, y: 60 },
    size: { width: 630, height: 380 },
    anchor: { x: 0, y: 0 },
  });
  const rootBg = root.addComponent(new Graphics());
  rootBg.graphics.beginFill(0x1f2a3a, 1);
  rootBg.graphics.drawRoundedRect(0, 0, 630, 380, 12);
  rootBg.graphics.endFill();
  game.scene.addChild(root);

  // container (root 的子,挂自己的 Graphics 矩形)
  const containerGo = new GameObject('container', {
    position: { x: 30, y: 30 },
    size: { width: 570, height: 320 },
    anchor: { x: 0, y: 0 },
  });
  const containerBg = containerGo.addComponent(new Graphics());
  containerBg.graphics.beginFill(0x2c3e50, 1);
  containerBg.graphics.drawRoundedRect(0, 0, 570, 320, 8);
  containerBg.graphics.endFill();
  root.addChild(containerGo);

  // childA — 圆形,挂 Render(visible:true alpha:0.5 zIndex:10)
  const childA = new GameObject('childA', {
    position: { x: 60, y: 60 },
    size: { width: 200, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  const childAGfx = childA.addComponent(new Graphics());
  childAGfx.graphics.beginFill(0x4fc3f7, 1);
  childAGfx.graphics.drawCircle(100, 100, 90);
  childAGfx.graphics.endFill();
  const childARender = childA.addComponent(
    new Render({
      visible: true,
      alpha: 0.5,
      zIndex: 10,
    }),
  );
  // childA 挂 Event 组件,验证 data-interactive='true'
  childA.addComponent(
    new Event({
      hitArea: {
        type: HIT_AREA_TYPE.Circle,
        style: { x: 100, y: 100, radius: 90 },
      },
    }),
  );
  containerGo.addChild(childA);

  // childB-hidden — 矩形,Render visible:false,验证镜像被剔除
  const childB = new GameObject('childB-hidden', {
    position: { x: 320, y: 60 },
    size: { width: 200, height: 200 },
    anchor: { x: 0, y: 0 },
  });
  const childBGfx = childB.addComponent(new Graphics());
  childBGfx.graphics.beginFill(0xff6b6b, 1);
  childBGfx.graphics.drawRect(0, 0, 200, 200);
  childBGfx.graphics.endFill();
  childB.addComponent(
    new Render({
      visible: false,
      alpha: 1,
      zIndex: 0,
    }),
  );
  containerGo.addChild(childB);

  // ============================================================
  // 3. DOM Overlay HUD — 表格化显示 querySelectorAll 结果
  // ============================================================
  const hud = document.createElement('div');
  hud.style.cssText = [
    'position:fixed',
    'left:12px',
    'top:12px',
    'z-index:99999',
    'max-width:560px',
    'max-height:96vh',
    'overflow:auto',
    'background:rgba(8,12,20,0.92)',
    'color:#cfe',
    'font:11px/1.45 ui-monospace,Menlo,monospace',
    'padding:10px 12px',
    'border-radius:6px',
    'border:1px solid #1f3a55',
    'box-shadow:0 4px 16px rgba(0,0,0,0.5)',
    'pointer-events:none',
    'white-space:pre',
  ].join(';');
  document.body.appendChild(hud);

  const history: string[] = [];
  function log(line: string) {
    history.unshift(`[${new Date().toLocaleTimeString()}] ${line}`);
    if (history.length > 5) history.length = 5;
    // 主动 console.log 一份
    // eslint-disable-next-line no-console
    console.log('[ai-deep]', line);
  }

  function pad(s: string, n: number) {
    if (s.length >= n) return s.slice(0, n);
    return s + ' '.repeat(n - s.length);
  }

  function dumpDataset(el: Element): Record<string, string> {
    const ds = (el as HTMLElement).dataset;
    const out: Record<string, string> = {};
    Object.keys(ds).forEach(k => {
      out[k] = ds[k] || '';
    });
    return out;
  }

  // 每 200ms 刷新一次 HUD
  const refreshTimer = window.setInterval(() => {
    const overlays = document.querySelectorAll('[data-ai-overlay]');
    const overlayDiv = overlays[0] as HTMLElement | undefined;
    const mirrors = overlayDiv ? overlayDiv.querySelectorAll<HTMLElement>(':scope > div') : ([] as any);
    const mirrorList: HTMLElement[] = Array.prototype.slice.call(mirrors);

    const lines: string[] = [];
    lines.push('=== plugin-ai querySelector 实时校验 ===');
    lines.push(`document.querySelectorAll('[data-ai-overlay]').length = ${overlays.length}`);
    if (overlayDiv) {
      const ds = dumpDataset(overlayDiv);
      lines.push(`overlay root dataset:`);
      lines.push(`  data-canvas-width=${ds.canvasWidth} data-canvas-height=${ds.canvasHeight}`);
      lines.push(`  data-background-color=${ds.backgroundColor || '(none)'}`);
      lines.push(`  zIndex(style)=${overlayDiv.style.zIndex}`);
    }
    lines.push(`镜像数量: ${mirrorList.length}`);
    lines.push('');
    lines.push(
      pad('name', 14) +
        pad('type', 10) +
        pad('visible', 8) +
        pad('alpha', 6) +
        pad('zIdx', 5) +
        pad('intr', 5) +
        pad('parent', 12) +
        'children',
    );
    lines.push('-'.repeat(80));

    for (const m of mirrorList) {
      const ds = dumpDataset(m);
      lines.push(
        pad(ds.name || '?', 14) +
          pad(ds.type || '?', 10) +
          pad(ds.visible || 'true', 8) +
          pad(ds.alpha || '1', 6) +
          pad(ds.zIndex || '0', 5) +
          pad(ds.interactive || '-', 5) +
          pad(ds.parent || '-', 12) +
          (ds.children || '-'),
      );
    }
    lines.push('');
    lines.push('=== 操作:1=disable(removeSystem) 2=enable(addSystem) ===');
    lines.push('         3=childA.alpha 0.5↔1.0 4=removeComponent childB');
    lines.push('         5=destroy root (onDestroy 清空)');
    lines.push('');
    lines.push('=== 操作历史 (最近 5 条) ===');
    for (const h of history) lines.push(h);

    hud.textContent = lines.join('\n');
  }, 200);

  // ============================================================
  // 4. 键盘交互
  // ============================================================
  let currentAi: AISystem | null = aiSystem;
  let rootDestroyed = false;

  window.addEventListener('keydown', async ev => {
    // 键 1 — disable AISystem (removeSystem 触发 onDestroy)
    if (ev.key === '1') {
      const before = document.querySelectorAll('[data-ai-overlay]').length;
      if (currentAi) {
        game.removeSystem(AISystem);
        currentAi = null;
      }
      const after = document.querySelectorAll('[data-ai-overlay]').length;
      log(`key=1 disable: overlay ${before} → ${after} (removeSystem 触发 onDestroy)`);
    }

    // 键 2 — enable AISystem (addSystem 重建 overlay)
    if (ev.key === '2') {
      if (rootDestroyed) {
        log(`key=2 enable: root 已销毁,镜像数量将为 0,但 [data-ai-overlay] 容器会回来`);
      }
      const before = document.querySelectorAll('[data-ai-overlay]').length;
      if (!currentAi) {
        currentAi = await game.addSystem(
          new AISystem({ enabled: true, debug: true, zIndex: 5000 }),
        );
      }
      // 等一帧让 lateUpdate 跑一次
      await new Promise(r => requestAnimationFrame(() => r(null)));
      await new Promise(r => requestAnimationFrame(() => r(null)));
      const after = document.querySelectorAll('[data-ai-overlay]').length;
      log(`key=2 enable: overlay ${before} → ${after} (addSystem 重建)`);
    }

    // 键 3 — childA.alpha 0.5 ↔ 1.0
    if (ev.key === '3') {
      if (rootDestroyed) {
        log(`key=3 ignored: root 已销毁`);
        return;
      }
      const r = childA.getComponent(Render) as Render | undefined;
      if (r) {
        const next = r.alpha < 0.99 ? 1.0 : 0.5;
        r.alpha = next;
        // 等两帧让 AISystem 同步 dataset
        await new Promise(res => requestAnimationFrame(() => res(null)));
        await new Promise(res => requestAnimationFrame(() => res(null)));
        const mirrors = document.querySelectorAll<HTMLElement>('[data-ai-overlay] > div[data-name="childA"]');
        const mirrorAlpha =
          mirrors[0]?.dataset.alpha ??
          (next === 1.0 ? '(omitted, alpha=1)' : '?');
        log(`key=3 childA.alpha → ${next}, dataset[data-alpha]=${mirrorAlpha}`);
      }
    }

    // 键 4 — removeComponent 销毁 childB,验证 activeIds cleanup
    if (ev.key === '4') {
      if (rootDestroyed) {
        log(`key=4 ignored: root 已销毁`);
        return;
      }
      const before = document.querySelectorAll<HTMLElement>(
        '[data-ai-overlay] > div',
      ).length;
      // childB 本来 visible:false 已经被剔出 cache,这里直接 remove 整个 GameObject
      // 让 lateUpdate 看不到这个 id,验证 activeIds cleanup 路径
      if (childB.parent) {
        childB.parent.removeChild(childB);
        childB.destroy();
      }
      await new Promise(res => requestAnimationFrame(() => res(null)));
      await new Promise(res => requestAnimationFrame(() => res(null)));
      const after = document.querySelectorAll<HTMLElement>(
        '[data-ai-overlay] > div',
      ).length;
      const stillThere = document.querySelectorAll<HTMLElement>(
        '[data-ai-overlay] > div[data-name="childB-hidden"]',
      ).length;
      log(
        `key=4 destroy childB: 镜像 ${before} → ${after}, childB-hidden 残留=${stillThere}`,
      );
    }

    // 键 5 — destroy root,验证整个层级清空
    if (ev.key === '5') {
      if (rootDestroyed) {
        log(`key=5 ignored: root 已销毁`);
        return;
      }
      const before = document.querySelectorAll<HTMLElement>(
        '[data-ai-overlay] > div',
      ).length;
      if (root.parent) {
        root.parent.removeChild(root);
      }
      root.destroy();
      rootDestroyed = true;
      await new Promise(res => requestAnimationFrame(() => res(null)));
      await new Promise(res => requestAnimationFrame(() => res(null)));
      const after = document.querySelectorAll<HTMLElement>(
        '[data-ai-overlay] > div',
      ).length;
      log(`key=5 destroy root: 镜像 ${before} → ${after} (期望 0,只剩 scene 自身)`);
    }
  });

  // ============================================================
  // 5. 启动后第一次 querySelector 自检 (等两帧让 lateUpdate 落地)
  // ============================================================
  await new Promise(r => requestAnimationFrame(() => r(null)));
  await new Promise(r => requestAnimationFrame(() => r(null)));
  await new Promise(r => requestAnimationFrame(() => r(null)));

  const overlays = document.querySelectorAll('[data-ai-overlay]');
  // eslint-disable-next-line no-console
  console.log('[ai-deep] 初始 querySelectorAll([data-ai-overlay]) =', overlays);
  if (overlays[0]) {
    // eslint-disable-next-line no-console
    console.log('[ai-deep] 初始镜像列表:');
    overlays[0].querySelectorAll<HTMLElement>(':scope > div').forEach(el => {
      // eslint-disable-next-line no-console
      console.log(
        '  ',
        el.dataset.name,
        '/',
        el.dataset.type,
        '/ visible=',
        el.dataset.visible || 'true',
        '/ alpha=',
        el.dataset.alpha || '1',
        '/ z-index=',
        el.dataset.zIndex || '0',
        '/ interactive=',
        el.dataset.interactive || '-',
        '/ parent=',
        el.dataset.parent || '-',
        '/ children=',
        el.dataset.children || '-',
      );
    });
  }
  log(`init: querySelectorAll([data-ai-overlay]).length=${overlays.length}`);

  // refreshTimer / hud 不主动 cleanup —— demo 关闭走 game.destroy() 顺带让
  // AISystem.onDestroy 把 [data-ai-overlay] 摘掉。不依赖外部 cleanup hook,
  // 让示例文件保持自包含。
  // (避免 lint 报 "unused")
  void refreshTimer;
  void childARender;
}
