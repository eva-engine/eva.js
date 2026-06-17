import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { GraphicsSystem, Graphics } from '@eva/plugin-renderer-graphics';
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';
import { Tween, TweenSystem, Easing } from '@eva/plugin-tween';
import type { EasingName } from '@eva/plugin-tween';

export const name = 'tween — 16 easing × parallel/sequence/yoyo/loop × play/pause/resume/stop';

const W = 750;
const H = 1000;
const TRACK_X = 30;
const TRACK_W = 480;
const ROW_H = 32;
const ROW_TOP = 30;

const EASINGS: EasingName[] = Object.keys(Easing) as EasingName[];

// 用一个 DOM 叠层显示文字标签 / 状态行,避免依赖 plugin-renderer-text
// (其与新版 pixi.js 暂存在类型导出不兼容,会整体阻塞模块加载)
function makeOverlay(canvas: HTMLCanvasElement) {
  const root = document.createElement('div');
  root.style.cssText = `
    position: fixed;
    pointer-events: none;
    color: #cccccc;
    font: 12px/1.2 ui-monospace, Menlo, Consolas, monospace;
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

  function place(el: HTMLElement, x: number, y: number) {
    el.style.cssText += `position:absolute;left:${(x / W) * 100}%;top:${(y / H) * 100}%;`;
  }
  function span(text: string, x: number, y: number, color = '#9aa3b2', size = 12) {
    const s = document.createElement('div');
    s.textContent = text;
    s.style.color = color;
    s.style.fontSize = `${size}px`;
    place(s, x, y);
    root.appendChild(s);
    return s;
  }
  return { root, span };
}

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: W, height: H, backgroundColor: '#101418' }),
      new GraphicsSystem(),
      new SignalBusSystem({
        signals: [
          { name: 'tween:finish' },
          { name: 'tween:demo:sequenceFinish' },
          { name: 'tween:demo:parallelFinish' },
        ],
      }),
      new TweenSystem(),
    ],
  });
  // @ts-ignore
  window.game = game;

  const overlay = makeOverlay(canvas);
  overlay.span(
    'Tween demo — 上方 16 行 easing yoyo loop;下方 sequence / parallel / controlled。按 1=play 2=pause 3=resume 4=stop',
    TRACK_X,
    8,
    '#fafafa',
  );

  // ---------- 1) 16 条 easing 同时跑(yoyo + loop=-1)----------
  for (let i = 0; i < EASINGS.length; i++) {
    const easing = EASINGS[i];
    const baseY = ROW_TOP + i * ROW_H;

    const trackGo = new GameObject(`track-${easing}`, { position: { x: TRACK_X, y: baseY } });
    const track = trackGo.addComponent(new Graphics());
    (track.graphics as any).rect(0, ROW_H * 0.5, TRACK_W, 1).fill('#3a4250');
    game.scene.addChild(trackGo);

    overlay.span(easing, TRACK_X + TRACK_W + 12, baseY + ROW_H * 0.5 - 6);

    const dotGo = new GameObject(`dot-${easing}`, { position: { x: TRACK_X, y: baseY + ROW_H * 0.5 } });
    const dot = dotGo.addComponent(new Graphics());
    (dot.graphics as any).circle(0, 0, 5).fill('#5cd6ff');
    game.scene.addChild(dotGo);

    dotGo.addComponent(
      new Tween({
        step: {
          target: 'transform.position.x',
          from: TRACK_X,
          to: TRACK_X + TRACK_W,
          duration: 1500,
          easing,
        },
        yoyo: true,
        loop: -1,
        autostart: true,
      }),
    );
  }

  // ---------- 2) sequence:三段位置(走 L 形)+ 自定义 signal ----------
  const seqY = ROW_TOP + EASINGS.length * ROW_H + 24;
  const seqGo = new GameObject('sequence-block', { position: { x: TRACK_X, y: seqY } });
  const seqG = seqGo.addComponent(new Graphics());
  (seqG.graphics as any).rect(-12, -12, 24, 24).fill('#ff8a4c');
  game.scene.addChild(seqGo);

  overlay.span('sequence (linear → easeInOutCubic → easeOutBounce) + signal', TRACK_X, seqY - 18);

  seqGo.addComponent(
    new Tween({
      steps: [
        { target: 'transform.position.x', to: TRACK_X + TRACK_W, duration: 800, easing: 'linear' },
        { target: 'transform.position.y', to: seqY + 60, duration: 600, easing: 'easeInOutCubic' },
        { target: 'transform.position.x', to: TRACK_X, duration: 1000, easing: 'easeOutBounce' },
      ],
      loop: -1,
      signal: 'tween:demo:sequenceFinish',
    }),
  );
  // 自定义 signal:每跑完一轮把方块换色
  let seqColorToggle = false;
  getSignalBus().on('tween:demo:sequenceFinish', () => {
    seqColorToggle = !seqColorToggle;
    (seqG.graphics as any).clear().rect(-12, -12, 24, 24).fill(seqColorToggle ? '#62d96b' : '#ff8a4c');
  });
  let finishLogged = 0;
  getSignalBus().on('tween:finish', () => {
    if (finishLogged < 3) {
      // eslint-disable-next-line no-console
      console.log('[tween demo] tween:finish observed', ++finishLogged);
    }
  });

  // ---------- 3) parallel:同时改 position.x + scale.x + scale.y ----------
  const parY = seqY + 110;
  const parGo = new GameObject('parallel-block', { position: { x: TRACK_X, y: parY } });
  const parG = parGo.addComponent(new Graphics());
  (parG.graphics as any).rect(-16, -16, 32, 32).fill('#9d6cff');
  game.scene.addChild(parGo);

  overlay.span('parallel (position.x + scale.x + scale.y 同时变, yoyo loop)', TRACK_X, parY - 18);

  parGo.addComponent(
    new Tween({
      steps: [
        { target: 'transform.position.x', to: TRACK_X + TRACK_W, duration: 1500, easing: 'easeInOutQuad' },
        { target: 'transform.scale.x', from: 1, to: 2.5, duration: 1500, easing: 'easeInOutBack' },
        { target: 'transform.scale.y', from: 1, to: 2.5, duration: 1500, easing: 'easeInOutElastic' },
      ],
      parallel: true,
      yoyo: true,
      loop: -1,
      autostart: true,
    }),
  );

  // ---------- 4) 受控 Tween:演示 play/pause/resume/stop ----------
  const ctrlY = parY + 80;
  const ctrlGo = new GameObject('controlled-block', { position: { x: TRACK_X, y: ctrlY } });
  const ctrlG = ctrlGo.addComponent(new Graphics());
  (ctrlG.graphics as any).rect(-14, -14, 28, 28).fill('#ffd166');
  game.scene.addChild(ctrlGo);

  const statusEl = overlay.span(
    'controlled (1=play  2=pause  3=resume  4=stop  delay=300ms first)',
    TRACK_X,
    ctrlY - 18,
  );

  const controlled = ctrlGo.addComponent(
    new Tween({
      steps: [
        { target: 'transform.position.x', to: TRACK_X + TRACK_W, duration: 1200, easing: 'easeInOutCubic', delay: 300 },
        { target: 'transform.position.x', to: TRACK_X, duration: 1200, easing: 'easeInOutCubic' },
      ],
      loop: -1,
      autostart: false,
      signal: 'tween:demo:parallelFinish',
    }),
  );

  // ---------- 5) 键盘 / 点击控制 ----------
  const keyMap: Record<string, () => void> = {
    '1': () => { controlled.play(); statusEl.textContent = 'controlled.play()'; },
    '2': () => { controlled.pause(); statusEl.textContent = 'controlled.pause()'; },
    '3': () => { controlled.resume(); statusEl.textContent = 'controlled.resume()'; },
    '4': () => { controlled.stop(); statusEl.textContent = 'controlled.stop()'; },
  };
  window.addEventListener('keydown', (e) => {
    const fn = keyMap[e.key];
    if (fn) fn();
  });
  canvas.addEventListener('click', () => keyMap['1']());

  // @ts-ignore
  window.tweens = { controlled };
}
