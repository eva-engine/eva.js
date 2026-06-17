import { Filter, FilterSystem } from '../lib';
import type { FilterSpec } from '../lib';

// 局部覆盖全局 pixi mock — 全局 mock 不包含 *Filter,这里加一遍最小骨架,
// 同时把 ColorMatrix 的 17 个 preset 方法都 stub 出来用于断言。
jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');

  class MockBaseFilter {
    destroyed = false;
    enabled = true;
    destroy() {
      this.destroyed = true;
    }
  }

  class BlurFilter extends MockBaseFilter {
    strength: number;
    quality: number;
    strengthX?: number;
    strengthY?: number;
    constructor(opts: any = {}) {
      super();
      this.strength = opts.strength;
      this.quality = opts.quality;
      if (opts.strengthX != null) this.strengthX = opts.strengthX;
      if (opts.strengthY != null) this.strengthY = opts.strengthY;
    }
  }

  class ColorMatrixFilter extends MockBaseFilter {
    matrix: number[] | null = null;
    // preset 调用记录:每个方法一次性 spy
    public _calls: Array<{ name: string; args: any[] }> = [];
    private _spy(name: string) {
      return (...args: any[]) => {
        this._calls.push({ name, args });
      };
    }
    sepia = this._spy('sepia');
    greyscale = this._spy('greyscale');
    negative = this._spy('negative');
    polaroid = this._spy('polaroid');
    vintage = this._spy('vintage');
    lsd = this._spy('lsd');
    predator = this._spy('predator');
    kodachrome = this._spy('kodachrome');
    browni = this._spy('browni');
    technicolor = this._spy('technicolor');
    blackAndWhite = this._spy('blackAndWhite');
    tint = this._spy('tint');
    saturate = this._spy('saturate');
    brightness = this._spy('brightness');
    contrast = this._spy('contrast');
    hue = this._spy('hue');
    night = this._spy('night');
  }

  class DisplacementFilter extends MockBaseFilter {
    sprite: any;
    scale: { x: number; y: number };
    constructor(opts: any = {}) {
      super();
      this.sprite = opts.sprite;
      this.scale = opts.scale ?? { x: 0, y: 0 };
    }
  }

  class NoiseFilter extends MockBaseFilter {
    noise: number;
    seed: number;
    constructor(opts: any = {}) {
      super();
      this.noise = opts.noise;
      this.seed = opts.seed;
    }
  }

  class AlphaFilter extends MockBaseFilter {
    alpha: number;
    constructor(opts: any = {}) {
      super();
      this.alpha = opts.alpha;
    }
  }

  return {
    ...pixi,
    BlurFilter,
    ColorMatrixFilter,
    DisplacementFilter,
    NoiseFilter,
    AlphaFilter,
  };
});

// 拿到 mock 之后再 import 工厂以便断言:此处不 import,直接通过 system 走 componentChanged 路径,
// 同时为 enum 测试单独引用工厂源码(它们在 system 内部被 import,这里也单独导一份)。
import { createBlurFilter } from '../lib/filters/blur';
import { createColorMatrixFilter } from '../lib/filters/colorMatrix';
import { createAlphaFilter } from '../lib/filters/alpha';
import { createNoiseFilter } from '../lib/filters/noise';
import { createDisplacementFilter } from '../lib/filters/displacement';
import {
  BlurFilter,
  ColorMatrixFilter,
  AlphaFilter,
  NoiseFilter,
  DisplacementFilter,
} from 'pixi.js';

// ---- 帮手:伪造 ContainerManager + GameObject + ComponentChanged ----
type FakeContainer = {
  filters: any;
  filterArea: any;
};
function makeContainer(): FakeContainer {
  return { filters: null, filterArea: null };
}

// Filter 组件的 init 不在 constructor 里被调用,真实链路在 GameObject.addComponent 中触发。
// 测试场景下直接 new + 手动 init,语义和 ECS 里把组件挂上对象时一致。
function makeFilter(params?: any): Filter {
  const f = new Filter(params);
  f.init?.(params);
  return f;
}

function makeFilterSystem(container: FakeContainer, id = 1) {
  const sys = new FilterSystem();
  // 短路 init:直接挂上 containerManager,不跑真正的 RendererSystem。
  (sys as any).containerManager = {
    getContainer: (gid: number) => (gid === id ? container : null),
  };
  return sys;
}

