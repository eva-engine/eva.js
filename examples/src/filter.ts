import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, RESOURCE_TYPE, resource } from '@eva/eva.js';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Filter, FilterSystem } from '@eva/plugin-renderer-filter';

export const name = 'filter';

export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'photo',
      type: RESOURCE_TYPE.IMAGE,
      src: { image: { type: 'jpg', url: '/phaser-assets/pics/akira.jpg' } },
      preload: true,
    },
    {
      name: 'displaceMap',
      type: RESOURCE_TYPE.IMAGE,
      src: { image: { type: 'png', url: '/phaser-assets/textures/distortion5.png' } },
      preload: true,
    },
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({ canvas, width: 750, height: 1000, backgroundColor: 0x202030 }),
      new ImgSystem(),
      new FilterSystem(),
    ],
  });

  const tile = (
    name: string,
    x: number,
    y: number,
    filterSpec: ConstructorParameters<typeof Filter>[0] | null,
  ) => {
    const go = new GameObject(name, {
      position: { x, y },
      anchor: { x: 0.5, y: 0.5 },
      size: { width: 220, height: 220 },
    });
    go.addComponent(new Img({ resource: 'photo' }));
    if (filterSpec) go.addComponent(new Filter(filterSpec));
    game.scene.addChild(go);
    return go;
  };

  // 行 1:原图(对照) / blur / colorMatrix sepia
  tile('original', 130, 200, null);
  tile('blur', 375, 200, { filters: [{ type: 'blur', strength: 12, quality: 4 }] });
  tile('sepia', 620, 200, { filters: [{ type: 'colorMatrix', preset: 'sepia' }] });

  // 行 2:negative / displacement / noise(动画)
  tile('negative', 130, 460, { filters: [{ type: 'colorMatrix', preset: 'negative' }] });
  tile('displace', 375, 460, {
    filters: [{ type: 'displacement', resource: 'displaceMap', scaleX: 80, scaleY: 80 }],
  });
  tile('noise', 620, 460, {
    filters: [{ type: 'noise', noise: 0.6, noiseAnimSpeed: 0.5 }],
  });

  // 行 3:alpha / hue 色相旋转 / 多滤镜叠加(grayscale + blur)
  tile('alpha', 130, 720, { filters: [{ type: 'alpha', alpha: 0.4 }] });
  tile('hue', 375, 720, {
    filters: [{ type: 'colorMatrix', preset: 'hue', presetArg: 120 }],
  });
  const stack = tile('stack', 620, 720, {
    filters: [
      { type: 'colorMatrix', preset: 'grayscale' },
      { type: 'blur', strength: 4, quality: 2 },
    ],
  });

  // @ts-ignore — 验证热更新:把 stack 切成 LSD preset
  window.test = () => {
    const f = stack.getComponent(Filter) as Filter;
    f.filters = [{ type: 'colorMatrix', preset: 'lsd' }];
  };
}
