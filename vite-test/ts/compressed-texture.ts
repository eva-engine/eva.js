import { Game, GameObject, resource, RESOURCE_TYPE, System } from "../../packages/eva.js/lib";
import {Img,ImgSystem} from "../../packages/plugin-renderer-img/lib";
import {RendererSystem} from "../../packages/plugin-renderer/lib";


export const name = 'compressed-textures';
export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 's3tc',
          url: './public/shannon.s3tc.ktx',
        },
      },
      preload: true,
    },
  ]);
  console.log(await resource.getResource('imageName'))
  // const game = new Game({
  //   systems: [
  //     //@ts-ignore
  //     new RendererSystem({
  //       canvas,
  //       width: 750,
  //       height: 1000,
  //     }),
  //     //@ts-ignore
  //     new ImgSystem(),
  //   ],
  // });

  // const image = new GameObject('image', {
  //   size: {width: 750, height: 1319},
  //   origin: {x: 0, y: 0},
  //   position: {
  //     x: 0,
  //     y: -319,
  //   },
  //   anchor: {
  //     x: 0,
  //     y: 0,
  //   },
  // });
  // //@ts-ignore
  // const img = new Img({
  //   resource: 'imageName',
  // });
  // image.addComponent(
  //   ///@ts-ignore
  //   img,
  // );

  // game.scene.addChild(image);
}