function dispatchChange(
  sys: FilterSystem,
  type: 'ADD' | 'CHANGE' | 'REMOVE',
  component: Filter,
  id = 1,
) {
  (sys as any).componentChanged({
    componentName: 'Filter',
    type,
    component,
    gameObject: { id },
  });
}

// ============================================================
// 测试用例
// ============================================================
describe('Filter Plugin - PixiJS 滤镜组件', () => {
  describe('FilterType 枚举完整性', () => {
    it('FilterSpec.type 必须覆盖 5 类:blur / colorMatrix / displacement / noise / alpha', () => {
      // 编译期类型只要在这里赋值不报错,就证明 5 类都被 union 覆盖。
      const all: FilterSpec[] = [
        { type: 'blur' },
        { type: 'colorMatrix' },
        { type: 'displacement' },
        { type: 'noise' },
        { type: 'alpha' },
      ];
      expect(all.map((s) => s.type).sort()).toEqual(
        ['alpha', 'blur', 'colorMatrix', 'displacement', 'noise'].sort(),
      );
    });
  });

  describe('Filter 组件 init', () => {
    it('应该把 filters / filterArea 解析到组件字段', () => {
      const params = {
        filters: [
          { type: 'blur', strength: 4 } as FilterSpec,
          { type: 'alpha', alpha: 0.5 } as FilterSpec,
        ],
        filterArea: { x: 1, y: 2, width: 3, height: 4 },
      };
      const filter = new Filter(params);
      // init 在真实运行时由 GameObject.addComponent 调用,这里手动模拟
      filter.init(params);
      expect(filter.name).toBe('Filter');
      expect(filter.filters).toHaveLength(2);
      expect(filter.filters[0].type).toBe('blur');
      expect(filter.filterArea).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it('未传参时 filters 为空数组、filterArea 为 null', () => {
      const filter = new Filter();
      expect(filter.filters).toEqual([]);
      expect(filter.filterArea).toBeNull();
    });
  });

  describe('FilterSystem ADD / CHANGE / REMOVE 流转', () => {
    it('ADD:应该把 spec 实例化为 PIXI 滤镜并写到 container.filters', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [
          { type: 'blur', strength: 6 },
          { type: 'alpha', alpha: 0.3 },
        ],
      });

      dispatchChange(sys, 'ADD', filter);

      expect(container.filters).toHaveLength(2);
      expect(container.filters[0]).toBeInstanceOf(BlurFilter);
      expect(container.filters[1]).toBeInstanceOf(AlphaFilter);
    });

    it('CHANGE:再次触发应该 destroy 旧滤镜并替换为新滤镜', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [{ type: 'blur', strength: 6 }],
      });

      dispatchChange(sys, 'ADD', filter);
      const oldFilter = container.filters[0];
      expect(oldFilter.destroyed).toBe(false);

      // 修改 filters 列表后再触发 CHANGE
      filter.filters = [{ type: 'noise', noise: 0.7, seed: 0.2 }];
      dispatchChange(sys, 'CHANGE', filter);

      expect(oldFilter.destroyed).toBe(true);
      expect(container.filters).toHaveLength(1);
      expect(container.filters[0]).toBeInstanceOf(NoiseFilter);
    });

    it('REMOVE:应该清空 container.filters / filterArea 并 destroy 已绑定滤镜', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [{ type: 'blur', strength: 3 }],
        filterArea: { x: 0, y: 0, width: 100, height: 100 },
      });

      dispatchChange(sys, 'ADD', filter);
      const blur = container.filters[0];
      expect(container.filterArea).toEqual({ x: 0, y: 0, width: 100, height: 100 });

      dispatchChange(sys, 'REMOVE', filter);

      expect(blur.destroyed).toBe(true);
      expect(container.filters).toBeNull();
      expect(container.filterArea).toBeNull();
    });

    it('非 Filter 组件变更应该被 system 忽略', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      (sys as any).componentChanged({
        componentName: 'NotFilter',
        type: 'ADD',
        component: new Filter(),
        gameObject: { id: 1 },
      });
      expect(container.filters).toBeNull();
    });

    it('container 不存在时不应该抛错', () => {
      const sys = new FilterSystem();
      (sys as any).containerManager = { getContainer: () => null };
      const filter = makeFilter({ filters: [{ type: 'blur' }] });
      expect(() => dispatchChange(sys, 'ADD', filter)).not.toThrow();
    });
  });

  describe('enabled toggle', () => {
    it('enabled === false 的 spec 不应该被实例化', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [
          { type: 'blur', strength: 1, enabled: false },
          { type: 'alpha', alpha: 0.5, enabled: true },
          { type: 'noise', noise: 0.1 }, // 默认启用
        ],
      });

      dispatchChange(sys, 'ADD', filter);

      expect(container.filters).toHaveLength(2);
      expect(container.filters[0]).toBeInstanceOf(AlphaFilter);
      expect(container.filters[1]).toBeInstanceOf(NoiseFilter);
    });
  });

  describe('filterArea', () => {
    it('应该把 filterArea 写到 container.filterArea', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [{ type: 'blur' }],
        filterArea: { x: 10, y: 20, width: 30, height: 40 },
      });

      dispatchChange(sys, 'ADD', filter);

      expect(container.filterArea).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });

    it('未提供 filterArea 时 container.filterArea 应该被设为 null', () => {
      const container = makeContainer();
      // 先模拟之前已经设置了某个 filterArea
      container.filterArea = { x: 1, y: 1, width: 1, height: 1 };
      const sys = makeFilterSystem(container);

      const filter = makeFilter({ filters: [{ type: 'alpha', alpha: 1 }] });
      dispatchChange(sys, 'ADD', filter);

      expect(container.filterArea).toBeNull();
    });
  });

  describe('Blur 参数', () => {
    it('createBlurFilter 应该使用默认 strength=8 / quality=4', () => {
      const f = createBlurFilter({ type: 'blur' }) as any;
      expect(f).toBeInstanceOf(BlurFilter);
      expect(f.strength).toBe(8);
      expect(f.quality).toBe(4);
      expect(f.strengthX).toBeUndefined();
      expect(f.strengthY).toBeUndefined();
    });

    it('blurX / blurY 应该映射到 PIXI strengthX / strengthY', () => {
      const f = createBlurFilter({ type: 'blur', strength: 2, quality: 3, blurX: 5, blurY: 7 }) as any;
      expect(f.strength).toBe(2);
      expect(f.quality).toBe(3);
      expect(f.strengthX).toBe(5);
      expect(f.strengthY).toBe(7);
    });
  });

  describe('ColorMatrix preset 17 个枚举值', () => {
    // 需要 presetArg 的(用 default presetArg=1):greyscale / predator / tint / saturate / brightness / contrast / hue / night
    // hue 特殊:实参 = arg * 360
    const cases: Array<{ preset: any; method: string; arg?: any }> = [
      { preset: 'sepia', method: 'sepia' },
      { preset: 'grayscale', method: 'greyscale', arg: 1 },
      { preset: 'negative', method: 'negative' },
      { preset: 'polaroid', method: 'polaroid' },
      { preset: 'vintage', method: 'vintage' },
      { preset: 'lsd', method: 'lsd' },
      { preset: 'predator', method: 'predator', arg: 1 },
      { preset: 'kodachrome', method: 'kodachrome' },
      { preset: 'browni', method: 'browni' },
      { preset: 'technicolor', method: 'technicolor' },
      { preset: 'blackAndWhite', method: 'blackAndWhite' },
      { preset: 'tint', method: 'tint', arg: 1 },
      { preset: 'saturate', method: 'saturate', arg: 1 },
      { preset: 'brightness', method: 'brightness', arg: 1 },
      { preset: 'contrast', method: 'contrast', arg: 1 },
      { preset: 'hue', method: 'hue', arg: 360 }, // arg(默认 1) * 360
      { preset: 'night', method: 'night', arg: 1 },
    ];

    it('17 个 preset 都应该派发到对应方法', () => {
      for (const c of cases) {
        const cm: any = createColorMatrixFilter({ type: 'colorMatrix', preset: c.preset });
        expect(cm).toBeInstanceOf(ColorMatrixFilter);
        const calls = cm._calls as Array<{ name: string; args: any[] }>;
        expect(calls.length).toBe(1);
        expect(calls[0].name).toBe(c.method);
        if (c.arg !== undefined) {
          expect(calls[0].args[0]).toBe(c.arg);
          // 第二个参数固定 true(multiply)
          expect(calls[0].args[1]).toBe(true);
        } else {
          expect(calls[0].args[0]).toBe(true);
        }
      }
    });

    it('presetArg 应该改写默认参数;hue 走 arg*360', () => {
      const cm: any = createColorMatrixFilter({ type: 'colorMatrix', preset: 'hue', presetArg: 0.5 });
      expect(cm._calls[0].name).toBe('hue');
      expect(cm._calls[0].args[0]).toBe(180);

      const cm2: any = createColorMatrixFilter({
        type: 'colorMatrix',
        preset: 'brightness',
        presetArg: 0.7,
      });
      expect(cm2._calls[0].args[0]).toBe(0.7);
    });

    it('matrix(20 项)优先于 preset:应该跳过所有 preset 调用并直接赋值', () => {
      const matrix = Array.from({ length: 20 }, (_, i) => i / 10);
      const cm: any = createColorMatrixFilter({
        type: 'colorMatrix',
        matrix,
        preset: 'sepia',
      });
      expect(cm.matrix).toEqual(matrix);
      expect(cm._calls).toHaveLength(0);
    });

    it('matrix 长度不足 20 时应该走 preset 分支', () => {
      const cm: any = createColorMatrixFilter({
        type: 'colorMatrix',
        matrix: [1, 2, 3],
        preset: 'sepia',
      });
      expect(cm._calls).toHaveLength(1);
      expect(cm._calls[0].name).toBe('sepia');
    });

    it('未指定 preset 也未传 matrix 时:返回的滤镜不调用任何 preset 方法', () => {
      const cm: any = createColorMatrixFilter({ type: 'colorMatrix' });
      expect(cm._calls).toHaveLength(0);
    });
  });

  describe('Alpha / Noise / Displacement 工厂', () => {
    it('createAlphaFilter 默认 alpha=1', () => {
      const f = createAlphaFilter({ type: 'alpha' }) as any;
      expect(f).toBeInstanceOf(AlphaFilter);
      expect(f.alpha).toBe(1);
    });

    it('createAlphaFilter 透传 alpha', () => {
      const f = createAlphaFilter({ type: 'alpha', alpha: 0.25 }) as any;
      expect(f.alpha).toBe(0.25);
    });

    it('createNoiseFilter 默认 noise=0.5,seed 是数字', () => {
      const f = createNoiseFilter({ type: 'noise' }) as any;
      expect(f).toBeInstanceOf(NoiseFilter);
      expect(f.noise).toBe(0.5);
      expect(typeof f.seed).toBe('number');
    });

    it('createNoiseFilter 透传 noise / seed', () => {
      const f = createNoiseFilter({ type: 'noise', noise: 0.9, seed: 0.123 }) as any;
      expect(f.noise).toBe(0.9);
      expect(f.seed).toBe(0.123);
    });

    it('createDisplacementFilter 没有 resource 时 sprite 用空 Texture 兜底', () => {
      const f = createDisplacementFilter({ type: 'displacement' }) as any;
      expect(f).toBeInstanceOf(DisplacementFilter);
      expect(f.sprite).toBeDefined();
      expect(f.scale).toEqual({ x: 20, y: 20 });
    });

    it('createDisplacementFilter 透传 scaleX / scaleY', () => {
      const f = createDisplacementFilter({
        type: 'displacement',
        scaleX: 5,
        scaleY: 9,
      }) as any;
      expect(f.scale).toEqual({ x: 5, y: 9 });
    });
  });

  describe('Noise 动画 seed', () => {
    it('noiseAnimSpeed 设置时 update 应该改写 PIXI 滤镜的 seed', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [{ type: 'noise', noise: 0.4, seed: 0, noiseAnimSpeed: 2 }],
      });
      dispatchChange(sys, 'ADD', filter);

      const noiseFilter = container.filters[0];
      const seedBefore = noiseFilter.seed;
      // 跑 5 帧 16ms,应该让 seed 变成 (5*0.016*2) % 1 = 0.16
      for (let i = 0; i < 5; i++) {
        sys.update({ deltaTime: 16 } as any);
      }
      expect(noiseFilter.seed).not.toBe(seedBefore);
      expect(noiseFilter.seed).toBeCloseTo(0.16, 5);
    });

    it('未设置 noiseAnimSpeed 时 update 不会修改 seed', () => {
      const container = makeContainer();
      const sys = makeFilterSystem(container);
      const filter = makeFilter({
        filters: [{ type: 'noise', noise: 0.2, seed: 0.7 }],
      });
      dispatchChange(sys, 'ADD', filter);

      const noiseFilter = container.filters[0];
      const seedBefore = noiseFilter.seed;
      sys.update({ deltaTime: 16 } as any);
      expect(noiseFilter.seed).toBe(seedBefore);
    });
  });
});
