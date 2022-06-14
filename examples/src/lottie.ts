import { Game, GameObject, resource } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
export const name = 'lottie';
import { Lottie, LottieSystem } from "@eva/plugin-renderer-lottie";
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
  ]);

  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1624,
        transparent: true,
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


  function createHalo() {
    const halo = new Lottie({ resource: 'Halo' });

    halo.on('complete', () => {
      console.log('halo play complete !');
    });
    halo.play([], { repeats: 0 });


    const haloGameObj = new GameObject('Halo', {
      anchor: {
        x: 0,
        y: 0,
      },
    });
    haloGameObj.addComponent(halo);
    game.scene.addChild(haloGameObj);
  }
  function createRed() {
    const red = new Lottie({ resource: 'Red' });

    red.on('complete', () => {
      console.log('Red play complete !');
    });

    red.play([], {
      repeats: 0,
      slot: [
        {
          name: '#number',
          type: 'TEXT',
          value: '10',
          style: {
            fontSize: 64,
          },
        },
        {
          name: '#unit',
          type: 'TEXT',
          value: '元',
          style: {
            fontSize: 22,
          },
        },
        {
          name: '#title',
          type: 'TEXT',
          value: '我是主标题',
          style: {
            fontSize: 32,
          },
        },
        {
          name: '#subtitle',
          type: 'TEXT',
          value: '我是副标题',
          style: {
            fontSize: 24,
          },
        },
      ],
    });


    red.onTap('#btn', () => {
      console.log('btn click !');
    });

    const redGameObj = new GameObject('Red', {
      anchor: { x: 0.5, y: 0.3 },
      size: { width: 660, height: 757 },
      origin: { x: 0.5, y: 0.5 },
    });

    redGameObj.addComponent(red);
    game.scene.addChild(redGameObj);
  }


  createHalo()
  createRed()

}