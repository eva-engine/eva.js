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
        // 本地素材位于 examples/public/dragonbone/,vite dev server 会从 public 目录提供。
        // CDN fallback(原始资源,可在网络可达时使用):
        //   image: https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/TB1RIpUBhn1gK0jSZKPXXXvUXXa-1024-1024.png
        //   tex:   https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/fb18baf3a1af41a88f9d1a4426d47832.json
        //   ske:   https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/c904e6867062e21123e1a44d2be2a0bf.json
        image: {
          type: 'png',
          url: '/dragonbone/texture.png',
        },
        tex: {
          type: 'json',
          url: '/dragonbone/texture.json',
        },
        ske: {
          type: 'json',
          url: '/dragonbone/skeleton.json',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game();
  await game.init({
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

  // playTimes=0 => 无限循环。提示:这套示例 DragonBones 资源里
  // `newAnimation` 自身没有 bone keyframe(空动画),所以骨骼不会动。
  // plugin 行为可以通过 `db.armature.armature.animation.lastAnimationState`
  // 看到 currentTime / currentPlayTimes 在持续推进,证明 advanceTime 链路正常。
  // 替换成你自己有 keyframe 的资源即可看到真实骨骼动画。
  db.play('newAnimation', 0);
  game.scene.addChild(dragonBone);

  // 方便自动化测试 / 调试时观察动画推进状态
  (window as any).__DRAGONBONE_COMPONENT__ = db;
  return game;
}