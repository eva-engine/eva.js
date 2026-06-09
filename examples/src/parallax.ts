import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Parallax, ParallaxSystem } from '@eva/plugin-parallax';

export const name = 'parallax — 视差背景';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new ParallaxSystem(),
    ],
  });

  // 模拟相机
  const camera = new GameObject('camera', { position: { x: 0, y: 500 } });
  game.scene.addChild(camera);

  // 三层背景,不同 speedX
  const layers = [
    { y: 200, color: '#cccccc', speed: 0.2 },
    { y: 400, color: '#999999', speed: 0.5 },
    { y: 600, color: '#666666', speed: 0.8 },
  ];

  for (const cfg of layers) {
    const bg = new GameObject(`bg-${cfg.speed}`, { position: { x: 0, y: cfg.y } });
    const g = bg.addComponent(new Graphics());
    for (let i = 0; i < 4; i++) {
      (g.graphics as any).rect(i * 400, 0, 380, 100).fill(cfg.color);
    }
    bg.addComponent(new Parallax({ speedX: cfg.speed, tileWidth: 1600, cameraEntity: 'camera' }));
    game.scene.addChild(bg);
  }

  // 自动平移相机
  let dir = 1;
  setInterval(() => {
    camera.transform.position.x += dir * 4;
    if (camera.transform.position.x > 800) dir = -1;
    if (camera.transform.position.x < -800) dir = 1;
  }, 32);
}
