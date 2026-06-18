import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-input-use-nine-slice-sprite';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'input-use-nine-slice-sprite');
}
