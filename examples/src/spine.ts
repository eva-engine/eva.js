import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem, registerKtx2CompressedTexture } from '@eva/plugin-renderer';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { StatsSystem } from '@eva/plugin-stats';

export const name = 'spine';

const params = {
  jsUrl: '/libktx.js',
  wasmUrl: '/libktx.wasm',
};
registerKtx2CompressedTexture(params);

const spineResource = {
  image: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.png',
  atlas:
    'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.atlas',
  ske: 'https://g.alicdn.com/eva/hd25-spring-assets/0.0.19/nianmonster/spine42/Monster.skel',
};

resource.addResource([
  {
    name: 'anim',
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'ske',
        url: spineResource.ske,
      },
      atlas: {
        type: 'atlas',
        url: spineResource.atlas,
      },
      image: {
        type: 'png',
        url: spineResource.image,
      },
    },
    preload: true,
  },
]);

resource.preload();

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
  const spine = new Spine({ resource: 'anim', animationName: 'idle', scale: 1 });
  gameObject.addComponent(spine);
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.on('loaded', () => {
    console.log('>>>loaded');
  });
  spine.play('idle');
  game.scene.addChild(gameObject);
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
  createGb(game, 10, 10);
};
