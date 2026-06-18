import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-progress-bar-sprite';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'progress-bar-sprite');
}
