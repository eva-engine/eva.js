import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { FancyButton,
  MaskedFrame,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeRoundedRect,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-fancy-button';

const CW = 750;
const CH = 1000;

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets([
    'avatar-01.png',
    'avatar-02.png',
    'avatar_mask.png',
    'button.png',
    'button_hover.png',
    'button_pressed.png',
    'button_disabled.png',
    'button_green.png',
    'button_blue.png',
    'button_black.png',
    'button_white.png',
  ]);

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
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui FancyButton stories'));

  game.scene.addChild(makeSectionLabel('graphics-label', 50, 96, 'Use Graphics'));
  game.scene.addChild(makeGraphicsFancyButton('graphics', 86, 132, 220, 220));

  game.scene.addChild(makeSectionLabel('icon-label', 380, 96, 'Use Icon'));
  game.scene.addChild(makeIconFancyButton('icon', 456, 132, 180, 180));

  game.scene.addChild(makeSectionLabel('sprite-label', 70, 398, 'Use Sprite'));
  game.scene.addChild(makeSpriteFancyButton('sprite', 70, 438, '👉 Click me 👈'));

  game.scene.addChild(makeSectionLabel('html-label', 410, 398, 'Using Sprite And HTMLText'));
  game.scene.addChild(makeSpriteFancyButton('html', 410, 438, '👉 Click me 👈', 'html'));

  game.scene.addChild(makeSectionLabel('bitmap-label', 70, 545, 'Using Sprite And BitmapText'));
  game.scene.addChild(makeSpriteFancyButton('bitmap', 70, 585, '👉 Click me 👈', 'bitmap'));

  game.scene.addChild(makeSectionLabel('dynamic-label', 410, 545, 'Dynamic Update'));
  game.scene.addChild(makeDynamicFancyButton('dynamic', 410, 585));

  game.scene.addChild(makeSectionLabel('nine-label', 70, 700, 'Use NineSliceSprite'));
  game.scene.addChild(makeNineSliceFancyButton('nine', 70, 742));

  game.scene.addChild(makeSectionLabel('link-label', 455, 730, 'Text Link'));
  game.scene.addChild(makeTextLinkFancyButton('link', 455, 780));
}

function makeSectionLabel(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 260, height: 24 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeGraphicsFancyButton(name: string, x: number, y: number, width: number, height: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width, height } });
  const exact = width >= 300;
  const icon = makeMaskedAvatarIcon(`${name}-icon`, exact ? 1 : 0.42, 10, pixiStoryColors.textColor);
  go.addChild(makeFancyButtonGraphicsView(`${name}-default`, width, height, 50, 'default', 12, 12, width - 4, height - 4));
  go.addChild(makeFancyButtonGraphicsView(`${name}-hover`, width, height, 50, 'hover', 12, 12, width - 4, height - 4));
  go.addChild(makeFancyButtonGraphicsView(`${name}-pressed`, width, height, 50, 'pressed', 9, 8, width - 4, height - 4));
  go.addChild(makeFancyButtonGraphicsView(`${name}-disabled`, width, height, 50, 'disabled', 12, 12, width - 4, height - 4));
  go.addChild(icon);
  go.addComponent(new (FancyButton as any)({
    views: {
      default: { entityName: `${name}-default` },
      hover: { entityName: `${name}-hover` },
      pressed: { entityName: `${name}-pressed` },
      disabled: { entityName: `${name}-disabled` },
      icon: { entityName: icon.name },
    },
    text: '👉 Click me 👈',
    textStyle: { ...pixiDefaultTextStyle, fontSize: exact ? 40 : 34, fill: pixiStoryColors.textColor },
    padding: 11,
    textOffset: { x: 0, y: exact ? 140 : 82 },
    iconOffset: { x: 0, y: exact ? -30 : -28 },
    defaultTextScale: 0.99,
    defaultIconScale: exact ? 0.99 : 1,
    defaultTextAnchor: { x: 0.5, y: 0.5 },
    defaultIconAnchor: { x: 0.5, y: 0.5 },
    contentFittingMode: 'none',
    animations: storyAnimations(0, -1, 5),
  } as any));
  return go;
}

export function makeIconFancyButton(name: string, x: number, y: number, width: number, height: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width, height } });
  const exact = width >= 250;
  const icon = makeMaskedAvatarIcon(`${name}-icon`, exact ? 1 : 0.56, 5, pixiStoryColors.textColor);
  go.addChild(makeFancyButtonGraphicsView(`${name}-default`, width, height, 200, 'default', 6, 6, width, height));
  go.addChild(makeFancyButtonGraphicsView(`${name}-hover`, width, height, 200, 'hover', 6, 6, width, height));
  go.addChild(makeFancyButtonGraphicsView(`${name}-pressed`, width, height, 200, 'pressed', 3, 3, width, height));
  go.addChild(makeFancyButtonGraphicsView(`${name}-disabled`, width, height, 200, 'disabled', 6, 6, width, height));
  go.addChild(icon);
  go.addComponent(new (FancyButton as any)({
    views: {
      default: { entityName: `${name}-default` },
      hover: { entityName: `${name}-hover` },
      pressed: { entityName: `${name}-pressed` },
      disabled: { entityName: `${name}-disabled` },
      icon: { entityName: icon.name },
    },
    padding: 30,
    defaultIconScale: exact ? 0.99 : 1,
    defaultIconAnchor: { x: 0.5, y: 0.5 },
    animations: storyAnimations(0, -1, 5),
  } as any));
  return go;
}

