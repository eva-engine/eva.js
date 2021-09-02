import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Spine, SpineSystem } from "@eva/plugin-renderer-spine38";
export const name = 'spine';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'anim',
      type: RESOURCE_TYPE.SPINE,
      src: {

        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/imgextra/i4/O1CN01EBvQrD28lE8W67BK9_!!6000000007972-2-tps-1271-1271.png',
        },
        ske: {
          type: 'json',
          url: 'https://pages.tmall.com/wow/eva/d40ea22bf9ade8ca3f09b0428588fd32_ske.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://pages.tmall.com/wow/eva/6cb96ffcecb5e4f5e829d2a273c8f109.atlas',
        },

      },
    }, {
      name: 'anim1',
      type: RESOURCE_TYPE.SPINE,
      src: {

        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/imgextra/i4/O1CN01EBvQrD28lE8W67BK9_!!6000000007972-2-tps-1271-1271.png',
        },
        ske: {
          type: 'json',
          url: 'https://pages.tmall.com/wow/eva/d40ea22bf9ade8ca3f09b0428588fd32_ske.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://pages.tmall.com/wow/eva/6cb96ffcecb5e4f5e829d2a273c8f109.atlas',
        },

      },
    },
  ]);

  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      //@ts-ignore
      new SpineSystem(),
    ],
    autoStart: true,
    frameRate: 60,
  });

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  const gameObject = new GameObject('spine', {
    position: {
      x: 300,
      y: 600
    }
  });
  //@ts-ignore
  const spine = new Spine({ resource: 'anim', animationName: 'dance' });
  window.spine =spine
  //@ts-ignore
  gameObject.addComponent(spine);
  //@ts-ignore
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.play('dance', true);
  game.scene.addChild(gameObject);
  window.spine = spine

  // spine.armature.skeleton.setSkinByName('dada');
  // window[petName+'0'] = spine;
  // window[petName] = spine.armature;

}