import {
  Game,
  GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { TextSystem } from '@eva/plugin-renderer-text';
import { RenderSystem } from '@eva/plugin-renderer-render';
import { UISystem,
} from '@eva/plugin-ui';
import {
  getStoryViewportSize,
  preloadPixiStoryAssets,
  registerPixiStoryAssets,
  StoryRoundRectSystem,
  StorySpriteSystem,
} from './helpers';
import {
  makeCircularProgressStory,
  makeProgressGraphicsStory,
  makeProgressSpriteStory,
  makeSliderGraphicsStory,
  makeSliderSpriteStory,
  startProgressRuntimeAnimation,
} from '../plugin-ui-pixi-stories-controls';
import {
  makeCheckBoxColumnStory,
  makeRadioGroupStory,
  makeSwitcherStory,
} from '../plugin-ui-pixi-stories-selection';
import {
  makeInputGraphicsStory,
  makeInputSpriteStory,
  makeMaskedFrameStory,
} from '../plugin-ui-pixi-stories-forms';
import {
  makeGraphicsSelect,
  makeSpriteSelect,
} from '../plugin-ui-pixi-stories-select';
import {
  makeDynamicScrollBox,
  makeGraphicsScrollBox,
  makeProximityScrollBox,
  makeSpriteScrollBox,
} from '../plugin-ui-pixi-stories-scrollbox';
import {
  makeListGraphicsStory,
  makeListSpriteStory,
} from '../plugin-ui-pixi-stories-layout';
import {
  makeDynamicFancyButton,
  makeGraphicsFancyButton,
  makeIconFancyButton,
  makeNineSliceFancyButton,
  makeSpriteFancyButton,
  makeTextLinkFancyButton,
} from '../plugin-ui-pixi-stories-fancy-button';
import {
  makeCheckboxSwapDialog,
  makeConfirmDialog,
  makeLetterDialog,
  makeNineSliceConfirmDialog,
  makeNineSliceDialog,
  makeSimpleAlertDialog,
  makeThreeButtonsDialog,
} from '../plugin-ui-pixi-stories-dialog';
import type {
  PixiUiNonButtonStoryKey,
  PixiUiStoryKey,
} from './manifest';

const PIXEL_PARITY_ANTIALIAS_STORIES = new Set<PixiUiStoryKey>([
  'dialog-graphics-simple-alert',
  'dialog-sprite-letter-grid-selector',
  'fancy-button-use-icon',
  'list-use-graphics',
  'list-use-sprite',
  'progress-bar-nine-slice-sprite',
  'progress-bar-sprite',
  'scroll-box-use-sprite',
  'select-use-html-text',
  'slider-double-nine-slice-sprite',
  'slider-double-sprite',
  'slider-single-nine-slice-sprite',
  'slider-single-sprite',
]);

const PIXEL_PARITY_RESOLUTION: Partial<Record<PixiUiNonButtonStoryKey, number>> = {
  'checkbox-use-graphics': 2,
  'checkbox-use-sprite': 2,
  'dialog-graphics-confirm-dialog': 2,
  'dialog-graphics-three-buttons': 2,
  'dialog-nine-slice-background': 2,
  'dialog-nine-slice-confirm': 2,
  'dialog-sprite-checkbox-swap-dialog': 2,
  'dialog-sprite-letter-grid-selector': 2,
  'fancy-button-use-graphics': 2,
  'fancy-button-using-sprite-and-html-text': 1.75,
  'input-use-graphics': 2,
  'input-use-nine-slice-sprite': 2,
  'input-use-sprite': 2,
  'list-use-graphics': 2,
  'radio-group-use-sprite': 2,
  'progress-bar-circular': 2,
  'scroll-box-proximity-event': 2,
  'scroll-box-use-graphics': 2,
  'scroll-box-use-dynamic-dimensions': 2,
  'select-use-sprite': 2,
  'select-use-html-text': 2,
  'slider-double-nine-slice-sprite': 1.5,
  'slider-double-sprite': 2,
  'slider-single-nine-slice-sprite': 1.5,
  'slider-single-sprite': 2,
};

export async function createPixiUiStoryGame(canvas: HTMLCanvasElement, story: PixiUiNonButtonStoryKey): Promise<Game> {
  registerPixiStoryAssets();
  await preloadPixiStoryAssets();

  const { width, height } = getStoryViewportSize(canvas);
  const resolution = PIXEL_PARITY_RESOLUTION[story] ?? 1;
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width,
        height,
        backgroundColor: '#1b1c1d',
        ...(resolution !== 1 ? { resolution, autoDensity: true } : {}),
        antialias: PIXEL_PARITY_ANTIALIAS_STORIES.has(story),
      } as any),
      new GraphicsSystem(),
      new StorySpriteSystem(),
      new StoryRoundRectSystem(),
      new TextSystem(),
      new RenderSystem(),
      new UISystem(),
    ],
  });

  const root = makeStoryRoot(story, width, height);
  game.scene.addChild(root);
  startStoryRuntimeAnimation(game, story);
  return game;
}

