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
  });
});
