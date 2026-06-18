import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import {
  CircularProgressBar,
  DoubleSlider,
  ProgressBar,
  Slider,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeRoundedRect,
  makeStoryHint,
  makeStoryLabel,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-controls';

const CW = 750;
const CH = 1000;
const sliderAssets = ['slider_bg.png', 'slider_progress.png', 'radio_checked.png'];

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(sliderAssets);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CW, height: CH }),
      new GraphicsSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, CW, CH, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui ProgressBar + Slider stories'));
  game.scene.addChild(makeStoryHint('subtitle', 32, 58, 'Default Storybook args, rendered through @eva/plugin-ui wrappers.'));

  game.scene.addChild(makeStoryLabel('progress-title', 32, 104, 'Components/ProgressBar'));
  game.scene.addChild(makeStoryTag('progress-graphics-label', 32, 147, 'UseGraphics'));
  game.scene.addChild(makeProgressGraphicsStory('progress-graphics', 240, 145));
  startProgressRuntimeAnimation(game, 'progress-graphics', 'ProgressBar', -50, 150, false, 7);
  game.scene.addChild(makeStoryTag('progress-sprite-label', 32, 219, 'Sprite'));
  game.scene.addChild(makeProgressSpriteStory('progress-sprite', 240, 214, false));
  startProgressRuntimeAnimation(game, 'progress-sprite', 'ProgressBar', -50, 150, false, -4);
  game.scene.addChild(makeStoryTag('progress-nine-label', 32, 291, 'NineSliceSprite'));
  game.scene.addChild(makeProgressSpriteStory('progress-nine', 240, 286, true));
  startProgressRuntimeAnimation(game, 'progress-nine', 'ProgressBar', -50, 150, false, 2);
  game.scene.addChild(makeStoryTag('progress-circular-label', 32, 371, 'Circular'));
  game.scene.addChild(makeCircularProgressStory('progress-circular', 380, 410));

  game.scene.addChild(makeStoryLabel('slider-title', 32, 482, 'Components/Slider'));
  game.scene.addChild(makeStoryTag('slider-graphics-label', 32, 526, 'Slider Graphics'));
  game.scene.addChild(makeSliderGraphicsStory('slider-graphics', 240, 524, false));
  game.scene.addChild(makeStoryTag('slider-sprite-label', 32, 602, 'Slider Sprite'));
  game.scene.addChild(makeSliderSpriteStory('slider-sprite', 240, 600, false, false));
  game.scene.addChild(makeStoryTag('slider-nine-label', 32, 678, 'Slider NineSlice'));
  game.scene.addChild(makeSliderSpriteStory('slider-nine', 240, 676, false, true));
  game.scene.addChild(makeStoryTag('double-graphics-label', 32, 754, 'Double Graphics'));
  game.scene.addChild(makeSliderGraphicsStory('double-graphics', 240, 752, true));
  game.scene.addChild(makeStoryTag('double-sprite-label', 32, 830, 'Double Sprite'));
  game.scene.addChild(makeSliderSpriteStory('double-sprite', 240, 828, true, false));
  game.scene.addChild(makeStoryTag('double-nine-label', 32, 906, 'Double NineSlice'));
  game.scene.addChild(makeSliderSpriteStory('double-nine', 240, 904, true, true));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 180, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeProgressGraphicsStory(name: string, x: number, y: number): GameObject {
  const width = 450;
  const height = 35;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addChild(makeBarGraphicView(`${name}-bg`, width, height, 25, 3, pixiStoryColors.pannelBorderColor));
  root.addChild(makeBarGraphicView(`${name}-fill`, width, height, 25, 3, pixiStoryColors.color));
  const progress = root.addComponent(new (ProgressBar as any)({
    value: 50,
    valueRange: [0, 100],
    bgView: { entityName: `${name}-bg` },
    fillView: { entityName: `${name}-fill` },
  } as any));
  return root;
}

export function makeProgressSpriteStory(name: string, x: number, y: number, nineSlice: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: nineSlice ? 490 : 489, height: 39 } });
  root.addComponent(new (ProgressBar as any)({
    value: 50,
    valueRange: [0, 100],
    bgView: { texture: 'slider_bg.png' },
    fillView: { texture: 'slider_progress.png' },
    fillPaddings: nineSlice
      ? { top: 4, right: 0, bottom: 4, left: 0 }
      : { top: 4, left: 0 },
    ...(nineSlice
      ? {
          nineSliceSprite: { bg: [44, 20, 44, 19], fill: [34, 16, 34, 15] },
        }
      : {}),
  } as any));
  return root;
}

export function makeCircularProgressStory(name: string, x: number, y: number): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 120, height: 120 } });
  root.addComponent(new (CircularProgressBar as any)({
    backgroundColor: pixiStoryColors.pannelBorderColor,
    fillColor: pixiStoryColors.color,
    radius: 50,
    lineWidth: 15,
    value: 38,
    valueRange: [0, 100],
    backgroundAlpha: 0.5,
    fillAlpha: 0.8,
    cap: 'round',
    rotation: 19.3,
    offset: { x: 0.5, y: 1.75 },
  } as any));
  return root;
}

