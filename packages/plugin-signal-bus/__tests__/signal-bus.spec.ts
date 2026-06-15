import {
  SignalBus,
  SignalBusSystem,
  getSignalBus,
  __setGlobalSignalBus,
} from '../lib';
import type { SignalTransport } from '../lib';

describe('plugin-signal-bus — 命名信号总线', () => {
  describe('SignalBus 实例', () => {
    let bus: SignalBus;
    beforeEach(() => { bus = new SignalBus(); });

    it('on / emit 会按订阅顺序触发', () => {
      const calls: number[] = [];
      bus.on('a', (n: number) => calls.push(n));
      bus.on('a', (n: number) => calls.push(n + 100));
      bus.emit('a', 1);
      expect(calls).toEqual([1, 101]);
    });

    it('emit 一个没人订阅的信号不会抛错', () => {
      expect(() => bus.emit('not-listened', 42)).not.toThrow();
    });

    it('once 只触发一次', () => {
      const fn = jest.fn();
      bus.once('hit', fn);
      bus.emit('hit');
      bus.emit('hit');
      bus.emit('hit');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('SignalHandle.dispose 取消订阅', () => {
      const fn = jest.fn();
      const h = bus.on('x', fn);
      h.dispose();
      bus.emit('x');
      expect(fn).not.toHaveBeenCalled();
    });

    it('off(name) 清空该名下所有订阅', () => {
      const a = jest.fn(), b = jest.fn();
      bus.on('m', a);
      bus.on('m', b);
      bus.off('m');
      bus.emit('m');
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
    });

    it('off(name, fn) 只移除指定 listener', () => {
      const a = jest.fn(), b = jest.fn();
      bus.on('m', a);
      bus.on('m', b);
      bus.off('m', a);
      bus.emit('m');
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('回调内部 off/on 不破坏遍历', () => {
      const order: string[] = [];
      bus.on('x', () => {
        order.push('a');
        bus.on('x', () => order.push('late'));
        bus.off('x');
      });
      bus.on('x', () => order.push('b'));
      bus.emit('x');
      // 第一次 emit 应当 a, b(快照之前);late 是 emit 期间 on 的,不应触发本次
      expect(order).toEqual(['a', 'b']);
    });

    it('listener 抛错被吞,后续 listener 仍然执行', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const ok = jest.fn();
      bus.on('boom', () => { throw new Error('nope'); });
      bus.on('boom', ok);
      expect(() => bus.emit('boom')).not.toThrow();
      expect(ok).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('clear() 清空所有 listener', () => {
      const fn = jest.fn();
      bus.on('a', fn);
      bus.clear();
      bus.emit('a');
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('register schema', () => {
    let bus: SignalBus;
    beforeEach(() => { bus = new SignalBus(); });

    it('register / getSchemas 往返一致', () => {
      bus.register({ name: 's:1', description: 'one' });
      bus.registerMany([
        { name: 's:2', description: 'two', payload: { v: 'number' } },
        { name: 's:3' },
      ]);
      const got = bus.getSchemas();
      expect(got.map((s) => s.name).sort()).toEqual(['s:1', 's:2', 's:3']);
    });
  });

  describe('全局单例', () => {
    it('getSignalBus 返回同一实例', () => {
      expect(getSignalBus()).toBe(getSignalBus());
    });
  });

  describe('SignalBusSystem', () => {
    afterEach(() => { getSignalBus().clear(); });
    it('init 不传参 OK', () => {
      const sys = new SignalBusSystem();
      sys.init();
      expect(sys.bus).toBe(getSignalBus());
    });
    it('init 传 signals 时批量注册', () => {
      const sys = new SignalBusSystem();
      sys.init({
        signals: [{ name: 'game:over' }, { name: 'monster:hit', description: 'hit' }],
      });
      const names = sys.bus.getSchemas().map((s) => s.name).sort();
      expect(names).toContain('game:over');
      expect(names).toContain('monster:hit');
    });
  });

  // -----------------------------------------------------------------
  // Phase 2: typed-bus 4 条契约迁移测试
  // -----------------------------------------------------------------
  describe('Phase 2: SignalBusOptions logListenerErrors', () => {
    it('logListenerErrors=false 时静默 listener 抛错', () => {
      const bus = new SignalBus({ logListenerErrors: false });
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const ok = jest.fn();
      bus.on('boom', () => {
        throw new Error('nope');
      });
      bus.on('boom', ok);
      bus.emit('boom');
      expect(errSpy).not.toHaveBeenCalled();
      expect(ok).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('默认 logListenerErrors 走 console.error 显眼提示', () => {
      const bus = new SignalBus();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      bus.on('boom', () => {
        throw new Error('nope');
      });
      bus.emit('boom');
      expect(errSpy).toHaveBeenCalled();
      const msg = String(errSpy.mock.calls[0][0]);
      expect(msg).toContain('boom');
      errSpy.mockRestore();
    });
  });

  describe('Phase 2: typed<P>() 零成本 cast', () => {
    type Demo = {
      'fire': { x: number; y: number };
      'score': { value: number };
    };
    it('typed<P>() 与原 bus 共享同一 listener Map', () => {
      const bus = new SignalBus();
      const seen: Array<{ x: number; y: number }> = [];
      const tbus = bus.typed<Demo>();
      const h = tbus.on('fire', (p) => seen.push(p));
      // 用原 bus emit string 也应触发 typed listener
      bus.emit('fire', { x: 1, y: 2 });
      // 用 typed bus emit 也应触发
      tbus.emit('fire', { x: 3, y: 4 });
      expect(seen).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      h.dispose();
    });
  });

  describe('Phase 2: transport mode (防双发)', () => {
    function makeTransport(): SignalTransport & {
      listeners: Map<string, Set<(p?: unknown) => void>>;
    } {
      const listeners = new Map<string, Set<(p?: unknown) => void>>();
      return {
        listeners,
        emit(name, payload) {
          const set = listeners.get(name);
          if (!set) return;
          for (const fn of Array.from(set)) fn(payload);
        },
        on(name, fn) {
          let set = listeners.get(name);
          if (!set) {
            set = new Set();
            listeners.set(name, set);
          }
          set.add(fn);
        },
        off(name, fn) {
          listeners.get(name)?.delete(fn);
        },
      };
    }

    it('transport 模式下 emit 走 transport,本地 Map 不参与(不双发)', () => {
      const t = makeTransport();
      const bus = new SignalBus({ transport: t });
      const fn = jest.fn();
      bus.on('fire', fn);
      bus.emit('fire', { x: 1 });
      expect(fn).toHaveBeenCalledTimes(1);
      // 关键防双发断言:transport 内 listener 数量 = 1(没有同时注册到本地)
      expect(t.listeners.get('fire')!.size).toBe(1);
    });

    it('transport 模式 SignalHandle.dispose 从 transport 注销', () => {
      const t = makeTransport();
      const bus = new SignalBus({ transport: t });
      const fn = jest.fn();
      const h = bus.on('fire', fn);
      h.dispose();
      bus.emit('fire', { x: 1 });
      expect(fn).not.toHaveBeenCalled();
      expect(t.listeners.get('fire')!.size).toBe(0);
    });

    it('transport 模式 off(name, fn) 从 transport 注销', () => {
      const t = makeTransport();
      const bus = new SignalBus({ transport: t });
      const fn = jest.fn();
      bus.on('fire', fn);
      bus.off('fire', fn);
      bus.emit('fire', { x: 1 });
      expect(fn).not.toHaveBeenCalled();
    });

    it('transport 模式下 listener 错误由 transport 自行处理(本地 try/catch 不介入)', () => {
      const t = makeTransport();
      const bus = new SignalBus({ transport: t });
      bus.on('boom', () => {
        throw new Error('uncaught');
      });
      // transport 不包错 → 抛出去
      expect(() => bus.emit('boom')).toThrow('uncaught');
    });
  });

  describe('Phase 2: SignalBusSystem 透传 transport / logListenerErrors', () => {
    afterEach(() => {
      __setGlobalSignalBus(null);
    });

    it('init 传 transport 时全局 bus 切换到 transport 模式', () => {
      const t: SignalTransport = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      };
      const sys = new SignalBusSystem();
      sys.init({ transport: t });
      sys.bus.emit('hi', { v: 1 });
      expect(t.emit).toHaveBeenCalledWith('hi', { v: 1 });
      // 全局 getSignalBus() 也应返回新实例
      expect(getSignalBus()).toBe(sys.bus);
    });

    it('init 传 logListenerErrors=false 时全局 bus 切换为静默', () => {
      const sys = new SignalBusSystem();
      sys.init({ logListenerErrors: false });
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      sys.bus.on('boom', () => {
        throw new Error('nope');
      });
      sys.bus.emit('boom');
      expect(errSpy).not.toHaveBeenCalled();
      errSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------
  // Phase 3: scene scope opt-in
  // -----------------------------------------------------------------
  describe("Phase 3: scope:'scene' 自动 dispose", () => {
    afterEach(() => {
      __setGlobalSignalBus(null);
    });

    it('scope:"scene" 订阅在 disposeSceneScoped 后被清理', () => {
      const bus = new SignalBus();
      const fn = jest.fn();
      bus.on('fire', fn, { scope: 'scene' });
      bus.emit('fire');
      expect(fn).toHaveBeenCalledTimes(1);
      bus.disposeSceneScoped();
      bus.emit('fire');
      expect(fn).toHaveBeenCalledTimes(1); // 没再被触发
    });

    it('scope:"game"(默认)在 disposeSceneScoped 后保留', () => {
      const bus = new SignalBus();
      const fn = jest.fn();
      bus.on('fire', fn);
      bus.disposeSceneScoped();
      bus.emit('fire');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('显式 dispose 优先于 scope 自动清理(不重复 dispose)', () => {
      const bus = new SignalBus();
      const fn = jest.fn();
      const h = bus.on('fire', fn, { scope: 'scene' });
      h.dispose();
      // 此时再触发 disposeSceneScoped 不应抛错
      expect(() => bus.disposeSceneScoped()).not.toThrow();
      bus.emit('fire');
      expect(fn).not.toHaveBeenCalled();
    });

    it('SignalBusSystem 监听 game sceneChanged,自动清理 scope:"scene"', () => {
      const EventEmitter = require('eventemitter3') as typeof import('eventemitter3').EventEmitter;
      const fakeGame = new EventEmitter() as any;
      const sys = new SignalBusSystem();
      // 模拟 eva.js 引擎注入 game
      sys.game = fakeGame;
      sys.init();
      sys.awake!();
      const fn = jest.fn();
      sys.bus.on('fire', fn, { scope: 'scene' });
      // 触发 game sceneChanged
      fakeGame.emit('sceneChanged', { scene: null, mode: 0, params: {} });
      sys.bus.emit('fire');
      expect(fn).not.toHaveBeenCalled();
    });

    it('autoDisposeSceneScoped=false 时不 hook game,scope 自动清理失效', () => {
      const EventEmitter = require('eventemitter3') as typeof import('eventemitter3').EventEmitter;
      const fakeGame = new EventEmitter() as any;
      const sys = new SignalBusSystem();
      sys.game = fakeGame;
      sys.init({ autoDisposeSceneScoped: false });
      sys.awake!();
      const fn = jest.fn();
      sys.bus.on('fire', fn, { scope: 'scene' });
      fakeGame.emit('sceneChanged', { scene: null, mode: 0, params: {} });
      sys.bus.emit('fire');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('SignalBusSystem.onDestroy 解绑 game listener', () => {
      const EventEmitter = require('eventemitter3') as typeof import('eventemitter3').EventEmitter;
      const fakeGame = new EventEmitter() as any;
      const sys = new SignalBusSystem();
      sys.game = fakeGame;
      sys.init();
      sys.awake!();
      expect(fakeGame.listenerCount('sceneChanged')).toBe(1);
      sys.onDestroy!();
      expect(fakeGame.listenerCount('sceneChanged')).toBe(0);
    });
  });

  // -----------------------------------------------------------------
  // Phase 4: Debug 钩子契约
  // -----------------------------------------------------------------
  describe('Phase 4: __getDebugSnapshot internal API', () => {
    it('返回 listeners 名单 + schema + transport 标记(本地)', () => {
      const bus = new SignalBus();
      bus.on('a', () => {});
      bus.on('a', () => {});
      bus.on('b', () => {});
      bus.register({ name: 'a', description: 'sig a' });
      const snap = bus.__getDebugSnapshot();
      expect(snap.transport).toBe('local');
      expect(snap.signals.find((s) => s.name === 'a')!.listenerCount).toBe(2);
      expect(snap.signals.find((s) => s.name === 'b')!.listenerCount).toBe(1);
      expect(snap.schemas.map((s) => s.name)).toEqual(['a']);
    });

    it('transport 模式下标记为 external,本地 signals 列表为空', () => {
      const t: SignalTransport = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      };
      const bus = new SignalBus({ transport: t });
      bus.on('a', () => {});
      const snap = bus.__getDebugSnapshot();
      expect(snap.transport).toBe('external');
      // 本地 listeners Map 不持有 transport 模式下的 listener
      expect(snap.signals).toEqual([]);
    });
  });
});
