import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-fancy-button-using-sprite-and-bitmap-text';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'fancy-button-using-sprite-and-bitmap-text');
}
