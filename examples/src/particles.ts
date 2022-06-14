import { RendererSystem } from "@eva/plugin-renderer";
import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { Particles, ParticleSystem } from "@eva/plugin-renderer-particles";
import { Event, EventSystem, HIT_AREA_TYPE } from "@eva/plugin-renderer-event";
export const name = 'image';
export async function init(canvas) {
  resource.addResource([
    {
      name: 'bubbles',
      type: RESOURCE_TYPE.PARTICLES,
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
      new EventSystem()
    ],
  });

  const particlesObject = new GameObject('particlesObject', {
    size: { width: 0, height: 0 },
    origin: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
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

  const evt = game.scene.addComponent(new Event({
    hitArea: {
      type: HIT_AREA_TYPE.Rect,
      style: {
        x: 0, y: 0,
        width: window.innerWidth,
        height: window.innerHeight - 200,
      }
    }
  }))
  evt.on('touchmove', (e) => {
    // console.log(emitter.emitter)
    // emitter.emitter.ownerPos.set(e.data.position.x, e.data.position.y)
    particlesObject.transform.position = e.data.position
  })

}