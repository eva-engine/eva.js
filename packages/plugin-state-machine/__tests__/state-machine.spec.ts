import { StateMachine, StateMachineSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-state-machine — 有限状态机', () => {
  beforeEach(() => getSignalBus().clear());

  function tick(sm: StateMachine, ms: number) {
    sm.update({ deltaTime: ms } as any);
  }

  it('initial state 进入时 emit onEnter / signalChange', () => {
    const enter = jest.fn();
    const change = jest.fn();
    getSignalBus().on('on:moving', enter);
    getSignalBus().on('state:change', change);

    const sm = new StateMachine();
    sm.init({
      initial: 'moving',
      signalChange: 'state:change',
      states: {
        moving: { onEnter: 'on:moving' },
      },
    });

    expect(sm.state).toBe('moving');
    expect(enter).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toMatchObject({ to: 'moving', reason: '__init__' });
  });

  it('signal-driven transition 执行后切换状态', () => {
    const sm = new StateMachine();
    sm.init({
      initial: 'idle',
      states: {
        idle: { transitions: [{ on: 'monster:hit', to: 'hurt' }] },
        hurt: {},
      },
    });
    expect(sm.state).toBe('idle');
    getSignalBus().emit('monster:hit');
    expect(sm.state).toBe('hurt');
  });

  it('after transition 在累计时间到点后自动迁移', () => {
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      states: {
        a: { transitions: [{ after: 100, to: 'b' }] },
        b: {},
      },
    });
    tick(sm, 50);
    expect(sm.state).toBe('a');
    tick(sm, 60);
    expect(sm.state).toBe('b');
  });

  it('guard 表达式可读 ctx,假则跳过', () => {
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      context: { hp: 10 },
      states: {
        a: { transitions: [{ on: 'g', to: 'b', guard: 'ctx.hp <= 0' }] },
        b: {},
      },
    });
    getSignalBus().emit('g');
    expect(sm.state).toBe('a');
    sm.ctx.hp = 0;
    getSignalBus().emit('g');
    expect(sm.state).toBe('b');
  });

  it('错误 guard 表达式 → 警告 + 跳过', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      states: {
        a: { transitions: [{ on: 'g', to: 'b', guard: 'this is not js' }] },
        b: {},
      },
    });
    getSignalBus().emit('g');
    expect(sm.state).toBe('a');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('onExit 在退出前 emit', () => {
    const exit = jest.fn();
    getSignalBus().on('exit:a', exit);
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      states: {
        a: { onExit: 'exit:a', transitions: [{ on: 'go', to: 'b' }] },
        b: {},
      },
    });
    getSignalBus().emit('go');
    expect(exit).toHaveBeenCalled();
  });

  it('goto(unknown) 警告但不切换', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sm = new StateMachine();
    sm.init({ initial: 'a', states: { a: {} } });
    sm.goto('nope');
    expect(sm.state).toBe('a');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('goto 到当前状态是 no-op', () => {
    const change = jest.fn();
    getSignalBus().on('change', change);
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      signalChange: 'change',
      states: { a: {} },
    });
    expect(change).toHaveBeenCalledTimes(1);
    sm.goto('a');
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('离开状态后该状态的 on 信号订阅被清理', () => {
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      states: {
        a: { transitions: [{ on: 'go', to: 'b' }] },
        b: {},
      },
    });
    getSignalBus().emit('go');
    expect(sm.state).toBe('b');
    // 再 emit 不应改变状态(订阅已被 cleanupSubs 移除)
    getSignalBus().emit('go');
    expect(sm.state).toBe('b');
  });

  it('onDestroy 清理订阅', () => {
    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      states: { a: { transitions: [{ on: 'go', to: 'b' }] }, b: {} },
    });
    sm.onDestroy();
    getSignalBus().emit('go');
    expect(sm.state).toBe('a');
  });

  it('reenterCurrent 重发当前状态 onEnter 信号,不改 current、不重新订阅', () => {
    const enter = jest.fn();
    const change = jest.fn();
    getSignalBus().on('on:a', enter);
    getSignalBus().on('change', change);

    const sm = new StateMachine();
    sm.init({
      initial: 'a',
      signalChange: 'change',
      states: {
        a: { onEnter: 'on:a', transitions: [{ on: 'go', to: 'b' }] },
        b: {},
      },
    });
    expect(enter).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);

    // 调 reenterCurrent:再发一次 onEnter + signalChange,但 current 不变
    sm.reenterCurrent();
    expect(sm.state).toBe('a');
    expect(enter).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenCalledTimes(2);
    expect(enter.mock.calls[1][0]).toMatchObject({ from: 'a', to: 'a', reason: 'reenter' });
    expect(change.mock.calls[1][0]).toMatchObject({ from: 'a', to: 'a', reason: 'reenter' });

    // 订阅没有被重新建立或清理:原 transition 信号仍生效(只触发一次)
    getSignalBus().emit('go');
    expect(sm.state).toBe('b');
    // reenterCurrent 不重订阅:不会产生重复订阅
    getSignalBus().emit('go');
    expect(sm.state).toBe('b');
  });

  it('reenterCurrent 在未 enter 前(init 前)是 no-op', () => {
    const enter = jest.fn();
    const change = jest.fn();
    getSignalBus().on('on:a', enter);
    getSignalBus().on('change', change);

    const sm = new StateMachine();
    // 不调 init,current 仍是 ''
    expect(sm.state).toBe('');
    expect(() => sm.reenterCurrent()).not.toThrow();
    expect(enter).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(sm.state).toBe('');
  });

  describe('StateMachineSystem', () => {
    it('能实例化且名字正确', () => {
      const sys = new StateMachineSystem();
      expect(sys.name).toBe('StateMachine');
    });
  });
});
