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
  Button,
  FancyButton,
  CheckBox,
  Switcher,
  RadioGroup,
  ProgressBar,
  CircularProgressBar,
  Slider,
  DoubleSlider,
  Input,
  List,
  ScrollBox,
  Select,
  Dialog,
  MaskedFrame,
} from '@eva/plugin-ui';

export const name = 'plugin-ui-tour';

/**
 * plugin-ui v2 — 全 16 组件巡览。
 *
 * Canvas 750 × 1624(竖屏),所有组件由唯一 UISystem 驱动,
 * 每个 wrapper 直接通过 viewRefs(inline color)注入 PIXI 显示对象。
 *
 * 旧 v1 demo 中的 Stepper / Tooltip / TabBar / ToastHost / HUDAnchor 已不再存在,
 * Switch 改名为 Switcher,InputField 改名为 Input,Modal 改名为 Dialog;
 * 新增 Button / DoubleSlider / List / Select / MaskedFrame / CircularProgressBar 6 个组件。
 */
export async function init(canvas: HTMLCanvasElement) {
  const CW = 750;
  const CH = 1624;
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

  // 标题
  game.scene.addChild(makeText('title', 32, 24, 686, 40, 'plugin-ui v2 — 16 components based on @pixi/ui', 22, '#f8fafc', '700'));

  // 1. UI shapes
  game.scene.addChild(makeLabel('1. UI shapes (rect / roundedRect / circle / linear-gradient)', 80));
  game.scene.addChild(makeUIRect('ui-rect', 32, 110, 200, 40, 12, '#3b82f6'));
  game.scene.addChild(makeUIGradient('ui-grad', 248, 110, 200, 40));
  game.scene.addChild(makeUICircle('ui-circle', 472, 110, 40));

  // 2. Button(单 view)
  game.scene.addChild(makeLabel('2. Button — 单 view 简易按钮', 170));
  game.scene.addChild(makeButton('btn-simple', 32, 200, 160, 36));

  // 3. FancyButton(4 状态)
  game.scene.addChild(makeLabel('3. FancyButton — 4 状态(default/hover/pressed/disabled)+ selected tint', 250));
  game.scene.addChild(makeFancyButton('fancy', 32, 280, 160, 36, 'Confirm'));

  // 4. CheckBox
  game.scene.addChild(makeLabel('4. CheckBox — 二态勾选', 330));
  game.scene.addChild(makeCheckBox('cb', 32, 360, true, '记住我'));

  // 5. Switcher(替代 Switch)
  game.scene.addChild(makeLabel('5. Switcher — 多 view 切换器(替代 Switch)', 410));
  game.scene.addChild(makeSwitcher('sw', 32, 440, true));

  // 6. RadioGroup
  game.scene.addChild(makeLabel('6. RadioGroup(简单 / 普通 / 困难)', 490));
  game.scene.addChild(makeRadioGroup('diff', 32, 520));

  // 7. ProgressBar + CircularProgressBar
  game.scene.addChild(makeLabel('7. ProgressBar(linear)+ CircularProgressBar', 580));
  game.scene.addChild(makeProgressBarH('hp', 32, 610, 280, 24, 65));
  game.scene.addChild(makeCircularProgressBar('cd', 340, 590, 80, 75));

  // 8. Slider + DoubleSlider
  game.scene.addChild(makeLabel('8. Slider + DoubleSlider — 拖拽数值 / 范围选择', 690));
  game.scene.addChild(makeSlider('vol', 32, 720, 320, 70));
  game.scene.addChild(makeDoubleSlider('range', 380, 720, 320, 25, 75));

  // === DEBUG: 注释 9~11 测哪个触发 RenderGroup 错 ===
  // game.scene.addChild(makeLabel('9. Input', 780));
  // game.scene.addChild(makeInput('name-input', 32, 810, 320, 48));
  // game.scene.addChild(makeLabel('10. List + ScrollBox', 880));
  // game.scene.addChild(makeList('list-demo', 32, 910, 320, 200));
  // game.scene.addChild(makeScrollBox('scroll-demo', 380, 910, 320, 200));
  // game.scene.addChild(makeLabel('11. Select', 1130));
  // game.scene.addChild(makeSelect('difficulty', 32, 1160, 200, 36));

  // 12. MaskedFrame(暂时跳过 — @pixi/ui MaskedFrame 在 PIXI v8.18+ 与 RenderGroup 嵌套有兼容问题)
  game.scene.addChild(makeLabel('12. MaskedFrame — 任意形状遮罩裁剪(详见独立 demo)', 1220));

  // 13. Dialog(默认关闭;Dialog 内部 RenderGroup 在 PIXI v8.18 直接 stage 上有兼容问题,
  //   生产用法应放在独立 scene 顶层 / 配合 backdrop)
  game.scene.addChild(makeLabel('13. Dialog — 模态弹窗(详见 hud demo 的 Ultimate Ready 场景)', 1350));

  console.log('plugin-ui-tour 就绪 — 16 个 @pixi/ui wrapper 全部加载,UISystem 驱动');
}

