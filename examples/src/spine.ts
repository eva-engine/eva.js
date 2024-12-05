import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';
import { StatsSystem } from '@eva/plugin-stats';
import { extensions, loadBasis, detectBasis, setBasisTranscoderPath } from 'pixi.js';

setBasisTranscoderPath({
  jsUrl: '/basis/basis_transcoder.js',
  wasmUrl: '/basis/basis_transcoder.wasm',
});
extensions.add(loadBasis, detectBasis);

export const name = 'spine';
resource.addResource([
  {
    name: 'anim',
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'skel',
        url: '/spine/spineboy/spineboy-pro.skel',
      },
      atlas: {
        type: 'atlas',
        url: '/spine/spineboy/spineboy-pma.atlas',
      },
      image: {
        type: 'png',
        url: '/spine/spineboy/spineboy-pma.basis',
        // url: '/spine/spineboy/spineboy-pma.png',
      },
    },
    preload: true,
  },
]);

resource.preload();

export const init = async canvas => {
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

  const g = new GameObject('g', {
    position: {
      x: 0,
      y: 0,
    },
  });
  const gameObject = new GameObject('spine', {
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    scale: {
      x: 0.5,
      y: 0.5,
    },
    position: {
      x: 300,
      y: 500,
    },
  });
  const spine = new Spine({ resource: 'anim', animationName: 'run', scale: 1 });
  gameObject.addComponent(spine);
  spine.on('complete', e => {
    console.log('动画播放结束', e.name);
  });
  spine.play('run');
  game.scene.addChild(gameObject);
};
