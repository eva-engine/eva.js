import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-list-use-graphics';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'list-use-graphics');
}
