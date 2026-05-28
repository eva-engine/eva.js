import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, RESOURCE_TYPE, resource } from '@eva/eva.js';
import { ImgSystem } from '@eva/plugin-renderer-img';
import { RenderTexture, RenderTextureSystem } from '@eva/plugin-renderer-render-texture';

export const name = 'renderTexture';

export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'star',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '/phaser-assets/particles/sparkle1.png',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x202030,
      }),
      new ImgSystem(),
      new RenderTextureSystem(),
    ],
  });

  const rtGo = new GameObject('rt', {
    position: { x: 375, y: 500 },
    anchor: { x: 0.5, y: 0.5 },
    size: { width: 600, height: 600 },
  });
  const rt = new RenderTexture({
    width: 600,
    height: 600,
    backgroundColor: 0x000000,
    backgroundAlpha: 1,
    ops: [
      { type: 'fill', color: 0x223366, alpha: 1 },
      { type: 'drawText', text: 'RenderTexture', x: 80, y: 80, style: { fontSize: 40, fill: 0xffffff } },
      { type: 'paint', resource: 'star', x: 60, y: 200, step: { x: 70, y: 0 }, times: 8, tintCycle: [0xff8800, 0x00ddff, 0xffee44] },
      { type: 'paint', resource: 'star', x: 60, y: 320, step: { x: 70, y: 30 }, times: 8, tint: 0xff66aa },
    ],
  });
  rtGo.addComponent(rt);
  game.scene.addChild(rtGo);

  let frame = 0;
  setInterval(() => {
    frame++;
    rt.addOp({
      type: 'drawText',
      text: String(frame),
      x: 480,
      y: 60 + (frame % 6) * 30,
      style: { fontSize: 28, fill: 0x66ff66 },
    });
  }, 600);
}
