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
        image: { type: 'png', url: 'https://gw.alicdn.com/imgextra/i3/O1CN01IiQrEp1LOrcVsRkkf_!!6000000001290-2-tps-1038-253.png' },
          ske: { type: 'json', url: 'https://pages.tmall.com/wow/eva/6790a0882dd67936d340d9bf2b1d4aaf_ske.json' },
          atlas: { type: 'atlas', url: 'https://pages.tmall.com/wow/eva/6903606675d84c503bad0f273e3d047d.atlas' },
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
      y: 300
    }
  });
  //@ts-ignore
  const spine = new Spine({ resource: 'anim', animationName: 'animation' });
  //@ts-ignore
  gameObject.addComponent(spine);
  //@ts-ignore
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.play('animation', true);
  game.scene.addChild(gameObject);
window.spine = spine

    // spine.armature.skeleton.setSkinByName('dada');
    // window[petName+'0'] = spine;
    // window[petName] = spine.armature;

}