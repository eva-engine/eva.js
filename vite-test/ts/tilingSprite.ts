import { Game, GameObject, resource, RESOURCE_TYPE } from "../../packages/eva.js/lib";
import { RendererSystem } from "../../packages/plugin-renderer/lib";
import { TilingSprite,TilingSpriteSystem } from "../../packages/plugin-renderer-tiling-sprite/lib";

export const name = 'tilingSprite';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/tfs/TB1t7vtOvb2gK0jSZK9XXaEgFXa-300-431.png',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
      }),
      new TilingSpriteSystem(),
    ],
  });

  const tilingSprite = new GameObject('sprite', {
    size: {width: 750, height: 1000},
  });

  tilingSprite.addComponent(
    new TilingSprite({
      resource: 'imageName',
      tileScale: {x: 0.7, y: 0.7},
      tilePosition: {x: 10, y: 40},
    }),
  );

  game.scene.addChild(tilingSprite);
}