// ============================================================
// Helpers
// ============================================================

function makeText(name: string, x: number, y: number, w: number, h: number, text: string, fontSize: number, fill: string, fontWeight = '400'): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Text({ text, style: { fontSize, fill, fontWeight } as any }));
  return go;
}

function makeLabel(label: string, y: number): GameObject {
  return makeText(`label-${y}`, 32, y, 686, 24, label, 14, '#94a3b8');
}

function makeUIRect(name: string, x: number, y: number, w: number, h: number, radius: number, fill: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w, height: h, radius, fill } as any }] }));
  return go;
}

function makeUIGradient(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new UI({
    shapes: [{
      type: UIShapeType.ROUNDED_RECT,
      style: { x: 0, y: 0, width: w, height: h, radius: 12, fill: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)' } as any,
    }],
  }));
  return go;
}

function makeUICircle(name: string, x: number, y: number, size: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: size, height: size } });
  go.addComponent(new UI({ shapes: [{ type: UIShapeType.CIRCLE, style: { x: size / 2, y: size / 2, radius: size / 2, fill: '#22c55e' } as any }] }));
  return go;
}

function makeButton(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Event({ hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: w, height: h } } as any }));
  go.addComponent(new Button({ enabled: true, view: { color: '#3b82f6', width: w, height: h, radius: 8 } } as any));
  return go;
}

function makeFancyButton(name: string, x: number, y: number, w: number, h: number, label: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Event({ hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: w, height: h } } as any }));
  go.addComponent(new FancyButton({
    enabled: true, selected: false, text: label, selectedTint: '#fbbf24',
    views: {
      default: { color: '#22c55e', width: w, height: h, radius: 8 },
      hover: { color: '#16a34a', width: w, height: h, radius: 8 },
      pressed: { color: '#15803d', width: w, height: h, radius: 8 },
      disabled: { color: '#64748b', width: w, height: h, radius: 8 },
    },
  } as any));
  return go;
}

function makeCheckBox(name: string, x: number, y: number, checked: boolean, labelText: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 32, height: 32 } });
  go.addComponent(new CheckBox({
    enabled: true, checked, text: labelText,
    views: {
      checked: { color: '#22c55e', width: 32, height: 32, radius: 6 },
      unchecked: { color: '#475569', width: 32, height: 32, radius: 6 },
    },
  } as any));
  return go;
}

function makeSwitcher(name: string, x: number, y: number, on: boolean): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 80, height: 32 } });
  go.addComponent(new Switcher({
    active: on ? 1 : 0, triggerEvent: 'onPress',
    views: [
      { color: '#475569', width: 80, height: 32, radius: 16 },
      { color: '#22c55e', width: 80, height: 32, radius: 16 },
    ],
  } as any));
  return go;
}

function makeRadioGroup(name: string, x: number, y: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 480, height: 40 } });
  go.addComponent(new RadioGroup({ selectedId: 'normal', direction: 'horizontal', elementsMargin: 8 }));

  const opts = [
    { id: 'easy', text: '简单', checked: false },
    { id: 'normal', text: '普通', checked: true },
    { id: 'hard', text: '困难', checked: false },
  ];
  opts.forEach((opt, i) => {
    const child = new GameObject(opt.id, { position: { x: i * 120, y: 0 }, size: { width: 32, height: 32 } });
    child.addComponent(new CheckBox({
      enabled: true, checked: opt.checked, text: opt.text,
      views: {
        checked: { color: '#22c55e', width: 32, height: 32, radius: 6 },
        unchecked: { color: '#475569', width: 32, height: 32, radius: 6 },
      },
    } as any));
    go.addChild(child);
  });
  return go;
}

function makeProgressBarH(name: string, x: number, y: number, w: number, h: number, value: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new ProgressBar({
    value, valueRange: [0, 100],
    bgView: { color: '#1f2937', width: w, height: h, radius: 12 },
    fillView: { color: '#22c55e', width: w, height: h, radius: 12 },
    fillPaddings: { top: 2, right: 2, bottom: 2, left: 2 },
  } as any));
  return go;
}

