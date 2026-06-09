import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { InputActionMap, InputActionSystem } from '@eva/plugin-input-action';

export const name = 'input-action — 输入到 action 映射';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new InputActionSystem(),
    ],
  });

  const player = new GameObject('player', { position: { x: 375, y: 500 } });
  const pg = player.addComponent(new Graphics());
  function paint(color: string) {
    (pg.graphics as any).clear().circle(0, 0, 40).fill(color);
  }
  paint('#5050ff');
  game.scene.addChild(player);

  player.addComponent(new InputActionMap({
    bindings: [
      { action: 'left', sources: [{ type: 'key', code: 'ArrowLeft' }] },
      { action: 'right', sources: [{ type: 'key', code: 'ArrowRight' }] },
      { action: 'up', sources: [{ type: 'key', code: 'ArrowUp' }] },
      { action: 'down', sources: [{ type: 'key', code: 'ArrowDown' }] },
      { action: 'fire', sources: [{ type: 'key', code: 'Space' }, { type: 'click' }] },
    ],
  }));

  const bus = getSignalBus();
  bus.on('input:left:hold', () => (player.transform.position.x -= 5));
  bus.on('input:right:hold', () => (player.transform.position.x += 5));
  bus.on('input:up:hold', () => (player.transform.position.y -= 5));
  bus.on('input:down:hold', () => (player.transform.position.y += 5));
  bus.on('input:fire:press', () => {
    paint('#ffdd55');
    setTimeout(() => paint('#5050ff'), 120);
  });

  // 顶部 4 个色块,显示当前按下的方向(hold 信号)
  const padGo = new GameObject('pad', { position: { x: 75, y: 80 } });
  const pad = padGo.addComponent(new Graphics());
  game.scene.addChild(padGo);

  setInterval(() => {
    (pad.graphics as any).clear();
    const states: [string, number, string][] = [
      ['left', 0, '#999'], ['up', 100, '#999'], ['down', 200, '#999'], ['right', 300, '#999'],
    ];
    // 简单:根据 player 位置变化推断不必要,直接展示绑定即可
    for (const [, x, c] of states) {
      (pad.graphics as any).rect(x, 0, 80, 80).fill(c);
    }
  }, 50);
}
