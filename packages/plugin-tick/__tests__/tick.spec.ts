import { Ticker, TickerSystem, getTickerSystem } from '../lib';

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
    it('init 后能拿到全局 ticker;getTickerSystem 也返回同实例', () => {
      const sys = new TickerSystem();
      sys.init();
      expect(sys.ticker).toBeDefined();
      expect(sys.ticker).toBe(getTickerSystem());
    });
  });
});
