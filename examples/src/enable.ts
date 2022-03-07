import { Game, GameObject, resource, RESOURCE_TYPE, Component, System } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";
export const name = 'Enable';
export async function init(canvas) {

  class Move extends Component<{ speed: { x: number, y: number }, myName: string }> {
    static componentName = 'Move';
    myName = ''

    speed = {
      // 移动速度
      x: 100,
      y: 200,
    };
    oldSpeed: { x: number, y: number }
    init(obj) {
      Object.assign(this, obj);
      console.log('init', this.myName);
    }
    onEnable() {
      console.log('onEnable', this.myName)
    }
    onDisable(): void {
      console.log('onDisable', this.myName)
    }
    awake() {
      console.log('awake', this.myName);
    }
    start() {
      console.log('start', this.myName);
    }
    update(e) {
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

  //   class DemoSystem extends System {
  //     init() {
  //       console.log('system init');
  //     }
  //     awake() {
  //       console.log('system awake');
  //     }
  //     start() {
  //       console.log('system start');
  //     }
  //     update() {
  //       // console.log()
  //     }
  //     onPause() {
  //       console.log('system onPause');
  //     }
  //     onResume() {
  //       console.log('system onResume');
  //     }
  //   }

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
  window.game = game
  //   game.addSystem(new DemoSystem());
  {
    const image = new GameObject('image', {
      size: { width: 200, height: 200 },
      origin: { x:0, y:0 },
      position: {
        x: 0,
        y: 0,
      },
    });
    window.image = image
    image.addComponent(
      new Move({
        speed: {
          x: 250,
          y: 200,
        },
        myName: 'aaa'
      }),
    )

    image.addComponent(
      new Img({
        resource: 'heart'
      })
    )

    game.scene.addChild(image)
    const image1 = new GameObject('image1', {
      size: { width: 200, height: 200 },
      origin: { x: 0, y: 0 },
      position: {
        x: 100,
        y: 100,
      },
    });

    image1.addComponent(
      new Img({
        resource: 'heart'
      })
    )
    image.addChild(image1);

    image1.addComponent(
      new Move({
        speed: {
          x: 250,
          y: 200,
        },
        myName: 'bbb'
      }),
    )

    setTimeout(() => {
      image.setActive(false)
      console.log('0 0')
    }, 1000)

    setTimeout(() => {
      image1.setActive(false)
      console.log('0 0')
    }, 1500)
    
    setTimeout(() => {
      image.setActive(true)
      console.log('1 0')
    }, 2000)

    setTimeout(() => {
      image.setActive(false)
      console.log('0 0')
    }, 2500)

    setTimeout(() => {
      try {
        image1.setActive(true)
      } catch(e) {
        console.error(e)
      }
      console.log('error')
    }, 3000)

    setTimeout(() => {
      image.setActive(true)
      console.log('1 0')
    }, 3500)

    setTimeout(() => {
      image1.setActive(true)
      console.log('1 1')
    }, 4000)

    setTimeout(() => {
      image.setActive(false)
      console.log('0 0')
    }, 4500)

    setTimeout(() => {
      image.setActive(true)
      console.log('1 1')
    }, 5000)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  });
}