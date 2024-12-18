import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Render, RenderSystem } from '@eva/plugin-renderer-render';

resource.addResource([
  {
    name: 'heart',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
      },
    },
    preload: false,
  },
]);

export const init = async () => {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new RenderSystem(),
    ],
  });

  const container = new GameObject('container', {
    size: {
      width: 300,
      height: 300,
    },
    position: {
      x: 300,
      y: 400,
    },
    origin: { x: 0, y: 0 },
  });
  container.addComponent(
    new Render({
      sortableChildren: true,
    }),
  );

  const image = new GameObject('image1', {
    size: { width: 200, height: 200 },
    origin: { x: 0, y: 0 },
    position: {
      x: 0,
      y: 0,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });
  image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  image.addComponent(
    new Render({
      zIndex: 0.5,
    }),
  );

  container.addChild(image);

  const image1 = new GameObject('image2', {
    size: { width: 200, height: 200 },
    origin: { x: 0, y: 0 },
    position: {
      x: 50,
      y: 50,
    },
    anchor: {
      x: 0,

      y: 0,
    },
  });

  image1.addComponent(
    new Img({
      resource: 'heart',
    }),
  );
  const render1 = image1.addComponent(
    new Render({
      zIndex: 1,
    }),
  );

  container.addChild(image1);

  game.scene.addChild(container);

  let index = 0;
  setInterval(() => {
    render1.zIndex = index++ % 2;
  }, 1000);
};
