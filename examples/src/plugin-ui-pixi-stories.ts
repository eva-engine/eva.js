import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Text,
  TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { Button,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  centerTextEveryFrame,
  centerTextOnce,
  makeButtonGraphicsShapes,
  makeImageView,
  makeRoundedRect,
  makeStoryHint,
  makeStoryLabel,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StorySpriteSystem,
  type PixiButtonStoryState,
} from './plugin-ui-pixi-stories/helpers';

export const name = 'plugin-ui-pixi-stories';

/**
 * @pixi/ui stories parity entry.
 *
 * This example is intentionally organized by the upstream Storybook story names.
 * Each section ports one upstream story through @eva/plugin-ui wrappers.
 */
export async function init(canvas: HTMLCanvasElement) {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets([
    'button.png',
    'button_hover.png',
    'button_pressed.png',
    'button_disabled.png',
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new StorySpriteSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(makeRoundedRect('bg', 0, 0, 750, 1000, 0, '#111827'));
  game.scene.addChild(makeStoryLabel('title', 32, 32, '@pixi/ui stories shown through @eva/plugin-ui'));
  game.scene.addChild(makeStoryHint('subtitle', 32, 66, 'Ported from tmp/pixi-ui/src/stories. Button family is the first exact-style slice.'));

  game.scene.addChild(makeStoryLabel('button-graphics-title', 32, 126, 'Components/Button/Use Graphics'));
  game.scene.addChild(makeButtonUseGraphicsStory('button-use-graphics', 375, 238, false));
  game.scene.addChild(makeButtonUseGraphicsStory('button-use-graphics-disabled', 375, 362, true));

  game.scene.addChild(makeStoryLabel('button-sprite-title', 32, 500, 'Components/Button/Use Sprite'));
  game.scene.addChild(makeButtonUseSpriteStory('button-use-sprite', 375, 620, false));
  game.scene.addChild(makeButtonUseSpriteStory('button-use-sprite-disabled', 375, 760, true));
}

function makeButtonUseGraphicsStory(name: string, x: number, y: number, disabled: boolean): GameObject {
  const args = {
    text: '👉 Click me 👈',
    width: 313,
    height: 75,
    radius: 14,
    disabled,
  };
  const root = new GameObject(name, { position: { x, y }, size: { width: args.width, height: args.height } });
  const view = new GameObject(`${name}-view`, { position: { x: 0, y: 0 }, size: { width: args.width, height: args.height } });
  const background = new GameObject(`${name}-background`, { position: { x: 0, y: 0 }, size: { width: args.width, height: args.height } });
  const backgroundUi = background.addComponent(new Shape({
    shapes: makeButtonGraphicsShapes(args.width, args.height, args.radius, disabled ? 'disabled' : 'default') as any,
  }));
  const label = makeCenteredButtonText(`${name}-label`, args.text, -4, -5);

  view.addChild(background);
  view.addChild(label);
  root.addChild(view);

  const button = root.addComponent(new (Button as any)({
    enabled: !disabled,
    view: { entityName: view.name },
  } as any));

  bindButtonGraphicsState(button, backgroundUi, label, args.width, args.height, args.radius, disabled);
  return root;
}

function makeButtonUseSpriteStory(name: string, x: number, y: number, disabled: boolean): GameObject {
  const root = new GameObject(name, { position: { x, y } });
  const view = new GameObject(`${name}-view`, { position: { x: 0, y: 0 } });
  const { root: bg, sprite } = makeImageView(`${name}-background`, disabled ? 'button_disabled.png' : 'button.png');
  const label = makeCenteredButtonText(`${name}-label`, '👉 Click me 👈', -4, -5);

  view.addChild(bg);
  view.addChild(label);
  root.addChild(view);

  const button = root.addComponent(new (Button as any)({
    enabled: !disabled,
    view: { entityName: view.name },
  } as any));

  bindButtonSpriteState(button, sprite, label, disabled);
  return root;
}

function makeCenteredButtonText(name: string, text: string, offsetX: number, offsetY: number): GameObject {
  const label = new GameObject(name, { position: { x: offsetX, y: offsetY }, size: { width: 1, height: 1 } });
  label.addComponent(new Text({
    text,
    style: {
      ...pixiDefaultTextStyle,
      fill: pixiStoryColors.textColor,
    } as any,
  }));
  centerTextOnce(label, offsetX, offsetY);
  return label;
}

function bindButtonGraphicsState(
  button: any,
  background: Shape,
  label: GameObject,
  width: number,
  height: number,
  radius: number,
  disabled: boolean,
): void {
  let lastKey = '';
  centerTextEveryFrame(label, () => {
    const pressed = !disabled && button.lastSignal === 'down';
    return { x: pressed ? -2 : -4, y: pressed ? -3 : -5 };
  });
  const tick = () => {
    const state = getGraphicsButtonState(button, disabled);
    const key = `${state}:${button.lastSignal}:${button.downCount}:${button.hoverCount}:${button.upCount}:${button.outCount}:${button.upOutCount}:${button.pressCount}`;
    if (key !== lastKey) {
      lastKey = key;
      const shapes = makeButtonGraphicsShapes(width, height, radius, state);
      background.updateShape(0, ShapeType.ROUNDED_RECT, shapes[0].style as any);
      background.updateShape(1, ShapeType.ROUNDED_RECT, shapes[1].style as any);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function bindButtonSpriteState(button: any, sprite: any, label: GameObject, disabled: boolean): void {
  let lastKey = '';
  centerTextEveryFrame(label, () => {
    const pressed = !disabled && button.lastSignal === 'down';
    return { x: pressed ? 0 : -4, y: pressed ? 0 : -5 };
  });
  const tick = () => {
    const state = getSpriteButtonState(button, disabled);
    const key = `${state}:${button.lastSignal}:${button.downCount}:${button.hoverCount}:${button.upCount}:${button.outCount}:${button.upOutCount}:${button.pressCount}`;
    if (key !== lastKey) {
      lastKey = key;
      sprite.texture = state === 'disabled'
        ? 'button_disabled.png'
        : state === 'hover'
          ? 'button_hover.png'
          : state === 'pressed'
            ? 'button_pressed.png'
            : 'button.png';
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function getGraphicsButtonState(button: any, disabled: boolean): PixiButtonStoryState {
  if (disabled) return 'disabled';
  if (button.lastSignal === 'down') return 'pressed';
  if (button.lastSignal === 'hover') return 'hover';
  return 'default';
}

function getSpriteButtonState(button: any, disabled: boolean): PixiButtonStoryState {
  if (disabled) return 'disabled';
  if (button.lastSignal === 'down') return 'pressed';
  if (button.lastSignal === 'hover' || button.lastSignal === 'up') return 'hover';
  return 'default';
}
