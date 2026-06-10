import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';

export async function init() {
  resource.addResource([
    {
      name: 'spriteName',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: '/sprite/symbol.png',
        },
        json: {
          type: 'json',
          url: '/sprite/symbol.json',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
        backgroundColor: 0x101010,
      }),
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

  const spriteCom1 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_1',
  });

  gameObj1.addComponent(spriteCom1);

  const gameObj2 = new GameObject('symbol_2', {
    size: { width: 200, height: 244 },
    position: {
      x: 300,
      y: 0,
    },
  });

  const spriteCom2 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_2',
  });

  gameObj2.addComponent(spriteCom2);

  const gameObj3 = new GameObject('symbol_3', {
    size: { width: 200, height: 244 },
    position: {
      x: 600,
      y: 0,
    },
  });

  const spriteCom3 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_3',
  });

  gameObj3.addComponent(spriteCom3);

  const gameObj4 = new GameObject('symbol_4', {
    size: { width: 200, height: 244 },
    position: {
      x: 0,
      y: 365,
    },
  });

  const spriteCom4 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_4',
  });

  gameObj4.addComponent(spriteCom4);

  const gameObj5 = new GameObject('symbol_5', {
    size: { width: 200, height: 244 },
    position: {
      x: 300,
      y: 365,
    },
  });

  const spriteCom5 = new Sprite({
    resource: 'spriteName',
    spriteName: 'symbol_5',
  });

  gameObj5.addComponent(spriteCom5);

  game.scene.addChild(gameObj1);
  game.scene.addChild(gameObj2);
  game.scene.addChild(gameObj3);
  game.scene.addChild(gameObj4);
  game.scene.addChild(gameObj5);

  const frames = ['symbol_1', 'symbol_2', 'symbol_3', 'symbol_4', 'symbol_5'];
  let frameIndex = 0;
  window.setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length;
    spriteCom1.setSprite(frames[frameIndex]);
  }, 800);
}
