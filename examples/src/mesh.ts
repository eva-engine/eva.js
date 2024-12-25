import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { PerspectiveMesh, MeshSystem } from '@eva/plugin-renderer-mesh';

export async function init() {
  resource.addResource([
    {
      name: 'meshName',
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

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas: document.querySelector('#canvas'),
        width: 750,
        height: 1000,
        backgroundColor: 0x101010,
      }),
      new MeshSystem(),
    ],
  });

  const gameObj1 = new GameObject('symbol_1', {
    size: { width: 200, height: 244 },
    position: {
      x: 100,
      y: 100,
    },
  });

  const meshComp = new PerspectiveMesh({
    resource: 'meshName',
    verticesX: 2,
    verticesY: 2,
  });

  gameObj1.addComponent(meshComp);

  setTimeout(async () => {
    const res = await resource.getResource('meshName');
    const texture = res?.data.image;
    if (texture) {
      const points = [
        { x: 0, y: 0 },
        { x: texture.width, y: 0 },
        { x: texture.width, y: texture.height },
        { x: 0, y: texture.height },
      ];

      let outputPoints = points.map(point => ({ ...point, x: point.x + 50 }));

      console.log(outputPoints);
      meshComp.setCorners(
        outputPoints[0].x,
        outputPoints[0].y,
        outputPoints[1].x,
        outputPoints[1].y,
        outputPoints[2].x,
        outputPoints[2].y,
        outputPoints[3].x,
        outputPoints[3].y,
      );
    }
  }, 5000);

  game.scene.addChild(gameObj1);
}
