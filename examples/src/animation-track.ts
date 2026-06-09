import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { AnimationTrack, AnimationTrackSystem } from '@eva/plugin-animation-track';

export const name = 'animation-track — 关键帧动画';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new AnimationTrackSystem(),
    ],
  });

  const ball = new GameObject('ball', { position: { x: 100, y: 500 } });
  const g = ball.addComponent(new Graphics());
  (g.graphics as any).circle(0, 0, 40).fill('#ff5050');
  game.scene.addChild(ball);

  ball.addComponent(new AnimationTrack({
    duration: 2,
    loop: true,
    autostart: true,
    tracks: [
      {
        target: 'transform.position.x',
        keyframes: [
          { time: 0, value: 100, easing: 'easeInOutCubic' },
          { time: 1, value: 650, easing: 'easeInOutCubic' },
          { time: 2, value: 100 },
        ],
      },
      {
        target: 'transform.position.y',
        keyframes: [
          { time: 0, value: 500 },
          { time: 0.5, value: 200, easing: 'easeOutBounce' },
          { time: 1, value: 500 },
          { time: 1.5, value: 700, easing: 'easeOutBounce' },
          { time: 2, value: 500 },
        ],
      },
    ],
  }));
}
