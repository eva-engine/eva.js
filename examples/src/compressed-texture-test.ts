export const name = '压缩纹理各个格式测试';
import { RESOURCE_TYPE } from "@eva/eva.js";
import { GameObject, Game, resource } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Spine, SpineSystem } from "@eva/plugin-renderer-spine";
import { Text, TextSystem } from "@eva/plugin-renderer-text";
import { EventSystem, Event } from "@eva/plugin-renderer-event";

export const init = async (canvas: HTMLCanvasElement) => {
  const game = new Game({
    systems: [
      new RendererSystem({
        width: 750,
        height: 1443,
        canvas,
        antialias: true
      }),
      new SpineSystem(),
      new TextSystem(),
      new EventSystem()
    ]
  });
  const formats = [
    ['ASTC_4x4', 'astc'],
    ['ASTC_5x5', 'astc'],
    ['ASTC_6x6', 'astc'],
    ['ASTC_6x5', 'astc'],
    ['ASTC_8x5', 'astc'],
    ['ASTC_8x6', 'astc'],
    ['ASTC_8x8', 'astc'],
    ['ASTC_10x5', 'astc'],
    ['ASTC_10x6', 'astc'],
    ['ASTC_10x8', 'astc'],
    ['ASTC_10x10', 'astc'],
    ['ASTC_12x10', 'astc'],
    ['ASTC_12x12', 'astc'],
    ['ETC2_RGBA', 'etc'],
    ['ETC2_RGB', 'etc'],
    ['PVRTC1_4', 'pvrtc'],
    ['PVRTC1_2', 'pvrtc'],
    ['PVRTC1_2_RGB', 'pvrtc'],
    ['PVRTC1_4_RGB', 'pvrtc'],
    // DXT5资源使用的是未预乘alpha的资源，显示有问题，可忽略。
    ['DXT5', 's3tc']
  ]
  const baseUrl = 'https://g.alicdn.com/eva-assets/b6b6c01a0b7128fcdfb03c009c8247ae/0.0.1/pub3/';
  //@ts-ignore
  window.resource = resource
  resource.addResource(formats.map(([format, type]) => ({
    name: format,
    type: RESOURCE_TYPE.SPINE,
    src: {
      ske: {
        type: 'json',
        url: '/spine/dance-cat/1.json',
      },
      atlas: {
        type: 'atlas',
        url: '/spine/dance-cat/1.atlas',
      },
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/tfs/TB1V5.qk0Tfau8jSZFwXXX1mVXa-601-601.png',
        texture: {
          type,
          url: `${baseUrl}base.mipmap.${format.toLowerCase()}.ktx`
        }
      },
    },
    preload: true
  })));
  resource.preload();
  let i = 0.5;
  for (const [format] of formats) {
    let { data: { image } } = await resource.getResource(format);
    const support = !(image instanceof HTMLImageElement);
    let go = new GameObject(format, {
      position: {
        x: 730,
        y: 50 * i++
      },
      origin: {
        x: 1,
        y: 0
      },
    });
    go.addComponent(new Text({
      text: format,
      style: {
        fill: support ? 0x00ffff : 0x555555,
        fontSize: 24,
        fontWeight: 'bold'
      }
    }));
    const event = go.addComponent(new Event());
    support && event.on('tap', _ => {
      show(format);
    })
    game.scene.addChild(go);
  }

  const cat = new GameObject('show', {
    position: {
      x: 300,
      y: 600
    },
    scale: {
      x: 1.8,
      y: 1.8
    }
  });
  game.scene.addChild(cat);

  const tip = new GameObject('tip', {
    position: {
      x: 300,
      y: 800
    },
    origin: {
      x: .5,
      y: .5
    }
  });
  const text = tip.addComponent(new Text({
    text: '',
    style: {
      fill: [0xff0000, 0xffff00, 0x00ff00],
      fillGradientType: 1,
      fontSize: 40
    }
  }))
  game.scene.addChild(tip);

  function show(format: string) {
    cat.removeComponent(Spine);
    text.text = 'Now: ' + format;
    cat.addComponent(new Spine({
      animationName: 'pk2',
      resource: format,
      autoPlay: true
    }));
  }

  //@ts-ignore
  show(formats.find((f) => !((resource.resourcesMap[f[0]]).data.image instanceof HTMLImageElement))[0]);

}