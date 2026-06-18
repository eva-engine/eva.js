import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-fancy-button-use-nine-slice-sprite';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'fancy-button-use-nine-slice-sprite');
}
