import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { Easing, EasingName } from '@eva/plugin-easing';

export const name = 'easing — 缓动曲线一览';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
    ],
  });

  // 把 16 条 easing 曲线一行行画出来,500ms 内反复扫一次
  const names = Object.keys(Easing) as EasingName[];
  const W = 700;
  const H = 50;
  const startX = 25;
  const labelStep = 56;

  const dots: { name: EasingName; comp: Graphics; baseY: number }[] = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const baseY = 30 + i * labelStep;

    const trackGo = new GameObject(`track-${name}`, { position: { x: startX, y: baseY } });
    const track = trackGo.addComponent(new Graphics());
    (track.graphics as any)
      .rect(0, H - 4, W, 1)
      .fill('#cccccc');
    game.scene.addChild(trackGo);

    const dotGo = new GameObject(`dot-${name}`, { position: { x: startX, y: baseY } });
    const dot = dotGo.addComponent(new Graphics());
    (dot.graphics as any)
      .circle(0, H - 4, 6)
      .fill('#ff5050');
    game.scene.addChild(dotGo);

    dots.push({ name, comp: dot, baseY });
  }

  // 用 setInterval 让 demo 不依赖 plugin-tick 也能动起来
  let t0 = performance.now();
  setInterval(() => {
    const elapsed = (performance.now() - t0) % 2000;
    const u = elapsed / 2000;
    for (const d of dots) {
      const eased = Easing[d.name](u);
      const x = startX + W * eased;
      const y = d.baseY;
      const t = (d.comp as any).gameObject.transform;
      t.position.x = x;
      t.position.y = y;
    }
  }, 16);
}
