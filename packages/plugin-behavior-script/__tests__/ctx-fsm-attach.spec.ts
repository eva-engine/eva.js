/**
 * ADR-0024B — ctx.fsm.attach 单元测试
 *
 * 验证:
 *   (1) attach 找到 entity 上的 StateMachine,getFsm() 返回真实实例
 *   (2) reset / goto 直链调用 fsm.reset / fsm.goto
 *   (3) onMissing='warn' 默认行为:console.warn 一次,getFsm() 返回 null
 *   (4) onMissing='throw' 立即抛 Error
 *   (5) onMissing='wait' 静默,FSM 后来加上时 getFsm() 命中
 *   (6) detach 清空 cached,component onDestroy 自动 dispose handle(via record.cleanupHandles)
 *   (7) options.ref 三元组定位
 */
import { getSignalBus } from '@eva/plugin-signal-bus';
import { BehaviorScript, BehaviorScriptSystem } from '../lib';

function createComponent(params: { scriptId: string; props?: any }, name = 'Player') {
  const component = new BehaviorScript(params as any);
  component.gameObject = { name } as any;
  component.init(params as any);
  return component;
}

function mockGame(entities: any[] = []) {
  return {
    scene: { gameObjects: entities },
    gameObjects: entities,
    on: () => {},
    off: () => {},
  } as any;
}

/** 构造一个 StateMachine-like component (duck-typed,避免硬依赖 plugin-state-machine) */
function makeMockFsm(componentName = 'StateMachine', ref?: string) {
  const fsm: any = {
    state: 'idle',
    reset: jest.fn(),
    goto: jest.fn(),
  };
  if (ref) fsm.ref = ref;
  // 模仿 Component class:constructor.componentName
  Object.defineProperty(fsm, 'constructor', { value: { componentName } });
  return fsm;
}

function makeEntityWithFsm(name: string, fsm: any) {
  return {
    name,
    components: [fsm],
    transform: { children: [] },
  };
}

describe('ctx.fsm.attach (ADR-0024B)', () => {
  beforeEach(() => {
    getSignalBus().clear();
    jest.restoreAllMocks();
  });

  it('(1) attach 找到 entity 上的 StateMachine,getFsm() 返回真实实例', () => {
    let handle: any;
    const fsm = makeMockFsm();
    const entity = makeEntityWithFsm('NPC', fsm);

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handle = ctx.fsm.attach('NPC');
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([entity]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    expect(handle).toBeDefined();
    expect(handle.getFsm()).toBe(fsm);

    system.detach(component);
  });

  it('(2) reset / goto 直链调用 fsm 方法', () => {
    let handle: any;
    const fsm = makeMockFsm();
    const entity = makeEntityWithFsm('NPC', fsm);

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handle = ctx.fsm.attach('NPC');
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([entity]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    handle.reset({ source: 'test' });
    expect(fsm.reset).toHaveBeenCalledWith({ source: 'test' });

    handle.goto('chase');
    expect(fsm.goto).toHaveBeenCalledWith('chase', undefined);

    system.detach(component);
  });

  it('(3) onMissing="warn" 默认: console.warn 一次,getFsm() 返回 null', () => {
    let handle: any;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handle = ctx.fsm.attach('NonExistent');
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    expect(handle.getFsm()).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('ctx.fsm.attach');
    expect(warnSpy.mock.calls[0][0]).toContain('NonExistent');
    warnSpy.mockRestore();

    system.detach(component);
  });

  it('(4) onMissing="throw" 立即抛 Error', () => {
    let thrownError: Error | null = null;

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          try {
            ctx.fsm.attach('NonExistent', undefined, { onMissing: 'throw' });
          } catch (e) {
            thrownError = e as Error;
          }
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toContain('ctx.fsm.attach');

    system.detach(component);
  });

  it('(5) onMissing="wait" 静默 + 后来 FSM 出现时 getFsm() 命中', () => {
    let handle: any;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const fsm = makeMockFsm();
    const entity = makeEntityWithFsm('LateNPC', fsm);

    const game = mockGame([]);
    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handle = ctx.fsm.attach('LateNPC', undefined, { onMissing: 'wait' });
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = game;

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    // 初次 attach 时 silent + getFsm() null
    expect(warnSpy).not.toHaveBeenCalled();
    expect(handle.getFsm()).toBeNull();

    // FSM 后来加入
    game.scene.gameObjects.push(entity);
    game.gameObjects.push(entity);

    expect(handle.getFsm()).toBe(fsm);
    warnSpy.mockRestore();

    system.detach(component);
  });

  it('(6) detach 后 getFsm() 返回 null', () => {
    let handle: any;
    const fsm = makeMockFsm();
    const entity = makeEntityWithFsm('NPC', fsm);

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handle = ctx.fsm.attach('NPC');
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([entity]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    expect(handle.getFsm()).toBe(fsm);

    // detach component → record.cleanupHandles dispose → handle cached 清空
    system.detach(component);
    expect(handle.getFsm()).toBeNull();
  });

  it('(7) options.ref 按 (componentName, ref) 三元组定位', () => {
    let handlePatrol: any;
    let handleChase: any;

    const patrolFsm = makeMockFsm('StateMachine', 'patrol');
    const chaseFsm = makeMockFsm('StateMachine', 'chase');

    // 同 entity 上两个 StateMachine 实例
    const entity = {
      name: 'NPC',
      components: [patrolFsm, chaseFsm],
      transform: { children: [] },
    };

    const system = new BehaviorScriptSystem({
      scripts: {
        ai: (ctx: any) => {
          handlePatrol = ctx.fsm.attach('NPC', undefined, { ref: 'patrol' });
          handleChase = ctx.fsm.attach('NPC', undefined, { ref: 'chase' });
          return {};
        },
      },
    });
    system.init(system.__systemDefaultParams);
    (system as any).game = mockGame([entity]);

    const component = createComponent({ scriptId: 'ai' });
    system.attach(component);

    expect(handlePatrol.getFsm()).toBe(patrolFsm);
    expect(handleChase.getFsm()).toBe(chaseFsm);

    system.detach(component);
  });
});
