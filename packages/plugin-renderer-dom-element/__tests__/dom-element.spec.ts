import { DOMElement, DOMElementSystem } from '../lib';

describe('DOMElement Plugin', () => {
  describe('Component', () => {
    it('应该使用默认值实例化', () => {
      const c = new DOMElement();
      expect(c.name).toBe('DOMElement');
      expect(c.element).toBe('div');
      expect(c.anchorX).toBe(0.5);
      expect(c.anchorY).toBe(0.5);
      expect(c.pointerEvents).toBe('auto');
    });

    it('init 应该应用 params', () => {
      const c = new DOMElement();
      c.init({
        html: '<button>OK</button>',
        className: 'foo',
        cssText: 'color:red',
        width: 100,
        height: 40,
        anchorX: 0,
        anchorY: 0,
        style: { background: 'blue' },
        attrs: { 'data-id': '42' },
      });
      expect(c.html).toBe('<button>OK</button>');
      expect(c.className).toBe('foo');
      expect(c.cssText).toBe('color:red');
      expect(c.width).toBe(100);
      expect(c.height).toBe(40);
      expect(c.anchorX).toBe(0);
      expect(c.style).toEqual({ background: 'blue' });
      expect(c.attrs).toEqual({ 'data-id': '42' });
    });
  });

  describe('System', () => {
    it('systemName 等于 DOMElement', () => {
      expect(DOMElementSystem.systemName).toBe('DOMElement');
    });

    it('实例化', () => {
      const sys = new DOMElementSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('DOMElement');
    });

    describe('onPause / onResume', () => {
      let sys: any;
      let rafSpy: jest.SpyInstance;
      let cancelSpy: jest.SpyInstance;

      beforeEach(() => {
        sys = new DOMElementSystem();
        rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 42 as any);
        cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined);
      });

      afterEach(() => {
        rafSpy.mockRestore();
        cancelSpy.mockRestore();
      });

      it('onPause 取消未完成的 syncRafId 并置 0', () => {
        sys.domLayer = {} as any;
        sys.syncRafId = 7;
        sys.onPause();
        expect(cancelSpy).toHaveBeenCalledWith(7);
        expect(sys.syncRafId).toBe(0);
      });

      it('onPause 后 startLayerSyncLoop 是空操作,不再发起 RAF', () => {
        sys.domLayer = {} as any;
        sys.onPause();
        rafSpy.mockClear();
        sys.startLayerSyncLoop();
        expect(rafSpy).not.toHaveBeenCalled();
        expect(sys.syncRafId).toBe(0);
      });

      it('onResume 在 domLayer 存在时重启 sync loop', () => {
        sys.domLayer = {} as any;
        sys.onPause();
        rafSpy.mockClear();
        sys.onResume();
        expect(rafSpy).toHaveBeenCalledTimes(1);
      });

      it('onResume 在 domLayer 缺失时不发起 RAF(避免空启动)', () => {
        sys.onPause();
        rafSpy.mockClear();
        sys.onResume();
        expect(rafSpy).not.toHaveBeenCalled();
      });

      it('多次 onPause 幂等,不会反复 cancel 已清零的 id', () => {
        sys.domLayer = {} as any;
        sys.syncRafId = 11;
        sys.onPause();
        sys.onPause();
        // 第二次 syncRafId 已为 0,守卫确保不 cancel
        expect(cancelSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
