import { GameObject } from '@eva/eva.js';
import { CanvasLayer, CanvasLayerSystem } from '../lib';

describe('plugin-canvas-layer — 渲染层级声明', () => {
  describe('CanvasLayer 组件', () => {
    it('init 解析参数,默认值合理', () => {
      const c = new CanvasLayer();
      c.init({ name: 'ui-hud', zIndex: 100 });
      expect(c.layerName).toBe('ui-hud');
      expect(c.zIndex).toBe(100);
      expect(c.screenSpace).toBe(false);
    });

    it('screenSpace 透传', () => {
      const c = new CanvasLayer();
      c.init({ name: 'modal', zIndex: 1000, screenSpace: true });
      expect(c.screenSpace).toBe(true);
    });

    it('init 不传参 OK', () => {
      const c = new CanvasLayer();
      expect(() => c.init()).not.toThrow();
    });

    it('awake 把元数据写到 transform 上', () => {
      const go = new GameObject('hud');
      const c = new CanvasLayer();
      go.addComponent(c);
      c.init({ name: 'ui-hud', zIndex: 50, screenSpace: true });
      c.awake();
      const t = go.transform as any;
      expect(t._canvasLayerName).toBe('ui-hud');
      expect(t._canvasLayerZ).toBe(50);
      expect(t._screenSpace).toBe(true);
    });
  });

  describe('CanvasLayerSystem', () => {
    it('能实例化', () => {
      const sys = new CanvasLayerSystem();
      expect(sys.name).toBe('CanvasLayer');
    });

    it('没有 game 时 update 不抛错', () => {
      const sys = new CanvasLayerSystem();
      expect(() => sys.update()).not.toThrow();
    });

    it('扫描场景实体时不会因为缺 children 字段抛错', () => {
      const sys = new CanvasLayerSystem();
      const go = new GameObject('a');
      const c = new CanvasLayer();
      go.addComponent(c);
      c.init({ name: 'world', zIndex: 0 });
      (sys as any).game = { scene: { gameObjects: [go] } };
      expect(() => sys.update()).not.toThrow();
    });
  });
});
