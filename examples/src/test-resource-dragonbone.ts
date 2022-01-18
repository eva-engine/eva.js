import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, RESOURCE_TYPE, resource } from "@eva/eva.js"
import { DragonBone, DragonBoneSystem } from "@eva/plugin-renderer-dragonbone";
export const name = 'image';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'dragonbone',
      type: RESOURCE_TYPE.DRAGONBONE,
      src: {
        image: {
          type: 'png',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/TB1RIpUBhn1gK0jSZKPXXXvUXXa-1024-1024.png',
        },
        tex: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/fb18baf3a1af41a88f9d1a4426d47832.json',
        },
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/c904e6867062e21123e1a44d2be2a0bf.json',
        },
      },
    },
    {
      name: 'dragonbone2',
      type: RESOURCE_TYPE.DRAGONBONE,
      src: {
        image: {
          type: 'png',
          url: '/dragonbone.png',
        },
        tex: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/fb18baf3a1af41a88f9d1a4426d47832.json?asdasd',
        },
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/c904e6867062e21123e1a44d2be2a0bf.json?ASdsdfdsf',
        },
      },
    },
  ]);
  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new DragonBoneSystem(),
    ],
  });

  const image = new GameObject('image', {
    // size: { width: 750, height: 1319 },
    // origin: { x: 0, y: 0 },
    position: {
      x: 375,
      y: 500,
    }
  });

  const img = image.addComponent(
    new DragonBone({
      resource: 'dragonbone',
      armatureName: 'armatureName',
      animationName: 'newAnimation',
      autoPlay: true
    }),
  );

  // setTimeout(() => {
  setTimeout(() => {
    img.resource = 'dragonbone2';

    // image.removeComponent(Img)
  }, 16)
  // }, 1000)
  game.scene.addChild(image);
}