import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { Timer, TimerSystem } from '@eva/plugin-timer';

export const name = 'timer — 倒计时';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new TimerSystem(),
    ],
  });

  // 顶部进度条:30 秒倒计时
  const barBg = new GameObject('bar-bg', { position: { x: 75, y: 200 } });
  const bg = barBg.addComponent(new Graphics());
  (bg.graphics as any).rect(0, 0, 600, 60).fill('#ddd');
  game.scene.addChild(barBg);

  const barFg = new GameObject('bar-fg', { position: { x: 75, y: 200 } });
  const fg = barFg.addComponent(new Graphics());
  game.scene.addChild(barFg);

  function setProgress(remain: number) {
    const w = Math.max(0, Math.min(600, 600 * (remain / 30000)));
    (fg.graphics as any).clear().rect(0, 0, w, 60).fill('#ff5050');
  }
  setProgress(30000);

  // 倒计时:30 秒一次性
  const cd = new GameObject('cd');
  cd.addComponent(new Timer({
    wait: 30000, autostart: true, oneShot: true,
    signal: 'game:timeup',
    tickSignal: 'cd:tick', tickInterval: 100,
  }));
  game.scene.addChild(cd);

  // 循环:每 600ms 一次,在底部画一个新方块
  const lapHost = new GameObject('lap');
  lapHost.addComponent(new Timer({ wait: 600, autostart: true, oneShot: false, signal: 'lap' }));
  game.scene.addChild(lapHost);

  const dotsGo = new GameObject('dots', { position: { x: 75, y: 700 } });
  const dots = dotsGo.addComponent(new Graphics());
  game.scene.addChild(dotsGo);

  let laps = 0;
  const bus = getSignalBus();
  bus.on('cd:tick', (p: any) => setProgress(p.left));
  bus.on('game:timeup', () => setProgress(0));
  bus.on('lap', () => {
    const x = (laps % 30) * 20;
    const y = Math.floor(laps / 30) * 20;
    (dots.graphics as any).rect(x, y, 16, 16).fill('#5050ff');
    laps++;
  });
}
