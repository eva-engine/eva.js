resource.addResource([
  {
    name: 'tree',
    type: RESOURCE_TYPE.DRAGONBONE,
    src: {
      ske: '//gw.alicdn.com/bao/uploaded/TB1SFUHVAzoK1RjSZFlXXai4VXa.json',
      tex: '//gw.alicdn.com/bao/uploaded/TB17n.IVrrpK1RjSZTEXXcWAVXa.json',
      image:
        '//gw.alicdn.com/bao/uploaded/TB11W7FVyrpK1RjSZFhXXXSdXXa-489-886.png',
    },
  },
  {
    name: 'image',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url:
          'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
      },
    },
    preload: true,
  },
  {
    name: 'spriteName',
    type: RESOURCE_TYPE.SPRITE,
    src: {
      image: {
        type: 'png',
        url:
          'https://gw.alicdn.com/tfs/TB1ONLxOAL0gK0jSZFAXXcA9pXa-900-730.png',
      },
      json: {
        type: 'json',
        url:
          'https://pages.tmall.com/wow/eva/ad317f6aea149d9a8b34a517e5df2caf.json',
      },
    },
    preload: true,
  },
  {
    name: 'heart',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image:
        '//gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
    },
    preload: false,
  },
  {
    name: 'anim',
    // @ts-ignore
    type: 'SPINE',
    src: {
      ske: {
        type: 'json',
        url:
          'https://pages.tmall.com/wow/eva/b5fdf74313d5ff2609ab82f6b6fd83e6.json',
      },
      // @ts-ignore
      atlas: {
        type: 'atlas',
        url:
          'https://pages.tmall.com/wow/eva/b8597f298a5d6fe47095d43ef03210d4.atlas',
      },
      image: {
        type: 'png',
        url:
          'https://gw.alicdn.com/tfs/TB1YHC8Vxz1gK0jSZSgXXavwpXa-711-711.png',
      },
    },
  },
]);

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('canvas'),
      width: 750,
      height: 1000,
    }),
    new TextSystem(),
    new ImgSystem(),
    new SpriteSystem(),
    new EventSystem(),
    new SpineSystem(),
    new A11ySystem({
      debug: true,
      activate: A11yActivate.CHECK,
    }),
  ],
  autoStart: true,
  frameRate: 60,
});

game.scene.transform.size = {
  width: 750,
  height: 1000,
};
// @ts-ignore
window.game = game;
loadText(game);
loadImage(game);
loadSprite(game);
loadEvent(game);
loadSpine(game);
