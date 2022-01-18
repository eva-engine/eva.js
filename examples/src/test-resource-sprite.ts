import { RendererSystem } from "@eva/plugin-renderer"
import { Game, GameObject, RESOURCE_TYPE, resource } from "@eva/eva.js"
import { Sprite, SpriteSystem } from "@eva/plugin-renderer-sprite";


export const name = 'sprite';
export async function init(canvas) {

  resource.addResource([
    {
      name: 'spriteName',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/sprite/TB1ONLxOAL0gK0jSZFAXXcA9pXa-900-730.png',
        },
        json: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/sprite/ad317f6aea149d9a8b34a517e5df2caf.json',
        },
      },
      preload: false,
    },
    {
      name: 'spriteName2',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          // url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/sprite/TB1ONLxOAL0gK0jSZFAXXcA9pXa-900-730.png?ASdasdas',
          url: '/dragonbone.png',
        },
        json: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/sprite/ad317f6aea149d9a8b34a517e5df2caf.json?dsfsadds',
        },
      },
      preload: false,
    },
  ]);

  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x101010,
      }),
      //@ts-ignore
      new SpriteSystem(),
    ],
  });

  const gameObj1 = new GameObject('symbol_1', {
    size: { width: 200, height: 244 },
    position: {
      x: 0,
      y: 0,
    },
  });

  // @ts-ignore
  const spriteCom1 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_1',
  });

  //@ts-ignore
  gameObj1.addComponent(spriteCom1);

  game.scene.addChild(gameObj1);

  setTimeout(() => { 
    spriteCom1.resource = 'spriteName2';
    // spriteCom1.spriteName = 'symbol_3';
  }, 1000) 
}