import { SignalBus, SignalBusSystem, getSignalBus } from '../lib';

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
});
