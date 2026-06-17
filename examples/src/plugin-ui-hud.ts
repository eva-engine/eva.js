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
  Slider,
  Switcher,
  CheckBox,
  Select,
  ScrollBox,
} from '@eva/plugin-ui';

export const name = 'plugin-ui-hud';

/**
 * Battle HUD demo (plugin-ui v2 / @pixi/ui):
 * - top-left:  HP / MP linear ProgressBar + circular CD (CircularProgressBar)
 * - top-right: 技能 charge Slider + Ultimate FancyButton(全 4 态视觉)
 * - bottom-left: 战斗日志 ScrollBox(条目作为业务子树注入)
 * - bottom-right: 设置面板 — CheckBox(audio)+ Switcher(music on/off)+ Slider(volume)+ Select(difficulty)
 *
 * 旧 v1 demo 中的 HUDAnchor / TabBar / Stepper 已不再存在,改用绝对定位 + 等价组件展示。
 */
export async function init(canvas: HTMLCanvasElement) {
  const CW = 750;
  const CH = 1334;
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CW, height: CH }),
      new GraphicsSystem(),
      new TextSystem(),
      new EventSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  // 场景背景
  const bg = new GameObject('bg', { position: { x: 0, y: 0 }, size: { width: CW, height: CH } });
  bg.addComponent(new UI({ shapes: [{ type: UIShapeType.RECT, style: { x: 0, y: 0, width: CW, height: CH, fill: '#0b1220' } as any }] }));
  game.scene.addChild(bg);

  const banner = new GameObject('banner', { position: { x: 32, y: 24 }, size: { width: 686, height: 40 } });
  banner.addComponent(new Text({ text: 'Battle HUD demo (plugin-ui v2 / @pixi/ui)', style: { fontSize: 18, fill: '#94a3b8' } as any }));
  game.scene.addChild(banner);

  // 4 个面板
  game.scene.addChild(makeHpPanel(32, 80));
  game.scene.addChild(makeSkillPanel(432, 80));
  game.scene.addChild(makeCombatLog(32, 800));
  game.scene.addChild(makeSettingsPanel(412, 800));
}

function makeHpPanel(x: number, y: number): GameObject {
  const w = 280;
  const h = 120;
  const root = new GameObject('panel-hp', { position: { x, y }, size: { width: w, height: h } });
  root.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w, height: h, radius: 12, fill: '#111827', stroke: '#374151', lineWidth: 1, alpha: 0.85 } as any }] }));

  const hpLabel = new GameObject('hp-label', { position: { x: 12, y: 8 }, size: { width: w - 24, height: 18 } });
  hpLabel.addComponent(new Text({ text: 'HP 60 / 100', style: { fontSize: 13, fill: '#e5e7eb' } as any }));
  root.addChild(hpLabel);

  const hpBar = new GameObject('hp-bar', { position: { x: 12, y: 32 }, size: { width: 200, height: 18 } });
  hpBar.addComponent(new ProgressBar({
    value: 60, valueRange: [0, 100],
    bgView: { color: '#1f2937', width: 200, height: 18, radius: 8 },
    fillView: { color: '#22c55e', width: 200, height: 18, radius: 8 },
    fillPaddings: { top: 2, right: 2, bottom: 2, left: 2 },
  } as any));
  root.addChild(hpBar);

  const mpLabel = new GameObject('mp-label', { position: { x: 12, y: 60 }, size: { width: w - 24, height: 18 } });
  mpLabel.addComponent(new Text({ text: 'MP 75 / 100', style: { fontSize: 13, fill: '#e5e7eb' } as any }));
  root.addChild(mpLabel);

  const mpBar = new GameObject('mp-bar', { position: { x: 12, y: 84 }, size: { width: 200, height: 14 } });
  mpBar.addComponent(new ProgressBar({
    value: 75, valueRange: [0, 100],
    bgView: { color: '#1f2937', width: 200, height: 14, radius: 6 },
    fillView: { color: '#0ea5e9', width: 200, height: 14, radius: 6 },
    fillPaddings: { top: 1, right: 1, bottom: 1, left: 1 },
  } as any));
  root.addChild(mpBar);

  const cd = new GameObject('cd-circle', { position: { x: 220, y: 32 }, size: { width: 56, height: 56 } });
  cd.addComponent(new CircularProgressBar({
    value: 75, valueRange: [0, 100],
    radius: 28, lineWidth: 6, startAngle: -90,
    backgroundColor: '#1f2937', fillColor: '#38bdf8',
  } as any));
  root.addChild(cd);
  return root;
}

