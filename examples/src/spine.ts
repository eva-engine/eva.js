import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Spine, SpineSystem } from "@eva/plugin-renderer-spine";
export const name = 'spine';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'anim',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b5fdf74313d5ff2609ab82f6b6fd83e6.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b8597f298a5d6fe47095d43ef03210d4.atlas',
        },
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/TB1YHC8Vxz1gK0jSZSgXXavwpXa-711-711.png',
        },
      },
      preload: true
    },
  ]);
  window.resource = resource


  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new SpineSystem(),
    ],
    autoStart: true,
    frameRate: 60,
  });
  window.game = game

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };
  let gameObject
  {
    gameObject = new GameObject('spine', {
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      scale: {
        x: 0.5,
        y: 0.5,
      },
    });
    const spine = new Spine({ resource: 'anim', animationName: 'idle', autoPlay: false });
    gameObject.addComponent(spine);
    spine.on('complete', e => {
      console.log('动画播放结束', e.name);
    });
    spine.play('idle', true);
    game.scene.addChild(gameObject);
  }
  setTimeout(() => {
    gameObject.destroy()
    let gameObject1 = new GameObject('spine', {
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      scale: {
        x: 0.5,
        y: 0.5,
      },
    });
    const spine = new Spine({ resource: 'anim', animationName: 'idle' });
    gameObject1.addComponent(spine);
    spine.on('complete', e => {
      console.log('动画播放结束', e.name);
    });
    spine.play('idle', true);
    game.scene.addChild(gameObject1);
  }, 1000)
}