import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Spine, SpineSystem } from "@eva/plugin-renderer-spine40";
export const name = 'spine38';
export async function init(canvas) {
  resource.addResource([
    {
      "name": "anim",
      "type": RESOURCE_TYPE.SPINE,
      "src": {
        "image": {
          "type": "png",
          "url": "https://gw.alicdn.com/imgextra/i1/O1CN01pSKMqE1ncQbxh0hVr_!!6000000005110-2-tps-336-288.png"
        },
        "ske": {
          "type": "json",
          "url": "https://g.alicdn.com/eva-assets/e9cd72650204c26dd92e06b548aa98a0/0.0.1/tmp/325d1/80cb7cc7-7a37-409c-8fdc-ec39200d5793.json"
        },
        "atlas": {
          "type": "atlas",
          "url": "https://g.alicdn.com/eva-assets/ef70f12ca0d0926f4e10ff65a8a5d45d/0.0.1/tmp/944f0/462d2071-0fd5-406a-bdcd-1e35982d37ad.atlas"
        }
      },
      "preload": true
    }
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        transparent: true
      }),
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
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    scale: {
      x: 0.5,
      y: 0.5,
    },
  });
  const spine = new Spine({ resource: 'anim', animationName: 'run' });
  gameObject.addComponent(spine);
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.play('run', true);
  setTimeout(()=>{
    spine.play('all', true);

  }, 5000)
  game.scene.addChild(gameObject);

}