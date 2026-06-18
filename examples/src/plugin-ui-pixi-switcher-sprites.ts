import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-switcher-sprites';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'switcher-sprites');
}