function makeCircularProgressBar(name: string, x: number, y: number, size: number, value: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: size, height: size } });
  go.addComponent(new CircularProgressBar({
    value, valueRange: [0, 100],
    radius: size / 2, lineWidth: 8, startAngle: -90,
    backgroundColor: '#1f2937', fillColor: '#38bdf8',
  } as any));
  return go;
}

function makeSlider(name: string, x: number, y: number, length: number, value: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: length, height: 24 } });
  go.addComponent(new Slider({
    enabled: true, value, min: 0, max: 100, step: 1,
    views: {
      bg: { color: '#1f2937', width: length, height: 8, radius: 4 },
      fill: { color: '#0ea5e9', width: length, height: 8, radius: 4 },
      thumb: { color: '#f8fafc', width: 20, height: 20, radius: 10 },
    },
  } as any));
  return go;
}

function makeDoubleSlider(name: string, x: number, y: number, length: number, v1: number, v2: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: length, height: 24 } });
  go.addComponent(new DoubleSlider({
    enabled: true, value1: v1, value2: v2, min: 0, max: 100,
    views: {
      bg: { color: '#1f2937', width: length, height: 8, radius: 4 },
      fill: { color: '#a78bfa', width: length, height: 8, radius: 4 },
      slider1: { color: '#f8fafc', width: 20, height: 20, radius: 10 },
      slider2: { color: '#f8fafc', width: 20, height: 20, radius: 10 },
    },
  } as any));
  return go;
}

function makeInput(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Input({
    value: '', placeholder: '请输入名称',
    maxLength: 20, align: 'left',
    padding: [8, 12, 8, 12],
    textStyle: { fontFamily: 'Arial', fontSize: 16, fill: '#f8fafc' },
    bgView: { color: '#1f2937', width: w, height: h, radius: 8 },
  } as any));
  return go;
}

function makeList(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new List({ type: 'vertical', elementsMargin: 8, padding: 8 }));

  const items = new GameObject('items', { position: { x: 0, y: 0 }, size: { width: w, height: h } });
  for (let i = 0; i < 4; i++) {
    const item = new GameObject(`li-${i}`, { position: { x: 0, y: 0 }, size: { width: w - 16, height: 36 } });
    const colors = ['#22c55e', '#0ea5e9', '#a78bfa', '#fbbf24'];
    item.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w - 16, height: 36, radius: 4, fill: colors[i] } as any }] }));
    items.addChild(item);
  }
  go.addChild(items);
  return go;
}

function makeScrollBox(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new ScrollBox({
    width: w, height: h, direction: 'vertical',
    background: '#1e293b', radius: 8,
    elementsMargin: 4, padding: 8,
  } as any));

  const content = new GameObject('content', { position: { x: 0, y: 0 }, size: { width: w, height: 600 } });
  for (let i = 0; i < 8; i++) {
    const row = new GameObject(`row-${i}`, { position: { x: 0, y: 0 }, size: { width: w - 16, height: 32 } });
    row.addComponent(new UI({ shapes: [{ type: UIShapeType.ROUNDED_RECT, style: { x: 0, y: 0, width: w - 16, height: 32, radius: 4, fill: '#374151' } as any }] }));
    content.addChild(row);
  }
  go.addChild(content);
  return go;
}

function makeSelect(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Select({
    items: [{ text: 'Easy' }, { text: 'Normal' }, { text: 'Hard' }],
    selectedIndex: 1, placeholder: 'Difficulty',
    closedView: { color: '#1f2937', width: w, height: h, radius: 6 },
    openView: { color: '#374151', width: w, height: h, radius: 6 },
    textStyle: { fontFamily: 'Arial', fontSize: 14, fill: '#f8fafc' },
  } as any));
  return go;
}

function makeMaskedFrame(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new MaskedFrame({
    targetView: { color: '#f59e0b', width: w, height: h },
    maskView: { color: '#ffffff', width: w, height: h, radius: w / 2 },
  } as any));
  return go;
}

function makeDialog(name: string, x: number, y: number, w: number, h: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  go.addComponent(new Dialog({
    open: false,
    title: '确认操作',
    width: w, height: h, padding: 16,
    backdropAlpha: 0.5, closeOnBackdropClick: true,
    backgroundView: { color: '#1f2937', width: w, height: h, radius: 12 },
  } as any));
  return go;
}
