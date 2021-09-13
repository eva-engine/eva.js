import { DragonBone } from '@eva/plugin-renderer-dragonbone';
import { DragonBoneSystem } from '@eva/plugin-renderer-dragonbone';
import { Spine } from '@eva/plugin-renderer-spine';
import { SpineSystem } from '@eva/plugin-renderer-spine';
import { TextSystem } from '@eva/plugin-renderer-text';
import { Text } from '@eva/plugin-renderer-text';
import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { SpriteAnimationSystem, SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";
import { Img, ImgSystem } from '@eva/plugin-renderer-img';

export const name = 'compressed-texture-animation';
let game: Game;
export async function init(canvas: HTMLCanvasElement) {

  canvas.style.height = '133vw';
  game = new Game({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      new ImgSystem(),
      new SpriteAnimationSystem(),
      new TextSystem(),
      new SpineSystem(),
      new DragonBoneSystem()
    ],
  });
  loadTitle('sprite animation', 200, 350);
  loadTitle('spine', 550, 350);
  loadTitle('dragonbone', 200, 750);
  loadSpriteAnimation();
  loadSpine();
  loadDragonbone();
  loadBackground();
}
async function loadBackground() {
  resource.addResource([{
    name: 'back',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: './back.png',
        texture: [{
          type: 'pvrtc',
          url: './back.pvrtc.ktx'
        },{
          type: 'etc',
          url: './back.etc.ktx'
        },{
          type: 'astc',
          url: './back.astc.ktx'
        }]
      }
    }
  }])
  let go = new GameObject('image', {
    size: {
      width: 750,
      height: 1000
    }
  })
  go.addComponent(new Img({
    resource: 'back'
  }))
  game.scene.addChild(go)


  const res = await resource.getResource('back')
  console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);
}
function loadTitle(title: string, x: number, y: number) {
  let go = new GameObject('title', {
    position: {
      x, y
    },
    origin: {
      x: .5,
      y: .5
    },
  });
  let text = new Text({
    text: title,
    style: {
      fontSize: 30,
      fill: 0x55eeff
    }
  });
  go.addComponent(text);
  game.scene.addChild(go);
}
async function loadSpriteAnimation() {
  resource.addResource([
    {
      name: 'fruit',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'cut',
          texture: [
            {
              type: 'pvrtc',
              url: './cut.pvrtc.ktx',
              size: {
                width: 377,
                height: 1070
              }
            },
            {
              type: 'astc',
              url: './cut.astc.ktx'
            },
            {
              type: 'etc',
              url: './cut.etc.ktx'
            },
            {
              type: 's3tc',
              url: './cut.s3tc.ktx'
            }
          ]
        },
        json: {
          type: 'json',
          url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json',
        },
      },
      preload: false,
    }, {
      name: 'fruit1',
      type: RESOURCE_TYPE.SPRITE_ANIMATION,
      src: {
        image: {
          type: 'png',
          url: 'cut',
          texture: [
            {
              type: 'astc',
              url: './cut.astc.ktx'
            },
            {
              type: 'etc',
              url: './cut.etc.ktx'
            },
            {
              type: 'pvrtc',
              url: './cut.astc.ktx',
              size: {
                width: 377,
                height: 1070
              }
            },
            {
              type: 's3tc',
              url: './cut.s3tc.ktx'
            }
          ]
        },
        json: {
          type: 'json',
          url: 'https://gw.alicdn.com/mt/TB1qCvumsyYBuNkSnfoXXcWgVXa.json',
        },
      },
      preload: false,
    },
  ]);
  {
    const cut = new GameObject('cut', {
      position: { x: 40, y: 80 },
      size: { width: 300, height: 200 },
      origin: { x: 0, y: 0 },
    });

    const frame = cut.addComponent(
      new SpriteAnimation({
        resource: 'fruit',
        speed: 100,
        autoPlay: true,
      }),
    );

    frame.play();

    game.scene.addChild(cut);
    const res = await resource.getResource('fruit')
    console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);

  }
  {
    const cut = new GameObject('cut', {
      position: { x: 40, y: 280 },
      size: { width: 300, height: 200 },
      origin: { x: 0, y: 0 },
    });

    const frame = cut.addComponent(
      new SpriteAnimation({
        resource: 'fruit1',
        speed: 100,
        autoPlay: true,
      }),
    );

    frame.play();

    game.scene.addChild(cut);
    const res = await resource.getResource('fruit1')
    console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);

  }
  // const res = await resource.getResource('fruit');
  // console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);
}

async function loadSpine() {
  resource.addResource([
    {
      name: 'anim',
      type: RESOURCE_TYPE.SPINE,
      src: {
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b5fdf74313d5ff2609ab82f6b6fd83e6.json',
        },
        atlas: {
          type: 'atlas',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/spine/b8597f298a5d6fe47095d43ef03210d4.atlas',
        },
        image: {
          type: 'png',
          url: './cat.png',
          texture: [
            {
              type: 'astc',
              url: './cat.astc.ktx'
            },
            {
              type: 'etc',
              url: './cat.etc.ktx'
            },
            {
              type: 's3tc',
              url: './cat.s3tc.ktx'
            }
          ]
        },
      },
      preload: true
    },
  ]);
  let gameObject = new GameObject('spine', {
    scale: {
      x: 0.3,
      y: 0.3,
    },
    position: {
      x: 550,
      y: 300
    },
  });
  //@ts-ignore
  const spine = new Spine({ resource: 'anim', animationName: 'idle', autoPlay: true });
  gameObject.addComponent(spine);
  spine.play('idle');
  game.scene.addChild(gameObject);

  const res = await resource.getResource('anim');
  console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);
}

async function loadDragonbone() {
  resource.addResource([
    {
      name: 'dragonbone',
      type: RESOURCE_TYPE.DRAGONBONE,
      src: {
        image: {
          type: 'png',
          url: './plane.png',
          texture: [
            {
              type: 'etc',
              url: './plane.etc.ktx'
            },
            {
              type: 'astc',
              url: './plane.astc.ktx'
            },
            {
              type: 's3tc',
              url: './plane.s3tc.ktx'
            }
          ]
        },
        tex: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/fb18baf3a1af41a88f9d1a4426d47832.json',
        },
        ske: {
          type: 'json',
          url: 'https://g.alicdn.com/eva-assets/eva-assets-examples/0.0.2/dragonbone/c904e6867062e21123e1a44d2be2a0bf.json',
        },
      },
      preload: true,
    },
  ]);


  // dragonbone 的 origin 是失效的，将会按照dragonbone设计时的坐标重点定位
  const dragonBone = new GameObject('db', {
    position: {
      x: 200,
      y: 550
    }
  });

  const db = dragonBone.addComponent(
    new DragonBone({
      resource: 'dragonbone',
      armatureName: 'armatureName',
      autoPlay: true,
      animationName: 'newAnimation'
    }),
  );

  db.play('newAnimation');
  game.scene.addChild(dragonBone);
  const res = await resource.getResource('dragonbone');
  console.log(res.name, res.src.image.type, res.src.image.url, res.data.image);
}