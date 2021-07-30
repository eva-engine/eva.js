import { Game, GameObject, resource, RESOURCE_TYPE } from "../../packages/eva.js/lib";
import { RendererSystem } from "../../packages/plugin-renderer/lib";
import { SpriteAnimationSystem, SpriteAnimation } from "../../packages/plugin-renderer-sprite-animation/lib";

export const name = 'spriteAnimation';
export async function init(canvas) {

  resource.addResource([
    {
      name: 'fruit',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/bao/uploaded/TB15pMkkrsTMeJjSszhXXcGCFXa-377-1070.png',
        },
        json: {
          type: 'json',
          url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json',
        },
      },
      preload: false,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
      }),
      new SpriteAnimationSystem(),
    ],
  });

  const cut = new GameObject('cut', {
    position: {x: 225, y: 400},
    size: {width: 300, height: 200},
    origin: {x: 0, y: 0},
  });

  const frame = cut.addComponent(
    new SpriteAnimation({
      resource: 'fruit',
      speed: 100,
    }),
  );

  frame.play(4);
  frame.on('onComplete', () =>{
    console.log('onComplete')
  })
  frame.on('onLoop', () =>{
    console.log('onLoop')
  })
  frame.on('onFrameChange', () =>{
    console.log('onFrameChange')
  })


  game.scene.addChild(cut);
}