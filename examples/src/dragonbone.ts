import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { DragonBone, DragonBoneSystem } from "@eva/plugin-renderer-dragonbone";
export const name = 'dragonbone';
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
      preload: true,
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

  // 此处还在考虑如何设置默认场景的宽高
  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  // dragonbone 的 origin 是失效的，将会按照dragonbone设计时的坐标重点定位
  const dragonBone = new GameObject('db', {
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });

  const db = dragonBone.addComponent(
    new DragonBone({
      resource: 'dragonbone',
      armatureName: 'armatureName',
      autoPlay: true,
      animationName: 'newAnimation'
    }),
  );

  db.play('newAnimation', 5);
  game.scene.addChild(dragonBone);

}