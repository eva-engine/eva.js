import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { StatsSystem } from '@eva/plugin-stats';

export const name = 'spine-slot-object';

resource.addResource([
  {
    name: 'light',
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'json',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/1cce/award.skel',
      },
      atlas: {
        type: 'atlas',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/0f1b/award.atlas',
      },
      image: {
        type: 'png',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/8a0c/award.png',
      },
    },
    preload: true,
  },
  {
    name: 'item1',
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'json',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/5c6e/item1.skel',
      },
      atlas: {
        type: 'atlas',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/1b3e/item1.atlas',
      },
      image: {
        type: 'png',
        url: 'https://g.alicdn.com/ani-assets/hudong/assets/311147/76a9/item1.png',
      },
    },
    preload: true,
  },
]);

resource.preload();

export const init = async (canvas: HTMLCanvasElement) => {
  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        debugMode: true,
      }),
      new SpineSystem(),
      new StatsSystem(),
    ],
    autoStart: true,
    frameRate: 60,
  });

  // 创建 light Spine 游戏对象
  const lightGo = new GameObject('light-spine', {
    anchor: { x: 0.5, y: 0.5 },
    position: { x: 375, y: 500 },
  });
  const lightSpine = new Spine({ resource: 'light', animationName: 'animation', autoPlay: true });
  lightGo.addComponent(lightSpine);
  game.scene.addChild(lightGo);

  lightSpine.on('loaded', () => {
    console.log('Light spine loaded');

    // 打印所有插槽
    const slots = lightSpine.armature?.skeleton?.slots;
    if (slots) {
      slots.forEach((slot: any, i: number) => {
        console.log(`  slot[${i}]: ${slot.data.name}`);
      });
    }

    // 创建 item1 Spine 的 GameObject
    const item1Go = new GameObject('item1-spine', {});
    const item1Spine = new Spine({ resource: 'item1', animationName: 'animation', autoPlay: true });
    item1Go.addComponent(item1Spine);
    // game.scene.addChild(item1Go);

    const gb = new GameObject('gb', {
      position: { x: 0, y: 0 },
      scale: { x: 2, y: 2 },
    });

    gb.addChild(item1Go);
    lightSpine.addSlotObject('figure', gb);

    // 等 item1 加载完成 & 容器就绪后，挂载到 figure 插槽
    // item1Spine.on('loaded', () => {
    //   console.log('Item1 spine loaded');
    //   // 延迟确保容器已被 RendererSystem 创建
    //   setTimeout(() => {
    //     console.log('addSlotObject: item1 -> "figure" slot');
    //     lightSpine.addSlotObject('figure', item1Go);
    //   }, 100);
    // });

    // // 5秒后移除挂载
    // setTimeout(() => {
    //   console.log('removeSlotObject: item1');
    //   lightSpine.removeSlotObject(gb);
    // }, 5000);

    // // 10秒后销毁 light spine，测试自动清理
    setTimeout(() => {
      console.log('destroy light spine');
      lightGo.destroy();
    }, 10000);
  });
};
