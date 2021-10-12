import { Game, GameObject, resource, RESOURCE_TYPE } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { Img, ImgSystem } from "@eva/plugin-renderer-img";

export const name = 'compressed-texture-mipmap';
export async function init(canvas: HTMLCanvasElement) {
  const input = document.createElement('input');
  input.value = '100';
  let currentValue = Number(input.value);
  input.type = 'number';
  input.oninput = () => {
    if (currentValue === Number(input.value)) return;
    currentValue = Number(input.value)
    if (currentValue < 1) return;
    refresh();
  }
  input.style.position = 'fixed';
  input.style.top = '5vw';
  input.style.right = '5vw';
  let image = document.createElement('div');
  image.style.position = 'fixed';
  image.style.top = '15vw';
  image.style.right = '50px';
  image.style.transformOrigin = 'right top';
  document.body.appendChild(input);
  document.body.appendChild(image);

  resource.addResource([
    {
      name: 'base',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: './block.png',
          texture: [
            {
              type: 'astc',
              url: './block.astc.ktx'
            },
            {
              type: 'etc',
              url: './block.etc.ktx'
            },
            {
              type: 'pvrtc',
              url: './block.pvrtc.ktx'
            },
            {
              type: 's3tc',
              url: './block.s3tc.ktx'
            }
          ]
        },
      },
      preload: false,
    },
    {
      name: 'mipmap',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: './block.png',
          texture: [
            {
              type: 'astc',
              url: './block.mipmap.astc.ktx'
            },
            {
              type: 'etc',
              url: './block.mipmap.etc.ktx'
            },
            {
              type: 'pvrtc',
              url: './block.mipmap.pvrtc.ktx'
            },
            {
              type: 's3tc',
              url: './block.mipmap.s3tc.ktx'
            }
          ]
        },
      },
      preload: false,
    }
  ]);
  const game = new Game({
    systems: [
      new RendererSystem({
        width: window.innerWidth,
        height: window.innerHeight,
        canvas,
        antialias: true,
        preserveDrawingBuffer: true
      }),
      new ImgSystem()
    ]
  });
  let width = currentValue;
  let g1 = new GameObject('', {
    size: {
      width,
      height: width
    },
    position: {
      x: 0,
      y: 0
    }
  });
  g1.addComponent(new Img({
    resource: 'base'
  }))
  game.scene.addChild(g1);

  let g2 = new GameObject('', {
    size: {
      width,
      height: width
    },
    position: {
      x: 0,
      y: width + 10
    }
  });
  g2.addComponent(new Img({
    resource: 'mipmap'
  }))
  game.scene.addChild(g2);
  await resource.getResource('mipmap');
  requestAnimationFrame(refresh);
  function refresh() {
    g1.transform.size.width = currentValue;
    g1.transform.size.height = currentValue;
    g2.transform.size.width = currentValue;
    g2.transform.size.height = currentValue;
    g2.transform.position.y = currentValue + 10;
    setTimeout(() => {
      image.style.width = currentValue + 'px';
      image.style.height = 10 + currentValue * 2 + 'px';
      image.style.background = `url(${canvas.toDataURL()}) no-repeat left top`;
      image.style.transform = `scale(${200 / (currentValue + 5)})`;
    }, 100)
  }
}