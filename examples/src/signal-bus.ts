import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';

export const name = 'signal-bus — 命名事件总线';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem({
        signals: [
          { name: 'demo:hit', description: '左键 click → emit demo:hit' },
          { name: 'demo:reset', description: '右键 → emit demo:reset' },
        ],
      }),
    ],
  });

  let count = 0;
  const dotsGo = new GameObject('dots', { position: { x: 50, y: 50 } });
  const dots = dotsGo.addComponent(new Graphics());
  game.scene.addChild(dotsGo);

  function paint() {
    (dots.graphics as any).clear();
    for (let i = 0; i < count; i++) {
      const x = (i % 20) * 35;
      const y = Math.floor(i / 20) * 35;
      (dots.graphics as any).circle(x, y, 14).fill('#ff5050');
    }
  }
  paint();

  const bus = getSignalBus();
  bus.on('demo:hit', () => { count++; paint(); });
  bus.on('demo:reset', () => { count = 0; paint(); });

  canvas.addEventListener('click', () => bus.emit('demo:hit'));
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    bus.emit('demo:reset');
  });
}
