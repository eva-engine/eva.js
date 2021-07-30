import { RendererSystem } from "../../packages/plugin-renderer/lib"
import { Game, GameObject, RESOURCE_TYPE, resource } from "../../packages/eva.js/lib"
import { Sprite, SpriteSystem } from "../../packages/plugin-renderer-sprite/lib";


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
      preload: true,
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

  const gameObj2 = new GameObject('symbol_2', {
    size: { width: 200, height: 244 },
    position: {
      x: 300,
      y: 0,
    },
  });

  //@ts-ignore
  const spriteCom2 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_2',
  });

  //@ts-ignore
  gameObj2.addComponent(spriteCom2);

  const gameObj3 = new GameObject('symbol_3', {
    size: { width: 200, height: 244 },
    position: {
      x: 600,
      y: 0,
    },
  });

  //@ts-ignore
  const spriteCom3 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_3',
  });

  //@ts-ignore
  gameObj3.addComponent(spriteCom3);

  const gameObj4 = new GameObject('symbol_4', {
    size: { width: 200, height: 244 },
    position: {
      x: 0,
      y: 365,
    },
  });

  //@ts-ignore
  const spriteCom4 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_4',
  });

  //@ts-ignore
  gameObj4.addComponent(spriteCom4);

  const gameObj5 = new GameObject('symbol_5', {
    size: { width: 200, height: 244 },
    position: {
      x: 300,
      y: 365,
    },
  });

  //@ts-ignore
  const spriteCom5 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_5',
  });

  //@ts-ignore
  gameObj5.addComponent(spriteCom5);

  game.scene.addChild(gameObj1);
  game.scene.addChild(gameObj2);
  game.scene.addChild(gameObj3);
  game.scene.addChild(gameObj4);
  game.scene.addChild(gameObj5);
}