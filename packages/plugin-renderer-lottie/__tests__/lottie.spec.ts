import { Lottie, LottieSystem } from '../lib';

describe('Lottie Plugin - Lottie 动画', () => {
  let lottieSystem: LottieSystem;

  beforeEach(() => {
    lottieSystem = new LottieSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (lottieSystem) {
      lottieSystem.destroy();
    }
  });

  describe('LottieSystem 初始化', () => {
    it('应该成功创建 LottieSystem 实例', () => {
      expect(lottieSystem).toBeDefined();
      expect(lottieSystem.name).toBe('LottieSystem');
    });
  });

  describe('Lottie 组件', () => {
    it('应该创建 Lottie 组件实例', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
      });

      expect(lottie).toBeDefined();
      expect(lottie.name).toBe('Lottie');
    });

    it('应该支持自动播放', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
        autoplay: true,
      });

      expect(lottie.autoplay).toBe(true);
    });

    it('应该支持循环播放', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
        loop: true,
      });

      expect(lottie.loop).toBe(true);
    });
  });

  describe('动画控制', () => {
    let lottie: Lottie;

    beforeEach(() => {
      lottie = new Lottie({
        resource: 'lottieAnimation',
      });
    });

    it('应该能够播放动画', () => {
      expect(() => {
        lottie.play();
      }).not.toThrow();
    });

    it('应该能够暂停动画', () => {
      lottie.play();
      expect(() => {
        lottie.pause();
      }).not.toThrow();
    });

    it('应该能够停止动画', () => {
      lottie.play();
      expect(() => {
        lottie.stop();
      }).not.toThrow();
    });

    it('应该能够跳转到指定帧', () => {
      expect(() => {
        lottie.goToFrame(10);
      }).not.toThrow();
    });
  });

  describe('动画速度', () => {
    it('应该能够设置播放速度', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
        speed: 1.5,
      });

      expect(lottie.speed).toBe(1.5);
    });

    it('应该支持动态修改速度', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
      });

      lottie.speed = 2.0;
      expect(lottie.speed).toBe(2.0);
    });
  });

  describe('动画事件', () => {
    it('应该支持完成事件回调', () => {
      const onComplete = jest.fn();
      const lottie = new Lottie({
        resource: 'lottieAnimation',
        onComplete,
      });

      expect(lottie.onComplete).toBe(onComplete);
    });

    it('应该支持循环事件回调', () => {
      const onLoopComplete = jest.fn();
      const lottie = new Lottie({
        resource: 'lottieAnimation',
        onLoopComplete,
      });

      expect(lottie.onLoopComplete).toBe(onLoopComplete);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        lottieSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('资源加载', () => {
    it('应该正确加载 Lottie JSON 数据', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
      });

      expect(() => {
        lottie.load();
      }).not.toThrow();
    });
  });

  describe('组件销毁', () => {
    it('应该正确清理 Lottie 资源', () => {
      const lottie = new Lottie({
        resource: 'lottieAnimation',
      });

      expect(() => {
        lottie.destroy();
      }).not.toThrow();
    });
  });
});
