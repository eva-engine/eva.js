import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import {
  CheckBox,
  RadioGroup,
  Switcher,
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
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-selection';

const CW = 750;
const CH = 1000;
const selectionAssets = [
  'radio.png',
  'radio_checked.png',
  'avatar-01.png',
  'avatar-02.png',
  'avatar-03.png',
  'avatar-04.png',
  'avatar-05.png',
];

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(selectionAssets);

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
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui selection stories'));
  game.scene.addChild(makeStoryHint('subtitle', 32, 58, 'Checkbox, RadioGroup, and Switcher through @eva/plugin-ui wrappers.'));

  game.scene.addChild(makeStoryLabel('checkbox-title', 32, 108, 'Components/Checkbox'));
  game.scene.addChild(makeStoryTag('checkbox-graphics-label', 64, 158, 'Use Graphics'));
  addCheckBoxColumn(game.scene, 'checkbox-graphics', 64, 198, false);
  game.scene.addChild(makeStoryTag('checkbox-sprite-label', 430, 158, 'Use Sprite'));
  addCheckBoxColumn(game.scene, 'checkbox-sprite', 430, 198, true);

  game.scene.addChild(makeStoryLabel('radio-title', 32, 430, 'Components/RadioGroup'));
  game.scene.addChild(makeStoryTag('radio-graphics-label', 64, 480, 'Use Graphics'));
  game.scene.addChild(makeRadioGroupStory('radio-graphics', 64, 520, false));
  game.scene.addChild(makeStoryTag('radio-sprite-label', 430, 480, 'Use Sprite'));
  game.scene.addChild(makeRadioGroupStory('radio-sprite', 430, 520, true));

  game.scene.addChild(makeStoryLabel('switcher-title', 32, 760, 'Components/Switcher/Sprites'));
  game.scene.addChild(makeStoryHint('switcher-hint', 32, 792, 'Default triggers: onPress, onHover, onOut. Tap or hover the avatar to cycle.'));
  game.scene.addChild(makeSwitcherStory('switcher-sprites', 430, 730));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 220, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

function addCheckBoxColumn(parent: GameObject, prefix: string, x: number, y: number, sprite: boolean): void {
  const rowGap = sprite ? 60.25 : 59;
  for (let i = 0; i < 3; i += 1) {
    parent.addChild(makeCheckBoxItem(`${prefix}-${i + 1}`, x, y + (i * rowGap), `Checkbox ${i + 1}`, i % 2 === 0, sprite));
  }
}

export function makeCheckBoxColumnStory(name: string, x: number, y: number, sprite: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 260, height: 210 } });
  addCheckBoxColumn(root, `${name}-checkbox`, 0, 0, sprite);
  return root;
}

export function makeRadioGroupStory(name: string, x: number, y: number, sprite: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 240, height: 210 } });
  const childNames: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const child = makeCheckBoxItem(`${name}-radio-${i + 1}`, 0, 0, `Radio ${i + 1}`, i === 0, sprite, true);
    childNames.push(child.name);
    root.addChild(child);
  }
  root.addComponent(new (RadioGroup as any)({
    selectedId: childNames[0],
    childNames,
    direction: 'vertical',
    elementsMargin: 10,
  } as any));
  return root;
}

export function makeSwitcherStory(name: string, x: number, y: number): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 250, height: 250 } });
  root.addComponent(new (Switcher as any)({
    active: 0,
    triggerEvent: ['onPress', 'onHover', 'onOut'],
    views: [
      { texture: 'avatar-01.png' },
      { texture: 'avatar-02.png' },
      { texture: 'avatar-03.png' },
      { texture: 'avatar-04.png' },
      { texture: 'avatar-05.png' },
    ],
  } as any));
  return root;
}

function makeCheckBoxItem(
  name: string,
  x: number,
  y: number,
  text: string,
  checked: boolean,
  sprite: boolean,
  radio = false,
): GameObject {
  const root = new GameObject(name, { position: { x, y }, size: { width: 260, height: 58 } });
  const checkedName = `${name}-checked`;
  const uncheckedName = `${name}-unchecked`;

  if (!sprite) {
    root.addChild(radio ? makeRadioGraphicsView(checkedName, true) : makeCheckBoxGraphicsView(checkedName, true));
    root.addChild(radio ? makeRadioGraphicsView(uncheckedName, false) : makeCheckBoxGraphicsView(uncheckedName, false));
  }

  root.addComponent(new (CheckBox as any)({
    checked,
    text,
    views: sprite
      ? {
          checked: { texture: 'radio_checked.png' },
          unchecked: { texture: 'radio.png' },
        }
      : {
          checked: { entityName: checkedName },
          unchecked: { entityName: uncheckedName },
        },
    textStyle: {
      ...pixiDefaultTextStyle,
      fontSize: 22,
      fill: pixiStoryColors.textColor,
    },
    ...(sprite ? { textOffset: { x: 0.5 } } : {}),
  } as any));

  return root;
}

function makeCheckBoxGraphicsView(name: string, checked: boolean): GameObject {
  const width = 50;
  const height = 50;
  const radius = 50;
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width: width + 4, height: height + 4 } });
  const shapes = [
    {
      type: ShapeType.ROUNDED_RECT,
      style: { x: -2, y: -2, width: width + 4, height: height + 4, radius, fill: pixiStoryColors.hoverColor } as any,
    },
    {
      type: ShapeType.ROUNDED_RECT,
      style: { x: 0, y: 0, width, height, radius, fill: pixiStoryColors.color } as any,
    },
  ];
  if (checked) {
    shapes.push(
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: 3, y: 3, width: width - 6, height: height - 6, radius, fill: pixiStoryColors.textColor } as any,
      },
      {
        type: ShapeType.ROUNDED_RECT,
        style: { x: 5, y: 5, width: width - 10, height: height - 10, radius, fill: pixiStoryColors.hoverColor } as any,
      },
    );
  }
  view.addComponent(new Shape({ shapes }));
  return view;
}

function makeRadioGraphicsView(name: string, checked: boolean): GameObject {
  const width = 50;
  const padding = 5;
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height: width } });
  const shapes = [
    {
      type: ShapeType.CIRCLE,
      style: { x: width / 2, y: width / 2, radius: width / 2, fill: pixiStoryColors.color } as any,
    },
  ];
  if (checked) {
    shapes.push({
      type: ShapeType.CIRCLE,
      style: { x: width / 2, y: width / 2, radius: (width / 2) - padding, fill: pixiStoryColors.textColor } as any,
    });
  }
  view.addComponent(new Shape({ shapes }));
  return view;
}
