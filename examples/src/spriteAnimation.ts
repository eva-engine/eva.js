import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { SpriteAnimationSystem, SpriteAnimation } from '@eva/plugin-renderer-sprite-animation';

export const name = 'spriteAnimation';
export async function init(canvas) {
  console.log('beginload');
  resource.addResource([
    {
      name: 'fruit',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/bao/uploaded/TB15pMkkrsTMeJjSszhXXcGCFXa-377-1070.png'
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
        canvas,
        width: 750,
        height: 1000,
      }),
      new SpriteAnimationSystem(),
    ],
  });

  const cut = new GameObject('cut', {
    position: { x: 225, y: 400 },
    size: { width: 300, height: 200 },
    origin: { x: 0, y: 0 },
  });

  const frame = cut.addComponent(
    new SpriteAnimation({
      resource: 'fruit',
      speed: 100,
      autoPlay: true,
    }),
  );

  frame.play(4);
  frame.on('complete', () => {
    console.log('complete');
  });
  frame.on('loop', () => {
    console.log('loop');
  });
  frame.on('frameChange', () => {
    console.log('frameChange');
  });

  game.scene.addChild(cut);
}
