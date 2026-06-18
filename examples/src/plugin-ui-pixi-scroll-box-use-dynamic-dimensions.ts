import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-scroll-box-use-dynamic-dimensions';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'scroll-box-use-dynamic-dimensions');
}
