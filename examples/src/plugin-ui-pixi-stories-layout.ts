import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { FancyButton,
  List,
  ScrollBox,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeRoundedRect,
  makeStoryHint,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StoryRoundRect,
  StoryRoundRectSystem,
  StorySpriteSystem,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-layout';

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
      new StorySpriteSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, CW, CH, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui List + ScrollBox stories'));
  game.scene.addChild(makeStoryHint('subtitle', 32, 58, 'Child containers are collected by @eva/plugin-ui List and ScrollBox wrappers.'));

  game.scene.addChild(makeStoryLabel('list-title', 32, 108, 'Components/List'));
  game.scene.addChild(makeStoryTag('list-graphics-label', 80, 158, 'Use Graphics'));
  game.scene.addChild(makeListGraphicsStory('list-graphics', 24, 190));
  game.scene.addChild(makeStoryTag('list-sprite-label', 450, 158, 'Use Sprite'));
  game.scene.addChild(makeListSpriteStory('list-sprite', 320, 190));

  game.scene.addChild(makeStoryLabel('scroll-title', 32, 532, 'Components/ScrollBox/Use Graphics'));
  game.scene.addChild(makeStoryHint('scroll-hint', 32, 562, 'Default story args: vertical list, 490x420 viewport, 100 button-like rows.'));
  game.scene.addChild(makeScrollBoxGraphicsStory('scroll-graphics', 130, 575));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 220, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeListGraphicsStory(name: string, x: number, y: number): GameObject {
  const width = 290;
  const height = 290;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addChild(makePanel(`${name}-panel`, width, height));
  const listRoot = new GameObject(`${name}-list`, { position: { x: 0, y: 0 }, size: { width, height } });
  const items = new GameObject(`${name}-items`, { position: { x: 0, y: 0 }, size: { width, height } });
  for (let i = 0; i < 9; i += 1) {
    items.addChild(makeGraphicListItem(`${name}-item-${i + 1}`, i + 1, 70, 70, 20));
  }
  listRoot.addChild(items);
  listRoot.addComponent(new (List as any)({
    type: 'bidirectional',
    elementsMargin: 10,
    topPadding: 20,
    leftPadding: 20,
    rightPadding: 20,
    maxWidth: width,
    itemsChildName: items.name,
  } as any));
  root.addChild(listRoot);
  return root;
}

export function makeListSpriteStory(name: string, x: number, y: number): GameObject {
  const width = 430;
  const height = 330;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addChild(makePanel(`${name}-panel`, width, height));
  const listRoot = new GameObject(`${name}-list`, { position: { x: 0, y: 0 }, size: { width, height } });
  const items = new GameObject(`${name}-items`, { position: { x: 0, y: 0 }, size: { width, height } });
  for (let i = 0; i < 16; i += 1) {
    items.addChild(makeSpriteListItem(`${name}-item-${i + 1}`, i + 1));
  }
  listRoot.addChild(items);
  listRoot.addComponent(new (List as any)({
    type: 'bidirectional',
    elementsMargin: 29,
    topPadding: 20,
    leftPadding: 20,
    rightPadding: 20,
    maxWidth: width,
    itemsChildName: items.name,
  } as any));
  root.addChild(listRoot);
  return root;
}

function makePanel(name: string, width: number, height: number): GameObject {
  const panel = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  panel.addComponent(new StoryRoundRect({
    width,
    height,
    radius: 20,
    fill: pixiStoryColors.pannelColor,
    stroke: pixiStoryColors.pannelBorderColor,
    lineWidth: 1,
  }));
  return panel;
}

export function makeScrollBoxGraphicsStory(name: string, x: number, y: number): GameObject {
  const width = 490;
  const height = 420;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  const content = new GameObject(`${name}-content`, { position: { x: 0, y: 0 }, size: { width: 1000, height: 8000 } });
  for (let i = 0; i < 100; i += 1) {
    content.addChild(makeScrollItem(`${name}-item-${i + 1}`, i + 1));
  }
  root.addChild(content);
  root.addComponent(new (ScrollBox as any)({
    width,
    height,
    direction: 'vertical',
    background: pixiStoryColors.pannelBorderColor,
    radius: 20,
    elementsMargin: 10,
    padding: 10,
    disableEasing: false,
    contentChildName: content.name,
  } as any));
  return root;
}

function makeGraphicListItem(name: string, index: number, width: number, height: number, radius: number): GameObject {
  const item = new GameObject(name, { position: { x: 0, y: 0 }, size: { width: width + 6, height: height + 6 } });
  item.addChild(makeGraphicListButtonView(`${name}-default`, width, height, radius, pixiStoryColors.color, 0, width - 3));
  item.addChild(makeGraphicListButtonView(`${name}-hover`, width, height, radius, pixiStoryColors.hoverColor, 0, width - 3));
  item.addChild(makeGraphicListButtonView(`${name}-pressed`, width, height, radius, pixiStoryColors.pressedColor, 4, width - 1));
  item.addComponent(new (FancyButton as any)({
    views: {
      default: { entityName: `${name}-default` },
      hover: { entityName: `${name}-hover` },
      pressed: { entityName: `${name}-pressed` },
    },
    text: String(index),
    textStyle: { ...pixiDefaultTextStyle, fill: pixiDefaultTextStyle.fill },
    anchorX: 0,
    anchorY: 0,
  } as any));
  return item;
}

function makeGraphicListButtonView(
  name: string,
  width: number,
  height: number,
  radius: number,
  color: string,
  offset: number,
  strokeSize: number,
): GameObject {
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width: width + 6, height: height + 6 } });
  view.addComponent(new Shape({
    shapes: [
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: offset, y: offset, width, height, radius, fill: color } as any,
      },
      {
        type: ShapeType.ROUNDED_RECT,
        style: {
          x: 8,
          y: 8,
          width: strokeSize,
          height: strokeSize,
          radius,
          stroke: color,
          lineWidth: 2,
        } as any,
      },
    ],
  } as any));
  return view;
}

