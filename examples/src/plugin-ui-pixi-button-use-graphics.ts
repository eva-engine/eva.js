import { createButtonStoryGame } from './plugin-ui-pixi-stories/button-single';

export const name = 'plugin-ui-pixi-button-use-graphics';

export async function init(canvas: HTMLCanvasElement) {
  await createButtonStoryGame(canvas, 'graphics');
}
