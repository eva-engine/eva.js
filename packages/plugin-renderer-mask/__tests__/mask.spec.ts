import { Mask, MaskSystem } from '../lib';

describe('Mask Plugin - 遮罩功能', () => {
  let maskSystem: MaskSystem;

  beforeEach(() => {
    maskSystem = new MaskSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (maskSystem) {
      maskSystem.destroy();
    }
  });

  describe('MaskSystem 初始化', () => {
    it('应该成功创建 MaskSystem 实例', () => {
      expect(maskSystem).toBeDefined();
      expect(maskSystem.name).toBe('MaskSystem');
    });
  });

  describe('Mask 组件', () => {
    it('应该创建 Mask 组件实例', () => {
      const mask = new Mask({
        type: 'rect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      expect(mask).toBeDefined();
      expect(mask.name).toBe('Mask');
    });

    it('应该支持矩形遮罩', () => {
      const mask = new Mask({
        type: 'rect',
        x: 10,
        y: 10,
        width: 200,
        height: 150,
      });

      expect(mask.type).toBe('rect');
    });

    it('应该支持圆形遮罩', () => {
      const mask = new Mask({
        type: 'circle',
        x: 50,
        y: 50,
        radius: 30,
      });

      expect(mask.type).toBe('circle');
    });

    it('应该支持精灵遮罩', () => {
      const mask = new Mask({
        type: 'sprite',
        resource: 'maskImage',
      });

      expect(mask.type).toBe('sprite');
    });
  });

  describe('遮罩类型', () => {
    it('应该正确设置矩形遮罩属性', () => {
      const mask = new Mask({
        type: 'rect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      expect(mask.x).toBe(0);
      expect(mask.y).toBe(0);
      expect(mask.width).toBe(100);
      expect(mask.height).toBe(100);
    });

    it('应该正确设置圆形遮罩属性', () => {
      const mask = new Mask({
        type: 'circle',
        x: 50,
        y: 50,
        radius: 25,
      });

      expect(mask.x).toBe(50);
      expect(mask.y).toBe(50);
      expect(mask.radius).toBe(25);
    });
  });

  describe('遮罩应用', () => {
    it('应该能够启用遮罩', () => {
      const mask = new Mask({
        type: 'rect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        enabled: true,
      });

      expect(mask.enabled).toBe(true);
    });

    it('应该能够禁用遮罩', () => {
      const mask = new Mask({
        type: 'rect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        enabled: false,
      });

      expect(mask.enabled).toBe(false);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        maskSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('遮罩销毁', () => {
    it('应该正确清理遮罩资源', () => {
      const mask = new Mask({
        type: 'rect',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      expect(() => {
        mask.destroy();
      }).not.toThrow();
    });
  });
});