function makeFancyButtonGraphicsView(
  name: string,
  width: number,
  height: number,
  radius: number,
  state: 'default' | 'hover' | 'pressed' | 'disabled',
  strokeX: number,
  strokeY: number,
  strokeWidth: number,
  strokeHeight: number,
): GameObject {
  const fill = state === 'hover'
    ? pixiStoryColors.hoverColor
    : state === 'pressed'
      ? pixiStoryColors.pressedColor
      : state === 'disabled'
        ? pixiStoryColors.disabledColor
        : pixiStoryColors.color;
  const go = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  go.addComponent(new Shape({
    shapes: [
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: 0, y: 0, width, height, radius, fill } as any,
      },
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: strokeX, y: strokeY, width: strokeWidth, height: strokeHeight, radius, stroke: fill, lineWidth: 3 } as any,
      },
    ],
  }));
  return go;
}

export function makeSpriteFancyButton(
  name: string,
  x: number,
  y: number,
  text: string,
  textClass: 'text' | 'html' | 'bitmap' = 'text',
): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 313, height: 75 } });
  go.addComponent(new (FancyButton as any)({
    views: spriteViews(),
    text,
    textClass,
    textStyle: { ...pixiDefaultTextStyle, fill: pixiStoryColors.textColor },
    padding: 11,
    textOffset: { x: 0, y: -7 },
    defaultTextScale: 0.99,
    defaultTextAnchor: { x: 0.5, y: 0.5 },
    animations: storyAnimations(0, 0, 10),
  } as any));
  return go;
}

export function makeDynamicFancyButton(name: string, x: number, y: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 313, height: 75 } });
  go.addComponent(new (FancyButton as any)({
    views: { ...spriteViews(), icon: { texture: 'avatar-01.png' } },
    text: 'Click me!',
    textStyle: { ...pixiDefaultTextStyle, fill: pixiStoryColors.textColor },
    padding: 11,
    textOffset: { x: 30, y: -7 },
    iconOffset: { x: -100, y: -7 },
    defaultTextScale: 0.99,
    defaultIconScale: 0.2,
    defaultTextAnchor: { x: 0.5, y: 0.5 },
    defaultIconAnchor: { x: 0.5, y: 0.5 },
  } as any));
  return go;
}

export function makeNineSliceFancyButton(name: string, x: number, y: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 300, height: 137 } });
  const icon = makeMaskedAvatarIcon(`${name}-icon`, 0.2, 10, pixiStoryColors.textColor, true);
  go.addChild(icon);
  go.addComponent(new (FancyButton as any)({
    views: { ...spriteViews(), icon: { entityName: icon.name } },
    nineSliceSprite: [25, 20, 25, 20],
    text: 'Click me',
    textStyle: { ...pixiDefaultTextStyle, fill: pixiStoryColors.textColor },
    padding: 11,
    textOffset: { x: 30, y: -5 },
    iconOffset: { x: -100, y: -7 },
    defaultTextScale: 0.99,
    defaultIconScale: 1,
    defaultTextAnchor: { x: 0.5, y: 0.5 },
    defaultIconAnchor: { x: 0.5, y: 0.5 },
    contentFittingMode: 'none',
    animations: storyAnimations(0, 0, 10),
  } as any));
  return go;
}

function makeMaskedAvatarIcon(
  name: string,
  scale: number,
  borderWidth: number,
  borderColor: string,
  spriteMask = false,
): GameObject {
  const icon = new GameObject(name, {
    position: { x: 0, y: 0 },
    size: { width: 250 * scale, height: 250 * scale },
  });
  const content = new GameObject(`${name}-content`, {
    position: { x: 0, y: 0 },
    scale: { x: scale, y: scale },
    size: { width: 250, height: 250 },
  });
  content.addComponent(new (MaskedFrame as any)({
    targetView: { texture: 'avatar-01.png' },
    maskView: spriteMask
      ? { texture: 'avatar_mask.png' }
      : { shape: { type: 'circle', style: { radius: 125, fill: 0x000000 } } },
    borderWidth,
    borderColor,
  } as any));
  icon.addChild(content);
  return icon;
}

export function makeTextLinkFancyButton(name: string, x: number, y: number): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 240, height: 60 } });
  go.addComponent(new (FancyButton as any)({
    text: '👉 Click me 👈',
    textStyle: { ...pixiDefaultTextStyle, fill: pixiStoryColors.textColor },
    animations: storyAnimations(0, 0, 10),
  } as any));
  return go;
}

function spriteViews() {
  return {
    default: { texture: 'button.png' },
    hover: { texture: 'button_hover.png' },
    pressed: { texture: 'button_pressed.png' },
    disabled: { texture: 'button_disabled.png' },
  };
}

function storyAnimations(defaultY: number, hoverY: number, pressedY: number) {
  return {
    default: { props: { scale: { x: 1, y: 1 }, y: defaultY }, duration: 100 },
    hover: { props: { scale: { x: 1.03, y: 1.03 }, y: hoverY }, duration: 100 },
    pressed: { props: { scale: { x: 0.9, y: 0.9 }, y: pressedY }, duration: 100 },
  };
}
