import { Game, GameObject, resource } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
export const name = 'lottie';
import { Lottie, LottieSystem } from '@eva/plugin-renderer-lottie';

export async function init(canvas) {
  resource.addResource([
    {
      name: 'Halo',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://gw.alipayobjects.com/os/bmw-prod/61d9cc77-12de-47a7-b6e5-06c836ce7083.json',
        },
      },
    },
    {
      name: 'Red',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://gw.alipayobjects.com/os/bmw-prod/e327ad5b-80d6-4d3f-8ffc-a7dd15350648.json',
        },
      },
    },
    {
      name: 'test',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://dev.g.alicdn.com/iz/tmfarm-assets/0.0.13/lottie/data.json',
        },
      },
    },
    {
      name: 'red',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://g.alicdn.com/ani-assets/fc7b4547f4fdec3d750a6dd47355f8e9/0.0.1/lottie.json',
        },
      },
    },
  ]);

  const game = new Game();
  globalThis.game = game;
  await game.init({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1624,
        backgroundAlpha: 1,
        debugMode: true,
      }),
      //@ts-ignore
      new LottieSystem(),
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = {
    width: 750,
    height: 1624,
  };

  async function createHalo(direction: number) {
    const halo = new Lottie({
      resource: 'red',
      replaceData: true,
    });
    halo.replaceData({
      hb1: '¥1888',
      hb2: '¥188',
      hb3: '¥564',
      hb4: '¥27',
      hb5: '¥19',
      hb6: '¥3',
    });
    halo.play([99, 130], {
      repeats: 0,
      infinite: false,
      direction: direction as any,
    });

    const haloGameObj = new GameObject('test', {});
    haloGameObj.addComponent(halo);
    game.scene.addChild(haloGameObj);
    haloGameObj.transform.position.x = 100 * direction;
  }

  createHalo(1);
  createHalo(-1);
  // createRed();
}