function makeSpriteListItem(name: string, index: number): GameObject {
  const width = 75;
  const visualWidth = 149;
  const itemHeight = 49.5;
  const buttonHeight = 101;
  const item = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height: itemHeight } });
  item.addComponent(new (FancyButton as any)({
    views: {
      default: { texture: 'button.png' },
      hover: { texture: 'button_hover.png' },
      pressed: { texture: 'button_pressed.png' },
    },
    nineSliceSprite: [25, 20, 25, 20],
    width: visualWidth,
    height: buttonHeight,
    scale: 0.5,
    anchorX: 0,
    anchorY: 0,
    text: String(index),
    textStyle: { ...pixiDefaultTextStyle, fontSize: 68, fill: pixiDefaultTextStyle.fill },
    textOffset: { x: 0, y: -7 },
    defaultTextAnchor: { x: 0.5, y: 0.5 },
  } as any));
  return item;
}

function makeScrollItem(name: string, index: number): GameObject {
  const width = 150;
  const height = 80;
  const item = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  item.addComponent(new StoryRoundRect({ width, height, radius: 20, fill: pixiStoryColors.color }));
  item.addChild(makeCenteredText(`${name}-label`, `Item ${index}`, width / 2, height / 2, 24));
  return item;
}

function makeCenteredText(name: string, text: string, x: number, y: number, fontSize: number): GameObject {
  const label = new GameObject(name, { position: { x, y }, size: { width: 1, height: 1 } });
  label.addComponent(new Text({
    text,
    style: {
      ...pixiDefaultTextStyle,
      fontSize,
      fill: pixiDefaultTextStyle.fill,
    } as any,
  }));
  const tick = () => {
    const { width, height } = label.transform.size;
    if (width > 1 || height > 1) {
      label.transform.position.x = x - (width / 2);
      label.transform.position.y = y - (height / 2);
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return label;
}
