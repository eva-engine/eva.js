import { Graphics, GraphicsSystem } from '../lib';

describe('Graphics Plugin - 图形绘制', () => {
  let graphicsSystem: GraphicsSystem;

  beforeEach(() => {
    graphicsSystem = new GraphicsSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (graphicsSystem) {
      graphicsSystem.destroy();
    }
  });

  describe('GraphicsSystem 初始化', () => {
    it('应该成功创建 GraphicsSystem 实例', () => {
      expect(graphicsSystem).toBeDefined();
      expect(graphicsSystem.name).toBe('Graphics');
    });
  });

  describe('Graphics 组件', () => {
    it('应该创建 Graphics 组件实例', () => {
      const graphics = new Graphics();
      graphics.init();

      expect(graphics).toBeDefined();
      expect(graphics.name).toBe('Graphics');
      expect(graphics.graphics).toBeDefined();
    });
  });

  describe('图形绘制', () => {
    it('应该支持绘制矩形', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.rect(0, 0, 100, 100);
      graphics.graphics.fill('#ff0000');

      expect(graphics.graphics).toBeDefined();
    });

    it('应该支持绘制圆形', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.circle(50, 50, 25);
      graphics.graphics.fill('#00ff00');

      expect(graphics.graphics).toBeDefined();
    });

    it('应该支持绘制线条', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.moveTo(0, 0);
      graphics.graphics.lineTo(100, 100);
      graphics.graphics.stroke({ width: 2, color: '#0000ff' });

      expect(graphics.graphics).toBeDefined();
    });

    it('应该支持绘制多边形', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.poly([0, 0, 50, 100, 100, 0]);
      graphics.graphics.fill('#ffff00');

      expect(graphics.graphics).toBeDefined();
    });
  });

  describe('样式设置', () => {
    it('应该支持填充颜色', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.rect(0, 0, 100, 100);
      graphics.graphics.fill('#ffffff');

      expect(graphics.graphics).toBeDefined();
    });

    it('应该支持描边样式', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.rect(0, 0, 100, 100);
      graphics.graphics.stroke({ width: 3, color: '#000000' });

      expect(graphics.graphics).toBeDefined();
    });

    it('应该支持透明度', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.circle(50, 50, 25);
      graphics.graphics.fill({ color: '#ff0000', alpha: 0.5 });

      expect(graphics.graphics).toBeDefined();
    });
  });

  describe('动态绘制', () => {
    it('应该能够清空图形', () => {
      const graphics = new Graphics();
      graphics.init();

      graphics.graphics.rect(0, 0, 100, 100);
      graphics.graphics.fill('#ff0000');
      graphics.graphics.clear();

      expect(graphics.graphics).toBeDefined();
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        graphicsSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });
});
