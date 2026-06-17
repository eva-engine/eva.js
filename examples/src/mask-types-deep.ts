/**
 * mask-types-deep
 *
 * 深度演示 @eva/plugin-renderer-mask 的 7 种 MASK_TYPE,以及 enabled toggle、runtime type 切换。
 *
 * 7 种 MASK_TYPE(以 packages/plugin-renderer-mask/lib/component.ts 源码为准):
 *   1. Circle       — radius
 *   2. Ellipse      — width / height (半径形式,system 内部走 graphics.ellipse)
 *   3. Rect         — width / height
 *   4. RoundedRect  — width / height / radius
 *   5. Polygon      — paths (number[],按 [x0,y0,x1,y1,...])
 *   6. Img          — resource (基于图片 alpha 通道)
 *   7. Sprite       — resource + spriteName (spritesheet 帧)
 *
 * 每个被遮罩的色块由 GraphicsSystem 画一个 100x100 实心方块,挂在 GameObject 上。
 * 在该 GameObject 上再 addComponent(Mask) 即可看到只显示遮罩形状内的色块部分。
 *
 * 键盘:
 *   1 — 全部 mask.enabled = false (色块整体显示)
 *   2 — 全部 mask.enabled = true  (色块被裁剪)
 *   3 — 切第一个 mask 的 type 从 Circle → Rect (运行时改 type)
 */

import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
// ImgSystem 必须挂上,Img 类型 mask 内部 createSprite 时会从 resource 系统取图;
// Img 组件本身在本 demo 不直接使用,所以只 import system。
import { ImgSystem } from '@eva/plugin-renderer-img';
import '@eva/plugin-renderer-sprite';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Mask, MaskSystem, MASK_TYPE } from '@eva/plugin-renderer-mask';

export const name = 'mask-types-deep — 7 种 MASK_TYPE 全演示 + runtime toggle';

const CELL = 100;
const GAP_X = 60;
const GAP_Y = 60;
const COLS = 4;
// 2x4 网格,容纳 7 种 + 1 个空位
// canvas 750x1000,网格起点 (60, 120),给标题留空间
const ORIGIN_X = 60;
const ORIGIN_Y = 140;

const COLORS = [
  0xff5252, // Circle      red
  0xff9800, // Ellipse     orange
  0xffd600, // Rect        yellow
  0x4caf50, // RoundedRect green
  0x2196f3, // Polygon     blue
  0x9c27b0, // Img         purple
  0x00bcd4, // Sprite      cyan
];

interface MaskCell {
  label: string;
  color: number;
  build: () => Mask;
}