function makeSkillPanel(x: number, y: number): GameObject {
  const w = 286;
  const h = 120;
  const root = new GameObject('panel-skill', { position: { x, y }, size: { width: w, height: h } });
  root.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w, height: h, radius: 14, fill: '#111827', stroke: '#fbbf24', lineWidth: 2 } as any }] }));

  const label = new GameObject('skill-label', { position: { x: 12, y: 8 }, size: { width: w - 24, height: 18 } });
  label.addComponent(new Text({ text: 'SKILL CHARGE', style: { fontSize: 12, fill: '#94a3b8' } as any }));
  root.addChild(label);

  const slider = new GameObject('skill-slider', { position: { x: 12, y: 36 }, size: { width: 240, height: 24 } });
  slider.addComponent(new Slider({
    enabled: true, value: 70, min: 0, max: 100, step: 1,
    views: {
      bg: { color: '#1f2937', width: 240, height: 8, radius: 4 },
      fill: { color: '#fbbf24', width: 240, height: 8, radius: 4 },
      thumb: { color: '#f8fafc', width: 18, height: 18, radius: 9 },
    },
  } as any));
  root.addChild(slider);

  const ult = new GameObject('ult-button', { position: { x: 12, y: 70 }, size: { width: w - 24, height: 38 } });
  ult.addComponent(new Event({ interactive: true, hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: w - 24, height: 38 } } as any }));
  ult.addComponent(new FancyButton({
    enabled: true, text: 'Ultimate Ready',
    views: {
      default: { color: '#fbbf24', width: w - 24, height: 38, radius: 8 },
      hover: { color: '#f59e0b', width: w - 24, height: 38, radius: 8 },
      pressed: { color: '#d97706', width: w - 24, height: 38, radius: 8 },
      disabled: { color: '#64748b', width: w - 24, height: 38, radius: 8 },
    },
  } as any));
  root.addChild(ult);
  return root;
}

function makeCombatLog(x: number, y: number): GameObject {
  const w = 360;
  const h = 280;
  const root = new GameObject('panel-log', { position: { x, y }, size: { width: w, height: h } });
  root.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w, height: h, radius: 10, fill: '#0f172a', stroke: '#334155', lineWidth: 1, alpha: 0.85 } as any }] }));

  const title = new GameObject('log-title', { position: { x: 12, y: 8 }, size: { width: w - 24, height: 24 } });
  title.addComponent(new Text({ text: 'COMBAT LOG', style: { fontSize: 12, fill: '#94a3b8' } as any }));
  root.addChild(title);

  const scroll = new GameObject('log-scroll', { position: { x: 8, y: 36 }, size: { width: w - 16, height: h - 44 } });
  scroll.addComponent(new ScrollBox({
    width: w - 16, height: h - 44, direction: 'vertical',
    background: '#0b1220', radius: 6,
    elementsMargin: 4, padding: 8,
  } as any));
  const content = new GameObject('content', { position: { x: 0, y: 0 }, size: { width: w - 16, height: 280 } });
  const lines: Array<{ text: string; color: string }> = [
    { text: '[12:01] Player joined the battle', color: '#cbd5e1' },
    { text: '[12:02] Slime took 24 damage', color: '#cbd5e1' },
    { text: '[12:02] Critical hit! -120 HP', color: '#f87171' },
    { text: '[12:03] Mana restored +40', color: '#38bdf8' },
    { text: '[12:04] Picked up Iron Sword', color: '#fbbf24' },
    { text: '[12:05] Boss appeared: Frost Wyrm', color: '#fb7185' },
    { text: '[12:06] You blocked 80 damage', color: '#cbd5e1' },
    { text: '[12:06] Combo x3 - bonus +15%', color: '#a78bfa' },
    { text: '[12:07] Healing potion used', color: '#cbd5e1' },
    { text: '[12:08] Wave 4 cleared', color: '#34d399' },
  ];
  lines.forEach((line, i) => {
    const row = new GameObject(`log-${i}`, { position: { x: 0, y: i * 28 }, size: { width: w - 32, height: 24 } });
    row.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w - 32, height: 24, radius: 4, fill: '#1e293b' } as any }] }));
    const t = new GameObject('text', { position: { x: 8, y: 4 }, size: { width: w - 48, height: 18 } });
    t.addComponent(new Text({ text: line.text, style: { fontSize: 12, fill: line.color } as any }));
    row.addChild(t);
    content.addChild(row);
  });
  scroll.addChild(content);
  root.addChild(scroll);
  return root;
}

