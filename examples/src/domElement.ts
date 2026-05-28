import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject } from '@eva/eva.js';
import { DOMElement, DOMElementSystem } from '@eva/plugin-renderer-dom-element';

export const name = 'domElement';

export async function init(canvas: HTMLCanvasElement) {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x202060,
      }),
      new DOMElementSystem(),
    ],
  });

  const titleGo = new GameObject('title', {
    position: { x: 375, y: 200 },
    anchor: { x: 0.5, y: 0.5 },
  });
  titleGo.addComponent(
    new DOMElement({
      html: '<h1 style="margin:0">Hello DOM</h1>',
      width: 400,
      height: 80,
      style: {
        color: '#ffeb6a',
        textAlign: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
        textShadow: '0 2px 4px rgba(0,0,0,0.6)',
      },
    }),
  );
  game.scene.addChild(titleGo);

  const inputGo = new GameObject('input', {
    position: { x: 375, y: 500 },
    anchor: { x: 0.5, y: 0.5 },
  });
  inputGo.addComponent(
    new DOMElement({
      element: 'input',
      width: 500,
      height: 60,
      attrs: { placeholder: '你好,请输入...', value: '' },
      style: {
        fontSize: '24px',
        padding: '0 16px',
        border: '2px solid #ffeb6a',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.95)',
        outline: 'none',
      },
    }),
  );
  game.scene.addChild(inputGo);

  let count = 0;
  const buttonGo = new GameObject('button', {
    position: { x: 375, y: 700 },
    anchor: { x: 0.5, y: 0.5 },
  });
  buttonGo.addComponent(
    new DOMElement({
      element: 'button',
      width: 240,
      height: 80,
      attrs: { id: 'eva-demo-btn' },
      style: {
        fontSize: '28px',
        borderRadius: '40px',
        background: 'linear-gradient(180deg,#ffd34a,#ffa92a)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
    }),
  );
  game.scene.addChild(buttonGo);

  setTimeout(() => {
    const btn = document.getElementById('eva-demo-btn');
    if (btn) {
      btn.innerText = 'Click 0';
      btn.addEventListener('click', () => {
        count++;
        btn.innerText = `Click ${count}`;
      });
    }
  }, 100);
}
