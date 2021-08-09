import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Graphics, GraphicsSystem } from "@eva/plugin-renderer-graphics";
import { PhysicsSystem, Physics, PhysicsType } from "@eva/plugin-matterjs";
import { Text, TextSystem } from "@eva/plugin-renderer-text";
import { ImgSystem, Img } from "@eva/plugin-renderer-img";
import { EventSystem, Event } from "@eva/plugin-renderer-event";

declare const window: Window & {
  game: Game
}
export const name = 'matter';
export async function init(canvas) {

  let gameHeight = 750 * (window.innerHeight / window.innerWidth);

  const fruitRadius = {
    yingtao: {
      radius: 30,
      next: 'ningmeng',
      grade: 10,
    },
    ningmeng: {
      radius: 56,
      next: 'yezi',
      grade: 20,
    },
    mihoutao: {
      radius: 56,
      next: 'hamigua',
      grade: 20,
    },
    fanqie: {
      radius: 56,
      next: 'hamigua',
      grade: 20,
    },
    danqie: {
      radius: 30,
      grade: 10,
      next: 'chengzi',
    },
    chengzi: {
      radius: 56,
      grade: 20,
      next: 'hamigua',
    },
    yezi: {
      radius: 108,
      grade: 60,
      next: 'xigua',
    },
    hamigua: {
      radius: 100,
      grade: 60,
      next: 'xigua',
    },
    xigua: {
      radius: 146,
      grade: 100,
      next: 'daxigua',
    },
    daxigua: {
      grade: 200,
      radius: 180,
      next: '',
    },
  };
  const canUseType = ['yingtao', 'ningmeng', 'mihoutao', 'fanqie', 'danqie', 'chengzi'];

  let currentFruit = null;
  let currentType = 'yingtao';
  let gradePanel = null;
  const bodyOptions = {
    isStatic: false,
    restitution: 0.4,
    density: 0.002,
  };
  createGame();
  function createGame() {
    resource.addResource([
      {
        name: 'yingtao',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i3/O1CN01RiTyaV1pYQK8i71zv_!!6000000005372-2-tps-30-30.png',
          },
        },
        preload: true,
      },
      {
        name: 'ningmeng',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i2/O1CN01pshzAr24I8TR1vt2e_!!6000000007367-2-tps-56-56.png',
          },
        },
        preload: true,
      },
      {
        name: 'mihoutao',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i2/O1CN01BhgdZQ1r2Tvs3S1W7_!!6000000005573-2-tps-55-55.png',
          },
        },
        preload: true,
      },
      {
        name: 'fanqie',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i4/O1CN010ZcL7r1xz0EcnGC7S_!!6000000006513-2-tps-67-67.png',
          },
        },
        preload: true,
      },
      {
        name: 'danqie',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i1/O1CN01wNvjVh1WHxNjIN8yp_!!6000000002764-2-tps-25-25.png',
          },
        },
        preload: true,
      },
      {
        name: 'chengzi',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i4/O1CN01JFUmPy1Eg5A7IKTuF_!!6000000000380-2-tps-48-48.png',
          },
        },
        preload: true,
      },

      {
        name: 'yezi',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i1/O1CN01WQ9kiI20RyWM3pIuQ_!!6000000006847-2-tps-107-107.png',
          },
        },
        preload: true,
      },

      {
        name: 'hamigua',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i2/O1CN01AREV7q1eZplnDe4NN_!!6000000003886-2-tps-100-100.png',
          },
        },
        preload: true,
      },
      {
        name: 'xigua',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i2/O1CN01B0Hc8G1VFNXOreNub_!!6000000002623-2-tps-146-146.png',
          },
        },
        preload: true,
      },
      {
        name: 'daxigua',
        type: RESOURCE_TYPE.IMAGE,
        src: {
          image: {
            type: 'png',
            url: 'https://gw.alicdn.com/imgextra/i2/O1CN01q6KlMS1evMNxBcapP_!!6000000003933-2-tps-288-280.png',
          },
        },
        preload: true,
      },
    ]);

    const game = new Game({
      autoStart: true,
      frameRate: 70, // 兼容Eva自身bug, 帧率必须大于60
      systems: [
        new RendererSystem({
          transparent: true,
          canvas,
          backgroundColor: 0xfee79d,
          width: 750,
          height: gameHeight,
          resolution: window.devicePixelRatio / 2,
        }),
        new GraphicsSystem(),
        new PhysicsSystem({
          resolution: window.devicePixelRatio / 2, // 保持RendererSystem的resolution一致
          isTest: true, // 是否开启调试模式
          element: document.getElementById('container'), // 调试模式下canvas节点的挂载点
          world: {
            gravity: {
              y: 5, // 重力
            },
          },
        }),
        new TextSystem(),
        new ImgSystem(),
        new EventSystem(),
      ],
    });
    window.game = game;
    // 构建背景
    // 构建背景
    buildGame();
    // 构建墙体
    buildWall();
  }

  function buildGame() {
    const background = new GameObject('background', {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 750,
        height: gameHeight,
      },
    });
    const { graphics } = background.addComponent(new Graphics());
    graphics.beginFill(0xfee79d, 1);
    graphics.drawRect(0, 0, background.transform.size.width, background.transform.size.height);
    graphics.endFill();
    window.game.scene.addChild(background);

    gradePanel = new GameObject('grade', {
      position: {
        x: 50,
        y: 150,
      },
      size: {
        width: 300,
        height: 100,
      },
    });
    gradePanel.addComponent(
      new Text({
        text: '0',
        style: {
          fontSize: 66,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: ['#ffffff'],
        },
      }),
    );

    const backPanel = new GameObject('grade', {
      position: {
        x: 50,
        y: 100,
      },
      size: {
        width: 300,
        height: 100,
      },
    });
    backPanel.addComponent(
      new Text({
        text: '返回',
        style: {
          fontSize: 40,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: ['#ffffff'],
        },
      }),
    );
    const backEvt = backPanel.addComponent(new Event());
    backEvt.on('tap', () => {
      // xsand.goBack();
    });
    window.game.scene.addChild(backPanel);
    window.game.scene.addChild(gradePanel);
    // 创建水果
    currentFruit = randomFruit('yingtao');
    window.game.scene.addChild(currentFruit);
    const evt = background.addComponent(new Event());
    let touched = false;
    const touchmoveFn = e => {
      if (!touched && currentFruit && currentFruit.transform) {
        currentFruit.transform.position.x = e.data.position.x;
      }
    };

    const touchend = () => {
      if (currentFruit && currentFruit.transform) {
        const physics = currentFruit.addComponent(
          new Physics({
            type: PhysicsType.CIRCLE,
            bodyOptions,
            radius: fruitRadius[currentType].radius,
          }),
        );
        physics.on('collisionStart', collisionStartFn);
      }
    };

    evt.on('touchstart', e => {
      // 更新水果的x坐标
      touchmoveFn(e);
      e.stopPropagation();
    });

    evt.on('touchmove', e => {
      // 更新水果的x坐标
      touchmoveFn(e);
      e.stopPropagation();
    });

    evt.on('touchend', e => {
      if (!touched) {
        touched = true;
        touchend();
        setTimeout(() => {
          touched = false;
          newAFruit();
        }, 1000);
      }
      e.stopPropagation();
    });
  }

  function collisionStartFn(gameObjectA, gameObjectB) {
    if (gameObjectA && gameObjectB && gameObjectA.name === gameObjectB.name) {
      const TextCom = gradePanel.getComponent('Text');
      TextCom.text = Number(TextCom.text) + fruitRadius[gameObjectA.name].grade * 2;
      const nextType = fruitRadius[gameObjectA.name].next;
      if (!nextType) {
        return;
      }
      const newFruit = randomFruit(nextType);
      newFruit.transform.position.x = gameObjectA.transform.position.x + gameObjectA.transform.size.width * 0.5;
      newFruit.transform.position.y = gameObjectA.transform.position.y + gameObjectA.transform.size.height * 0.5;
      const physics = newFruit.addComponent(
        new Physics({
          type: PhysicsType.CIRCLE,
          bodyOptions,
          radius: fruitRadius[nextType].radius,
        }),
      );
      // @ts-ignore
      window.game.scene.addChild(newFruit);
      physics.on('collisionStart', collisionStartFn);
      gameObjectA.destroy();
      gameObjectB.destroy();
    }
  }
  function newAFruit() {
    const randomIndex = Math.floor(Math.random() * canUseType.length);
    currentType = canUseType[randomIndex];
    currentFruit = randomFruit(currentType);
    window.game.scene.addChild(currentFruit);
  }
  function randomFruit(type) {
    return buildFruit(type, 375, 150, fruitRadius[type].radius, type);
  }
  function buildWall() {
    const bottomWall = createGameObjectAddGraphicsRect(375, gameHeight - 10, 750, 20, 0xff0000);
    window.game.scene.addChild(bottomWall);
    const leftWall = createGameObjectAddGraphicsRect(0, gameHeight / 2, 10, gameHeight, 0xff0000);
    window.game.scene.addChild(leftWall);
    const rightWall = createGameObjectAddGraphicsRect(750, gameHeight / 2, 10, gameHeight, 0xff0000);
    window.game.scene.addChild(rightWall);
  }
  function createGameObjectAddGraphicsRect(x, y, width, height, color) {
    const gameObject = new GameObject('gameObject', {
      position: {
        x,
        y,
      },
      size: {
        width,
        height,
      },
      origin: {
        x: 0.5,
        y: 0.5,
      },
    });
    const { graphics } = gameObject.addComponent(new Graphics());
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, gameObject.transform.size.width, gameObject.transform.size.height);
    graphics.endFill();
    const py = gameObject.addComponent(
      new Physics({
        type: PhysicsType.RECTANGLE,
        bodyOptions: {
          isStatic: true,
        },
      }),
    );
    return gameObject;
  }

  function buildFruit(name, x, y, radius, type) {
    const gameObject = new GameObject(name, {
      position: {
        x,
        y,
      },
      size: {
        width: 2 * radius,
        height: 2 * radius,
      },
      origin: {
        x: 0.5,
        y: 0.5,
      },
    });
    gameObject.addComponent(
      new Img({
        resource: type,
      }),
    );
    return gameObject;
  }
}