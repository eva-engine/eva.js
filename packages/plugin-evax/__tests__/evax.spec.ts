import { GameObject, OBSERVER_TYPE } from '@eva/eva.js';
import { EvaX, EvaXSystem } from '../lib';

/**
 * 帮助函数:把一个 EvaX 组件的 ADD 通知推到 system 的 componentObserver,
 * 然后触发一次 update(),让 EvaXSystem.add() 真正接管这个组件。
 *
 * 这模拟了 Game 真实生命周期里 GameObject.addComponent 触发的 observer 通知,
 * 不需要启动整个引擎。
 */
function attach(system: EvaXSystem, component: EvaX) {
  system.componentObserver.add({
    component,
    componentName: 'EvaX',
    type: OBSERVER_TYPE.ADD,
  });
  system.update();
}

function detach(system: EvaXSystem, component: EvaX) {
  system.componentObserver.add({
    component,
    componentName: 'EvaX',
    type: OBSERVER_TYPE.REMOVE,
  });
  system.update();
}

/** 把一帧内累积的 changeList 真正派发给 EventEmitter 监听器。 */
function flush(system: EvaXSystem) {
  system.lateUpdate();
}

/**
 * 把 jest.fn() 包成 events 配置项需要的 { deep, handler } 形式。
 *
 * 实测 EvaXSystem.add 走 `events[key] instanceof Function` 分支判断,
 * 而 jsdom 环境里 jest.fn() 的 prototype chain 不指向当前 realm 的 Function,
 * `jest.fn() instanceof Function === false`,会走 else 分支去取 .handler。
 * 所以测试统一用对象形式;`instanceof Function` 的简写支路用 plain function
 * 单独覆盖(见对应 it)。
 */
function wrap(fn: Function, deep = false) {
  return { deep, handler: fn };
}

function createComponent(events: Record<string, any>, name = 'evax-actor') {
  const go = new GameObject(name);
  const comp = new EvaX(go);
  comp.init({ events });
  return comp;
}

