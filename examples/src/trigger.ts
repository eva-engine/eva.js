import { Component, Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { StateMachine, StateMachineSystem } from '@eva/plugin-state-machine';
import { Trigger, TriggerSystem } from '@eva/plugin-trigger';

export const name = 'trigger — 5 actions × guard × signal-bus × state-machine';

const W = 750;
const H = 1000;

// 用 DOM 叠层显示 HUD / 帮助文字,避免依赖 plugin-renderer-text(与新版 pixi.js 不兼容)
function makeOverlay(canvas: HTMLCanvasElement) {
  const root = document.createElement('div');
  root.style.cssText = `
    position: fixed;
    pointer-events: none;
    color: #cccccc;
    font: 14px/1.4 ui-monospace, Menlo, Consolas, monospace;
    white-space: pre;
    z-index: 10;
    text-shadow: 0 1px 0 #000a;
  `;
  function reposition() {
    const rect = canvas.getBoundingClientRect();
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.top}px`;
    root.style.width = `${rect.width}px`;
    root.style.height = `${rect.height}px`;
  }
  reposition();
  window.addEventListener('resize', reposition);
  document.body.appendChild(root);
  return {
    span(text: string, x: number, y: number, color = '#cccccc', size = 14) {
      const s = document.createElement('div');
      s.textContent = text;
      s.style.cssText = `position:absolute;left:${(x / W) * 100}%;top:${(y / H) * 100}%;color:${color};font-size:${size}px;`;
      root.appendChild(s);
      return s;
    },
  };
}

export async function init(canvas: HTMLCanvasElement) {
  // ---------- 0) 装最小 mx.store(plugin-trigger 用 (key, updater) 签名)----------
  const state: Record<string, any> = { score: 0, hits: 0, cooldown: false, lastEvent: '-' };
  (window as any).mx = {
    store: {
      get: (k: string) => state[k],
      update: (key: string, updater: (oldVal: any) => any) => {
        const prev = state[key];
        const next = typeof updater === 'function' ? updater(prev) : updater;
        state[key] = next;
        getSignalBus().emit(`store:change:${key}`, { prev, next });
      },
    },
  };

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: W, height: H, backgroundColor: '#0e1116' }),
      new GraphicsSystem(),
      new SignalBusSystem({
        signals: [
          { name: 'input:click' },
          { name: 'input:reset' },
          { name: 'monster:hit' },
          { name: 'monster:state-moving' },
          { name: 'monster:state-knockback' },
          { name: 'monster:state-resting' },
          { name: 'store:change:score' },
          { name: 'store:change:cooldown' },
          { name: 'demo:cooldownExpire' },
        ],
      }),
      new StateMachineSystem(),
      new TriggerSystem(),
    ],
  });
  // @ts-ignore
  window.game = game;

  // ---------- 1) 自定义 Component:ScoreCounter — 用于演示 callMethod ----------
  class ScoreCounter extends Component {
    static componentName = 'ScoreCounter';
    reset() {
      (window as any).mx.store.update('score', () => 0);
      (window as any).mx.store.update('hits', () => 0);
      (window as any).mx.store.update('lastEvent', () => 'reset(via callMethod)');
      console.log('[trigger demo] ScoreCounter.reset() called via Trigger.callMethod');
    }
  }

  // ---------- 2) 怪物身体(由 state-machine 切色)----------
  const body = new GameObject('monsterBody', { position: { x: W / 2, y: 460 } });
  const bodyG = body.addComponent(new Graphics());
  function paintBody(color: string) {
    (bodyG.graphics as any).clear().circle(0, 0, 90).fill(color);
  }
  paintBody('#5cb85c');
  body.addComponent(
    new StateMachine({
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
    }),
  );
  game.scene.addChild(body);

  const scorer = new GameObject('scoreCounter');
  scorer.addComponent(new ScoreCounter());
  game.scene.addChild(scorer);

  // 画一道分界线 + 左右半边底色提示
  const guideGo = new GameObject('guide');
  const guide = guideGo.addComponent(new Graphics());
  (guide.graphics as any)
    .rect(0, 0, W / 2, H).fill({ color: 0x123048, alpha: 0.18 })
    .rect(W / 2, 0, W / 2, H).fill({ color: 0x402028, alpha: 0.18 })
    .rect(W / 2 - 1, 0, 2, H).fill('#444a55');
  game.scene.addChild(guideGo);

  // ---------- 3) Trigger:5 种 action + guard + ctx ----------
  const triggerHost = new GameObject('triggerHost');
  triggerHost.addComponent(
    new Trigger({
      context: { allowedScene: true },
      rules: [
        // ① emit + guard (payload + ctx) — 左半边可点 + 不在冷却
        {
          on: 'input:click',
          guard: 'payload && payload.x < 375 && ctx.allowedScene && !payload.cooldown',
          do: [
            { type: 'emit', signal: 'monster:hit' }, // emit
            { type: 'setStore', key: 'cooldown', value: true }, // setStore
            { type: 'log', message: 'left-click accepted, monster:hit emitted' }, // log
          ],
        },
        // ② 右半边 click — guard miss → log
        {
          on: 'input:click',
          guard: 'payload && payload.x >= 375',
          do: [
            { type: 'log', message: 'right-half click ignored by rule A guard' },
          ],
        },
        // ③ monster:hit → incStore('score', +10) + incStore('hits') + setStore lastEvent
        {
          on: 'monster:hit',
          do: [
            { type: 'incStore', key: 'score', delta: 10 }, // incStore (delta)
            { type: 'incStore', key: 'hits' }, // incStore (默认 +1)
            { type: 'setStore', key: 'lastEvent', value: 'monster:hit' },
          ],
        },
        // ④ knockback → log + setStore
        {
          on: 'monster:state-knockback',
          do: [
            { type: 'log', message: 'monster entered knockback' },
            { type: 'setStore', key: 'lastEvent', value: 'state→knockback' },
          ],
        },
        // ⑤ input:reset → callMethod(scoreCounter.ScoreCounter.reset)
        {
          on: 'input:reset',
          do: [
            {
              type: 'callMethod',
              entity: 'scoreCounter',
              component: 'ScoreCounter',
              method: 'reset',
              args: [],
            },
          ],
        },
      ],
    }),
  );
  game.scene.addChild(triggerHost);

  // 冷却 800ms 后自动释放(用普通 setTimeout + 第二条 Trigger 接力,演示 trigger 之间用 signal 串联)
  const bus = getSignalBus();
  bus.on('store:change:cooldown', (e: any) => {
    if (e?.next === true) {
      setTimeout(() => bus.emit('demo:cooldownExpire'), 800);
    }
  });
  const cooldownReleaser = new GameObject('cooldownReleaser');
  cooldownReleaser.addComponent(
    new Trigger({
      rules: [
        {
          on: 'demo:cooldownExpire',
          do: [
            { type: 'setStore', key: 'cooldown', value: false },
            { type: 'log', message: 'cooldown released' },
          ],
        },
      ],
    }),
  );
  game.scene.addChild(cooldownReleaser);

  // ---------- 4) 普通 bus 监听画身体颜色 ----------
  bus.on('monster:state-moving', () => paintBody('#5cb85c'));
  bus.on('monster:state-knockback', () => paintBody('#f0ad4e'));
  bus.on('monster:state-resting', () => paintBody('#777'));

  // ---------- 5) HUD (DOM overlay) ----------
  const overlay = makeOverlay(canvas);
  const hudEl = overlay.span('...', 30, 30, '#fafafa', 16);
  overlay.span('LEFT half  → guard pass\n  emit monster:hit\n  +10 score\n  cooldown=true\n  log', 30, 70, '#5cd6ff', 12);
  overlay.span('RIGHT half → guard miss\n  log only', W / 2 + 30, 70, '#ff8a8a', 12);
  overlay.span(
    '左半边 click → guard 通过 → emit monster:hit + incStore score+10 + setStore cooldown=true + log\n' +
      '右半边 click → guard miss  → log "right-half click ignored"\n' +
      '按 R 键   → input:reset → callMethod scoreCounter.ScoreCounter.reset()\n' +
      '冷却 800ms 内的左点会被 guard "!payload.cooldown" 屏蔽',
    30,
    H - 130,
    '#9aa3b2',
    12,
  );

  function refreshHud() {
    hudEl.textContent =
      `score=${state.score}  hits=${state.hits}  cooldown=${state.cooldown}  lastEvent=${state.lastEvent}`;
  }
  refreshHud();
  bus.on('store:change:score', refreshHud);
  bus.on('store:change:hits', refreshHud);
  bus.on('store:change:cooldown', refreshHud);
  bus.on('store:change:lastEvent', refreshHud);

  // ---------- 6) Input → emit signal ----------
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    bus.emit('input:click', { x, y, cooldown: state.cooldown });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') bus.emit('input:reset');
  });

  // @ts-ignore
  window.triggerDemo = { state, bus, body, scorer, triggerHost };
}
