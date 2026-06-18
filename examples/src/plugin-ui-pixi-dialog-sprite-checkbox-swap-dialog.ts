import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-dialog-sprite-checkbox-swap-dialog';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'dialog-sprite-checkbox-swap-dialog');
}