describe('@eva/plugin-evax — EvaXSystem 全局响应式 store', () => {
  it('init({ store }) 之后,系统接管传入的 store 对象', () => {
    const system = new EvaXSystem();
    const initial = { score: 0, player: { hp: 100 } };
    system.init({ store: initial });

    expect(system.store).toBe(initial);
    expect(system.store.score).toBe(0);
    expect(system.store.player.hp).toBe(100);
  });

  it('updateStore 修改浅 path 后,在 lateUpdate 触发对应 store.xxx 监听', () => {
    const system = new EvaXSystem();
    system.init({ store: { score: 0 } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.score': wrap(handler) });
    attach(system, comp);

    system.updateStore({ score: 99 });
    flush(system);

    expect(handler).toHaveBeenCalledTimes(1);
    // handler(newStore, oldStore)
    const [newStore, oldStore] = handler.mock.calls[0];
    expect(newStore.score).toBe(99);
    expect(oldStore.score).toBe(0);
  });

  it('深 path (store.a.b.c) 的浅监听能拦到 leaf 字段修改', () => {
    const system = new EvaXSystem();
    system.init({ store: { a: { b: { c: 1 } } } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.a.b.c': wrap(handler) });
    attach(system, comp);

    // 直接对 leaf 赋值 —— defineProperty 拦截到 c 的 setter
    system.store.a.b.c = 2;
    flush(system);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(system.store.a.b.c).toBe(2);
  });

  it('deep:true 监听器响应嵌套对象内部 leaf 修改', () => {
    const system = new EvaXSystem();
    system.init({ store: { player: { hp: 100, mp: 50 } } });

    const handler = jest.fn();
    const comp = createComponent({
      'store.player': wrap(handler, true),
    });
    attach(system, comp);

    // 改 player 子字段 —— deep 监听器应被触发
    system.store.player.hp = 80;
    flush(system);

    expect(handler).toHaveBeenCalledTimes(1);

    system.store.player.mp = 30;
    flush(system);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('浅监听 store.player 不响应 store.player.hp 修改;只响应 player 整体替换', () => {
    const system = new EvaXSystem();
    system.init({ store: { player: { hp: 100 } } });

    const shallow = jest.fn();
    const comp = createComponent({ 'store.player': wrap(shallow) });
    attach(system, comp);

    // 浅监听只在 player 字段本身被替换时触发,改子字段不应触发
    system.store.player.hp = 1;
    flush(system);

    expect(shallow).not.toHaveBeenCalled();

    // 整体替换 player 引用才会触发浅监听
    system.store.player = { hp: 50 };
    flush(system);

    expect(shallow).toHaveBeenCalledTimes(1);
  });

  it('updateStore 跳过未变化的 leaf,所以同值不会触发监听', () => {
    const system = new EvaXSystem();
    system.init({ store: { score: 10 } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.score': wrap(handler) });
    attach(system, comp);

    // 同值 update —— utils.updateStore 内部 if (store[key] !== newStore[key]) 跳过赋值
    system.updateStore({ score: 10 });
    flush(system);

    expect(handler).not.toHaveBeenCalled();
  });

  it('forceUpdateStore 即使值未变也会重新赋值,触发监听', () => {
    const system = new EvaXSystem();
    system.init({ store: { score: 10 } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.score': wrap(handler) });
    attach(system, comp);

    system.forceUpdateStore({ score: 10 });
    flush(system);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('on / emit / off 事件总线对称工作', () => {
    const system = new EvaXSystem();
    system.init({ store: {} });

    const handler = jest.fn();
    system.on('game:over', handler);

    system.emit('game:over', { reason: 'timeout' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual({ reason: 'timeout' });

    system.off('game:over', handler);
    system.emit('game:over', { reason: 'again' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('内置 evax.updateStore 事件等价于直接调 updateStore', () => {
    const system = new EvaXSystem();
    system.init({ store: { score: 0 } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.score': wrap(handler) });
    attach(system, comp);

    // 通过事件触发 updateStore
    system.emit('evax.updateStore', { score: 7 });
    flush(system);

    expect(system.store.score).toBe(7);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('内置 evax.forceUpdateStore 事件等价于直接调 forceUpdateStore', () => {
    const system = new EvaXSystem();
    system.init({ store: { hp: 100 } });

    const handler = jest.fn();
    const comp = createComponent({ 'store.hp': wrap(handler) });
    attach(system, comp);

    system.emit('evax.forceUpdateStore', { hp: 100 });
    flush(system);

    // force 强制赋值,即使值未变,setter 仍被触发
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('attach 后 component.evax 被反向赋值为 system 实例', () => {
    const system = new EvaXSystem();
    system.init({ store: { x: 1 } });

    const comp = createComponent({ 'store.x': wrap(() => {}) });
    expect(comp.evax).toBeUndefined();

    attach(system, comp);
    expect(comp.evax).toBe(system);
  });

  it('多个 EvaX 组件监听同一 path,store 变化时全部触发', () => {
    const system = new EvaXSystem();
    system.init({ store: { score: 0 } });

    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const handlerC = jest.fn();

    const a = createComponent({ 'store.score': wrap(handlerA) }, 'a');
    const b = createComponent({ 'store.score': wrap(handlerB) }, 'b');
    const c = createComponent({ 'store.score': wrap(handlerC) }, 'c');
    attach(system, a);
    attach(system, b);
    attach(system, c);

    system.updateStore({ score: 42 });
    flush(system);

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
    expect(handlerC).toHaveBeenCalledTimes(1);
  });

  it('handler 内部 this 指向自己的组件实例(系统在 add 时 bind(component))', () => {
    const system = new EvaXSystem();
    system.init({ store: { v: 0 } });

    let captured: any = null;
    const handler = function (this: EvaX) {
      captured = this;
    };

    const comp = createComponent({ 'store.v': wrap(handler) });
    attach(system, comp);

    system.store.v = 1;
    flush(system);

    expect(captured).toBe(comp);
  });

  it('lateUpdate 之前 changeList 累积,同一帧多次修改批量派发', () => {
    const system = new EvaXSystem();
    system.init({ store: { a: 0, b: 0 } });

    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const comp = createComponent({
      'store.a': wrap(handlerA),
      'store.b': wrap(handlerB),
    });
    attach(system, comp);

    system.store.a = 1;
    system.store.b = 2;
    // 此时 changeList 长度为 2,但还没派发
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();

    flush(system);

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
    // 二次 flush 不会重复派发
    flush(system);
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  it('events 简写为 plain function 时,system.add 走 instanceof Function 分支并正确绑定', () => {
    // 这里必须用 plain function expression(同 realm),不能用 jest.fn(),
    // 否则 jest mock 的跨 realm 原型链会让 instanceof Function 返回 false。
    const system = new EvaXSystem();
    system.init({ store: { tick: 0 } });

    let calls = 0;
    function handler() {
      calls++;
    }

    const comp = createComponent({ 'store.tick': handler as any });
    attach(system, comp);

    system.store.tick = 1;
    flush(system);

    expect(calls).toBe(1);
  });

  it('REMOVE 通知触发 system.remove 走 plain function 分支(不抛异常,处理 ee.off 调用)', () => {
    // 注意:当前源码 EvaXSystem.remove 用 `events[key].bind(component)` 计算
    // ee.off 的目标 listener,而 bind() 每次都返回新的 bound function,引用与
    // ee.on 时注册的那个不同,所以 EventEmitter3 实际上找不到匹配项,
    // 不会真的反注册。这是一个已知的源码缺陷。
    //
    // 这里只验证:
    //   1. REMOVE 通知能让 system.remove 走 plain function (instanceof Function) 分支
    //   2. 整个流程不抛异常
    // 不主张 detach 后 handler 一定不再触发(那需要先修源码)。
    const system = new EvaXSystem();
    system.init({ store: { score: 0 } });

    let calls = 0;
    function handler() {
      calls++;
    }

    const comp = createComponent({ 'store.score': handler as any });
    attach(system, comp);

    system.store.score = 1;
    flush(system);
    expect(calls).toBe(1);

    expect(() => detach(system, comp)).not.toThrow();
  });

  it('EvaX 组件 static componentName === "EvaX"', () => {
    expect(EvaX.componentName).toBe('EvaX');
  });

  it('EvaXSystem.systemName === "EvaX"', () => {
    expect(EvaXSystem.systemName).toBe('EvaX');
  });
});
