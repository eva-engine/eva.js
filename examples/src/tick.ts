import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { TickerSystem, getTickerSystem } from '@eva/plugin-tick';

export const name = 'tick — 帧调度器';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new TickerSystem(),
    ],
  });

  // 三个圆球分别注册到 physics / logic / late 三个分组,以不同速度移动
  const colors = ['#ff5050', '#50a0ff', '#50d050'];
  const groups: ('physics' | 'logic' | 'late')[] = ['physics', 'logic', 'late'];
  const speeds = [80, 160, 240];

  const ticker = getTickerSystem();

  for (let i = 0; i < 3; i++) {
    const go = new GameObject(`ball-${groups[i]}`, { position: { x: 50, y: 200 + i * 100 } });
    const g = go.addComponent(new Graphics());
    (g.graphics as any).circle(0, 0, 30).fill(colors[i]);
    game.scene.addChild(go);

    const speed = speeds[i];
    let dir = 1;
    ticker.add((dt: number) => {
      go.transform.position.x += (speed * dt) / 1000 * dir;
      if (go.transform.position.x > 700) dir = -1;
      if (go.transform.position.x < 50) dir = 1;
    }, groups[i]);
  }
}
