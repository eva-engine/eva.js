import { Game, GameObject, resource, RESOURCE_TYPE,Scene,LOAD_SCENE_MODE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";

export const name = 'multi-canavs';
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
          new RendererSystem({
            canvas,
            width: 500,
            height: 500,
          }),
          new ImgSystem(),
        ],
      });

      const image = new GameObject('image', {
        size: {width: 400, height: 400},
        origin: {x: 0, y: 0},
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
          resource: 'imageName',
        }),
      );

      game.scene.addChild(image);

      const scene2 = new Scene('scene2');

      const canvas2 = document.createElement('canvas');
      document.body.appendChild(canvas2);

      game.loadScene({
        scene: scene2,
        mode: LOAD_SCENE_MODE.MULTI_CANVAS,
        params: {
          canvas: canvas2,
          width: 500,
          height: 500,
        },
      });
      const image2 = new GameObject('image', {
        size: {width: 400, height: 400},
        origin: {x: 0, y: 0},
        position: {
          x: 30,
          y: 30,
        },
        anchor: {
          x: 0,
          y: 0,
        },
      });

      image2.addComponent(
        new Img({
          resource: 'imageName',
        }),
      );
      // scene2.addChild(image2)
      // game.scene.addChild(image2)
      setTimeout(() => {
        scene2.addChild(image2);
      }, 3000);
}