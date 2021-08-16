import { Game, GameObject, resource, RESOURCE_TYPE, Component, System } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
export const name = 'component';
export async function init(canvas) {

  class Move extends Component<{ speed: { x: number, y: number } }> {
    static componentName = 'Move';
    speed = {
      // 移动速度
      x: 100,
      y: 200,
    };
    oldSpeed: { x: number, y: number }
    init(obj) {
      Object.assign(this, obj);
      console.log('component init');
    }
    awake() {
      console.log('component awake');
    }
    start() {
      console.log('component start');
    }
    update(e) {
      // 每秒 N 像素
      // console.log(e)
      const position = this.gameObject.transform.position;
      this.gameObject.transform.position.x += this.speed.x * (e.deltaTime / 1000);
      this.gameObject.transform.position.y += this.speed.y * (e.deltaTime / 1000);
      if (position.x >= 750 || position.x <= 0) {
        this.speed.x = -this.speed.x;
      }
      if (position.y >= 1000 || position.y <= 0) {
        this.speed.y = -this.speed.y;
      }
    }
    onPause() {
      this.oldSpeed = this.speed;
      this.speed = {
        x: 0,
        y: 0,
      };
    }
    onResume() {
      this.speed = this.oldSpeed;
    }
  }

  class DemoSystem extends System {
    init() {
      console.log('system init');
    }
    awake() {
      console.log('system awake');
    }
    start() {
      console.log('system start');
    }
    update() {
      // console.log()
    }
    onPause() {
      console.log('system onPause');
    }
    onResume() {
      console.log('system onResume');
    }
  }

  resource.addResource([
    {
      name: 'heart',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '//gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
        },
      },
      preload: false,
    },
  ]);

  const game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
    ],
  });
  game.addSystem(new DemoSystem());
  {
    const image = new GameObject('image', {
      size: { width: 200, height: 200 },
      origin: { x: 0.5, y: 0.5 },
      position: {
        x: 0,
        y: 0,
      },
    });
    image.addComponent(
      new Img({
        resource: 'heart',
      }),
    );

    game.scene.addChild(image);

    image.addComponent(
      new Move({
        speed: {
          x: 250,
          y: 200,
        },
      }),
    );
  }
  {
    const image = new GameObject('image', {
      size: { width: 200, height: 200 },
      origin: { x: 0.5, y: 0.5 },
      position: {
        x: 300,
        y: 300,
      },
    });
    image.addComponent(
      new Img({
        resource: 'heart',
      }),
    );

    game.scene.addChild(image);

    image.addComponent(
      new Move({
        speed: {
          x: 250,
          y: 200,
        },
      }),
    );
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  });
}