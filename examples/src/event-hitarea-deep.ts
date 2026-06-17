import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Event, EventSystem, HIT_AREA_TYPE } from '@eva/plugin-renderer-event';

export const name = 'event-hitarea-deep — 5 种 HIT_AREA_TYPE 全演示 + cursor / stopPropagation';

/**
 * 深度演示 @eva/plugin-renderer-event 的 EventParams 全部字段:
 *
 *   1. hitArea (HIT_AREA_TYPE 5 种枚举):
 *        Circle / Ellipse / Rect / RoundedRect / Polygon
 *      每个形状的 Graphics 视觉与 hitArea 严格对齐,鼠标命中区才触发
 *      tap;非命中区不触发,以此证明 hit test 走 hitArea 而不是矩形包围盒。
 *
 *   2. cursor:
 *        EventParams.cursor 字段 (源码声明但 EventSystem 不主动消费)
 *      —— demo 通过 Event 组件的 init 钩子 + 手动设 container.cursor 兜底,
 *      让 5 个色块在 hover 时显示 5 种不同光标 (pointer / crosshair /
 *      grab / help / not-allowed)。
 *
 *   3. EventParams.on 一次性 map 配置:
 *        new Event({ on: { tap, touchstart, touchend } })
 *      EventComponent.init 会遍历 on 对象,把每个 key 当事件名注册;
 *      destroy 时统一卸载。
 *
 *   4. stopPropagation:
 *        嵌套实体 (parent → child),子节点 onTap 内调
 *        e.stopPropagation() 阻止冒泡到父。键盘 1 键切换开关,
 *        关时 child + parent 都触发,开时只 child 触发。
 *
 *   5. EventParam.localPosition:
 *        每次 tap 在 overlay 显示命中点的 global / local 坐标。
 *
 * 不依赖 plugin-renderer-text:文字全用 DOM overlay 输出。
 */

const HIT_TYPES = [
  HIT_AREA_TYPE.Circle,
  HIT_AREA_TYPE.Ellipse,
  HIT_AREA_TYPE.Rect,
  HIT_AREA_TYPE.RoundedRect,
  HIT_AREA_TYPE.Polygon,
];

const CURSORS = ['pointer', 'crosshair', 'grab', 'help', 'not-allowed'];
const FILLS = [0xff5e5e, 0xffb84d, 0x4dd07a, 0x4d9bff, 0xb86bff];

interface ShapeSpec {
  type: HIT_AREA_TYPE;
  cursor: string;
  fill: number;
  cx: number; // grid center x
  cy: number; // grid center y
  draw: (g: any) => void; // paint at local 0,0 referenced to gameObject anchor
  hitArea: { type: HIT_AREA_TYPE; style: any };
  width: number;
  height: number;
}

const COL_W = 150;
const CANVAS_W = 750;
const CANVAS_H = 1000;

function buildSpecs(): ShapeSpec[] {
  // 一行排开,canvas 750 / 5 = 150
  const cy = 250;
  return HIT_TYPES.map((type, i) => {
    const cx = COL_W / 2 + i * COL_W;
    const cursor = CURSORS[i];
    const fill = FILLS[i];
    return makeSpec(type, cursor, fill, cx, cy);
  });
}

