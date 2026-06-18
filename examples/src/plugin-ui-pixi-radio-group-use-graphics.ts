import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-radio-group-use-graphics';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'radio-group-use-graphics');
}
