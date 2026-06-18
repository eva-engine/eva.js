import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { TextSystem,
  Text } from '@eva/plugin-renderer-text';
import { EventSystem,
  Event,
  HIT_AREA_TYPE } from '@eva/plugin-renderer-event';
import { RenderSystem } from '@eva/plugin-renderer-render';
import {
  Shape,
  ShapeType,
  UISystem,
  Button,
  FancyButton,
  ProgressBar,
  CircularProgressBar,
} from '@eva/plugin-ui';

export const name = 'plugin-ui-button-and-bar';

/**
 * plugin-ui v2 — Button graphics story + FancyButton + ProgressBar 协作 demo。
 *
 * 演示:
 * - UISystem 单一注册即可驱动所有 plugin-ui 组件(@pixi/ui factory wrapper)
 * - Button/Use Graphics 复刻 @pixi/ui Storybook 的 default/hover/pressed/disabled 视觉和 6 个信号
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
  bg.addComponent(new Shape({ shapes: [{ type: ShapeType.RECT, style: { x: 0, y: 0, width: 750, height: 1000, fill: '#0f172a' } as any }] }));
  game.scene.addChild(bg);

  // 标题 + 提示
  const title = new GameObject('title', { position: { x: 32, y: 60 }, size: { width: 686, height: 60 } });
  title.addComponent(new Text({ text: '@pixi/ui Button Graphics × ProgressBar', style: { fontSize: 30, fill: '#f8fafc' } as any }));
  game.scene.addChild(title);

  const hint = new GameObject('hint', { position: { x: 32, y: 124 }, size: { width: 686, height: 32 } });
  hint.addComponent(new Text({ text: 'Button 区块复刻 pixijs/ui Button/Use Graphics；下方 FancyButton 控制 HP/CD', style: { fontSize: 17, fill: '#94a3b8' } as any }));
  game.scene.addChild(hint);

  game.scene.addChild(makeSectionTitle('pixi Button / Use Graphics', 178));
  const activeStoryButton = makePixiGraphicsButton('storybook-button', 190, 250, false);
  const disabledStoryButton = makePixiGraphicsButton('storybook-button-disabled', 560, 250, true);
  game.scene.addChild(activeStoryButton.root);
  game.scene.addChild(disabledStoryButton.root);
  bindPixiGraphicsButtonVisuals(activeStoryButton);
  bindPixiGraphicsButtonVisuals(disabledStoryButton);

  game.scene.addChild(makePixiGraphicsButtonSnapshot('snapshot-default', 110, 378, 'default', 'default'));
  game.scene.addChild(makePixiGraphicsButtonSnapshot('snapshot-hover', 285, 378, 'hover', 'hover'));
  game.scene.addChild(makePixiGraphicsButtonSnapshot('snapshot-pressed', 460, 378, 'pressed', 'pressed'));
  game.scene.addChild(makePixiGraphicsButtonSnapshot('snapshot-disabled', 635, 378, 'disabled', 'disabled'));

  // HP 文字 + linear ProgressBar
  game.scene.addChild(makeSectionTitle('FancyButton × ProgressBar', 456));
  const hpLabel = new GameObject('hp-label', { position: { x: 32, y: 498 }, size: { width: 686, height: 32 } });
  hpLabel.addComponent(new Text({ text: 'HP 50 / 100', style: { fontSize: 24, fill: '#e5e7eb' } as any }));
  game.scene.addChild(hpLabel);

  const hpBar = new GameObject('hp', { position: { x: 32, y: 538 }, size: { width: 686, height: 32 } });
  const progressBar = hpBar.addComponent(new (ProgressBar as any)({
    value: 50,
    valueRange: [0, 100],
    bgView: { color: '#1f2937', width: 686, height: 32, radius: 16 },
    fillView: { color: '#22c55e', width: 686, height: 32, radius: 16 },
    fillPaddings: { top: 3, right: 3, bottom: 3, left: 3 },
  } as any));
  game.scene.addChild(hpBar);

  // CircularProgressBar(独立 wrapper)
  const cd = new GameObject('cd', { position: { x: 304, y: 618 }, size: { width: 140, height: 140 } });
  const cdBar = cd.addComponent(new (CircularProgressBar as any)({
    value: 100,
    valueRange: [0, 100],
    radius: 70,
    lineWidth: 14,
    startAngle: -90,
    backgroundColor: '#1f2937',
    fillColor: '#38bdf8',
  } as any));
  game.scene.addChild(cd);

  const cdText = new GameObject('cd-text', { position: { x: 374, y: 688 }, size: { width: 140, height: 40 }, anchor: { x: 0.5, y: 0.5 } });
  const cdTextLabel = cdText.addComponent(new Text({ text: '100%', style: { fontSize: 24, fill: '#ffffff', align: 'center' } as any }));
  game.scene.addChild(cdText);

  // 按钮回调:直接改 wrapper 字段,UISystem 监听并同步到 @pixi/ui
  game.scene.addChild(makeButton('btn-minus', 32, 836, 220, 80, '受伤 -10', '#ef4444', () => {
    const next = Math.max(0, (progressBar as any).value - 10);
    (progressBar as any).value = next;
    hpLabel.getComponent(Text).text = `HP ${next} / 100`;
  }));

  game.scene.addChild(makeButton('btn-plus', 280, 836, 220, 80, '回血 +10', '#22c55e', () => {
    const next = Math.min(100, (progressBar as any).value + 10);
    (progressBar as any).value = next;
    hpLabel.getComponent(Text).text = `HP ${next} / 100`;
  }));

  game.scene.addChild(makeButton('btn-cd', 528, 836, 190, 80, '技能 CD', '#8b5cf6', () => {
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

type PixiButtonState = 'default' | 'hover' | 'pressed' | 'disabled';

interface PixiGraphicsButtonDemo {
  root: GameObject;
  button: any;
  background: Shape;
  label: GameObject;
  statusText?: Text;
  disabled: boolean;
  width: number;
  height: number;
  radius: number;
}

const PIXI_BUTTON_COLORS = {
  color: '#2563eb',
  hoverColor: '#3b82f6',
  pressedColor: '#1d4ed8',
  disabledColor: '#64748b',
  textColor: '#f8fafc',
};

function makeSectionTitle(text: string, y: number): GameObject {
  const go = new GameObject(`section-${y}`, { position: { x: 32, y }, size: { width: 686, height: 28 } });
  go.addComponent(new Text({ text, style: { fontSize: 18, fill: '#e5e7eb', fontWeight: '700' } as any }));
  return go;
}

function makePixiGraphicsButton(name: string, centerX: number, centerY: number, disabled: boolean): PixiGraphicsButtonDemo {
  const width = 313;
  const height = 75;
  const radius = 14;
  const root = new GameObject(name, { position: { x: centerX, y: centerY }, size: { width, height } });

  const view = new GameObject(`${name}-view`, { position: { x: 0, y: 0 }, size: { width, height } });
  const background = new GameObject(`${name}-background`, { position: { x: 0, y: 0 }, size: { width, height } });
  const backgroundUi = background.addComponent(new Shape({ shapes: createPixiButtonShapes(width, height, radius, disabled ? 'disabled' : 'default') as any }));

  const label = new GameObject(`${name}-label`, {
    position: { x: -80, y: -16 },
    size: { width: 1, height: 1 },
  });
  label.addComponent(new Text({
    text: disabled ? 'Disabled' : '👉 Click me 👈',
    style: { fontSize: 24, fill: PIXI_BUTTON_COLORS.textColor, fontWeight: '700', align: 'center' } as any,
  }));

  view.addChild(background);
  view.addChild(label);
  root.addChild(view);

  const status = new GameObject(`${name}-status`, { position: { x: -width / 2, y: height / 2 + 16 }, size: { width: 330, height: 48 } });
  const statusText = status.addComponent(new Text({
    text: disabled
      ? 'enabled:false — disabledColor'
      : 'signals: press/down/up/hover/out/upOut = 0',
    style: { fontSize: 13, fill: disabled ? '#94a3b8' : '#cbd5e1', align: 'left' } as any,
  }));
  root.addChild(status);

  const button = root.addComponent(new (Button as any)({
    enabled: !disabled,
    view: { entityName: view.name },
  } as any));

  return { root, button, background: backgroundUi, label, statusText, disabled, width, height, radius };
}

function makePixiGraphicsButtonSnapshot(name: string, centerX: number, centerY: number, state: PixiButtonState, labelText: string): GameObject {
  const width = 150;
  const height = 44;
  const radius = 10;
  const root = new GameObject(name, { position: { x: centerX, y: centerY }, size: { width, height } });
  const background = new GameObject(`${name}-background`, { position: { x: 0, y: 0 }, size: { width, height } });
  background.addComponent(new Shape({ shapes: createPixiButtonShapes(width, height, radius, state) as any }));
  const label = new GameObject(`${name}-label`, {
    position: { x: -28, y: -10 },
    size: { width: 1, height: 1 },
  });
  label.addComponent(new Text({
    text: labelText,
    style: { fontSize: 15, fill: PIXI_BUTTON_COLORS.textColor, fontWeight: '700', align: 'center' } as any,
  }));
  root.addChild(background);
  root.addChild(label);
  settlePixiButtonLabel(label, state === 'pressed' ? 2 : 0);
  return root;
}

function bindPixiGraphicsButtonVisuals(demo: PixiGraphicsButtonDemo): void {
  let lastKey = '';
  const sync = () => {
    const signalState = demo.disabled ? 'disabled' : (demo.button.visualState as PixiButtonState) || 'default';
    const visualState: PixiButtonState = demo.disabled ? 'disabled' : (signalState === 'pressed' || signalState === 'hover' ? signalState : 'default');
    const key = [
      visualState,
      demo.button.pressCount,
      demo.button.downCount,
      demo.button.upCount,
      demo.button.hoverCount,
      demo.button.outCount,
      demo.button.upOutCount,
      demo.button.lastSignal,
    ].join('|');
    const labelOffset = visualState === 'pressed' ? 2 : 0;
    centerPixiButtonLabel(demo.label, labelOffset);

    if (key !== lastKey) {
      lastKey = key;
      demo.background.updateShape(0, ShapeType.ROUNDED_RECT, createPixiButtonShapes(demo.width, demo.height, demo.radius, visualState)[0].style as any);
      demo.background.updateShape(1, ShapeType.ROUNDED_RECT, createPixiButtonShapes(demo.width, demo.height, demo.radius, visualState)[1].style as any);
      if (demo.statusText && !demo.disabled) {
        demo.statusText.text = [
          `last=${demo.button.lastSignal}`,
          `press=${demo.button.pressCount}`,
          `down=${demo.button.downCount}`,
          `up=${demo.button.upCount}`,
          `hover=${demo.button.hoverCount}`,
          `out=${demo.button.outCount}`,
          `upOut=${demo.button.upOutCount}`,
        ].join('  ');
      }
    }
    requestAnimationFrame(sync);
  };
  requestAnimationFrame(sync);
}

function settlePixiButtonLabel(label: GameObject, offset: number): void {
  const tick = () => {
    if (!centerPixiButtonLabel(label, offset)) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

function centerPixiButtonLabel(label: GameObject, offset: number): boolean {
  const { width, height } = label.transform.size;
  if (width <= 1 || height <= 1) return false;
  label.transform.position.x = -width / 2 - 4 + offset;
  label.transform.position.y = -height / 2 - 5 + offset;
  return true;
}

function createPixiButtonShapes(width: number, height: number, radius: number, state: PixiButtonState) {
  const isDisabled = state === 'disabled';
  const isPressed = state === 'pressed';
  const fill = isDisabled
    ? PIXI_BUTTON_COLORS.disabledColor
    : state === 'hover'
      ? PIXI_BUTTON_COLORS.hoverColor
      : isPressed
        ? PIXI_BUTTON_COLORS.pressedColor
        : PIXI_BUTTON_COLORS.color;
  const offset = isPressed ? 2 : 0;
  const innerX = isPressed ? 9 : 12;
  const innerY = isPressed ? 8 : 12;

  return [
    {
      type: ShapeType.ROUNDED_RECT,
      style: {
        x: -width / 2 + offset,
        y: -height / 2 + offset,
        width,
        height,
        radius,
        fill,
      },
    },
    {
      type: ShapeType.ROUNDED_RECT,
      style: {
        x: -width / 2 + innerX + offset,
        y: -height / 2 + innerY + offset,
        width: width - 4,
        height: height - 4,
        radius,
        stroke: fill,
        lineWidth: 3,
      },
    },
  ];
}

/**
 * v2 FancyButton:viewRefs 直接传 inline color 视觉。
 * Event 组件继续负责 hit area + tap 回调。
 */
function makeButton(name: string, x: number, y: number, w: number, h: number, label: string, fill: string, onTap: () => void): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: w, height: h } });
  const evt = go.addComponent(new Event({ hitArea: { type: HIT_AREA_TYPE.Rect, style: { x: 0, y: 0, width: w, height: h } } as any }));

  go.addComponent(new (FancyButton as any)({
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
