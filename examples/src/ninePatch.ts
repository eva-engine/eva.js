import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { NinePatchSystem, NinePatch } from "@eva/plugin-renderer-nine-patch";

export const name = 'ninePatch';
export async function init(canvas) {

  resource.addResource([
    {
      name: 'nine',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://img.alicdn.com/tfs/TB17uSKkQ9l0K4jSZFKXXXFjpXa-363-144.png',
        },
      },
      preload: false,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0xffffff,
      }),
      new NinePatchSystem(),
    ],
  });

  const patch = new GameObject('patch', {
    size: { width: 360, height: 145 },
    origin: { x: 0, y: 0 },
    position: {
      x: 10,
      y: 10,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });
  patch.addComponent(
    new NinePatch({
      resource: 'nine',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );

  const patch1 = new GameObject('patch1', {
    size: { width: 660, height: 345 },
    origin: { x: 0, y: 0 },
    position: {
      x: 10,
      y: 300,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  patch1.addComponent(
    new NinePatch({
      resource: 'nine',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );

  game.scene.addChild(patch);
  game.scene.addChild(patch1);
}