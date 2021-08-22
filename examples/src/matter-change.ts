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
    width: '100vw',
    height: '100vh'
  });

  const canvas2 = document.createElement('canvas');
  div.appendChild(canvas2);
  Object.assign(canvas2.style, {
    width: '100vw',
    height: '100vh',
    opacity: .5
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
        canvas: canvas2,
        resolution: 1,
        world: {
          gravity: {
            y: .3, // 重力
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
    },
    origin: {
      x: .5,
      y: .5
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
    radius: 125,
  }))
  gameObject.addComponent(new Img({
    resource: 'img'
  }));

  game.scene.addChild(gameObject);


  //@ts-ignore
  window.transform = gameObject.getComponent('Transform');
  setTimeout(() => {
    gameObject.remove();
  }, 2000);
  setTimeout(() => {
    game.scene.addChild(gameObject);
  }, 4000);
  setTimeout(() => {
    gameObject.destroy();
  }, 6000)
}