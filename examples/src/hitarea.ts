import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { HitArea, HitAreaSystem } from '@eva/plugin-hitarea';

export const name = 'hitarea — 区域碰撞';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new HitAreaSystem(),
    ],
  });

  // 静止 monster
  const monster = new GameObject('monster', { position: { x: 375, y: 500 } });
  const mg = monster.addComponent(new Graphics());
  function paintMonster(color: string) {
    (mg.graphics as any).clear().circle(0, 0, 80).fill(color);
  }
  paintMonster('#5cb85c');
  monster.addComponent(new HitArea({
    shape: { type: 'circle', radius: 80 },
    layer: ['monster'],
    mask: ['rocket'],
    signalEnter: 'monster:hit',
    signalExit: 'monster:leave',
  }));
  game.scene.addChild(monster);

  // 跟鼠标的 rocket
  const rocket = new GameObject('rocket', { position: { x: 100, y: 100 } });
  const rg = rocket.addComponent(new Graphics());
  (rg.graphics as any).circle(0, 0, 30).fill('#ff5050');
  rocket.addComponent(new HitArea({
    shape: { type: 'circle', radius: 30 },
    layer: ['rocket'],
    mask: [],
  }));
  game.scene.addChild(rocket);

  const bus = getSignalBus();
  bus.on('monster:hit', () => paintMonster('#ff5050'));
  bus.on('monster:leave', () => paintMonster('#5cb85c'));

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    rocket.transform.position.x = ((e.clientX - r.left) / r.width) * 750;
    rocket.transform.position.y = ((e.clientY - r.top) / r.height) * 1000;
  });
}
