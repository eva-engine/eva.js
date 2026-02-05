import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem, registerKtx2CompressedTexture } from '@eva/plugin-renderer';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine36';
import { StatsSystem } from '@eva/plugin-stats';

export const name = 'spine';

const params = {
  jsUrl: '/libktx.js',
  wasmUrl: '/libktx.wasm',
};
registerKtx2CompressedTexture(params);

const spineResource = {
  image: 'https://gw.alicdn.com/imgextra/i4/O1CN01AHYeJo24fxNQdlxOm_!!6000000007419-2-tps-553-551.png',
  atlas:
    'https://g.alicdn.com/eva-assets/6f5817dd5a392c6cfbbc03acc2ba8778/0.0.1/tmp/05afd25/8d703ab1-2023-40f4-be69-ec2ed621b1e6.atlas',
  ske: 'https://g.alicdn.com/eva-assets/32e307f6f38e8223b40fac1e3ccebbd0/0.0.1/tmp/953d6ec/c4c3af1b-d4f4-4436-8735-3353a061839c.json',
};



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
  });
  const spine = new Spine({ resource: 'anim', animationName: 'animation', scale: 1 });
  gameObject.addComponent(spine);
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.on('loaded', () => {
    console.log('>>>loaded');
  });
  spine.play('animation');
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

  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };
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
    },1000)
  }, 1000);
};
