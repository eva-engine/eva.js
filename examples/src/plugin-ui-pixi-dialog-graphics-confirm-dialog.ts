import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-dialog-graphics-confirm-dialog';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'dialog-graphics-confirm-dialog');
}
