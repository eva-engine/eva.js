import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { TextSystem, Text } from '@eva/plugin-renderer-text';
import { EventSystem, Event, HIT_AREA_TYPE } from '@eva/plugin-renderer-event';
import { RenderSystem } from '@eva/plugin-renderer-render';
import {
  UI,
  UIShapeType,
  UISystem,
  FancyButton,
  ProgressBar,
  CircularProgressBar,
} from '@eva/plugin-ui';

export const name = 'plugin-ui-button-and-bar';

/**
 * plugin-ui v2 — FancyButton + ProgressBar + CircularProgressBar 协作 demo。
 *
 * 演示:
 * - UISystem 单一注册即可驱动所有 plugin-ui 组件(@pixi/ui factory wrapper)
 * - FancyButton 4 状态 view 由 @pixi/ui FancyButton 内部接管(hover/pressed 自动切换)
 * - tap 事件回调直接修改 wrapper.value,UISystem 监听变化触发 @pixi/ui ProgressBar.progress 同步
 * - applyDeclarativeProps 幂等保证:外部改 valueRange 不会重置 value
 */
export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new TextSystem(),
      new EventSystem(),
      new RenderSystem(),
      new UISystem(), // 唯一 plugin-ui system
    ],
  });

  // 背景
  const bg = new GameObject('bg', { position: { x: 0, y: 0 }, size: { width: 750, height: 1000 } });
  bg.addComponent(new UI({ shapes: [{ type: UIShapeType.RECT, style: { x: 0, y: 0, width: 750, height: 1000, fill: '#0f172a' } as any }] }));
  game.scene.addChild(bg);

  // 标题 + 提示
  const title = new GameObject('title', { position: { x: 32, y: 60 }, size: { width: 686, height: 60 } });
  title.addComponent(new Text({ text: 'FancyButton × ProgressBar', style: { fontSize: 36, fill: '#f8fafc' } as any }));
  game.scene.addChild(title);

  const hint = new GameObject('hint', { position: { x: 32, y: 124 }, size: { width: 686, height: 32 } });
  hint.addComponent(new Text({ text: '点击下方 3 个按钮看 HP/CD 实时刷新(plugin-ui v2)', style: { fontSize: 18, fill: '#94a3b8' } as any }));
  game.scene.addChild(hint);

  // HP 文字 + linear ProgressBar
  const hpLabel = new GameObject('hp-label', { position: { x: 32, y: 240 }, size: { width: 686, height: 32 } });
  hpLabel.addComponent(new Text({ text: 'HP 50 / 100', style: { fontSize: 24, fill: '#e5e7eb' } as any }));
  game.scene.addChild(hpLabel);

  const hpBar = new GameObject('hp', { position: { x: 32, y: 280 }, size: { width: 686, height: 32 } });
  const progressBar = hpBar.addComponent(new ProgressBar({
    value: 50,
    valueRange: [0, 100],
    bgView: { color: '#1f2937', width: 686, height: 32, radius: 16 },
    fillView: { color: '#22c55e', width: 686, height: 32, radius: 16 },
    fillPaddings: { top: 3, right: 3, bottom: 3, left: 3 },
  } as any));
  game.scene.addChild(hpBar);

  // CircularProgressBar(独立 wrapper)
  const cd = new GameObject('cd', { position: { x: 304, y: 360 }, size: { width: 140, height: 140 } });
  const cdBar = cd.addComponent(new CircularProgressBar({
    value: 100,
    valueRange: [0, 100],
    radius: 70,
    lineWidth: 14,
    startAngle: -90,
    backgroundColor: '#1f2937',
    fillColor: '#38bdf8',
  } as any));
  game.scene.addChild(cd);

  const cdText = new GameObject('cd-text', { position: { x: 374, y: 430 }, size: { width: 140, height: 40 }, anchor: { x: 0.5, y: 0.5 } });
  const cdTextLabel = cdText.addComponent(new Text({ text: '100%', style: { fontSize: 24, fill: '#ffffff', align: 'center' } as any }));
  game.scene.addChild(cdText);

  // 按钮回调:直接改 wrapper 字段,UISystem 监听并同步到 @pixi/ui
  game.scene.addChild(makeButton('btn-minus', 32, 580, 220, 80, '受伤 -10', '#ef4444', () => {
    const next = Math.max(0, (progressBar as any).value - 10);
    (progressBar as any).value = next;
    hpLabel.getComponent(Text).text = `HP ${next} / 100`;
  }));

  game.scene.addChild(makeButton('btn-plus', 280, 580, 220, 80, '回血 +10', '#22c55e', () => {
    const next = Math.min(100, (progressBar as any).value + 10);
    (progressBar as any).value = next;
    hpLabel.getComponent(Text).text = `HP ${next} / 100`;
  }));

  game.scene.addChild(makeButton('btn-cd', 528, 580, 190, 80, '技能 CD', '#8b5cf6', () => {
    (cdBar as any).value = 0;
    if (cdTextLabel) cdTextLabel.text = '0%';
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / 2000);
      const v = Math.round(t * 100);
      (cdBar as any).value = v;
      if (cdTextLabel) cdTextLabel.text = `${v}%`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
}

/**
 * v2 FancyButton:viewRefs 直接传 inline color 视觉。
 * Event 组件继续负责 hit area + tap 回调。
 */
function makeButton(name: string, x: number, y: number, w: number, h: number, label: string, fill: string, onTap: () => void): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  const evt = go.addComponent(new Event({ hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: w, height: h } } as any }));

  go.addComponent(new FancyButton({
    enabled: true,
    text: label,
    views: {
      default: { color: fill, width: w, height: h, radius: 16 },
      hover: { color: fill, width: w, height: h, radius: 16 },
      pressed: { color: fill, width: w, height: h, radius: 16 },
      disabled: { color: '#64748b', width: w, height: h, radius: 16 },
    },
  } as any));

  evt.on('tap', onTap);
  return go;
}
