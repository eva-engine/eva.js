import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-slider-single-graphics';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'slider-single-graphics');
}
