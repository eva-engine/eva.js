import { GameObject } from '@eva/eva.js';
import { HitArea, HitAreaSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-hitarea — 区域相交检测', () => {
  beforeEach(() => getSignalBus().clear());

  function makeGo(name: string, x: number, y: number, hit: any) {
    const go = new GameObject(name, { position: { x, y } });
    const area = new HitArea();
    go.addComponent(area);
    area.init(hit);
    return { go, area };
  }

  function makeFakeGame(...gos: GameObject[]) {
    return { scene: { gameObjects: gos } };
  }

  describe('HitArea init', () => {
    it('解析 shape/layer/mask/signals/oneShot/enabled', () => {
      const a = new HitArea();
      a.init({
        shape: { type: 'rect', width: 10, height: 20 },
        layer: ['monster'],
        mask: ['rocket'],
        signalEnter: 'on',
        signalExit: 'off',
        oneShot: true,
        enabled: false,
      });
      expect(a.shape).toEqual({ type: 'rect', width: 10, height: 20 });
      expect(a.layer).toEqual(['monster']);
      expect(a.mask).toEqual(['rocket']);
      expect(a.signalEnter).toBe('on');
      expect(a.signalExit).toBe('off');
      expect(a.oneShot).toBe(true);
      expect(a.enabled).toBe(false);
    });
  });

  describe('HitAreaSystem 圆-圆 相交', () => {
    it('两圆相交时 emit signalEnter,且只触发一次', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: m } = makeGo('m', 0, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['monster'],
        mask: ['rocket'],
        signalEnter: 'hit',
      });
      const { go: r } = makeGo('r', 20, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['rocket'],
        mask: [],
      });

      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(m, r);
      sys.update();
      sys.update(); // 第二次不应该 enter 第二次
      expect(enter).toHaveBeenCalledTimes(1);
    });

    it('从相交到分离会 emit signalExit', () => {
      const enter = jest.fn();
      const exit = jest.fn();
      getSignalBus().on('en', enter);
      getSignalBus().on('ex', exit);
      const { go: m, area: ma } = makeGo('m', 0, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['monster'],
        mask: ['rocket'],
        signalEnter: 'en',
        signalExit: 'ex',
      });
      const { go: r } = makeGo('r', 20, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['rocket'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(m, r);
      sys.update();
      expect(enter).toHaveBeenCalledTimes(1);
      // 拉远
      r.transform.position.x = 200;
      sys.update();
      expect(exit).toHaveBeenCalledTimes(1);
      void ma;
    });

    it('不相交时不 emit', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: a } = makeGo('a', 0, 0, {
        shape: { type: 'circle', radius: 10 },
        layer: ['x'],
        mask: ['y'],
        signalEnter: 'hit',
      });
      const { go: b } = makeGo('b', 1000, 0, {
        shape: { type: 'circle', radius: 10 },
        layer: ['y'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(a, b);
      sys.update();
      expect(enter).not.toHaveBeenCalled();
    });

    it('layer/mask 不匹配时不 emit', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: a } = makeGo('a', 0, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['x'],
        mask: ['z'], // 不关心 b 的 layer 'y'
        signalEnter: 'hit',
      });
      const { go: b } = makeGo('b', 5, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['y'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(a, b);
      sys.update();
      expect(enter).not.toHaveBeenCalled();
    });

    it('AABB 相交(rect-rect)', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: a } = makeGo('a', 0, 0, {
        shape: { type: 'rect', width: 100, height: 100 },
        layer: ['x'],
        mask: ['y'],
        signalEnter: 'hit',
      });
      const { go: b } = makeGo('b', 30, 0, {
        shape: { type: 'rect', width: 100, height: 100 },
        layer: ['y'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(a, b);
      sys.update();
      expect(enter).toHaveBeenCalledTimes(1);
    });

    it('oneShot=true 进入即 disabled', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: a, area } = makeGo('a', 0, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['x'],
        mask: ['y'],
        signalEnter: 'hit',
        oneShot: true,
      });
      const { go: b } = makeGo('b', 5, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['y'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(a, b);
      sys.update();
      expect(area.enabled).toBe(false);
    });

    it('enabled=false 不参与碰撞', () => {
      const enter = jest.fn();
      getSignalBus().on('hit', enter);
      const { go: a } = makeGo('a', 0, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['x'],
        mask: ['y'],
        signalEnter: 'hit',
        enabled: false,
      });
      const { go: b } = makeGo('b', 5, 0, {
        shape: { type: 'circle', radius: 30 },
        layer: ['y'],
        mask: [],
      });
      const sys = new HitAreaSystem();
      (sys as any).game = makeFakeGame(a, b);
      sys.update();
      expect(enter).not.toHaveBeenCalled();
    });
  });

  describe('HitAreaSystem 其他', () => {
    it('没有 game 时 update 不抛错', () => {
      const sys = new HitAreaSystem();
      expect(() => sys.update()).not.toThrow();
    });
  });
});
