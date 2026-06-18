import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-dialog-graphics-three-buttons';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'dialog-graphics-three-buttons');
}
