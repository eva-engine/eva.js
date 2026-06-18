import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import {
  Input,
  MaskedFrame,
  Select,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeImageView,
  makeRoundedRect,
  makeStoryHint,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StorySpriteSystem,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-forms';

const CW = 750;
const CH = 1000;
const formAssets = [
  'input.png',
  'select.png',
  'select_open.png',
  'arrow_down.png',
  'avatar-01.png',
  'avatar_mask.png',
];

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(formAssets);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: CW, height: CH }),
      new GraphicsSystem(),
      new StorySpriteSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, CW, CH, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui form + frame stories'));
  game.scene.addChild(makeStoryHint('subtitle', 32, 58, 'Input, Select, and MaskedFrame through @eva/plugin-ui wrappers.'));

  game.scene.addChild(makeStoryLabel('input-title', 32, 108, 'Components/Input'));
  game.scene.addChild(makeStoryTag('input-graphics-label', 60, 166, 'Use Graphics'));
  game.scene.addChild(makeInputGraphicsStory('input-graphics', 250, 145));
  game.scene.addChild(makeStoryTag('input-sprite-label', 60, 272, 'Use Sprite'));
  game.scene.addChild(makeInputSpriteStory('input-sprite', 250, 250, false));
  game.scene.addChild(makeStoryTag('input-nine-label', 60, 378, 'NineSliceSprite'));
  game.scene.addChild(makeInputSpriteStory('input-nine', 250, 356, true));

  game.scene.addChild(makeStoryLabel('select-title', 32, 482, 'Components/Select'));
  game.scene.addChild(makeStoryTag('select-graphics-label', 60, 530, 'Use Graphics'));
  game.scene.addChild(makeSelectStory('select-graphics', 250, 516, false));
  game.scene.addChild(makeStoryTag('select-sprite-label', 60, 606, 'Use Sprite'));
  game.scene.addChild(makeSelectStory('select-sprite', 250, 592, true));

  game.scene.addChild(makeStoryLabel('masked-title', 32, 650, 'Components/MaskedFrame'));
  game.scene.addChild(makeStoryTag('masked-graphics-label', 96, 692, 'Use Graphics'));
  game.scene.addChild(makeMaskedFrameStory('masked-graphics', 96, 704, false));
  game.scene.addChild(makeStoryTag('masked-sprite-label', 430, 692, 'Use Sprite'));
  game.scene.addChild(makeMaskedFrameStory('masked-sprite', 430, 704, true));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 180, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeInputGraphicsStory(name: string, x: number, y: number): GameObject {
  const width = 320;
  const height = 70;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  root.addChild(makeInputGraphicsView(`${name}-bg`, width, height));
  root.addComponent(new (Input as any)({
    value: '',
    placeholder: 'Enter text',
    secure: false,
    align: 'center',
    textStyle: { fill: pixiStoryColors.textColor, fontSize: 24, fontWeight: 'bold' },
    maxLength: 20,
    padding: [0, 7, 0, 7],
    cleanOnFocus: true,
    addMask: false,
    bgView: { entityName: `${name}-bg` },
  } as any));
  return root;
}

export function makeInputSpriteStory(name: string, x: number, y: number, nineSlice: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 320, height: nineSlice ? 80 : 70 } });
  root.addComponent(new (Input as any)({
    value: '',
    placeholder: 'Enter text',
    secure: false,
    align: 'center',
    textStyle: { fill: pixiStoryColors.textColor, fontSize: 24, fontWeight: 'bold' },
    maxLength: 20,
    padding: [0, 0, 0, 0],
    addMask: false,
    bgView: { texture: 'input.png' },
    ...(nineSlice
      ? {
          nineSliceSprite: [160, 27, 160, 27],
        }
      : {}),
  } as any));
  return root;
}

export function makeSelectStory(name: string, x: number, y: number, sprite: boolean): GameObject {
  const width = sprite ? 300 : 250;
  const height = 50;
  const root = new GameObject(name, { position: { x, y }, size: { width, height } });
  if (!sprite) {
    root.addChild(makeSelectGraphicsView(`${name}-closed`, width, height, false));
    root.addChild(makeSelectGraphicsView(`${name}-open`, width, height, true));
  }
  const items = Array.from({ length: sprite ? 100 : 100 }, (_, i) => ({ text: `Item ${i + 1}` }));
  root.addComponent(new (Select as any)({
    items,
    selectedIndex: -1,
    placeholder: '',
    closedView: sprite ? { texture: 'select.png' } : { entityName: `${name}-closed` },
    openView: sprite ? { texture: 'select_open.png' } : { entityName: `${name}-open` },
    textStyle: {
      ...pixiDefaultTextStyle,
      fill: pixiStoryColors.textColor,
      fontSize: sprite ? 40 : 28,
    },
  } as any));
  return root;
}

export function makeMaskedFrameStory(name: string, x: number, y: number, sprite: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 270, height: 270 } });
  if (!sprite) {
    root.addComponent(new (MaskedFrame as any)({
      targetView: { texture: 'avatar-01.png' },
      maskView: { shape: { type: 'circle', style: { radius: 125, fill: 0x000000 } } },
      borderWidth: 10,
      borderColor: '#FFFFFF',
    } as any));
  } else {
    root.addComponent(new (MaskedFrame as any)({
      targetView: { texture: 'avatar-01.png' },
      maskView: { texture: 'avatar_mask.png' },
      borderWidth: 10,
      borderColor: '#FFFFFF',
    } as any));
  }
  return root;
}

function makeInputGraphicsView(name: string, width: number, height: number): GameObject {
  const border = 5;
  const radius = 11;
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  view.addComponent(new Shape({
    shapes: [
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: 0, y: 0, width, height, radius: radius + border, fill: pixiStoryColors.pressedColor } as any,
      },
      {
        type: ShapeType.ROUNDED_RECT,
        style: {
          x: border,
          y: border,
          width: width - (border * 2),
          height: height - (border * 2),
          radius,
          fill: pixiStoryColors.color,
        } as any,
      },
    ],
  }));
  return view;
}

function makeSelectGraphicsView(name: string, width: number, height: number, open: boolean): GameObject {
  const root = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height: open ? height * 6 : height } });
  root.addComponent(new Shape({
    shapes: [{
      type: ShapeType.ROUNDED_RECT,
      style: { x: 0, y: 0, width, height: open ? height * 6 : height, radius: 15, fill: pixiStoryColors.color } as any,
    }],
  }));
  const { root: arrow } = makeImageView(`${name}-arrow`, 'arrow_down.png');
  arrow.transform.position.x = width * 0.9;
  arrow.transform.position.y = height / 2;
  if (open) arrow.transform.rotation = Math.PI;
  root.addChild(arrow);
  return root;
}
