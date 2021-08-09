import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
import { Transition, TransitionSystem } from "@eva/plugin-transition";

export const name = 'transition';
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
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new TransitionSystem(),
    ],
  });

  const image = new GameObject('image', {
    size: { width: 200, height: 200 },
    origin: { x: 0, y: 0 },
    position: {
      x: 0,
      y: 0,
    },
    anchor: { x: 0.5, y: 0.5 },
  });
  const img = image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  const animation = image.addComponent(new Transition());
  animation.group = {
    idle: [
      {
        name: 'scale.x',
        component: image.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: 'ease-out',
          },
          {
            time: 300,
            value: 1.2,
            tween: 'ease-in',
          },
          {
            time: 600,
            value: 1,
          },
        ],
      },
      {
        name: 'scale.y',
        component: image.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: 'ease-out',
          },
          {
            time: 300,
            value: 1.2,
            tween: 'ease-in',
          },
          {
            time: 600,
            value: 1,
          },
        ],
      },
    ],
    move: [
      {
        name: 'position.x',
        component: image.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: 'ease-out',
          },
          {
            time: 300,
            value: 300,
            tween: 'ease-in',
          },
        ],
      },
      {
        name: 'position.y',
        component: image.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: 'ease-in',
          },
          {
            time: 300,
            value: 300,
          },
        ],
      },
    ],
  };

  animation.play('move', 1);
  animation.on('finish', name => {
    if (name === 'move') {
      animation.play('idle', 5);
    } else if (name === 'idle') {
      console.log('transition finished');
    }
  });

  game.scene.addChild(image);
}