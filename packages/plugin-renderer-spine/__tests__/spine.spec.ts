import { Spine, SpineSystem } from '../lib';

describe('Spine Plugin - Spine 骨骼动画', () => {
  let spineSystem: SpineSystem;

  beforeEach(() => {
    spineSystem = new SpineSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (spineSystem) {
      spineSystem.destroy();
    }
  });

  describe('SpineSystem 初始化', () => {
    it('应该成功创建 SpineSystem 实例', () => {
      expect(spineSystem).toBeDefined();
      expect(spineSystem.name).toBe('SpineSystem');
    });
  });

  describe('Spine 组件', () => {
    it('应该创建 Spine 组件实例', () => {
      const spine = new Spine({
        resource: 'character',
      });

      expect(spine).toBeDefined();
      expect(spine.name).toBe('Spine');
    });

    it('应该支持资源引用', () => {
      const spine = new Spine({
        resource: 'skeleton',
      });

      expect(spine.resource).toBe('skeleton');
    });
  });

  describe('动画播放', () => {
    let spine: Spine;

    beforeEach(() => {
      spine = new Spine({
        resource: 'character',
      });
    });

    it('应该能够播放指定动画', () => {
      expect(() => {
        spine.play('walk');
      }).not.toThrow();
    });

    it('应该能够停止动画', () => {
      spine.play('walk');
      expect(() => {
        spine.stop();
      }).not.toThrow();
    });

    it('应该支持循环播放', () => {
      expect(() => {
        spine.play('idle', true);
      }).not.toThrow();
    });

    it('应该支持动画混合', () => {
      expect(() => {
        spine.play('walk');
        spine.play('run', false, 0.5); // 0.5秒混合时间
      }).not.toThrow();
    });
  });

  describe('动画控制', () => {
    it('应该能够设置动画时间缩放', () => {
      const spine = new Spine({
        resource: 'character',
        timeScale: 1.5,
      });

      expect(spine.timeScale).toBe(1.5);
    });

    it('应该能够暂停动画', () => {
      const spine = new Spine({
        resource: 'character',
      });

      spine.play('walk');
      expect(() => {
        spine.pause();
      }).not.toThrow();
    });

    it('应该能够恢复动画', () => {
      const spine = new Spine({
        resource: 'character',
      });

      spine.play('walk');
      spine.pause();
      expect(() => {
        spine.resume();
      }).not.toThrow();
    });
  });

  describe('换肤功能', () => {
    it('应该支持设置皮肤', () => {
      const spine = new Spine({
        resource: 'character',
        skin: 'default',
      });

      expect(spine.skin).toBe('default');
    });

    it('应该能够动态切换皮肤', () => {
      const spine = new Spine({
        resource: 'character',
      });

      expect(() => {
        spine.setSkin('blue');
      }).not.toThrow();
    });
  });

  describe('动画事件', () => {
    it('应该触发动画开始事件', () => {
      const onStart = jest.fn();
      const spine = new Spine({
        resource: 'character',
        onStart,
      });

      expect(spine.onStart).toBe(onStart);
    });

    it('应该触发动画完成事件', () => {
      const onComplete = jest.fn();
      const spine = new Spine({
        resource: 'character',
        onComplete,
      });

      expect(spine.onComplete).toBe(onComplete);
    });

    it('应该触发自定义事件', () => {
      const onEvent = jest.fn();
      const spine = new Spine({
        resource: 'character',
        onEvent,
      });

      expect(spine.onEvent).toBe(onEvent);
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        spineSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });

  describe('资源管理', () => {
    it('应该正确加载 Spine 资源', () => {
      const spine = new Spine({
        resource: 'character',
      });

      expect(() => {
        spine.load();
      }).not.toThrow();
    });

    it('应该在销毁时清理资源', () => {
      const spine = new Spine({
        resource: 'character',
      });

      expect(() => {
        spine.destroy();
      }).not.toThrow();
    });
  });
});
