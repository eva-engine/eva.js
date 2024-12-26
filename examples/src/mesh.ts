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
      x: 0,
      y: 0,
    },
  });

  const meshComp = new PerspectiveMesh({
    resource: 'meshName',
    verticesX: 2,
    verticesY: 2,
  });

  gameObj1.addComponent(meshComp);

  const res = await resource.getResource('meshName');
  const texture = res?.data.image;
  if (texture) {
    const points = [
      { x: 0, y: 0 },
      { x: texture.width, y: 0 },
      { x: texture.width, y: texture.height },
      { x: 0, y: texture.height },
    ];

    let outPoints = points.map(point => ({ ...point }));
    function rotate3D(points, outPoints, angleX, angleY, perspective, isMirrorX) {
      const radX = (angleX * Math.PI) / 180;
      const radY = (angleY * Math.PI) / 180;
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      for (let i = 0; i < points.length; i++) {
        const src = points[i];
        const out = outPoints[i];
        let x = src.x - texture.width / 2;
        if (isMirrorX) {
          x = -x;
        }
        const y = src.y - texture.height / 2;
        let z = 0; // Assume initial z is 0 for this 2D plane

        // Rotate around Y axis
        const xY = cosY * x - sinY * z;

        z = sinY * x + cosY * z;

        // Rotate around X axis
        const yX = cosX * y - sinX * z;

        z = sinX * y + cosX * z;

        // Apply perspective projection
        const scale = perspective / (perspective - z);

        out.x = xY * scale + texture.width / 2;
        out.y = yX * scale + texture.height / 2;
      }
    }
    let angleY = 0;

    setInterval(() => {
      angleY += 1;
      rotate3D(points, outPoints, 0, angleY, 300, false);
      // const vertices = outPoints.reduce((prev, { x, y }) => [...prev, x, y], []);
      meshComp.setCorners(
        outPoints[0].x,
        outPoints[0].y,
        outPoints[1].x,
        outPoints[1].y,
        outPoints[2].x,
        outPoints[2].y,
        outPoints[3].x,
        outPoints[3].y,
      );
    }, 10);
  }

  game.scene.addChild(gameObj1);
}
