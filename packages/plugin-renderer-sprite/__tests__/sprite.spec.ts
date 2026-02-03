import { Sprite, SpriteSystem } from '../lib';

describe('Sprite Plugin - 精灵渲染', () => {
  let spriteSystem: SpriteSystem;

  beforeEach(() => {
    spriteSystem = new SpriteSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (spriteSystem) {
      spriteSystem.destroy();
    }
  });

  describe('SpriteSystem 初始化', () => {
    it('应该成功创建 SpriteSystem 实例', () => {
      expect(spriteSystem).toBeDefined();
      expect(spriteSystem.name).toBe('SpriteSystem');
    });
  });

  describe('Sprite 组件', () => {
    it('应该创建 Sprite 组件实例', () => {
      const sprite = new Sprite({
        resource: 'spriteSheet',
        spriteName: 'character',
      });

      expect(sprite).toBeDefined();
      expect(sprite.name).toBe('Sprite');
    });

    it('应该支持精灵表引用', () => {
      const sprite = new Sprite({
        resource: 'atlas',
        spriteName: 'frame1',
      });

      expect(sprite.resource).toBe('atlas');
      expect(sprite.spriteName).toBe('frame1');
    });
  });

  describe('帧切换', () => {
    it('应该能够切换精灵帧', () => {
      const sprite = new Sprite({
        resource: 'atlas',
        spriteName: 'frame1',
      });

      expect(() => {
        sprite.setSprite('frame2');
      }).not.toThrow();
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        spriteSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });
});
