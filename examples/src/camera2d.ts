import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { Camera2D, Camera2DSystem } from '@eva/plugin-camera2d';

export const name = 'camera2d — 相机跟随 + shake';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new Camera2DSystem(),
    ],
  });

  const world = new GameObject('world');
  game.scene.addChild(world);

  // 在世界里铺一些方块当 reference
  for (let i = 0; i < 30; i++) {
    const tile = new GameObject(`tile-${i}`, { position: { x: i * 200, y: 500 } });
    const g = tile.addComponent(new Graphics());
    (g.graphics as any).rect(-90, -90, 180, 180).fill(i % 2 ? '#cce5ff' : '#fff5b8');
    world.addChild(tile);
  }

  const Player = new GameObject('Player', { position: { x: 100, y: 500 } });
  const pg = Player.addComponent(new Graphics());
  (pg.graphics as any).circle(0, 0, 30).fill('#ff5050');
  world.addChild(Player);

  const camHost = new GameObject('cam-host');
  camHost.addComponent(new Camera2D({
    followEntity: 'Player',
    worldRoot: 'world',
    viewportCenter: { x: 375, y: 500 },
    deadzone: { x: 80, y: 60 },
    damping: 0.2,
  }));
  game.scene.addChild(camHost);

  // 自动让 Player 走起来,这样能看到相机跟随
  let dir = 1;
  setInterval(() => {
    Player.transform.position.x += dir * 10;
    if (Player.transform.position.x > 5000) dir = -1;
    if (Player.transform.position.x < 100) dir = 1;
  }, 32);

  canvas.addEventListener('click', () => {
    getSignalBus().emit('camera:shake', { intensity: 30, duration: 400 });
  });
}
