import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem, registerKtx2CompressedTexture } from '@eva/plugin-renderer';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { StatsSystem } from '@eva/plugin-stats';
import * as PIXI from 'pixi.js';
// @ts-ignore
window.PIXI = PIXI;

export const name = 'spine';

const params = {
  jsUrl: '/libktx.js',
  wasmUrl: '/libktx.wasm',
};
registerKtx2CompressedTexture(params);

// <script src="js" crossorigin="anonymous"></script>
// js
// if swicth  + webgl
// load script
// appendChild(script):

//script
// load down PIXI EVA + callback + status

// main.js
// callback registry + status

function createGb(game, x, y) {
  resource.addResource([
    {
      name: 'anim',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'ske',
          url: '/spine/spineboy/spineboy-pro.skel',
        },
        atlas: {
          type: 'atlas',
          url: '/spine/spineboy/spineboy-pma.atlas',
        },
        image: {
          type: 'ktx2',
          url: '/spine/spineboy/spineboy-pma.png',
          texture: [
            {
              type: 'astc',
              url: '/spine/spineboy/spineboy-pma.ktx2',
            },
            {
              type: 'pvrtc',
              url: '',
            },
            {
              type: 'etc',
              url: '',
            },
            {
              type: 's3tc',
              url: '',
            },
          ],
        },
      },
    },
  ]);
  const gameObject = new GameObject('spine' + x + y, {
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    scale: {
      x: 0.5,
      y: 0.5,
    },
    position: {
      x: x * 30 + 100,
      y: y * 30 + 100,
    },
  });
  const spine = new Spine({ resource: 'anim', animationName: 'run', scale: 1 });
  gameObject.addComponent(spine);
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.play('run');
  game.scene.addChild(gameObject);
  return gameObject;
}

export const init = async canvas => {
  // const type = resource.addResource2([{}]);
  // console.log('>>>type', type);
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
    frameRate: 120,
  });

  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 10; j++) {
  //     createGb(game, i, j);
  //   }
  // }

  const gb = createGb(game, 10, 10);
  setTimeout(() => {
    gb.destroy();
    setTimeout(() => {
      createGb(game, 10, 10);
    }, 2000);
  }, 2000);
};
