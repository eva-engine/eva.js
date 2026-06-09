import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { StateMachine, StateMachineSystem } from '@eva/plugin-state-machine';

export const name = 'state-machine — 怪物状态机';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000 }),
      new GraphicsSystem(),
      new SignalBusSystem(),
      new StateMachineSystem(),
    ],
  });

  // 怪物身体 = 圆,颜色随状态变
  const body = new GameObject('body', { position: { x: 375, y: 500 } });
  const g = body.addComponent(new Graphics());
  function paint(color: string) {
    (g.graphics as any).clear().circle(0, 0, 80).fill(color);
  }
  paint('#5cb85c');
  game.scene.addChild(body);

  body.addComponent(new StateMachine({
    initial: 'moving',
    signalChange: 'monster:state',
    states: {
      moving: {
        onEnter: 'monster:state-moving',
        transitions: [{ on: 'monster:hit', to: 'knockback' }],
      },
      knockback: {
        onEnter: 'monster:state-knockback',
        transitions: [{ after: 600, to: 'resting' }],
      },
      resting: {
        onEnter: 'monster:state-resting',
        transitions: [{ after: 1500, to: 'moving' }],
      },
    },
  }));

  const bus = getSignalBus();
  bus.on('monster:state-moving', () => paint('#5cb85c'));
  bus.on('monster:state-knockback', () => paint('#f0ad4e'));
  bus.on('monster:state-resting', () => paint('#777'));

  // 点击画布 → emit monster:hit (颜色变橙 → 灰 → 绿)
  canvas.addEventListener('click', () => bus.emit('monster:hit'));
}
