import { Game, GameObject, resource, RESOURCE_TYPE, Component, System } from "../../packages/eva.js/lib";
import { RendererSystem } from "../../packages/plugin-renderer/lib";
import { Img, ImgSystem } from "../../packages/plugin-renderer-img/lib";
import "../../packages/plugin-renderer-sprite/lib";
import { Mask, MaskSystem, MASK_TYPE } from "../../packages/plugin-renderer-mask/lib";
export const name = 'mask';
export async function init(canavs) {

  resource.addResource([
    {
      name: 'heart',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '//gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
        },
      },
      preload: false,
    },
    {
      name: 'tag',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: '//gw.alicdn.com/mt/TB1KcVte4n1gK0jSZKPXXXvUXXa-150-50.png',
        },
        json: {
          type: 'json',
          url: '//gw.alicdn.com/mt/TB1d4lse4D1gK0jSZFsXXbldVXa.json',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new MaskSystem(),
    ],
  });

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  const image = new GameObject('image', {
    size: { width: 200, height: 200 },
  });
  image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );
  game.scene.addChild(image);
  image.addComponent(
    new Mask({
      type: MASK_TYPE.Circle,
      style: {
        x: 100,
        y: 100,
        radius: 70,
      },
    }),
  );

  const image1 = new GameObject('image', {
    size: { width: 200, height: 200 },
    position: { x: 400, y: 300 },
  });
  image1.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  image1.addComponent(
    new Mask({
      type: MASK_TYPE.Img,
      style: {
        width: 100,
        height: 100,
        x: 20,
        y: 20,
      },
      resource: 'heart',
    }),
  );
  game.scene.addChild(image1);

  const image2 = new GameObject('image', {
    size: { width: 200, height: 200 },
    position: { x: 100, y: 400 },
  });
  image2.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  image2.addComponent(
    new Mask({
      type: MASK_TYPE.Sprite,
      style: {
        width: 100,
        height: 100,
        x: 20,
        y: 20,
      },
      resource: 'tag',
      spriteName: 'task.png',
    }),
  );
  game.scene.addChild(image2);
}