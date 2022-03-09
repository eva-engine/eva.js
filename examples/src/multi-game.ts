import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, RESOURCE_TYPE, resource } from "@eva/eva.js"
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
export const name = 'multiGame';
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

  const img = new Img({
    resource: 'imageName',
  })


  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
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

  image.addComponent(img);

  game.scene.addChild(image);

  // @ts-ignore
  window.test = () => {
    setTimeout(() => {
      image.removeComponent(Img)
      image.addComponent(
        new Img({
          resource: 'imageName',
        }),
      );
      setTimeout(() => {
        image.removeComponent(Img)
        setTimeout(() => {
          image.addComponent(
            new Img({
              resource: 'imageName',
            }),
          );
        }, 1000)
      }, 1000)
    }, 1000)
  }
}