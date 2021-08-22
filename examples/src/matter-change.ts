import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from '@eva/plugin-renderer';
import { ImgSystem, Img } from '@eva/plugin-renderer-img';
import { PhysicsSystem, Physics, PhysicsType } from '@eva/plugin-matterjs';
export const name = '物理组件移除添加';
export const init = async (canvas: HTMLCanvasElement) => {
  resource.addResource([
    {
      name: 'img',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/imgextra/i4/O1CN010ZcL7r1xz0EcnGC7S_!!6000000006513-2-tps-67-67.png'
        }
      },
      preload: true
    }
  ])
  const div = document.createElement('div');
  document.body.appendChild(div);
  Object.assign(div.style, {
    position: 'absolute',
    top: '0',
  });
  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 700,
        height: 1443
      }),
      new ImgSystem(),
      new PhysicsSystem({
        isTest: true,
        element: div,
        world: {
          gravity: {
            y: .1, // 重力
          },
        },
        mouse: {
          open: true
        }
      })
    ],
  });
  const gameObject = new GameObject('12', {
    position: {
      x: 300,
      y: 100
    },
    size: {
      width: 250,
      height: 250
    }
  });

  const bodyOptions = {
    isStatic: false,
    restitution: 0.4,
    density: 0.002,
  };

  gameObject.addComponent(new Physics({
    type: PhysicsType.CIRCLE,
    bodyOptions,
    radius: 250,
  }))
  gameObject.addComponent(new Img({
    resource: 'img'
  }));

  game.scene.addChild(gameObject);
}