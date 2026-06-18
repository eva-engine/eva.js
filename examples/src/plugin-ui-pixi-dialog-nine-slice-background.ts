import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-dialog-nine-slice-background';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'dialog-nine-slice-background');
}
