import { Video, VideoSystem } from '../lib';

jest.mock('pixi.js', () => {
  const Sprite = jest.fn().mockImplementation((tex: any) => ({
    texture: tex,
    width: 0,
    height: 0,
    anchor: { set: jest.fn() },
    destroy: jest.fn(),
  }));
  const Texture = {
    from: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), source: { update: jest.fn() } })),
    EMPTY: { id: 'empty' },
  };
  return { Sprite, Texture };
});

describe('Video Plugin', () => {
  describe('Component', () => {
    it('应该使用默认值实例化', () => {
      const c = new Video();
      expect(c.name).toBe('Video');
      expect(c.loop).toBe(false);
      expect(c.autoplay).toBe(true);
      expect(c.muted).toBe(true);
      expect(c.volume).toBe(1);
      expect(c.playbackRate).toBe(1);
      expect(c.anchorX).toBe(0.5);
      expect(c.anchorY).toBe(0.5);
    });

    it('init 应该应用 params', () => {
      const c = new Video();
      c.init({
        src: '/foo.mp4',
        loop: true,
        muted: false,
        volume: 0.5,
        playbackRate: 2,
        width: 480,
        height: 270,
      });
      expect(c.src).toBe('/foo.mp4');
      expect(c.loop).toBe(true);
      expect(c.muted).toBe(false);
      expect(c.volume).toBe(0.5);
      expect(c.playbackRate).toBe(2);
      expect(c.width).toBe(480);
      expect(c.height).toBe(270);
    });

    it('snapshot 在 video 未就绪时返回 null', () => {
      const c = new Video();
      expect(c.snapshot()).toBeNull();
    });

    it('play/pause/setCurrentTime 在无 videoElement 时不抛错', () => {
      const c = new Video();
      expect(() => c.play()).not.toThrow();
      expect(() => c.pause()).not.toThrow();
      expect(() => c.setCurrentTime(5)).not.toThrow();
    });
  });

  describe('System', () => {
    it('systemName 等于 Video', () => {
      expect(VideoSystem.systemName).toBe('Video');
    });

    it('实例化', () => {
      const sys = new VideoSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('Video');
    });
  });
});
