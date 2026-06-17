import { Stats, StatsSystem } from '../lib';
import StatsClass from '../lib/Stats';
import { BaseHooks } from '../lib/hooks/BaseHooks';
import { GLHook } from '../lib/hooks/GLHook';
import { TextureHook } from '../lib/hooks/TextureHook';

// jsdom 不实现 canvas.getContext('2d');stats.js Panel 需要它绘制图表。
// 这里返回一个最小 stub,让 Stats 工厂能跑通。
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = function getContextStub(): any {
    return {
      font: '',
      textBaseline: '',
      fillStyle: '',
      globalAlpha: 1,
      fillRect: () => {},
      fillText: () => {},
      drawImage: () => {},
    };
  };
});

/**
 * 构造一个最小的 mock GL 上下文。
 * stats.js / GLHook / TextureHook 仅需 prototype 上的 drawElements / createTexture / deleteTexture。
 */
function makeMockGL() {
  const proto = {
    drawElements(_mode: any, _count: any, _type: any, _offset: any) {
      return undefined;
    },
    createTexture() {
      return { __mockTexture: true, id: Math.random() };
    },
    deleteTexture(_tex: any) {
      return undefined;
    },
  };
  // 用 Object.create 让 __proto__ 能被替换(GLHook/TextureHook 修改 _gl.__proto__)
  return Object.create(proto);
}

/**
 * 构造一个 fake RendererSystem,带 application.renderer.gl,供 StatsSystem.init 使用
 */
function makeMockRendererSystem(gl: any) {
  return {
    name: 'Renderer',
    application: {
      renderer: { gl },
    },
  };
}