function makeSpec(type: HIT_AREA_TYPE, cursor: string, fill: number, cx: number, cy: number): ShapeSpec {
  switch (type) {
    case HIT_AREA_TYPE.Circle: {
      const r = 55;
      return {
        type,
        cursor,
        fill,
        cx,
        cy,
        width: r * 2,
        height: r * 2,
        // Graphics 在 GameObject 局部 0,0 处绘制,GameObject 以 anchor 居中
        draw: g => g.beginFill(fill).drawCircle(r, r, r).endFill(),
        // hitArea 也用相同的 (x=r, y=r, radius=r),与 graphics 完全重合
        hitArea: { type, style: { x: r, y: r, radius: r } },
      };
    }
    case HIT_AREA_TYPE.Ellipse: {
      const rx = 60;
      const ry = 35;
      return {
        type,
        cursor,
        fill,
        cx,
        cy,
        width: rx * 2,
        height: ry * 2,
        draw: g => g.beginFill(fill).drawEllipse(rx, ry, rx, ry).endFill(),
        // pixi Ellipse(x, y, halfWidth, halfHeight)
        hitArea: { type, style: { x: rx, y: ry, width: rx, height: ry } },
      };
    }
    case HIT_AREA_TYPE.Rect: {
      const w0 = 110;
      const h0 = 110;
      return {
        type,
        cursor,
        fill,
        cx,
        cy,
        width: w0,
        height: h0,
        draw: g => g.beginFill(fill).drawRect(0, 0, w0, h0).endFill(),
        hitArea: { type, style: { x: 0, y: 0, width: w0, height: h0 } },
      };
    }
    case HIT_AREA_TYPE.RoundedRect: {
      const w0 = 110;
      const h0 = 110;
      const r = 30;
      return {
        type,
        cursor,
        fill,
        cx,
        cy,
        width: w0,
        height: h0,
        draw: g => g.beginFill(fill).drawRoundedRect(0, 0, w0, h0, r).endFill(),
        hitArea: { type, style: { x: 0, y: 0, width: w0, height: h0, radius: r } },
      };
    }
    case HIT_AREA_TYPE.Polygon: {
      // 五角星:在 110x110 的 box 内绘制
      const cxL = 55;
      const cyL = 55;
      const outer = 55;
      const inner = 25;
      const pts: number[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(cxL + Math.cos(a) * r, cyL + Math.sin(a) * r);
      }
      return {
        type,
        cursor,
        fill,
        cx,
        cy,
        width: 110,
        height: 110,
        draw: g => {
          g.beginFill(fill);
          g.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
          g.lineTo(pts[0], pts[1]);
          g.endFill();
        },
        hitArea: { type, style: { paths: pts } },
      };
    }
  }
  // unreachable but keep TS happy
  return null as any;
}

// ------------------------- DOM overlay -------------------------

interface LogEntry {
  ts: string;
  evtName: string;
  source: string;
  extra?: string;
}

class Overlay {
  root: HTMLDivElement;
  status: HTMLDivElement;
  list: HTMLOListElement;
  entries: LogEntry[] = [];

  constructor(parent: HTMLElement) {
    const root = document.createElement('div');
    root.style.cssText = [
      'position:fixed',
      'right:12px',
      'top:12px',
      'width:330px',
      'max-height:96vh',
      'overflow:auto',
      'background:rgba(20,22,28,0.92)',
      'color:#e6edf3',
      'font:12px/1.45 ui-monospace,Menlo,Consolas,monospace',
      'border:1px solid #2d333b',
      'border-radius:8px',
      'padding:10px 12px',
      'z-index:9999',
      'box-shadow:0 4px 18px rgba(0,0,0,0.4)',
    ].join(';');
    root.innerHTML = `
      <div style="font-weight:600;font-size:13px;margin-bottom:6px;">
        event-hitarea-deep
      </div>
      <div style="color:#9aa4ad;margin-bottom:8px;">
        5 种 HIT_AREA_TYPE 一字排开。<br/>
        鼠标 hover → cursor 切换。<br/>
        点击命中区 → 下方记录 (最近 10 条)。<br/>
        嵌套区 (canvas 下半部) → 键盘 [1] 切换 stopPropagation。
      </div>
      <div data-role="status" style="margin-bottom:8px;padding:6px 8px;background:#0d1117;border-radius:4px;color:#8be9fd;"></div>
      <ol data-role="list" style="margin:0;padding-left:18px;list-style:decimal;color:#c9d1d9;"></ol>
    `;
    parent.appendChild(root);
    this.root = root;
    this.status = root.querySelector('[data-role="status"]') as HTMLDivElement;
    this.list = root.querySelector('[data-role="list"]') as HTMLOListElement;
  }

  setStatus(text: string) {
    this.status.textContent = text;
  }

  log(evtName: string, source: string, extra?: string) {
    const d = new Date();
    const ts = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    this.entries.unshift({ ts, evtName, source, extra });
    if (this.entries.length > 10) this.entries.length = 10;
    this.render();
  }

  render() {
    this.list.innerHTML = this.entries
      .map(e => {
        const tail = e.extra ? ` <span style="color:#9aa4ad">${e.extra}</span>` : '';
        return `<li><span style="color:#79c0ff">[${e.ts}]</span> <b style="color:#ffa657">${e.evtName}</b> on <span style="color:#a5d6ff">${e.source}</span>${tail}</li>`;
      })
      .join('');
  }
}

