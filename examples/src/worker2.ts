import { RendererSystem } from '@eva/plugin-renderer';
import { Component, Game, GameObject, RESOURCE_TYPE, UpdateParams, resource } from '@eva/eva.js';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Event, EventSystem, HIT_AREA_TYPE } from '@eva/plugin-renderer-event';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { SpriteSystem } from '@eva/plugin-renderer-sprite';
import { SpriteAnimation, SpriteAnimationSystem } from '@eva/plugin-renderer-sprite-animation';
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine36';
import { NinePatchSystem, NinePatch } from '@eva/plugin-renderer-nine-patch';
import { LottieSystem, Lottie } from '@eva/plugin-renderer-lottie';
import { eventHandler } from '@eva/plugin-worker';

const spineResource = {
  image: 'https://gw.alicdn.com/imgextra/i4/O1CN01AHYeJo24fxNQdlxOm_!!6000000007419-2-tps-553-551.png',
  atlas:
    'https://g.alicdn.com/eva-assets/6f5817dd5a392c6cfbbc03acc2ba8778/0.0.1/tmp/05afd25/8d703ab1-2023-40f4-be69-ec2ed621b1e6.atlas',
  ske: 'https://g.alicdn.com/eva-assets/32e307f6f38e8223b40fac1e3ccebbd0/0.0.1/tmp/953d6ec/c4c3af1b-d4f4-4436-8735-3353a061839c.json',
};

function events(game) {
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

  resource.addResource([
    {
      name: 'Halo',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://gw.alipayobjects.com/os/bmw-prod/61d9cc77-12de-47a7-b6e5-06c836ce7083.json',
        },
      },
    },
    {
      name: 'Red',
      //@ts-ignore
      type: 'LOTTIE',
      src: {
        json: {
          type: 'json',
          url: 'https://gw.alipayobjects.com/os/bmw-prod/e327ad5b-80d6-4d3f-8ffc-a7dd15350648.json',
        },
      },
    },
  ]);

  const image = new GameObject('image', {
    size: { width: 200, height: 200 },
    origin: { x: 0.5, y: 0.5 },
    position: {
      x: 325,
      y: 300,
    },
    anchor: { x: 0.5, y: 0.5 },
  });
  image.addComponent(
    new Img({
      resource: 'heart',
    }),
  );

  const evt = image.addComponent(
    new Event({
      // 使用这个属性设置交互事件可以触发的区域，骨骼动画有所变差，可以临时在当前游戏对象下添加一个同类型同属性的Graphic查看具体点击位置。
      hitArea: {
        // 非必要无需设置
        type: HIT_AREA_TYPE.Polygon,
        style: {
          paths: [109, 48, 161, 21, 194, 63, 193, 104, 65, 176, 8, 86, 38, 40, 90, 33],
        },
      },
    }),
  );

  let touched = false;
  evt.on('touchstart', e => {
    console.log('touchstart', e.data.position.x, e.data.position.y);
    touched = true;
  });
  evt.on('touchend', () => {
    console.log('touchend');
    touched = false;
  });
  evt.on('touchmove', e => {
    if (touched) {
      const transform = e.gameObject.transform;
      transform.position = e.data.position;
    }
  });

  // game.scene.addChild(image);

  const localPosEventGameObject = new GameObject('', {
    position: {
      x: 400,
      y: 700,
    },
    size: {
      width: 1000,
      height: 1000,
    },
    scale: {
      x: 0.25,
      y: 0.5,
    },
    origin: {
      x: 0.5,
      y: 0.5,
    },
    rotation: Math.PI * 0.25,
  });
  const g = localPosEventGameObject.addComponent(new Graphics());
  g.graphics.beginFill(0xff0000).drawRect(0, 0, 1000, 1000).endFill();

  const e = localPosEventGameObject.addComponent(new Event());

  e.on('tap', e => {
    console.log(`LocalPosition: [x: ${e.data.localPosition.x}, y: ${e.data.localPosition.y}]`);
  });
  // game.scene.addChild(localPosEventGameObject);
}

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
    position: {
      x,
      y,
    },
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
  // game.scene.addChild(gameObject);
}

