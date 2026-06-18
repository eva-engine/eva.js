import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-select-use-sprite';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'select-use-sprite');
}
