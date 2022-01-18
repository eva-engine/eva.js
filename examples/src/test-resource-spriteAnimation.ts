import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { SpriteAnimationSystem, SpriteAnimation } from '@eva/plugin-renderer-sprite-animation';

export const name = 'spriteAnimation';
export async function init(canvas) {
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
    {
      name: 'fruit2',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/bao/uploaded/TB15pMkkrsTMeJjSszhXXcGCFXa-377-1070.png?dasdda'
        },
        json: {
          type: 'json',
          url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json?asfgews',
        },
      },
      preload: false,
    }
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
      forwards: true
    }),
  );

  frame.play();

  setTimeout(() => {
    frame.resource = 'fruit2';
    cut.removeComponent(frame)
  }, 1000);

  game.scene.addChild(cut);
}