const initEva = async data => {
  const { type, width, height, resolution, canvas } = data;
  resource.addResource([
    {
      name: 'imageName',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
        },
      },
      preload: true,
    },
  ]);
  // @ts-ignore
  const game = new Game();
  // @ts-ignore
  globalThis.game = game;
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width,
        height,
        resolution,
      }),
      new ImgSystem(),
      new TextSystem(),
      new SpriteSystem(),
      new NinePatchSystem(),
      new SpriteAnimationSystem(),
      new SpineSystem(),
      new EventSystem(),
      new GraphicsSystem(),
      new LottieSystem(),
    ],
  });

  const text = new GameObject('text', {
    position: {
      x: 300,
      y: 300,
    },
    origin: {
      x: 0.5,
      y: 0.5,
    },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });

  text.addComponent(
    new Text({
      text: '欢迎使用EVA互动游戏开发体系！',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['red'], // gradient
        fillGradientType: 1,
        fillGradientStops: [0.1, 0.4],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 400,
        breakWords: true,
      },
    }),
  );
  const image = new GameObject('image', {
    size: { width: 200, height: 300 },
    origin: { x: 0.5, y: 0.5 },
    position: {
      x: width / 2,
      y: height / 2,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  image.addComponent(
    new Img({
      resource: 'imageName',
    }),
  );

  // game.scene.addChild(text);
  resource.addResource([
    {
      name: 'nine',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.png',
        },
        json: {
          type: 'json',
          url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.json',
        },
      },
      preload: false,
    },
  ]);

  const patch = new GameObject('patch', {
    size: { width: 360, height: 145 },
    origin: { x: 0, y: 0 },
    position: {
      x: 10,
      y: 10,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });
  patch.addComponent(
    new NinePatch({
      resource: 'nine',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
    }),
  );

  const patch1 = new GameObject('patch1', {
    size: { width: 660, height: 345 },
    origin: { x: 0, y: 0 },
    position: {
      x: 10,
      y: 300,
    },
    anchor: {
      x: 0,
      y: 0,
    },
  });

  patch1.addComponent(
    new NinePatch({
      resource: 'nine',
      leftWidth: 100,
      topHeight: 40,
      rightWidth: 40,
      bottomHeight: 40,
      spriteName: 'waiting_tip.png',
    }),
  );

  resource.addResource([
    {
      name: 'fruit',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'https://gw.alicdn.com/bao/uploaded/TB15pMkkrsTMeJjSszhXXcGCFXa-377-1070.png',
        },
        json: {
          type: 'json',
          url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json',
        },
      },
      preload: false,
    },
  ]);

  const cut = new GameObject('cut', {
    position: { x: 225, y: 400 },
    size: { width: 300, height: 200 },
    origin: { x: 0, y: 0 },
  });

  const frame = cut.addComponent(
    new SpriteAnimation({
      resource: 'fruit',
      speed: 100,
      autoPlay: true,
      forwards: true,
    }),
  );

  resource.addResource([
    {
      name: 'nine',
      type: RESOURCE_TYPE.SPRITE,
      src: {
        image: {
          type: 'png',
          url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.png',
        },
        json: {
          type: 'json',
          url: 'https://dev.g.alicdn.com/eva/hd25-spring-assets/0.0.5/gohome/tp.json',
        },
      },
      preload: false,
    },
  ]);

  frame.play(4);
  frame.on('complete', () => {
    console.log('complete');
  });
  frame.on('loop', () => {
    console.log('loop');
  });
  frame.on('frameChange', () => {
    console.log('frameChange');
  });

  // game.scene.addChild(cut);
  // createGb(game, 200, 200);

  events(game);

  // game.scene.addChild(patch);
  // game.scene.addChild(patch1);

  function createHalo() {
    const halo = new Lottie({ resource: 'Halo' });

    halo.on('complete', () => {
      console.log('halo play complete !');
    });
    halo.play([], { repeats: 0 });

    const haloGameObj = new GameObject('Halo', {
      anchor: {
        x: 0,
        y: 0,
      },
    });
    haloGameObj.addComponent(halo);
    game.scene.addChild(haloGameObj);
  }
  function createRed() {
    const red = new Lottie({ resource: 'Red' });

    // red.on('complete', () => {
    //   console.log('Red play complete !');
    // });

    red.play([], {
      repeats: 0,
      slot: [
        {
          name: '#number',
          type: 'TEXT',
          value: '10',
          style: {
            fontSize: 64,
          },
        },
        {
          name: '#unit',
          type: 'TEXT',
          value: '元',
          style: {
            fontSize: 22,
          },
        },
        {
          name: '#title',
          type: 'TEXT',
          value: '我是主标题',
          style: {
            fontSize: 32,
          },
        },
        {
          name: '#subtitle',
          type: 'TEXT',
          value: '我是副标题',
          style: {
            fontSize: 24,
          },
        },
      ],
    });

    red.onTap('#btn', () => {
      console.log('btn click !');
    });

    const redGameObj = new GameObject('Red', {
      anchor: { x: 0.5, y: 0.3 },
      size: { width: 660, height: 757 },
      origin: { x: 0.5, y: 0.5 },
    });

    redGameObj.addComponent(red);
    game.scene.addChild(redGameObj);
  }

  createHalo();
  createRed();
};

onmessage = async ({ data }) => {
  const { type } = data;
  if (type === 'eva-init') {
    initEva(data);
    globalThis.$canvasRect = data.canvasRect;
  }

  eventHandler(data);
};
