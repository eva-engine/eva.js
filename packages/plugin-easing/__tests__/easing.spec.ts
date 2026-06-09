import { Easing, applyEase } from '../lib';

describe('plugin-easing — 缓动函数库', () => {
  describe('linear', () => {
    it('linear(t) === t', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.linear(0.5)).toBe(0.5);
      expect(Easing.linear(1)).toBe(1);
    });
  });

  describe('端点稳定性', () => {
    const names = Object.keys(Easing) as (keyof typeof Easing)[];
    for (const name of names) {
      it(`${name}(0) ≈ 0 && ${name}(1) ≈ 1`, () => {
        const fn = Easing[name];
        expect(fn(0)).toBeCloseTo(0, 5);
        expect(fn(1)).toBeCloseTo(1, 5);
      });
    }
  });

  describe('单调性 / 形状', () => {
    it('easeInQuad 在 t=0.5 处低于 linear', () => {
      expect(Easing.easeInQuad(0.5)).toBeLessThan(Easing.linear(0.5));
    });
    it('easeOutQuad 在 t=0.5 处高于 linear', () => {
      expect(Easing.easeOutQuad(0.5)).toBeGreaterThan(Easing.linear(0.5));
    });
    it('easeInOutCubic 在 t=0.5 处恰好 0.5', () => {
      expect(Easing.easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    });
    it('easeOutBack(0.5) 大于 1 后再回落(over-shoot)', () => {
      // easeOutBack 0~1 区间内会出现 > 1 的瞬时值
      const samples = [0.55, 0.6, 0.65, 0.7];
      const overShoot = samples.some((t) => Easing.easeOutBack(t) > 1);
      expect(overShoot).toBe(true);
    });
  });

  describe('applyEase', () => {
    it('未传 name 时返回 t 本身', () => {
      expect(applyEase(undefined, 0.5)).toBe(0.5);
    });
    it('未知 name 时退化为 t(防御性容错)', () => {
      // @ts-expect-error 故意传不存在的 name
      expect(applyEase('nope', 0.5)).toBe(0.5);
    });
    it('已知 name 等价于直接调用', () => {
      expect(applyEase('easeInQuad', 0.5)).toBeCloseTo(Easing.easeInQuad(0.5), 10);
    });
  });
});
