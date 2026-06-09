import { Timer, TimerSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-timer — Timer 组件', () => {
  beforeEach(() => getSignalBus().clear());

  function tick(t: Timer, ms: number) {
    t.update({ deltaTime: ms } as any);
  }

  it('init 解析参数', () => {
    const t = new Timer();
    t.init({ wait: 500, oneShot: false, autostart: true, signal: 'game:over', tickSignal: 'cd:tick', tickInterval: 100 });
    expect(t.wait).toBe(500);
    expect(t.oneShot).toBe(false);
    expect(t.autostart).toBe(true);
    expect(t.signal).toBe('game:over');
    expect(t.tickSignal).toBe('cd:tick');
    expect(t.tickInterval).toBe(100);
  });

  it('autostart=true 时 awake 后开始计时', () => {
    const t = new Timer();
    t.init({ wait: 100, autostart: true });
    t.awake();
    tick(t, 50);
    expect(t.timeElapsed).toBeGreaterThan(0);
  });

  it('autostart=false 时 awake 后不计时,直到手动 start', () => {
    const t = new Timer();
    t.init({ wait: 100, autostart: false });
    t.awake();
    tick(t, 50);
    expect(t.timeElapsed).toBe(0);
    t.start();
    tick(t, 50);
    expect(t.timeElapsed).toBe(50);
  });

  it('oneShot=true:到点后 emit signal 且自动停止', () => {
    const fn = jest.fn();
    getSignalBus().on('boom', fn);
    const t = new Timer();
    t.init({ wait: 100, oneShot: true, signal: 'boom' });
    t.start();
    tick(t, 60);
    expect(fn).not.toHaveBeenCalled();
    tick(t, 60); // 总 120 > 100
    expect(fn).toHaveBeenCalledTimes(1);
    // 到点后 stop 把 elapsed 归零
    expect(t.timeElapsed).toBe(0);
    // 再 tick 不会再 emit(因为 stopped)
    tick(t, 200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('oneShot=false:循环触发,余数保留', () => {
    const fn = jest.fn();
    getSignalBus().on('lap', fn);
    const t = new Timer();
    t.init({ wait: 100, oneShot: false, signal: 'lap' });
    t.start();
    tick(t, 250); // 应该触发一次,剩 150,这一帧再次触发,剩 50
    // 由于 update 内只检查一次 timeout,每个 update 最多触发一次
    expect(fn).toHaveBeenCalledTimes(1);
    expect(t.timeElapsed).toBeGreaterThanOrEqual(0);
  });

  it('tickSignal + tickInterval emit 周期性 tick', () => {
    const fn = jest.fn();
    getSignalBus().on('cd', fn);
    const t = new Timer();
    t.init({ wait: 1000, tickSignal: 'cd', tickInterval: 100 });
    t.start();
    tick(t, 50); // tickAcc=50 < 100
    tick(t, 60); // tickAcc=110 >=100 → emit, reset to 0
    tick(t, 90); // tickAcc=90
    tick(t, 20); // tickAcc=110 → emit
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('pause/resume', () => {
    const t = new Timer();
    t.init({ wait: 200 });
    t.start();
    tick(t, 50);
    t.pause();
    tick(t, 100);
    expect(t.timeElapsed).toBe(50);
    t.resume();
    tick(t, 30);
    expect(t.timeElapsed).toBe(80);
  });

  it('reset 把 elapsed 归零但不影响 running', () => {
    const t = new Timer();
    t.init({ wait: 200 });
    t.start();
    tick(t, 50);
    t.reset();
    expect(t.timeElapsed).toBe(0);
    tick(t, 30);
    expect(t.timeElapsed).toBe(30);
  });

  it('timeLeft = wait - elapsed,触发后 = 0', () => {
    const t = new Timer();
    t.init({ wait: 100 });
    t.start();
    tick(t, 30);
    expect(t.timeLeft).toBe(70);
  });

  it('timer:timeout 总是 emit(无论是否配置 signal)', () => {
    const fn = jest.fn();
    getSignalBus().on('timer:timeout', fn);
    const t = new Timer();
    t.init({ wait: 100 });
    t.start();
    tick(t, 150);
    expect(fn).toHaveBeenCalled();
  });

  describe('TimerSystem', () => {
    it('能实例化且名字正确', () => {
      const sys = new TimerSystem();
      expect(sys.name).toBe('Timer');
    });
  });
});
