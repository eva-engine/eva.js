import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { PathFollow, PathFollowSystem } from '@eva/plugin-path-follow';

export const name = 'path-follow — 沿路径行进';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new PathFollowSystem(),
    ],
  });

  const waypoints = [
    { x: 100, y: 200 },
    { x: 600, y: 200 },
    { x: 600, y: 500 },
    { x: 100, y: 500 },
    { x: 350, y: 800 },
  ];

  // 把路径画出来
  const trackGo = new GameObject('track', { position: { x: 0, y: 0 } });
  const tg = trackGo.addComponent(new Graphics());
  (tg.graphics as any).moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) {
    (tg.graphics as any).lineTo(waypoints[i].x, waypoints[i].y);
  }
  (tg.graphics as any).stroke({ width: 2, color: '#ccc' });
  game.scene.addChild(trackGo);

  // 沿路径走的小三角(用 rotateToFace 让它转向)
  const arrow = new GameObject('arrow', { position: waypoints[0] });
  const ag = arrow.addComponent(new Graphics());
  (ag.graphics as any)
    .poly([15, 0, -10, 8, -10, -8])
    .fill('#ff5050');
  game.scene.addChild(arrow);

  arrow.addComponent(new PathFollow({
    waypoints,
    speed: 200,
    loop: 'pingpong',
    autostart: true,
    rotateToFace: true,
  }));
}
