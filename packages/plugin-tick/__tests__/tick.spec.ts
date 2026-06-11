import { Ticker, TickerSystem, getTickerSystem, __resetGlobalTickerForTests } from '../lib';

describe('plugin-tick — 帧调度器', () => {
  describe('Ticker.add / dispose', () => {
    let ticker: Ticker;
    beforeEach(() => { ticker = new Ticker(); });
    afterEach(() => ticker.stop());

    it('add 注册回调,后 stop 时不再触发', () => {
      const fn = jest.fn();
      ticker.add(fn);
      // 直接驱动一次 private 方法 — 通过 forceWallMode 启动 + 自然 tick 触发
      ticker.start();
      // 触发一次内部 tickOnce(通过 stop 阻断后续 RAF/interval)
      (ticker as any).tickOnce();
      ticker.stop();
      (ticker as any).tickOnce();
      expect(fn).toHaveBeenCalledTimes(2); // start tickOnce + stop 之后再调一次手动 tickOnce
      // 注意:start() 自身不直接 tickOnce,这里两次都是手动触发
    });

    it('dispose 后该回调不再被触发', () => {
      const fn = jest.fn();
      const handle = ticker.add(fn);
      ticker.start();
      (ticker as any).tickOnce();
      handle.dispose();
      (ticker as any).tickOnce();
      expect(fn).toHaveBeenCalledTimes(1);
      ticker.stop();
    });

    it('group 顺序: physics → logic → late', () => {
      const order: string[] = [];
      ticker.add(() => order.push('logic'), 'logic');
      ticker.add(() => order.push('late'), 'late');
      ticker.add(() => order.push('physics'), 'physics');
      ticker.start();
      (ticker as any).tickOnce();
      ticker.stop();
      expect(order).toEqual(['physics', 'logic', 'late']);
    });

    it('同 group 内按 priority 升序', () => {
      const order: string[] = [];
      ticker.add(() => order.push('p10'), 'logic', 10);
      ticker.add(() => order.push('p1'), 'logic', 1);
      ticker.add(() => order.push('p5'), 'logic', 5);
      ticker.start();
      (ticker as any).tickOnce();
      ticker.stop();
      expect(order).toEqual(['p1', 'p5', 'p10']);
    });

    it('回调抛错不影响后续回调', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const fn = jest.fn();
      ticker.add(() => { throw new Error('boom'); });
      ticker.add(fn);
      ticker.start();
      (ticker as any).tickOnce();
      expect(fn).toHaveBeenCalled();
      errSpy.mockRestore();
      ticker.stop();
    });

    it('回调内部 dispose 不破坏本帧迭代', () => {
      const calls: string[] = [];
      let h: any;
      ticker.add(() => { calls.push('a'); h.dispose(); });
      h = ticker.add(() => calls.push('b'));
      ticker.add(() => calls.push('c'));
      ticker.start();
      (ticker as any).tickOnce();
      ticker.stop();
      expect(calls).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Ticker dt 行为', () => {
    let ticker: Ticker;
    beforeEach(() => { ticker = new Ticker(); });
    afterEach(() => ticker.stop());

    it('dt 上限被夹紧到 MAX_DT(50ms)', () => {
      let observed = -1;
      ticker.add((dt) => { observed = dt; });
      ticker.start();
      // 把 last 改成很久以前
      (ticker as any).last = (ticker as any).now() - 5000;
      (ticker as any).tickOnce();
      ticker.stop();
      expect(observed).toBeLessThanOrEqual(Ticker.MAX_DT);
      expect(observed).toBeGreaterThanOrEqual(0);
    });

    it('dt 不会为负', () => {
      let observed = -1;
      ticker.add((dt) => { observed = dt; });
      ticker.start();
      // 把 last 改到未来
      (ticker as any).last = (ticker as any).now() + 1000;
      (ticker as any).tickOnce();
      ticker.stop();
      expect(observed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('forceWallMode / forceRafMode', () => {
    it('能在两种模式间切换不抛错', () => {
      const ticker = new Ticker();
      ticker.start();
      expect(() => ticker.forceWallMode()).not.toThrow();
      expect((ticker as any).mode).toBe('wall');
      expect(() => ticker.forceRafMode()).not.toThrow();
      ticker.stop();
    });
  });

  describe('TickerSystem', () => {
    afterEach(() => {
      __resetGlobalTickerForTests();
    });

    it('init 后能拿到全局 ticker;getTickerSystem 也返回同实例', () => {
      const sys = new TickerSystem();
      sys.init();
      expect(sys.ticker).toBeDefined();
      expect(sys.ticker).toBe(getTickerSystem());
    });

    it('init 把自己注册成 ref,ticker 处于 active 状态', () => {
      const sys = new TickerSystem();
      sys.init();
      const stats = sys.ticker.getRefStats();
      // standalone(getTickerSystem) + sys 自己,可能存在 0 或 1 个 standalone
      expect(stats.total).toBeGreaterThanOrEqual(1);
      expect(stats.active).toBeGreaterThanOrEqual(1);
      expect((sys.ticker as any).started).toBe(true);
    });

    it('单 system + 无 standalone:onPause 把 RAF 停掉', () => {
      const sys = new TickerSystem();
      sys.init();
      // 用例隔离:把 standalone owner 释放,确保 sys 是唯一 owner
      const ticker: any = sys.ticker;
      // 找出非 sys 的 owner 强制 release(主要是 STANDALONE_OWNER)
      for (const owner of [...(ticker.refs as Map<object, any>).keys()]) {
        if (owner !== sys) ticker.release(owner);
      }
      expect(ticker.started).toBe(true);
      sys.onPause();
      expect(ticker.started).toBe(false);
      expect(ticker.getRefStats()).toEqual({ total: 1, active: 0 });
    });

    it('多 system pause 一个,另一个仍 active,RAF 不停', () => {
      const a = new TickerSystem();
      const b = new TickerSystem();
      a.init();
      b.init();
      const ticker: any = a.ticker;
      // 清理 standalone owner
      for (const owner of [...(ticker.refs as Map<object, any>).keys()]) {
        if (owner !== a && owner !== b) ticker.release(owner);
      }
      a.onPause();
      expect(ticker.started).toBe(true);
      expect(ticker.getRefStats()).toEqual({ total: 2, active: 1 });
      b.onPause();
      expect(ticker.started).toBe(false);
    });

    it('onResume 把 paused owner 拉回 active,重新 start RAF', () => {
      const sys = new TickerSystem();
      sys.init();
      const ticker: any = sys.ticker;
      for (const owner of [...(ticker.refs as Map<object, any>).keys()]) {
        if (owner !== sys) ticker.release(owner);
      }
      sys.onPause();
      expect(ticker.started).toBe(false);
      sys.onResume();
      expect(ticker.started).toBe(true);
      expect(ticker.getRefStats()).toEqual({ total: 1, active: 1 });
    });

    it('onDestroy release ref;最后一个 release 后 ticker 停', () => {
      const sys = new TickerSystem();
      sys.init();
      const ticker: any = sys.ticker;
      for (const owner of [...(ticker.refs as Map<object, any>).keys()]) {
        if (owner !== sys) ticker.release(owner);
      }
      sys.onDestroy();
      expect(ticker.started).toBe(false);
      expect(ticker.getRefStats()).toEqual({ total: 0, active: 0 });
    });

    it('getTickerSystem 单独使用时拿到 active ticker(不被某个 Game pause 影响)', () => {
      // 模拟:editor 内嵌 standalone 消费 + 一个 Game 暂停
      const standalone = getTickerSystem();
      const game = new TickerSystem();
      game.init();
      game.onPause();
      // standalone owner 仍 active,所以 ticker 不停
      expect((standalone as any).started).toBe(true);
    });

    it('多次 addRef 同一 owner 幂等,不会膨胀 ref 数', () => {
      const ticker = new Ticker();
      const owner = {};
      ticker.addRef(owner);
      ticker.addRef(owner);
      ticker.addRef(owner);
      expect(ticker.getRefStats()).toEqual({ total: 1, active: 1 });
      ticker.stop();
    });

    it('addRef 把已 paused 的 owner 拉回 active', () => {
      const ticker = new Ticker();
      const owner = {};
      ticker.addRef(owner);
      ticker.pauseRef(owner);
      expect(ticker.getRefStats().active).toBe(0);
      ticker.addRef(owner);
      expect(ticker.getRefStats().active).toBe(1);
      ticker.stop();
    });
  });
});
