import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-checkbox-use-graphics';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'checkbox-use-graphics');
}
