import { InputActionMap, InputActionSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-input-action — 输入到 action 映射', () => {
  // 每个 test 自己创建的 InputActionMap 都会在 document 上注册 listener;
  // 必须在 test 之后 onDestroy 释放,否则下一个 test 的 dispatchEvent 会被多次响应。
  let active: InputActionMap[] = [];
  function track(m: InputActionMap): InputActionMap {
    active.push(m);
    return m;
  }

  beforeEach(() => {
    getSignalBus().clear();
    active = [];
  });
  afterEach(() => {
    for (const m of active) m.onDestroy();
    active = [];
  });

  it('init 把 bindings 初始化为 not pressed', () => {
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'click' }] }] });
    expect(m.isPressed('fire')).toBe(false);
  });

  it('keydown 触发 input:{action}:press,keyup 触发 release', () => {
    const press = jest.fn();
    const release = jest.fn();
    getSignalBus().on('input:fire:press', press);
    getSignalBus().on('input:fire:release', release);
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'key', code: 'Space' }] }] });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(press).toHaveBeenCalledTimes(1);
    expect(m.isPressed('fire')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(release).toHaveBeenCalledTimes(1);
    expect(m.isPressed('fire')).toBe(false);
    m.onDestroy();
  });

  it('e.repeat=true 不重复 emit press', () => {
    const press = jest.fn();
    getSignalBus().on('input:fire:press', press);
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'key', code: 'Space' }] }] });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: true }));
    expect(press).toHaveBeenCalledTimes(1);
    m.onDestroy();
  });

  it('多源同 action,任一源按下都 press,需要全部松开才 release', () => {
    const press = jest.fn();
    const release = jest.fn();
    getSignalBus().on('input:fire:press', press);
    getSignalBus().on('input:fire:release', release);
    const m = track(new InputActionMap());
    m.init({
      bindings: [
        { action: 'fire', sources: [{ type: 'key', code: 'Space' }, { type: 'key', code: 'Enter' }] },
      ],
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    expect(press).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    // Enter 还按着,不应 release
    expect(release).not.toHaveBeenCalled();
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    expect(release).toHaveBeenCalledTimes(1);
    m.onDestroy();
  });

  it('mousedown 触发 click 类型 press', () => {
    const press = jest.fn();
    getSignalBus().on('input:fire:press', press);
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'click' }] }] });
    document.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
    expect(press).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
    m.onDestroy();
  });

  it('显式自定义 pressSignal/releaseSignal 覆盖默认', () => {
    const press = jest.fn();
    const release = jest.fn();
    getSignalBus().on('go!', press);
    getSignalBus().on('halt!', release);
    const m = track(new InputActionMap());
    m.init({
      bindings: [
        {
          action: 'fire',
          sources: [{ type: 'key', code: 'Space' }],
          pressSignal: 'go!',
          releaseSignal: 'halt!',
        },
      ],
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(press).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
    m.onDestroy();
  });

  it('update 在按下状态下 emit hold 信号', () => {
    const hold = jest.fn();
    getSignalBus().on('input:fire:hold', hold);
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'key', code: 'Space' }] }] });
    m.update();
    expect(hold).not.toHaveBeenCalled(); // 没按下
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    m.update();
    m.update();
    expect(hold).toHaveBeenCalledTimes(2);
    m.onDestroy();
  });

  it('onDestroy 卸载所有 listener', () => {
    const press = jest.fn();
    getSignalBus().on('input:fire:press', press);
    const m = track(new InputActionMap());
    m.init({ bindings: [{ action: 'fire', sources: [{ type: 'key', code: 'Space' }] }] });
    m.onDestroy();
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(press).not.toHaveBeenCalled();
  });

  describe('InputActionSystem', () => {
    it('能实例化且名字正确', () => {
      expect(new InputActionSystem().name).toBe('InputAction');
    });
  });
});
