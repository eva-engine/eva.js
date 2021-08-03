import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { INTERNAL_FORMATS, RendererSystem } from "@eva/plugin-renderer";
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
          url: './yanhua.png',
          texture: [
            // {
            //   type: 'etc',
            //   internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR,
            //   url: './yanhua.etc.ktx'
            // },
            {
              type: 'astc',
              internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR,
              url: './yanhua.astc.ktx'
            }, {
              type: 's3tc',
              internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
              url: './yanhua.s3tc.ktx'
            },]
        },
      },
      preload: false,
    },
    {
      name: 'image2',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: './person.png',
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
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '0xff0000'
      }),
      //@ts-ignore
      new ImgSystem(),
    ],
  });
  const res = await resource.getResource('imageName');
  console.log('load finish ', res);

  const image = new GameObject('image', {
    size: { width: window.innerWidth, height: window.innerWidth },
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
  const image2 = new GameObject('image', {
    size: { width: window.innerWidth, height: window.innerWidth },
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
  // image2.addComponent(new Img({
  //   resource: 'image2'
  // }))
  // game.scene.addChild(image2);
  game.scene.addChild(image);
}