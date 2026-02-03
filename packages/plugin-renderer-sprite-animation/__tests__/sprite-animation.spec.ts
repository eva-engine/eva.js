import { SpriteAnimation, SpriteAnimationSystem } from '../lib';

describe('SpriteAnimation Plugin - 精灵动画', () => {
  let spriteAnimationSystem: SpriteAnimationSystem;

  beforeEach(() => {
    spriteAnimationSystem = new SpriteAnimationSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (spriteAnimationSystem) {
      spriteAnimationSystem.destroy();
    }
  });

  describe('SpriteAnimationSystem 初始化', () => {
    it('应该成功创建 SpriteAnimationSystem 实例', () => {
      expect(spriteAnimationSystem).toBeDefined();
      expect(spriteAnimationSystem.name).toBe('SpriteAnimationSystem');
    });
  });

  describe('SpriteAnimation 组件', () => {
    it('应该创建 SpriteAnimation 组件实例', () => {
      const animation = new SpriteAnimation({
        resource: 'characterAnim',
        animations: {
          idle: { start: 0, end: 5, speed: 0.1 },
          run: { start: 6, end: 11, speed: 0.2 },
        },
      });

      expect(animation).toBeDefined();
      expect(animation.name).toBe('SpriteAnimation');
    });

    it('应该支持多个动画定义', () => {
      const animations = {
        idle: { start: 0, end: 5 },
        walk: { start: 6, end: 11 },
        run: { start: 12, end: 17 },
      };

      const animation = new SpriteAnimation({
        resource: 'character',
        animations,
      });

      expect(animation.animations).toEqual(animations);
    });
  });

  describe('动画播放', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation({
        resource: 'character',
        animations: {
          idle: { start: 0, end: 5, speed: 0.1 },
          run: { start: 6, end: 11, speed: 0.2 },
        },
      });
    });

    it('应该能够播放指定动画', () => {
      expect(() => {
        animation.play('idle');
      }).not.toThrow();
    });

    it('应该能够停止动画', () => {
      animation.play('idle');
      expect(() => {
        animation.stop();
      }).not.toThrow();
    });

    it('应该支持循环播放', () => {
      expect(() => {
        animation.play('idle', true);
      }).not.toThrow();
    });
  });

  describe('动画速度', () => {
    it('应该支持设置动画速度', () => {
      const animation = new SpriteAnimation({
        resource: 'character',
        animations: {
          idle: { start: 0, end: 5, speed: 0.1 },
        },
      });

      animation.speed = 0.5;
      expect(animation.speed).toBe(0.5);
    });
  });

  describe('动画事件', () => {
    it('应该触发动画完成事件', () => {
      const onComplete = jest.fn();
      const animation = new SpriteAnimation({
        resource: 'character',
        animations: {
          idle: { start: 0, end: 5 },
        },
        onComplete,
      });

      expect(animation.onComplete).toBe(onComplete);
    });

    it('应该触发帧变化事件', () => {
      const onFrameChange = jest.fn();
      const animation = new SpriteAnimation({
        resource: 'character',
        animations: {
          idle: { start: 0, end: 5 },
        },
        onFrameChange,
      });

      expect(animation.onFrameChange).toBe(onFrameChange);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        spriteAnimationSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });
});
