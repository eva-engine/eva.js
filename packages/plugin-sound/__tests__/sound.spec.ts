import { Sound, SoundSystem } from '../lib';
import { sound } from '@pixi/sound';

// Mock @pixi/sound
jest.mock('@pixi/sound', () => ({
  sound: {
    add: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    volume: jest.fn(),
    exists: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  },
  Sound: jest.fn(),
}));

describe('Sound Plugin', () => {
  let soundSystem: SoundSystem;

  beforeEach(() => {
    soundSystem = new SoundSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (soundSystem) {
      soundSystem.destroy();
    }
  });

  describe('SoundSystem 初始化', () => {
    it('应该成功创建 SoundSystem 实例', () => {
      expect(soundSystem).toBeDefined();
      expect(soundSystem.name).toBe('Sound');
    });

    it('应该正确初始化音频系统', () => {
      const mockGame = {
        scene: {
          gameObjects: [],
        },
      };

      expect(() => {
        soundSystem.init(mockGame as any);
      }).not.toThrow();
    });
  });

  describe('Sound 组件', () => {
    it('应该创建 Sound 组件实例', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
      });

      expect(soundComponent).toBeDefined();
      expect(soundComponent.name).toBe('Sound');
    });

    it('应该支持自动播放配置', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
        autoplay: true,
      });

      expect(soundComponent).toBeDefined();
    });

    it('应该支持循环播放配置', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
        loop: true,
      });

      expect(soundComponent).toBeDefined();
    });

    it('应该支持音量设置', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
        volume: 0.5,
      });

      expect(soundComponent).toBeDefined();
    });
  });

  describe('音频播放控制', () => {
    let soundComponent: Sound;

    beforeEach(() => {
      soundComponent = new Sound({
        resource: 'testSound',
      });
    });

    it('应该能够播放音频', () => {
      soundComponent.play();
      expect(sound.play).toHaveBeenCalled();
    });

    it('应该能够停止音频', () => {
      soundComponent.stop();
      expect(sound.stop).toHaveBeenCalled();
    });

    it('应该能够暂停音频', () => {
      soundComponent.pause();
      expect(sound.pause).toHaveBeenCalled();
    });

    it('应该能够恢复播放', () => {
      soundComponent.resume();
      expect(sound.resume).toHaveBeenCalled();
    });
  });

  describe('音量控制', () => {
    it('应该能够设置音量', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
      });

      soundComponent.volume = 0.8;
      expect(soundComponent.volume).toBe(0.8);
    });

    it('音量应该在 0-1 范围内', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
      });

      soundComponent.volume = 1.5;
      expect(soundComponent.volume).toBeLessThanOrEqual(1);

      soundComponent.volume = -0.5;
      expect(soundComponent.volume).toBeGreaterThanOrEqual(0);
    });
  });

  describe('资源管理', () => {
    it('应该正确加载音频资源', () => {
      const soundComponent = new Sound({
        resource: 'bgMusic',
      });

      expect(soundComponent.config.resource).toBe('bgMusic');
    });

    it('应该在销毁时清理资源', () => {
      const soundComponent = new Sound({
        resource: 'testSound',
      });

      expect(() => {
        soundComponent.onDestroy();
      }).not.toThrow();
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        soundSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('多音频管理', () => {
    it('应该支持同时播放多个音频', () => {
      const sound1 = new Sound({ resource: 'sound1' });
      const sound2 = new Sound({ resource: 'sound2' });

      sound1.play();
      sound2.play();

      expect(sound.play).toHaveBeenCalledTimes(2);
    });
  });
});
