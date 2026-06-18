import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-dialog-nine-slice-confirm';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'dialog-nine-slice-confirm');
}
