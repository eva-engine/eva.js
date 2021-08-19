import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { Particles, ParticleSystem } from "@eva/plugin-renderer-particles";
export const name = 'image';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'bubbles',
      type: RESOURCE_TYPE['Particles'] || 'Particles',
      src: {
        img_0: {
          type: 'png',
          url: 'https://gw.alicdn.com/imgextra/i2/O1CN01Fi8ma31eWAcqY8pXg_!!6000000003878-2-tps-99-99.png',
        },
        json: {
          type: "json",
          url: "./public/bubbles.json"
        }
      },
      preload: true,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight - 200,
      }),
      new ParticleSystem(),
    ],
  });

  const particlesObject = new GameObject('particlesObject', {
    size: { width: 750, height: 1319 },
    origin: { x: 0, y: 0 },
    position: { x: window.innerWidth / 2, y: window.innerHeight / 3 },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  let emitter = particlesObject.addComponent(
    new Particles({
      resource: 'bubbles',
    }),
  );
  game.scene.addChild(particlesObject);
  emitter.play()
}