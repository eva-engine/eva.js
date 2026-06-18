import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { FancyButton, ScrollBox, UISystem } from '@eva/plugin-ui';
import {
  makeRoundedRect,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StoryRoundRect,
  StoryRoundRectSystem,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-scrollbox';

const CW = 750;
const CH = 1000;

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(['button.png', 'button_hover.png', 'button_pressed.png']);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CW, height: CH }),
      new GraphicsSystem(),
      new StoryRoundRectSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, CW, CH, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui ScrollBox stories'));

  game.scene.addChild(makeStoryTag('graphics-label', 46, 88, 'Use Graphics'));
  game.scene.addChild(makeGraphicsScrollBox('graphics', 46, 122, 300, 340));

  game.scene.addChild(makeStoryTag('sprite-label', 410, 88, 'Use Sprite'));
  game.scene.addChild(makeSpriteScrollBox('sprite', 410, 122, 300, 340));

  game.scene.addChild(makeStoryTag('dynamic-label', 46, 525, 'Use Dynamic Dimensions'));
  game.scene.addChild(makeDynamicScrollBox('dynamic', 46, 558));

  game.scene.addChild(makeStoryTag('proximity-label', 410, 525, 'Proximity Event'));
  game.scene.addChild(makeProximityScrollBox('proximity', 410, 558));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 260, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeGraphicsScrollBox(name: string, x: number, y: number, width: number, height: number): GameObject {
  return makeScrollBox(name, x, y, width, height, {
    background: pixiStoryColors.pannelBorderColor,
    direction: 'both',
    radius: 20,
    elementsMargin: 10,
    padding: 10,
    itemCount: 100,
    itemFactory: (index) => makeGraphicButtonItem(`${name}-item-${index}`, `Item ${index}`, 150, 80),
  });
}

export function makeSpriteScrollBox(name: string, x: number, y: number, width: number, height: number): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addComponent(new StoryRoundRect({
    width,
    height,
    radius: 20,
    fill: pixiStoryColors.pannelColor,
    stroke: pixiStoryColors.pannelBorderColor,
    lineWidth: 1,
  }));
  const inner = makeScrollBox(`${name}-inner`, 20, 20, width - 40, height - 40, {
    radius: 5,
    elementsMargin: 6,
    padding: 0,
    itemCount: 100,
    itemFactory: (index) => makeSpriteButtonItem(`${name}-item-${index}`, String(index), width - 40, 50),
  });
  root.addChild(inner);
  return root;
}

export function makeDynamicScrollBox(name: string, x: number, y: number): GameObject {
  const sizes = [
    { width: 320, height: 440 },
    { width: 630, height: 440 },
    { width: 630, height: 360 },
    { width: 320, height: 200 },
  ];
  const buttons: any[] = [];
  const root = makeScrollBox(name, x, y, sizes[0].width, sizes[0].height, {
    background: pixiStoryColors.pannelBorderColor,
    radius: 20,
    elementsMargin: 10,
    padding: 10,
    itemCount: 100,
    itemFactory: (index) => makeGraphicButtonItem(`${name}-item-${index}`, `Item ${index}`, 300, 80),
    onItemButton: (button) => buttons.push(button),
  });
  let index = 0;
  let lastPressTotal = 0;
  const resizeScrollBox = () => {
    index = (index + 1) % sizes.length;
    root.transform.size.width = sizes[index].width;
    root.transform.size.height = sizes[index].height;
  };
  const watchPresses = () => {
    const pressTotal = buttons.reduce((total, button) => total + (button.pressCount ?? 0), 0);
    if (pressTotal !== lastPressTotal) {
      lastPressTotal = pressTotal;
      resizeScrollBox();
    }
    requestAnimationFrame(watchPresses);
  };
  requestAnimationFrame(watchPresses);
  return root;
}

export function makeProximityScrollBox(name: string, x: number, y: number): GameObject {
  return makeScrollBox(name, x, y, 320, 420, {
    background: pixiStoryColors.pannelBorderColor,
    radius: 20,
    elementsMargin: 10,
    padding: 10,
    proximityRange: 100,
    proximityDebounce: 10,
    itemCount: 100,
    itemFactory: (index) => makeGraphicButtonItem(`${name}-item-${index}`, `Item ${index}`, 300, 80),
  });
}

interface ScrollBoxStoryOptions {
  background?: string;
  direction?: 'horizontal' | 'vertical' | 'both';
  radius: number;
  elementsMargin: number;
  padding: number;
  proximityRange?: number;
  proximityDebounce?: number;
  itemCount: number;
  itemFactory: (index: number) => GameObject;
  onItemButton?: (button: any) => void;
}

function makeScrollBox(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: ScrollBoxStoryOptions,
): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  const content = new GameObject(`${name}-content`, { position: { x: 0, y: 0 }, size: { width: 1000, height: 8000 } });
  for (let i = 1; i <= options.itemCount; i += 1) {
    const item = options.itemFactory(i);
    const button = item.getComponent?.('FancyButton');
    if (button) options.onItemButton?.(button);
    content.addChild(item);
  }
  root.addChild(content);
  root.addComponent(new (ScrollBox as any)({
    direction: options.direction ?? 'vertical',
    background: options.background,
    radius: options.radius,
    elementsMargin: options.elementsMargin,
    padding: options.padding,
    disableEasing: false,
    globalScroll: true,
    shiftScroll: false,
    proximityRange: options.proximityRange,
    proximityDebounce: options.proximityDebounce,
    contentChildName: content.name,
  } as any));
  return root;
}

function makeGraphicButtonItem(name: string, text: string, width: number, height: number): GameObject {
  const item = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height: height - 0.25 } });
  item.addComponent(new (FancyButton as any)({
    views: {
      default: { color: pixiStoryColors.color, width, height, radius: 20 },
      hover: { color: pixiStoryColors.hoverColor, width, height, radius: 20 },
      pressed: { color: pixiStoryColors.pressedColor, width, height, radius: 20 },
    },
    text,
    textStyle: {
      ...pixiDefaultTextStyle,
      fill: pixiDefaultTextStyle.fill,
    },
    textOffset: { y: 0.5 },
    defaultTextAnchor: { x: 0.5, y: 0.5 },
  } as any));
  return item;
}

function makeSpriteButtonItem(name: string, text: string, width: number, height: number): GameObject {
  const item = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height: height - 0.25 } });
  item.addComponent(new (FancyButton as any)({
    views: {
      default: { texture: 'button.png' },
      hover: { texture: 'button_hover.png' },
      pressed: { texture: 'button_pressed.png' },
    },
    nineSliceSprite: [25, 20, 25, 20],
    width: width * 2,
    height: (height - 0.25) * 2,
    scale: 0.5,
    anchorX: 0,
    anchorY: 0,
    text,
    textStyle: { ...pixiDefaultTextStyle, fontSize: 68, fill: pixiDefaultTextStyle.fill },
    textOffset: { x: 0.5, y: -7 },
    defaultTextAnchor: { x: 0.5, y: 0.5 },
  } as any));
  return item;
}
