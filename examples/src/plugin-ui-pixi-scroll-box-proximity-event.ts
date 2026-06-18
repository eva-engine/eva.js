import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-scroll-box-proximity-event';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'scroll-box-proximity-event');
}
