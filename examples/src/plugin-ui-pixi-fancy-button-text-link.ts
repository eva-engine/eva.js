import { createPixiUiStoryGame } from './plugin-ui-pixi-stories/story-single';

export const name = 'plugin-ui-pixi-fancy-button-text-link';

export function init(canvas: HTMLCanvasElement) {
  return createPixiUiStoryGame(canvas, 'fancy-button-text-link');
}
