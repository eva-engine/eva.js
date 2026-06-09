import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { Persistence, PersistenceSystem } from '@eva/plugin-persistence';

export const name = 'persistence — mx.store ↔ localStorage';

export async function init(canvas: HTMLCanvasElement) {
  // 装一个最小 mx.store(实际项目里由 Eva 业务层提供)
  const state: Record<string, any> = { highScore: 0, runs: 0 };
  (window as any).mx = {
    store: {
      get: (k: string) => state[k],
      update: (patch: Record<string, any>) => {
        for (const k in patch) {
          state[k] = patch[k];
          getSignalBus().emit(`store:change:${k}`, state[k]);
        }
      },
    },
  };

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new PersistenceSystem(),
    ],
  });

  const host = new GameObject('persist');
  host.addComponent(new Persistence({
    namespace: 'eva-demo',
    keys: ['highScore', 'runs'],
    autoload: true,
    autosave: true,
    saveDebounceMs: 100,
  }));
  game.scene.addChild(host);

  // 用方格数表示 runs
  const dotsGo = new GameObject('dots', { position: { x: 60, y: 200 } });
  const dots = dotsGo.addComponent(new Graphics());
  game.scene.addChild(dotsGo);

  function paint() {
    (dots.graphics as any).clear();
    for (let i = 0; i < state.runs; i++) {
      const x = (i % 20) * 32;
      const y = Math.floor(i / 20) * 32;
      (dots.graphics as any).rect(x, y, 28, 28).fill('#ff5050');
    }
  }
  paint();

  canvas.addEventListener('click', () => {
    (window as any).mx.store.update({
      highScore: state.highScore + 10,
      runs: state.runs + 1,
    });
    paint();
  });

  // 右键清空
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    (window as any).mx.store.update({ highScore: 0, runs: 0 });
    paint();
  });
}