function pad2(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

// ------------------------- main -------------------------

export async function init(canvas: HTMLCanvasElement) {
  const overlay = new Overlay(document.body);

  let stopPropagationOn = true;
  overlay.setStatus(`stopPropagation = ON (按 [1] 切换)`);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CANVAS_W, height: CANVAS_H }),
      new GraphicsSystem(),
      new EventSystem(),
    ],
  });

  // 取出 RendererSystem,后面用它把 cursor 应用到 PixiJS container
  const rendererSystem = game.getSystem(RendererSystem) as RendererSystem;
  const containerManager: any = (rendererSystem as any).containerManager;

  const applyCursor = (gameObject: GameObject, cursor: string) => {
    const c = containerManager?.getContainer?.(gameObject.id);
    if (c) c.cursor = cursor;
  };

  // ---- 1. 5 个独立形状 + hitArea + cursor + on map ----
  const specs = buildSpecs();
  for (const spec of specs) {
    const go = new GameObject(`shape-${spec.type}`, {
      size: { width: spec.width, height: spec.height },
      origin: { x: 0.5, y: 0.5 },
      anchor: { x: 0.5, y: 0.5 },
      position: { x: spec.cx, y: spec.cy },
    });

    const g = go.addComponent(new Graphics());
    spec.draw(g.graphics as any);

    // EventParams.on map:一次性把多个事件作为对象传入
    go.addComponent(
      new Event({
        interactive: true,
        cursor: spec.cursor,
        hitArea: spec.hitArea,
        on: {
          tap: (e: any) => {
            const lp = e.data.localPosition;
            overlay.log(
              'tap',
              spec.type,
              `local=(${lp.x.toFixed(0)},${lp.y.toFixed(0)})`,
            );
          },
          touchstart: () => overlay.log('touchstart', spec.type),
          touchend: () => overlay.log('touchend', spec.type),
        },
      }),
    );

    // EventSystem 不消费 cursor 字段,这里手动同步到 PixiJS container
    // 等 RendererSystem 下一帧创建好 container 后再设
    requestAnimationFrame(() => applyCursor(go, spec.cursor));

    game.scene.addChild(go);
  }

  // ---- 2. 嵌套实体演示 stopPropagation ----
  // 父 (大蓝矩形, 600x300) 居中下半部,子 (黄圆) 在父内部
  const parent = new GameObject('parentBox', {
    size: { width: 600, height: 300 },
    origin: { x: 0.5, y: 0.5 },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: CANVAS_W / 2, y: 700 },
  });
  const pg = parent.addComponent(new Graphics());
  (pg.graphics as any).beginFill(0x274472).drawRoundedRect(0, 0, 600, 300, 16).endFill();
  parent.addComponent(
    new Event({
      interactive: true,
      cursor: 'help',
      hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: 600, height: 300 } },
      on: {
        tap: () => overlay.log('tap', 'parentBox', 'parent received'),
      },
    }),
  );
  requestAnimationFrame(() => applyCursor(parent, 'help'));
  game.scene.addChild(parent);

  const child = new GameObject('childCircle', {
    size: { width: 140, height: 140 },
    origin: { x: 0.5, y: 0.5 },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: 300, y: 150 }, // 父的局部坐标系
  });
  const cg = child.addComponent(new Graphics());
  (cg.graphics as any).beginFill(0xffd24d).drawCircle(70, 70, 70).endFill();
  child.addComponent(
    new Event({
      interactive: true,
      cursor: 'grab',
      hitArea: { type: HIT_AREA_TYPE.Circle, style: { x: 70, y: 70, radius: 70 } },
      on: {
        tap: (e: any) => {
          overlay.log('tap', 'childCircle', stopPropagationOn ? 'STOP' : 'pass-through');
          if (stopPropagationOn) e.stopPropagation();
        },
      },
    }),
  );
  parent.addChild(child);
  requestAnimationFrame(() => applyCursor(child, 'grab'));

  // ---- 3. 键盘 [1] 切 stopPropagation ----
  window.addEventListener('keydown', e => {
    if (e.key === '1') {
      stopPropagationOn = !stopPropagationOn;
      overlay.setStatus(`stopPropagation = ${stopPropagationOn ? 'ON' : 'OFF'} (按 [1] 切换)`);
      overlay.log('toggle', 'keyboard', `stopPropagation=${stopPropagationOn}`);
    }
  });

  // 暴露给 console 方便手动验证
  (window as any).__eventDeep = {
    game,
    specs: specs.map(s => s.type),
    setStop: (v: boolean) => {
      stopPropagationOn = v;
      overlay.setStatus(`stopPropagation = ${v ? 'ON' : 'OFF'} (按 [1] 切换)`);
    },
  };
}