export async function init(canvas: HTMLCanvasElement) {
  // === 资源 ===
  // Img 类型用 examples/public/mask/heart.png (mask.ts 已 verified 可用)
  // Sprite 类型用 examples/public/mask/tag.png + tag.json
  resource.addResource([
    {
      name: 'heart',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '/mask/heart.png',
        },
      },
      preload: false,
    },
    {
      name: 'tag',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: '/mask/tag.png',
        },
        json: {
          type: 'json',
          url: '/mask/tag.json',
        },
      },
      preload: true,
    },
  ]);

  // === Game ===
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new GraphicsSystem(),
      new MaskSystem(),
    ],
  });

  game.scene.transform.size = { width: 750, height: 1000 };

  // === DOM overlay (标题 + 标签 + 操作提示) ===
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position: fixed',
    'left: 0',
    'top: 0',
    'width: 100vw',
    'height: 100vh',
    'pointer-events: none',
    'font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    'color: #fff',
    'z-index: 10',
  ].join(';');
  document.body.appendChild(overlay);

  const title = document.createElement('div');
  title.textContent = name;
  title.style.cssText = [
    'position: absolute',
    'left: 24px',
    'top: 16px',
    'font-size: 18px',
    'font-weight: 600',
    'text-shadow: 0 1px 2px rgba(0,0,0,0.6)',
  ].join(';');
  overlay.appendChild(title);

  const status = document.createElement('div');
  status.id = 'mask-deep-status';
  status.style.cssText = [
    'position: absolute',
    'left: 24px',
    'top: 44px',
    'font-size: 13px',
    'color: #cfe',
    'text-shadow: 0 1px 2px rgba(0,0,0,0.6)',
  ].join(';');
  status.textContent = '键盘: 1=disable / 2=enable / 3=切第一个 mask 的 type Circle↔Rect';
  overlay.appendChild(status);

  // === 7 种 MASK_TYPE 配置 ===
  // 注意: MASK_TYPE.Ellipse 在 system.ts 用 `graphics.ellipse(x, y, width, height)`,
  // PixiJS 8 ellipse 签名是 (cx, cy, halfWidth, halfHeight),
  // 所以这里 width/height 实际意义是椭圆的 *半轴*,不是直径。设 40/30 在 100x100 块内可见。
  //
  // Polygon 走 `graphics.poly(paths)`,paths 是顶点数组 [x0,y0,x1,y1,...]。
  // 这里画一个菱形,顶点相对于 cell 局部坐标 0..100。
  //
  // Img / Sprite 用 style.x/y/width/height 控制遮罩贴图的位置/尺寸,基于该 GameObject 的局部坐标。
  const cells: MaskCell[] = [
    {
      label: '1. Circle\n(x,y,radius)',
      color: COLORS[0],
      build: () =>
        new Mask({
          type: MASK_TYPE.Circle,
          style: { x: 50, y: 50, radius: 40 },
        }),
    },
    {
      label: '2. Ellipse\n(x,y,width,height)',
      color: COLORS[1],
      build: () =>
        new Mask({
          type: MASK_TYPE.Ellipse,
          // width/height 在 PIXI v8 ellipse 是半轴
          style: { x: 50, y: 50, width: 40, height: 28 },
        }),
    },
    {
      label: '3. Rect\n(x,y,width,height)',
      color: COLORS[2],
      build: () =>
        new Mask({
          type: MASK_TYPE.Rect,
          style: { x: 10, y: 10, width: 80, height: 80 },
        }),
    },
    {
      label: '4. RoundedRect\n(x,y,w,h,radius)',
      color: COLORS[3],
      build: () =>
        new Mask({
          type: MASK_TYPE.RoundedRect,
          style: { x: 10, y: 10, width: 80, height: 80, radius: 24 },
        }),
    },
    {
      label: '5. Polygon\n(paths[])',
      color: COLORS[4],
      build: () =>
        new Mask({
          type: MASK_TYPE.Polygon,
          // 菱形: top, right, bottom, left
          style: { paths: [50, 5, 95, 50, 50, 95, 5, 50] },
        }),
    },
    {
      label: '6. Img\n(alpha 遮罩)',
      color: COLORS[5],
      build: () =>
        new Mask({
          type: MASK_TYPE.Img,
          style: { x: 0, y: 0, width: 100, height: 100 },
          resource: 'heart',
        }),
    },
    {
      label: '7. Sprite\n(spritesheet 帧)',
      color: COLORS[6],
      build: () =>
        new Mask({
          type: MASK_TYPE.Sprite,
          style: { x: 0, y: 0, width: 100, height: 100 },
          resource: 'tag',
          spriteName: 'task.png',
        }),
    },
  ];

  // === 创建 7 个色块 + Mask ===
  const maskComponents: Mask[] = [];

  cells.forEach((cell, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = ORIGIN_X + col * (CELL + GAP_X);
    const y = ORIGIN_Y + row * (CELL + GAP_Y + 40); // 多留 40 给标签

    const go = new GameObject(`mask-cell-${i}`, {
      position: { x, y },
      size: { width: CELL, height: CELL },
    });

    // 用 Graphics 画 100x100 实心方块作为被遮罩内容
    const g = go.addComponent(new Graphics());
    g.graphics.beginFill(cell.color, 1);
    g.graphics.drawRect(0, 0, CELL, CELL);
    g.graphics.endFill();

    // 画一个细描边方便看出"裁剪外区域被裁掉了"
    g.graphics.beginFill(0x000000, 0);
    g.graphics.lineStyle?.(2, 0xffffff, 0.4);
    g.graphics.drawRect(0, 0, CELL, CELL);
    g.graphics.endFill();

    game.scene.addChild(go);

    // 加 Mask 组件
    const maskComponent = go.addComponent(cell.build());
    maskComponents.push(maskComponent);

    // DOM 标签
    const labelEl = document.createElement('div');
    labelEl.textContent = cell.label;
    labelEl.style.cssText = [
      'position: absolute',
      // canvas 在窗口里以 contain 缩放,这里直接用 canvas 像素映射:
      // canvas 宽 750 → 窗口 100vw,所以 px → vw 比例 = 100/750
      // 但更稳妥的方式是把 overlay 用 fixed + 与 canvas 等大。
      // 简单起见直接用 px,但用 canvas 实际渲染坐标对齐 — 用 calc。
      `left: calc(${x}px / 750 * 100vw)`,
      `top: calc(${y + CELL + 4}px / 1000 * 100vh)`,
      `width: calc(${CELL}px / 750 * 100vw)`,
      'font-size: 11px',
      'line-height: 1.3',
      'color: #fff',
      'text-shadow: 0 1px 2px rgba(0,0,0,0.8)',
      'white-space: pre',
    ].join(';');
    overlay.appendChild(labelEl);
  });

  // === 键盘交互 ===
  function setStatus(msg: string) {
    status.textContent = `键盘: 1=disable / 2=enable / 3=切第一个 mask Circle↔Rect | ${msg}`;
  }

  let firstType: MASK_TYPE = MASK_TYPE.Circle;

  window.addEventListener('keydown', e => {
    if (e.key === '1') {
      maskComponents.forEach(m => {
        m.enabled = false;
      });
      console.log('[mask-types-deep] all masks disabled (mask.enabled = false)');
      setStatus('all enabled = false (色块整体显示)');
    } else if (e.key === '2') {
      maskComponents.forEach(m => {
        m.enabled = true;
      });
      console.log('[mask-types-deep] all masks enabled (mask.enabled = true)');
      setStatus('all enabled = true (色块被裁剪)');
    } else if (e.key === '3') {
      const m = maskComponents[0];
      if (firstType === MASK_TYPE.Circle) {
        // 切到 Rect — 复用同一 mask 实例,直接改 type + 必要 style 参数
        // (Circle ↔ Rect 在 system 内会触发 redrawGraphics,因为 _lastType !== type 的条件
        //  对 Graphics 类型仍然走 redraw 分支,而不是 remove+add)
        m.type = MASK_TYPE.Rect;
        m.style = { x: 10, y: 10, width: 80, height: 80 };
        // 显式触发 system 监听的 style/x/y/width/height 字段更新:
        m.x = 10;
        m.y = 10;
        m.width = 80;
        m.height = 80;
        firstType = MASK_TYPE.Rect;
        console.log('[mask-types-deep] first mask type Circle → Rect');
        setStatus('first mask: Rect');
      } else {
        m.type = MASK_TYPE.Circle;
        m.style = { x: 50, y: 50, radius: 40 };
        m.x = 50;
        m.y = 50;
        m.radius = 40;
        firstType = MASK_TYPE.Circle;
        console.log('[mask-types-deep] first mask type Rect → Circle');
        setStatus('first mask: Circle');
      }
    }
  });

  // 暴露给 console / 自动化 verify
  // @ts-ignore
  window.__maskDeep = { maskComponents, MASK_TYPE };

  console.log('[mask-types-deep] ready. 7 mask types:', cells.map(c => c.label.split('\n')[0]));
}
