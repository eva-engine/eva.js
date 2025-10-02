import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
export const name = 'text';

resource.addResource([
  {
    type: RESOURCE_TYPE.FONT,
    name: 'test',
    src: { font: { type: 'font', url: 'https://hudong.tbcdn.cn/u/tbcoinjump/1iFTgM2SDGhP.woff' } },
    preload: true,
  },
]);

export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      //@ts-ignore
      new TextSystem(),
    ],
  });

  // 此处还在考虑如何设置默认场景的宽高
  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  const text = new GameObject('text', {
    position: {
      x: 0,
      y: 0,
    },
    origin: {
      x: 0.5,
      y: 0.5,
    },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });

  const txt = text.addComponent(
    new Text({
      text: '升级了',
      style: {
        fontFamily: 'test',
        fontSize: 108,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff'],
      },
    }),
  );

  setTimeout(() => {
    txt.style.fontFamily = 'Arial';
  }, 3000);

  game.scene.addChild(text);
}