describe('plugin-stats', () => {
  // 隔离 dom,避免多个测试 stats panel 累积
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('StatsSystem 基础', () => {
    it('能实例化,name 为 Stats', () => {
      const sys = new StatsSystem();
      expect(sys).toBeDefined();
      // System.name 来自 static systemName
      expect((sys as any).name).toBe('Stats');
    });

    it('init({ show: false }) 不报错,也不去拿 gl', () => {
      const sys = new StatsSystem();
      // init 实现里无论 show 是否,都会读 renderSystem.application,所以必须给个 stub
      (sys as any).game = {
        getSystem: () => ({ application: undefined }),
      };
      expect(() => sys.init({ show: false })).not.toThrow();
      expect(sys.show).toBe(false);
      expect(sys.hook).toBeUndefined();
    });

    it('init({ show: true }) 在有 RendererSystem + gl 时构造 hook', () => {
      const sys = new StatsSystem();
      const gl = makeMockGL();
      (sys as any).game = {
        getSystem: (name: string) => (name === 'Renderer' ? makeMockRendererSystem(gl) : undefined),
      };
      sys.init({ show: true });
      expect(sys.show).toBe(true);
      expect(sys.hook).toBeInstanceOf(BaseHooks);
      // 释放 hook 以免污染下一测试 prototype
      (sys.hook as BaseHooks).release();
    });
  });

  describe('Stats 工厂(stats.js)', () => {
    it('调用 Stats() 返回带 dom / showPanel / begin / end 的对象', () => {
      const inst = StatsClass({ width: 20, height: 12, x: 0, y: 0 });
      expect(inst).toBeDefined();
      expect(inst.dom).toBeInstanceOf(HTMLElement);
      expect(typeof inst.showPanel).toBe('function');
      expect(typeof inst.begin).toBe('function');
      expect(typeof inst.end).toBe('function');
      // 至少有 4 个面板:FPS / MS / DrawCall / TC,可能再加 MB
      expect(inst.dom.children.length).toBeGreaterThanOrEqual(4);
    });

    it('showPanel(0/1/2) 切换可见面板', () => {
      const inst = StatsClass({ width: 20, height: 12, x: 0, y: 0 });
      inst.showPanel(0);
      const children = inst.dom.children;
      expect((children[0] as HTMLElement).style.display).toBe('block');
      // 其他面板应该被隐藏
      for (let i = 1; i < children.length; i++) {
        expect((children[i] as HTMLElement).style.display).toBe('none');
      }
      inst.showPanel(1);
      expect((children[0] as HTMLElement).style.display).toBe('none');
      expect((children[1] as HTMLElement).style.display).toBe('block');
      inst.showPanel(2);
      expect((children[2] as HTMLElement).style.display).toBe('block');
    });

    it('begin / end 调用顺序更新 frame 计数,不抛异常', () => {
      const inst = StatsClass({ width: 20, height: 12, x: 0, y: 0 });
      inst.begin(performance.now());
      const t = inst.end(undefined);
      expect(typeof t).toBe('number');
      // update 把 begin 重置
      expect(() => inst.update()).not.toThrow();
    });
  });

  describe('GLHook', () => {
    it('attach 后拦截 drawElements,drawPasses 计数递增', () => {
      const gl = makeMockGL();
      const hook = new GLHook(gl);
      expect(hook.isInit).toBe(true);
      expect(hook.drawPasses).toBe(0);
      gl.drawElements(0, 0, 0, 0);
      gl.drawElements(0, 0, 0, 0);
      expect(hook.drawPasses).toBe(2);
      hook.reset();
      expect(hook.drawPasses).toBe(0);
      hook.release();
      expect(hook.isInit).toBe(false);
    });

    it('未传 gl 时 console.error,不构造钩子', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const hook = new GLHook();
      expect(hook.isInit).toBe(false);
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });
  });

  describe('TextureHook', () => {
    it('attach 后拦截 createTexture / deleteTexture,统计 currentTextureCount', () => {
      const gl = makeMockGL();
      const hook = new TextureHook(gl);
      expect(hook.isInit).toBe(true);
      expect(hook.currentTextureCount).toBe(0);
      const a = gl.createTexture();
      const b = gl.createTexture();
      expect(hook.currentTextureCount).toBe(2);
      expect(hook.maxTexturesCount).toBe(2);
      gl.deleteTexture(a);
      expect(hook.currentTextureCount).toBe(1);
      // maxTexturesCount 不会下降
      expect(hook.maxTexturesCount).toBe(2);
      hook.reset();
      expect(hook.currentTextureCount).toBe(0);
      expect(hook.maxTexturesCount).toBe(0);
      // release 会 console.log,做静默
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      hook.release();
      expect(hook.isInit).toBe(false);
      logSpy.mockRestore();
      // 未 release 的 b 不要再操作
      void b;
    });
  });

  describe('BaseHooks 综合', () => {
    it('attach 之后 drawCalls / texturesCount 通过 GLHook/TextureHook 反映', () => {
      const gl = makeMockGL();
      const hooks = new BaseHooks();
      hooks.attach(gl);
      expect(hooks.drawCalls).toBe(0);
      gl.drawElements(0, 0, 0, 0);
      expect(hooks.drawCalls).toBe(1);

      // deltaDrawCalls 第一次返回 0 + 初始化 _drawCalls
      const firstDelta = hooks.deltaDrawCalls;
      expect(firstDelta).toBe(0);

      gl.drawElements(0, 0, 0, 0);
      gl.drawElements(0, 0, 0, 0);
      expect(hooks.deltaDrawCalls).toBe(2);
      expect(hooks.maxDeltaDrawCalls).toBeGreaterThanOrEqual(2);

      gl.createTexture();
      expect(hooks.texturesCount).toBe(1);
      expect(hooks.maxTextureCount).toBe(1);

      hooks.reset();
      expect(hooks.maxDeltaDrawCalls).toBe(-1);

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      hooks.release();
      logSpy.mockRestore();
    });

    it('未 attach 时 drawCalls = -1, texturesCount = 0', () => {
      const hooks = new BaseHooks();
      expect(hooks.drawCalls).toBe(-1);
      expect(hooks.texturesCount).toBe(0);
      expect(hooks.maxTextureCount).toBe(0);
      // release 不抛
      expect(() => hooks.release()).not.toThrow();
    });
  });

  describe('Stats 组件', () => {
    it('能实例化,name 为 Stats', () => {
      const c = new Stats();
      expect((c as any).name).toBe('Stats');
    });

    it('update 没有 stats 时不抛', () => {
      const c = new Stats();
      expect(() => c.update()).not.toThrow();
    });

    it('update 在有 stats 时会调用 begin', () => {
      const c = new Stats();
      const begin = jest.fn();
      (c as any).stats = { begin };
      c.update();
      expect(begin).toHaveBeenCalled();
    });
  });

  describe('show:false 时的生命周期保护', () => {
    it('start/lateUpdate 在 show:false 时不创建 panel,不抛异常', () => {
      const sys = new StatsSystem();
      (sys as any).game = {
        getSystem: () => ({ application: undefined }),
        scene: {
          addComponent: jest.fn(),
        },
      };
      sys.init({ show: false });

      // start / lateUpdate 都受 show:false 短路保护
      expect(() => sys.start()).not.toThrow();
      expect(sys.stats).toBeUndefined();
      expect((sys as any).game.scene.addComponent).not.toHaveBeenCalled();

      expect(() => sys.lateUpdate()).not.toThrow();
    });

    it('show:true + 完整 mock 时 start 会向 scene 添加 StatsComponent 并挂 dom', () => {
      const sys = new StatsSystem();
      const gl = makeMockGL();
      const fakeComponent: any = {};
      const addComponent = jest.fn().mockImplementation((c: any) => {
        // Game 内部 addComponent 接受 instance,返回 instance
        Object.assign(fakeComponent, c);
        return fakeComponent;
      });
      (sys as any).game = {
        getSystem: (name: string) => (name === 'Renderer' ? makeMockRendererSystem(gl) : undefined),
        scene: { addComponent },
      };

      sys.init({ show: true });
      sys.start();

      expect(addComponent).toHaveBeenCalledTimes(1);
      expect(sys.stats).toBeDefined();
      // dom 已挂入 body
      expect(document.body.contains(sys.stats.dom)).toBe(true);

      // lateUpdate 正常调用 stats.end(hook)
      expect(() => sys.lateUpdate()).not.toThrow();

      // 释放 hook 还原 prototype
      (sys.hook as BaseHooks).release();
    });
  });

  describe('plugin 默认导出', () => {
    it('default export 有 Components / Systems', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../lib').default;
      expect(mod).toBeDefined();
      expect(mod.Components).toContain(Stats);
      expect(mod.Systems).toContain(StatsSystem);
    });
  });
});
