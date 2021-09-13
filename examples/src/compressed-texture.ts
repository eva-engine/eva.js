import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";

export const name = 'compressed-textures';
export async function init(canvas: HTMLCanvasElement) {

  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: './person.png',
          texture: [
            {
              type: 'astc',
              url: './person.astc.ktx'
            },
            {
              type: 'pvrtc',
              url: './person.pvrtc.ktx'
            }, {
              type: 'etc',
              url: './person.etc.ktx'
            }, {
              type: 's3tc',
              url: './person.s3tc.ktx'
            }]
        },
      },
      preload: false,
    }
  ]);
  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x003355
      }),
      //@ts-ignore
      new ImgSystem(),
    ],
  });
  var res = await resource.getResource('imageName');
  console.log('load finish ', res.src.image.type, res.src.image.url, res.data.image);

  const image = new GameObject('image', {
    size: { width: 924 / 2, height: 514 / 2 },
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
  const img = new Img({
    resource: 'imageName',
  });
  image.addComponent(
    img,
  );
  game.scene.addChild(image);
  window.image = image
  window.resource  = resource
  window.game = game
}