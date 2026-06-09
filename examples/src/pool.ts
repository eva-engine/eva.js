import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Pool, PoolSystem } from '@eva/plugin-pool';

export const name = 'pool — 子弹对象池';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new PoolSystem(),
    ],
  });

  // 创建一个名为 "bullet" 的池子,每个子弹是一个红色小球
  const poolGo = new GameObject('pool-host');
  const pool = poolGo.addComponent(new Pool({ name: 'bullet', initialSize: 32, maxSize: 64 }));
  game.scene.addChild(poolGo);

  pool.setFactory(() => {
    const b = new GameObject(`bullet-${Math.random().toString(36).slice(2, 6)}`, {
      position: { x: -100, y: -100 },
    });
    const g = b.addComponent(new Graphics());
    (g.graphics as any).circle(0, 0, 8).fill('#ff5050');
    game.scene.addChild(b);
    return b;
  });
  pool.setReset((go) => {
    go.transform.position.x = -100;
    go.transform.position.y = -100;
  });
  pool.setActivate((go) => {
    (go as any).__vy = -200 - Math.random() * 200;
    (go as any).__vx = (Math.random() - 0.5) * 200;
  });

  pool.warmup();

  setInterval(() => {
    const b = pool.acquire();
    if (!b) return;
    b.transform.position.x = 375 + (Math.random() - 0.5) * 40;
    b.transform.position.y = 900;
  }, 80);

  setInterval(() => {
    const dt = 16;
    const flying: GameObject[] = (pool as any).inUse ? Array.from((pool as any).inUse) : [];
    for (const b of flying) {
      b.transform.position.x += ((b as any).__vx * dt) / 1000;
      b.transform.position.y += ((b as any).__vy * dt) / 1000;
      if (b.transform.position.y < -50) pool.release(b);
    }
  }, 16);
}
