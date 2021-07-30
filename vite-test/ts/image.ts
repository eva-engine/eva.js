import { RendererSystem } from "../../packages/plugin-renderer/lib"
import { Game, GameObject, RESOURCE_TYPE, resource } from "../../packages/eva.js/lib"
import { Img, ImgSystem } from "../../packages/plugin-renderer-img/lib";
export const name = 'image';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
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
      }),
      //@ts-ignore
      new ImgSystem(),
    ],
  });

  const image = new GameObject('image', {
    size: { width: 750, height: 1319 },
    origin: { x: 0, y: 0 },
    position: {
      x: 0,
      y: -319,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  image.addComponent(
    //@ts-ignore
    new Img({
      resource: 'imageName',
    }),
  );

  game.scene.addChild(image);
}