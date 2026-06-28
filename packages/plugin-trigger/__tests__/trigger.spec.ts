import { Component, GameObject, Scene } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { Trigger, TriggerSystem } from '../lib';

/**
 * plugin-trigger 单测。
 *
 * 关键点:
 * - jest setup (scripts/setupJestEnv.ts) 在 afterEach 检查所有未被
 *   `expect(msg).toHaveBeenWarned()` 断言过的 console.warn 输出,会主动抛错。
 *   所以需要让 console.warn 触发的用例显式断言或自己 spy + mockRestore。
 *   Trigger 内部 console.warn 的字段是固定文案,使用 toHaveBeenWarned 即可。
 * - mx 是模块内 declare const,用 (window as any).mx 注入。
 * - callMethod 用真 Scene + GameObject + 自定义 Component 链路,通过给 scene
 *   注入 game = { scene } 满足 `gameObject.scene.game.scene.gameObjects` 路径。
 */

class FooComponent extends Component {
  static componentName = 'Foo';
  /** 测试桩 */
  doSomething(..._args: any[]) {
    /* spy 替换 */
  }
}

function setupMxStore() {
  const update = jest.fn();
  const get = jest.fn();
  (window as any).mx = { store: { update, get } };
  return { update, get };
}

function clearMx() {
  delete (window as any).mx;
}

/** 构造一个 Scene,并把 scene.game 反向指回去,满足 Trigger.callMethod 的访问路径。 */
function makeSceneWithGame(): Scene {
  const scene = new Scene('scene');
  (scene as any).game = { scene };
  return scene;
}

/** 把一个挂着 Trigger 的 GameObject 加到 scene,触发 awake。 */
function attachTriggerOn(
  scene: Scene,
  trigger: Trigger,
  hostName = 'host',
): GameObject {
  const host = new GameObject(hostName);
  scene.addChild(host);
  host.addComponent(trigger);
  return host;
}

