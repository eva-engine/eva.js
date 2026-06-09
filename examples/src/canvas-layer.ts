import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { CanvasLayer, CanvasLayerSystem } from '@eva/plugin-canvas-layer';

export const name = 'canvas-layer — 渲染层声明';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new CanvasLayerSystem(),
    ],
  });

  // 三个互相重叠的方块,用 CanvasLayer 声明 z 顺序;高 z 在前
  const layers = [
    { name: 'world',   z: 0,   color: '#ff5050', x: 200, y: 400 },
    { name: 'overlay', z: 50,  color: '#50d050', x: 280, y: 460 },
    { name: 'ui-hud',  z: 100, color: '#5050ff', x: 360, y: 520 },
  ];
  for (const cfg of layers) {
    const go = new GameObject(`${cfg.name}-rect`, { position: { x: cfg.x, y: cfg.y } });
    const g = go.addComponent(new Graphics());
    (g.graphics as any).rect(0, 0, 200, 200).fill(cfg.color);
    go.addComponent(new CanvasLayer({ name: cfg.name, zIndex: cfg.z }));
    game.scene.addChild(go);
  }
}