function startStoryRuntimeAnimation(game: Game, story: PixiUiNonButtonStoryKey): void {
  switch (story) {
    case 'progress-bar-use-graphics':
      startProgressRuntimeAnimation(game, story, 'ProgressBar', -50, 150, false, 7);
      break;
    case 'progress-bar-sprite':
      startProgressRuntimeAnimation(game, story, 'ProgressBar', -50, 150, false, -4);
      break;
    case 'progress-bar-nine-slice-sprite':
      startProgressRuntimeAnimation(game, story, 'ProgressBar', -50, 150, false, 2);
      break;
    default:
      break;
  }
}

function makeStoryRoot(story: PixiUiNonButtonStoryKey, cw: number, ch: number): GameObject {
  switch (story) {
    case 'checkbox-use-graphics':
      return makeCheckBoxColumnStory(story, centerX(cw, 195) + 3, centerY(ch, 170) - 1, false);
    case 'checkbox-use-sprite':
      return makeCheckBoxColumnStory(story, centerX(cw, 195) + 3, centerY(ch, 170) - 3, true);
    case 'dialog-graphics-simple-alert':
      return makeSimpleAlertDialog(story, cw / 2, (ch / 2) + 1, true);
    case 'dialog-graphics-confirm-dialog':
      return makeConfirmDialog(story, cw / 2, ch / 2, true);
    case 'dialog-graphics-three-buttons':
      return makeThreeButtonsDialog(story, cw / 2, ch / 2, true);
    case 'dialog-nine-slice-background':
      return makeNineSliceDialog(story, cw / 2, ch / 2, true);
    case 'dialog-nine-slice-confirm':
      return makeNineSliceConfirmDialog(story, cw / 2, ch / 2, true);
    case 'dialog-sprite-letter-grid-selector':
      return makeLetterDialog(story, cw / 2, ch / 2, true);
    case 'dialog-sprite-checkbox-swap-dialog':
      return makeCheckboxSwapDialog(story, cw / 2, ch / 2, true);
    case 'fancy-button-use-graphics':
      return makeGraphicsFancyButton(story, centerX(cw, 350) - 5, centerY(ch, 350) - 5, 350, 350);
    case 'fancy-button-use-icon':
      return makeIconFancyButton(story, centerX(cw, 250) - 4, centerY(ch, 250) - 4, 250, 250);
    case 'fancy-button-use-sprite':
      return makeSpriteFancyButton(story, centerX(cw, 324) + 1, centerY(ch, 84), '👉 Click me 👈');
    case 'fancy-button-using-sprite-and-html-text':
      return makeSpriteFancyButton(story, centerX(cw, 324) + 2, centerY(ch, 84) + 1, '👉 Click me 👈', 'html');
    case 'fancy-button-using-sprite-and-bitmap-text':
      return makeSpriteFancyButton(story, centerX(cw, 324), centerY(ch, 84), '👉 Click me 👈', 'bitmap');
    case 'fancy-button-dynamic-update':
      return makeDynamicFancyButton(story, centerX(cw, 324) + 1, centerY(ch, 84));
    case 'fancy-button-use-nine-slice-sprite':
      return makeNineSliceFancyButton(story, centerX(cw, 300), centerY(ch, 137));
    case 'fancy-button-text-link':
      return makeTextLinkFancyButton(story, cw / 2, ch / 2);
    case 'input-use-graphics':
      return makeInputGraphicsStory(story, centerX(cw, 320), centerY(ch, 70));
    case 'input-use-sprite':
      return makeInputSpriteStory(story, centerX(cw, 320) + 5, centerY(ch, 70) + 1, false);
    case 'input-use-nine-slice-sprite':
      return makeInputSpriteStory(story, centerX(cw, 320), centerY(ch, 80), true);
    case 'list-use-graphics':
      return makeListGraphicsStory(story, centerX(cw, 290), centerY(ch, 290) - 1);
    case 'list-use-sprite':
      return makeListSpriteStory(story, centerX(cw, 430), centerY(ch, 330) - 1);
    case 'masked-frame-use-graphics':
      return makeMaskedFrameStory(story, centerX(cw, 270), centerY(ch, 270), false);
    case 'masked-frame-use-sprite':
      return makeMaskedFrameStory(story, centerX(cw, 270), centerY(ch, 270), true);
    case 'progress-bar-circular':
      return makeCircularProgressStory(story, cw / 2, ch / 2);
    case 'progress-bar-use-graphics':
      return makeProgressGraphicsStory(story, centerX(cw, 450), centerY(ch, 35) + 35);
    case 'progress-bar-sprite':
      return makeProgressSpriteStory(story, centerX(cw, 489), ch / 2, false);
    case 'progress-bar-nine-slice-sprite':
      return makeProgressSpriteStory(story, centerX(cw, 490), ch / 2, true);
    case 'radio-group-use-graphics':
      return makeRadioGroupStory(story, centerX(cw, 140), centerY(ch, 170), false);
    case 'radio-group-use-sprite':
      return makeRadioGroupStory(story, centerX(cw, 145), centerY(ch, 186), true);
    case 'scroll-box-use-dynamic-dimensions':
      return makeDynamicScrollBox(story, centerX(cw, 320), centerY(ch, 440));
    case 'scroll-box-use-graphics':
      return makeGraphicsScrollBox(story, centerX(cw, 490), centerY(ch, 420), 490, 420);
    case 'scroll-box-proximity-event':
      return makeProximityScrollBox(story, centerX(cw, 320), centerY(ch, 420));
    case 'scroll-box-use-sprite':
      return makeSpriteScrollBox(story, centerX(cw, 400), centerY(ch, 400) - 1, 400, 400);
    case 'select-use-graphics':
      return makeGraphicsSelect(story, centerX(cw, 250), 10, false, true);
    case 'select-use-html-text':
      return makeGraphicsSelect(story, centerX(cw, 250) + 1, 10, true, true);
    case 'select-use-sprite':
      return makeSpriteSelect(story, centerX(cw, 300), 10, true);
    case 'slider-single-graphics':
      return makeSliderGraphicsStory(story, centerX(cw, 450), centerY(ch, 35) - 6, false);
    case 'slider-double-graphics':
      return makeSliderGraphicsStory(story, centerX(cw, 450), centerY(ch, 35) - 6, true);
    case 'slider-single-sprite':
      return makeSliderSpriteStory(story, centerX(cw, 489), centerY(ch, 55) - 11.785, false, false);
    case 'slider-double-sprite':
      return makeSliderSpriteStory(story, centerX(cw, 489), centerY(ch, 55) - 11.785, true, false);
    case 'slider-single-nine-slice-sprite':
      return makeSliderSpriteStory(story, centerX(cw, 500), centerY(ch, 55) - 11.785, false, true);
    case 'slider-double-nine-slice-sprite':
      return makeSliderSpriteStory(story, centerX(cw, 500), centerY(ch, 55) - 11.785, true, true);
    case 'switcher-sprites':
      return makeSwitcherStory(story, centerX(cw, 250), centerY(ch, 250));
    default:
      return assertNever(story);
  }
}

function assertNever(story: never): never {
  throw new Error(`Unsupported Pixi UI story: ${story}`);
}

function centerX(width: number, itemWidth: number): number {
  return (width - itemWidth) / 2;
}

function centerY(height: number, itemHeight: number): number {
  return (height - itemHeight) / 2;
}