describe('plugin-trigger', () => {
  beforeEach(() => {
    getSignalBus().clear();
  });

  afterEach(() => {
    clearMx();
  });

  it('init / awake 把每条 rule 注册到 signal-bus', () => {
    const bus = getSignalBus();
    const onSpy = jest.spyOn(bus, 'on');

    const trigger = new Trigger({
      rules: [
        { on: 'a', do: [{ type: 'log', message: 'A' }] },
        { on: 'b', do: [{ type: 'log', message: 'B' }] },
      ],
    });

    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    // awake 注册 2 条规则
    expect(onSpy).toHaveBeenCalledTimes(2);
    expect(onSpy.mock.calls[0][0]).toBe('a');
    expect(onSpy.mock.calls[1][0]).toBe('b');

    onSpy.mockRestore();
  });

  it('emit action 把信号转发出去,默认沿用原 payload', () => {
    const downstream = jest.fn();
    getSignalBus().on('rocket:spawn', downstream);

    const trigger = new Trigger({
      rules: [
        {
          on: 'input:fire:press',
          do: [{ type: 'emit', signal: 'rocket:spawn' }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('input:fire:press', { x: 1, y: 2 });
    expect(downstream).toHaveBeenCalledTimes(1);
    expect(downstream.mock.calls[0][0]).toEqual({ x: 1, y: 2 });
  });

  it('emit action 显式 payload 优先于原 payload', () => {
    const downstream = jest.fn();
    getSignalBus().on('rocket:spawn', downstream);

    const trigger = new Trigger({
      rules: [
        {
          on: 'input:fire:press',
          do: [{ type: 'emit', signal: 'rocket:spawn', payload: { override: true } }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('input:fire:press', { x: 9 });
    expect(downstream).toHaveBeenCalledWith({ override: true });
  });

  it('setStore action 调 mx.store.update 写入 value', () => {
    const { update } = setupMxStore();
    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [{ type: 'setStore', key: 'score', value: 99 }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('sig');
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toBe('score');
    // 第二个参数是 updater 函数,执行后返回 value
    const updater = update.mock.calls[0][1];
    expect(typeof updater).toBe('function');
    expect(updater(undefined)).toBe(99);
  });

  it('incStore action 用 updater 把当前值 +delta(默认 1)', () => {
    const { update } = setupMxStore();
    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            { type: 'incStore', key: 'shotsFired' },
            { type: 'incStore', key: 'score', delta: 5 },
          ],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('sig');
    expect(update).toHaveBeenCalledTimes(2);

    const [k1, u1] = update.mock.calls[0];
    expect(k1).toBe('shotsFired');
    expect(u1(undefined)).toBe(1); // (undefined ?? 0) + 1
    expect(u1(10)).toBe(11);

    const [k2, u2] = update.mock.calls[1];
    expect(k2).toBe('score');
    expect(u2(undefined)).toBe(5);
    expect(u2(7)).toBe(12);
  });

  it('mx 不存在时 setStore / incStore 不抛错', () => {
    // 不调用 setupMxStore,确保 mx 未挂载
    expect((window as any).mx).toBeUndefined();
    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            { type: 'setStore', key: 'k', value: 1 },
            { type: 'incStore', key: 'k' },
          ],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    expect(() => getSignalBus().emit('sig')).not.toThrow();
  });

  it('log action 调 console.log 输出 [trigger] 前缀和 payload', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const trigger = new Trigger({
      rules: [
        { on: 'sig', do: [{ type: 'log', message: 'hello' }] },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('sig', { foo: 1 });
    expect(log).toHaveBeenCalledWith('[trigger]', 'hello', { foo: 1 });
    log.mockRestore();
  });

  it('callMethod 在 scene 顶层找到命名实体并调方法', () => {
    const scene = makeSceneWithGame();

    // 目标实体 + 自定义组件
    const target = new GameObject('Target');
    scene.addChild(target);
    const foo = new FooComponent();
    target.addComponent(foo);
    const methodSpy = jest.spyOn(foo, 'doSomething').mockImplementation(() => {});

    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            {
              type: 'callMethod',
              entity: 'Target',
              component: 'Foo',
              method: 'doSomething',
              args: [1, 'two', { three: true }],
            },
          ],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    getSignalBus().emit('sig');
    expect(methodSpy).toHaveBeenCalledTimes(1);
    expect(methodSpy).toHaveBeenCalledWith(1, 'two', { three: true });
    methodSpy.mockRestore();
  });

  it('callMethod 递归 transform.children 找嵌套实体', () => {
    const scene = makeSceneWithGame();

    const parent = new GameObject('Parent');
    scene.addChild(parent);

    const nested = new GameObject('Deep');
    parent.addChild(nested);

    const foo = new FooComponent();
    nested.addComponent(foo);
    const methodSpy = jest.spyOn(foo, 'doSomething').mockImplementation(() => {});

    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            {
              type: 'callMethod',
              entity: 'Deep',
              component: 'Foo',
              method: 'doSomething',
            },
          ],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    getSignalBus().emit('sig');
    expect(methodSpy).toHaveBeenCalledTimes(1);
    expect(methodSpy).toHaveBeenCalledWith();
    methodSpy.mockRestore();
  });

  it('callMethod 找不到实体不抛错也不调任何方法', () => {
    const scene = makeSceneWithGame();
    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            {
              type: 'callMethod',
              entity: 'NoSuch',
              component: 'Foo',
              method: 'doSomething',
            },
          ],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    expect(() => getSignalBus().emit('sig')).not.toThrow();
  });

  /**
   * ADR-0024B — callMethod.ref 字段:同 entity 多 componentName 多实例时按
   * (componentName, ref) 三元组定位。修复 alert-chase.json 类模板 hidden
   * broken state。
   */
  it('callMethod 无 ref 时取首个 componentName 命中(legacy 行为)', () => {
    const scene = makeSceneWithGame();
    const target = new GameObject('Multi');
    scene.addChild(target);

    const a = new FooComponent();
    (a as any).ref = 'aaa';
    target.addComponent(a);
    const b = new FooComponent();
    (b as any).ref = 'bbb';
    target.addComponent(b);

    const aSpy = jest.spyOn(a, 'doSomething').mockImplementation(() => {});
    const bSpy = jest.spyOn(b, 'doSomething').mockImplementation(() => {});

    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [{ type: 'callMethod', entity: 'Multi', component: 'Foo', method: 'doSomething' }],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    getSignalBus().emit('sig');
    // 首个命中(a)被调,后写胜出(componentMap dedup)情况下行为依赖 Eva.js 内部顺序
    const totalCalls = aSpy.mock.calls.length + bSpy.mock.calls.length;
    expect(totalCalls).toBe(1);
    aSpy.mockRestore();
    bSpy.mockRestore();
  });

  it('callMethod 带 ref 时按 (componentName, instance.ref) 精确定位', () => {
    const scene = makeSceneWithGame();
    const target = new GameObject('Multi');
    scene.addChild(target);

    // Eva.js _componentCache 按 componentName 去重(ADR-0015),addComponent
    // 同名第二次是 no-op。本测试场景模拟 "componentMap dedup 之外多实例
    // 真实场景"(例如 plugin-trigger.findComponentByRef 在 components 列表
    // walk),直接绕过 _componentCache push 到 components 数组。
    const a = new FooComponent();
    (a as any).ref = 'patrol';
    target.addComponent(a);
    const b = new FooComponent();
    (b as any).ref = 'chase';
    (b as any).gameObject = target;
    (target as any).components.push(b);

    const aSpy = jest.spyOn(a, 'doSomething').mockImplementation(() => {});
    const bSpy = jest.spyOn(b, 'doSomething').mockImplementation(() => {});

    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            {
              type: 'callMethod',
              entity: 'Multi',
              component: 'Foo',
              method: 'doSomething',
              ref: 'chase',
            },
          ],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    getSignalBus().emit('sig');
    expect(aSpy).not.toHaveBeenCalled();
    expect(bSpy).toHaveBeenCalledTimes(1);
    aSpy.mockRestore();
    bSpy.mockRestore();
  });

  it('callMethod 带 ref 但实例 ref 不匹配时不调任何方法', () => {
    const scene = makeSceneWithGame();
    const target = new GameObject('Multi');
    scene.addChild(target);

    const a = new FooComponent();
    (a as any).ref = 'patrol';
    target.addComponent(a);

    const aSpy = jest.spyOn(a, 'doSomething').mockImplementation(() => {});

    const trigger = new Trigger({
      rules: [
        {
          on: 'sig',
          do: [
            {
              type: 'callMethod',
              entity: 'Multi',
              component: 'Foo',
              method: 'doSomething',
              ref: 'no-such-ref',
            },
          ],
        },
      ],
    });
    attachTriggerOn(scene, trigger, 'Host');

    getSignalBus().emit('sig');
    expect(aSpy).not.toHaveBeenCalled();
    aSpy.mockRestore();
  });

  it('guard 表达式可读 payload,假则跳过', () => {
    const downstream = jest.fn();
    getSignalBus().on('out', downstream);
    const trigger = new Trigger({
      rules: [
        {
          on: 'in',
          guard: 'payload.score > 100',
          do: [{ type: 'emit', signal: 'out' }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('in', { score: 50 });
    expect(downstream).not.toHaveBeenCalled();

    getSignalBus().emit('in', { score: 200 });
    expect(downstream).toHaveBeenCalledTimes(1);
  });

  it('context 字段在 guard 中可读', () => {
    const downstream = jest.fn();
    getSignalBus().on('out', downstream);
    const trigger = new Trigger({
      rules: [
        {
          on: 'in',
          guard: 'ctx.allowedScene === true',
          do: [{ type: 'emit', signal: 'out' }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('in');
    expect(downstream).not.toHaveBeenCalled();

    trigger.ctx.allowedScene = true;
    getSignalBus().emit('in');
    expect(downstream).toHaveBeenCalledTimes(1);
  });

  it('错误 guard 表达式 → console.warn 且 rule 跳过', () => {
    const downstream = jest.fn();
    getSignalBus().on('out', downstream);
    const trigger = new Trigger({
      rules: [
        {
          on: 'in',
          guard: 'this is not js',
          do: [{ type: 'emit', signal: 'out' }],
        },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('in');
    expect(downstream).not.toHaveBeenCalled();
    expect('[plugin-trigger] bad guard').toHaveBeenWarned();
  });

  it('onDestroy 清理 listeners,再 emit 不命中', () => {
    const downstream = jest.fn();
    getSignalBus().on('out', downstream);
    const trigger = new Trigger({
      rules: [
        { on: 'in', do: [{ type: 'emit', signal: 'out' }] },
      ],
    });
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    getSignalBus().emit('in');
    expect(downstream).toHaveBeenCalledTimes(1);

    trigger.onDestroy();
    getSignalBus().emit('in');
    expect(downstream).toHaveBeenCalledTimes(1); // 没增长
  });

  it('init() 不传参数时 rules 默认空,awake 不注册', () => {
    const bus = getSignalBus();
    const onSpy = jest.spyOn(bus, 'on');

    const trigger = new Trigger();
    const scene = makeSceneWithGame();
    attachTriggerOn(scene, trigger);

    expect(onSpy).not.toHaveBeenCalled();
    onSpy.mockRestore();
  });

  describe('TriggerSystem', () => {
    it('能实例化且 name 正确', () => {
      const sys = new TriggerSystem();
      expect(sys.name).toBe('Trigger');
      expect((TriggerSystem as any).systemName).toBe('Trigger');
    });
  });
});