export function startProgressRuntimeAnimation(
  game: Game,
  gameObjectName: string,
  componentName: 'ProgressBar' | 'CircularProgressBar',
  min: number,
  max: number,
  rotate = false,
  phaseFrames = 0,
): void {
  const go = game.findByName(gameObjectName);
  if (!go) return;
  const uiSystem = game.systems.find((system: any) => system.name === 'UISystem') as any;
  if (!uiSystem?.instances) return;

  const startTime = performance.now();
  const frameMs = 1000 / 60;

  const tick = () => {
    const instance = uiSystem.instances.get(componentName)?.get(go.id);
    if (instance) {
      const frame = Math.max(0, Math.floor((performance.now() - startTime) / frameMs) + phaseFrames);
      const value = resolveProgressFrame(frame, min, max, componentName === 'CircularProgressBar');
      instance.progress = value;
      if (rotate) instance.rotation = frame * 0.1;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function resolveProgressFrame(frame: number, min: number, max: number, inclusiveEdges: boolean): number {
  let value = 50;
  let isFilling = true;
  for (let i = 0; i < frame; i++) {
    value += isFilling ? 1 : -1;
    if (inclusiveEdges ? value >= max : value > max) isFilling = false;
    else if (inclusiveEdges ? value <= min : value < min) isFilling = true;
  }
  return value;
}

export function makeSliderGraphicsStory(name: string, x: number, y: number, double: boolean): GameObject {
  const width = 450;
  const height = 35;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addChild(makeBarGraphicView(`${name}-bg`, width, height, 25, double ? 4 : 3, pixiStoryColors.hoverColor));
  root.addChild(makeBarGraphicView(`${name}-fill`, width, height, 25, double ? 4 : 3, pixiStoryColors.color));
  root.addChild(makeSliderHandle(`${name}-thumb-a`));
  if (double) root.addChild(makeSliderHandle(`${name}-thumb-b`));

  if (double) {
    root.addComponent(new (DoubleSlider as any)({
      value1: 15,
      value2: 85,
      min: 0,
      max: 100,
      showValue: true,
      valueTextStyle: { fill: pixiStoryColors.textColor, fontSize: 20 },
      views: {
        bg: { entityName: `${name}-bg` },
        fill: { entityName: `${name}-fill` },
        slider1: { entityName: `${name}-thumb-a` },
        slider2: { entityName: `${name}-thumb-b` },
      },
    } as any));
  } else {
    root.addComponent(new (Slider as any)({
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      showValue: true,
      valueTextStyle: { fill: pixiStoryColors.textColor, fontSize: 20 },
      views: {
        bg: { entityName: `${name}-bg` },
        fill: { entityName: `${name}-fill` },
        thumb: { entityName: `${name}-thumb-a` },
      },
    } as any));
  }

  return root;
}

export function makeSliderSpriteStory(name: string, x: number, y: number, double: boolean, nineSlice: boolean): GameObject {
  const width = nineSlice ? 500 : 489;
  const root = new GameObject(name, { position: { x, y }, size: { width, height: 55 } });
  const common = {
    min: 0,
    max: 100,
    showValue: true,
    valueTextStyle: { fill: '#FFFFFF', fontSize: 20 },
    valueTextOffset: { y: -40 },
    fillPaddings: nineSlice
      ? { top: 4, right: 0, bottom: 4, left: 0 }
      : { top: 4, left: 0 },
    ...(nineSlice
      ? {
          nineSliceSprite: { bg: [44, 20, 44, 19], fill: [34, 16, 34, 15] },
        }
      : {}),
  };

  if (double) {
    root.addComponent(new (DoubleSlider as any)({
      ...common,
      value1: 15,
      value2: 85,
      views: {
        bg: { texture: 'slider_bg.png' },
        fill: { texture: 'slider_progress.png' },
        slider1: { texture: 'radio_checked.png' },
        slider2: { texture: 'radio_checked.png' },
      },
    } as any));
  } else {
    root.addComponent(new (Slider as any)({
      ...common,
      value: 50,
      step: 1,
      views: {
        bg: { texture: 'slider_bg.png' },
        fill: { texture: 'slider_progress.png' },
        thumb: { texture: 'radio_checked.png' },
      },
    } as any));
  }
  return root;
}

function makeBarGraphicView(
  name: string,
  width: number,
  height: number,
  radius: number,
  border: number,
  innerFill: string,
): GameObject {
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  view.addComponent(new Shape({
    shapes: [
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: 0, y: 0, width, height, radius, fill: pixiStoryColors.textColor } as any,
      },
      {
        type: ShapeType.ROUNDED_RECT,
        style: {
          x: border,
          y: border,
          width: width - (border * 2),
          height: height - (border * 2),
          radius,
          fill: innerFill,
        } as any,
      },
    ],
  }));
  return view;
}

function makeSliderHandle(name: string): GameObject {
  const handle = new GameObject(name, { position: { x: 0, y: 0 }, size: { width: 46, height: 46 } });
  handle.addComponent(new Shape({
    shapes: [
      {
        type: ShapeType.CIRCLE,
        style: { x: 0, y: 0, radius: 23, fill: pixiStoryColors.textColor } as any,
      },
      {
        type: ShapeType.CIRCLE,
        style: { x: 0, y: 0, radius: 20, fill: pixiStoryColors.color } as any,
      },
    ],
  }));
  return handle;
}