function makeSettingsPanel(x: number, y: number): GameObject {
  const w = 306;
  const h = 280;
  const root = new GameObject('panel-settings', { position: { x, y }, size: { width: w, height: h } });
  root.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w, height: h, radius: 12, fill: '#111827', stroke: '#475569', lineWidth: 1 } as any }] }));

  const title = new GameObject('settings-title', { position: { x: 12, y: 12 }, size: { width: w - 24, height: 24 } });
  title.addComponent(new Text({ text: 'SETTINGS', style: { fontSize: 14, fill: '#94a3b8' } as any }));
  root.addChild(title);

  // CheckBox: Audio
  const audio = new GameObject('audio-checkbox', { position: { x: 12, y: 50 }, size: { width: 32, height: 32 } });
  audio.addComponent(new CheckBox({
    enabled: true, checked: true, text: 'Audio',
    views: {
      checked: { color: '#22c55e', width: 32, height: 32, radius: 6 },
      unchecked: { color: '#475569', width: 32, height: 32, radius: 6 },
    },
  } as any));
  root.addChild(audio);

  // Switcher: Music on/off(替代旧 Switch)
  const music = new GameObject('music-toggle', { position: { x: 12, y: 110 }, size: { width: 80, height: 32 } });
  music.addComponent(new Switcher({
    active: 1, triggerEvent: 'onPress',
    views: [
      { color: '#475569', width: 80, height: 32, radius: 16 },
      { color: '#22c55e', width: 80, height: 32, radius: 16 },
    ],
  } as any));
  root.addChild(music);

  // Slider: Volume
  const volume = new GameObject('volume-slider', { position: { x: 12, y: 170 }, size: { width: w - 24, height: 24 } });
  volume.addComponent(new Slider({
    enabled: true, value: 50, min: 0, max: 100, step: 5,
    views: {
      bg: { color: '#1f2937', width: w - 24, height: 8, radius: 4 },
      fill: { color: '#a78bfa', width: w - 24, height: 8, radius: 4 },
      thumb: { color: '#f8fafc', width: 18, height: 18, radius: 9 },
    },
  } as any));
  root.addChild(volume);

  // Select: Difficulty
  const difficulty = new GameObject('difficulty-select', { position: { x: 12, y: 220 }, size: { width: 200, height: 36 } });
  difficulty.addComponent(new Select({
    items: [{ text: 'Easy' }, { text: 'Normal' }, { text: 'Hard' }],
    selectedIndex: 1, placeholder: 'Difficulty',
    closedView: { color: '#1f2937', width: 200, height: 36, radius: 6 },
    openView: { color: '#374151', width: 200, height: 36, radius: 6 },
    textStyle: { fontFamily: 'Arial', fontSize: 14, fill: '#f8fafc' },
  } as any));
  root.addChild(difficulty);

  return root;
}
