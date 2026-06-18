import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-slider-double-graphics';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'slider-double-graphics');
}
