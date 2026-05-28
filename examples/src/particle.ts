import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, RESOURCE_TYPE, resource } from '@eva/eva.js';
// 引入 Img 仅为触发 IMAGE 资源的 registerInstance 副作用
import '@eva/plugin-renderer-img';
import { ParticleEmitter, ParticleEmitterSystem } from '@eva/plugin-renderer-particle';

export const name = 'particle';

export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'spark',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '/phaser-assets/particles/yellow.png',
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
        backgroundColor: 0x101020,
      }),
      new ParticleEmitterSystem(),
    ],
  });

  const fountain = new GameObject('fountain', {
    position: { x: 375, y: 700 },
    anchor: { x: 0.5, y: 0.5 },
  });
  fountain.addComponent(
    new ParticleEmitter({
      resource: 'spark',
      frequency: 30,
      quantity: 2,
      lifespan: { min: 800, max: 1400 },
      speed: { min: 200, max: 400 },
      angle: { min: 240, max: 300 },
      gravityY: 600,
      scale: { start: 1.0, end: 0.2 },
      alpha: { start: 1, end: 0 },
      tint: [0xffaa33, 0xffd066, 0xff6633, 0xffffff],
    }),
  );
  game.scene.addChild(fountain);

  const explosion = new GameObject('explosion', {
    position: { x: 200, y: 300 },
    anchor: { x: 0.5, y: 0.5 },
  });
  explosion.addComponent(
    new ParticleEmitter({
      resource: 'spark',
      auto: false,
      explode: 60,
      lifespan: { min: 600, max: 1000 },
      speed: { min: 100, max: 350 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff3355, 0xff8855, 0xffcc55],
    }),
  );
  game.scene.addChild(explosion);

  const ring = new GameObject('ring', {
    position: { x: 550, y: 300 },
    anchor: { x: 0.5, y: 0.5 },
  });
  ring.addComponent(
    new ParticleEmitter({
      resource: 'spark',
      frequency: 80,
      quantity: 1,
      lifespan: 1500,
      speed: 0,
      scale: { start: 0.2, end: 1.2 },
      alpha: { start: 1, end: 0 },
      emitZone: { type: 'edge', shape: { type: 'circle', radius: 80 }, total: 32 },
      tint: 0x66ccff,
    }),
  );
  game.scene.addChild(ring);

  // @ts-ignore
  window.test = () => {
    const emitterComp = explosion.getComponent(ParticleEmitter) as ParticleEmitter;
    emitterComp.start();
    emitterComp.paused = false;
  };
}
