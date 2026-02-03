import { Img, ImgSystem } from '../lib';
import { Sprite, Texture } from 'pixi.js';

// Mock PixiJS
jest.mock('pixi.js', () => ({
  Sprite: jest.fn().mockImplementation(() => ({
    texture: null,
    anchor: { set: jest.fn() },
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    destroy: jest.fn(),
  })),
  Texture: {
    from: jest.fn(),
    EMPTY: {},
  },
}));

describe('Img Plugin - 图片渲染', () => {
  let imgSystem: ImgSystem;

  beforeEach(() => {
    imgSystem = new ImgSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (imgSystem) {
      imgSystem.destroy();
    }
  });

  describe('ImgSystem 初始化', () => {
    it('应该成功创建 ImgSystem 实例', () => {
      expect(imgSystem).toBeDefined();
      expect(imgSystem.name).toBe('ImgSystem');
    });

    it('应该正确初始化图片系统', () => {
      const mockGame = {
        scene: {
          gameObjects: [],
        },
      };

      expect(() => {
        imgSystem.init(mockGame as any);
      }).not.toThrow();
    });
  });

  describe('Img 组件', () => {
    it('应该创建 Img 组件实例', () => {
      const img = new Img({
        resource: 'testImage',
      });

      expect(img).toBeDefined();
      expect(img.name).toBe('Img');
    });

    it('应该支持资源引用', () => {
      const resource = 'player.png';
      const img = new Img({
        resource,
      });

      expect(img.resource).toBe(resource);
    });

    it('应该支持锚点设置', () => {
      const img = new Img({
        resource: 'testImage',
        anchor: { x: 0.5, y: 0.5 },
      });

      expect(img.anchor).toEqual({ x: 0.5, y: 0.5 });
    });
  });

  describe('图片加载', () => {
    it('应该正确加载图片资源', () => {
      const img = new Img({
        resource: 'loadTest',
      });

      expect(() => {
        img.load();
      }).not.toThrow();
    });

    it('应该处理加载错误', () => {
      const img = new Img({
        resource: 'nonexistent',
      });

      expect(() => {
        img.load();
      }).not.toThrow();
    });
  });

  describe('图片缩放', () => {
    it('应该支持宽度设置', () => {
      const img = new Img({
        resource: 'testImage',
        width: 200,
      });

      expect(img.width).toBe(200);
    });

    it('应该支持高度设置', () => {
      const img = new Img({
        resource: 'testImage',
        height: 200,
      });

      expect(img.height).toBe(200);
    });

    it('应该支持同时设置宽高', () => {
      const img = new Img({
        resource: 'testImage',
        width: 200,
        height: 150,
      });

      expect(img.width).toBe(200);
      expect(img.height).toBe(150);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        imgSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('组件销毁', () => {
    it('应该正确清理图片资源', () => {
      const img = new Img({
        resource: 'testImage',
      });

      expect(() => {
        img.destroy();
      }).not.toThrow();
    });
  });
});
