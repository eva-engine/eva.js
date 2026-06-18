import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { Select,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  StorySprite,
  StorySpriteSystem,
  makeRoundedRect,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories-select';

const CW = 750;
const CH = 1000;

export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets(['select.png', 'select_open.png', 'arrow_down.png']);

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
  game.scene.addChild(makeStoryLabel('title', 32, 28, '@pixi/ui Select stories'));

  game.scene.addChild(makeStoryTag('graphics-label', 80, 105, 'Use Graphics'));
  game.scene.addChild(makeGraphicsSelect('graphics', 80, 140, false));

  game.scene.addChild(makeStoryTag('html-label', 420, 105, 'Use HTMLText'));
  game.scene.addChild(makeGraphicsSelect('html', 420, 140, true));

  game.scene.addChild(makeStoryTag('sprite-label', 250, 555, 'Use Sprite'));
  game.scene.addChild(makeSpriteSelect('sprite', 250, 590));
}

function makeStoryTag(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 240, height: 24 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 14, fill: '#cbd5e1', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeGraphicsSelect(name: string, x: number, y: number, htmlText: boolean, exact = false): GameObject {
  const width = 250;
  const height = 50;
  const radius = 15;
  const closedViewName = `${name}-closed-bg`;
  const openViewName = `${name}-open-bg`;
  const go = new GameObject(name, { position: { x, y }, size: { width, height: exact ? height : height * 6 } });
  go.addChild(makeSelectBgView(closedViewName, width, height, radius, false));
  go.addChild(makeSelectBgView(openViewName, width, height * 6, radius, true));
  go.addComponent(new (Select as any)({
    open: !exact,
    width,
    height,
    radius,
    visibleItems: 5,
    closedView: { entityName: closedViewName },
    openView: { entityName: openViewName },
    textClass: htmlText ? 'html' : 'text',
    textStyle: {
      ...pixiDefaultTextStyle,
      fill: pixiStoryColors.textColor,
    },
    items: makeItems(htmlText ? 5 : 100),
    itemWidth: width,
    itemHeight: height,
    itemBackgroundColor: pixiStoryColors.color,
    itemHoverColor: pixiStoryColors.hoverColor,
    scrollBox: {
      width,
      height: height * 5,
      radius,
      background: pixiStoryColors.color,
    },
  } as any));
  return go;
}

export function makeSpriteSelect(name: string, x: number, y: number, exact = false): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 300, height: exact ? 50 : 350 } });
  go.addComponent(new (Select as any)({
    open: !exact,
    width: 300,
    height: 50,
    visibleItems: 5,
    closedView: { texture: 'select.png' },
    openView: { texture: 'select_open.png' },
    textStyle: {
      ...pixiDefaultTextStyle,
      fill: pixiStoryColors.textColor,
    },
    items: makeItems(100),
    itemWidth: 297,
    itemHeight: 50,
    itemBackgroundColor: pixiStoryColors.color,
    itemHoverColor: pixiStoryColors.hoverColor,
    radius: 15,
    scrollBox: {
      width: 300,
      height: 300,
      background: pixiStoryColors.color,
    },
  } as any));
  return go;
}

function makeSelectBgView(name: string, width: number, height: number, radius: number, open: boolean): GameObject {
  const view = new GameObject(name, { position: { x: 0, y: 0 }, size: { width, height } });
  view.addComponent(new Shape({
    shapes: [{
      type: ShapeType.ROUNDED_RECT,
      style: { x: 0, y: 0, width, height, radius, fill: pixiStoryColors.color } as any,
    }],
  }));

  const arrow = new GameObject(`${name}-arrow`, {
    position: { x: width * 0.9, y: 25 },
    rotation: open ? Math.PI : 0,
    size: { width: 20, height: 20 },
  });
  arrow.addComponent(new StorySprite({ texture: 'arrow_down.png', anchor: { x: 0.5, y: 0.5 } }));
  view.addChild(arrow);
  return view;
}

function makeItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({ text: `Item ${index + 1}` }));
}
