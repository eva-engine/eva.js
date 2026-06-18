import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { Button,
  Shape,
  ShapeType,
  UISystem,
} from '@eva/plugin-ui';
import {
  makeButtonGraphicsShapes,
  getStoryViewportSize,
  makeImageView,
  pixiDefaultTextStyle,
  pixiStoryColors,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StorySpriteSystem,
  StoryText,
  StoryTextSystem,
  type PixiButtonStoryState,
} from './helpers';

export async function createButtonStoryGame(
  canvas: HTMLCanvasElement,
  story: 'graphics' | 'sprite',
): Promise<Game> {
  registerPixiStoryAssets();
  if (story === 'sprite') {
    await preloadPixiStoryAssets(['button.png', 'button_hover.png', 'button_pressed.png', 'button_disabled.png']);
  }

  const { width, height } = getStoryViewportSize(canvas);
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width,
        height,
        backgroundColor: '#1b1c1d',
        resolution: 2,
        autoDensity: true,
        antialias: true,
      } as any),
      new GraphicsSystem(),
      new StorySpriteSystem(),
      new StoryTextSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  game.scene.addChild(story === 'graphics'
    ? makeButtonUseGraphicsStory('button-use-graphics', (width / 2) - 5, (height / 2) - 5, false)
    : makeButtonUseSpriteStory('button-use-sprite', width / 2, height / 2, false));

  return game;
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
  const label = makeCenteredButtonText(`${name}-label`, args.text, 1, 1);

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
  label.addComponent(new StoryText({
    text,
    style: {
      ...pixiDefaultTextStyle,
      fill: pixiStoryColors.textColor,
    } as any,
    anchor: { x: 0.5, y: 0.5 },
  }));
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
  positionTextEveryFrame(label, () => {
    const pressed = !disabled && button.lastSignal === 'down';
    return { x: pressed ? 3 : 1, y: pressed ? 3 : 1 };
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
  positionTextEveryFrame(label, () => {
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

function positionTextEveryFrame(label: GameObject, getOffset: () => { x: number; y: number }): void {
  const tick = () => {
    const offset = getOffset();
    label.transform.position.x = offset.x;
    label.transform.position.y = offset.y;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
