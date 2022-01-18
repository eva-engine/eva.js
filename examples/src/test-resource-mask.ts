import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, RESOURCE_TYPE, resource } from "@eva/eva.js"
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
import "@eva/plugin-renderer-sprite";
import { Mask, MaskSystem, MASK_TYPE } from "@eva/plugin-renderer-mask";
export const name = 'image';
export async function init(canvas) {
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
      new MaskSystem(),
      new ImgSystem()
    ],
  });

  game.scene.transform.size = {
    width: 750,
    height: 1334
  }

  const image = new GameObject('image', {
    size: { width: 200, height: 200 },
  });
  image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );
  game.scene.addChild(image);
  const mask = image.addComponent(
    new Mask({
      resource: 'tag',
      spriteName: 'donate.png',
      type: MASK_TYPE.Sprite,
      style: {
        width: 100,
        height: 100,
        x: 20,
        y: 20,
      },
    }),
  );


  setTimeout(() => {
    mask.resource = 'tag';
    mask.spriteName = 'task.png';
    mask.type = MASK_TYPE.Sprite;
    mask.style = {
      width: 100,
      height: 100,
      x: 20,
      y: 20,
    };

    image.removeComponent(Img)
  }, 1000)
  // }, 1000)
}