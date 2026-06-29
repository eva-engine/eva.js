// @eva/plugin-renderer-dragonbone 单元测试
//
// 设计要点(写在前面,排错时减少误判):
//
// 1. 不加载真实 db.js bundle(615KB,依赖 PIXI 真实实现)。
//    通过 jest.mock 把 lib/db 重定向到 __mocks__/db.ts 的最小 stub,
//    只保留 system.ts/engine.ts 实际触达的 PixiFactory.factory.* 接口。
//
// 2. 不直接对 DragonBoneSystem.init() 做端到端集成测试 —— 它依赖
//    game.getSystem(RendererSystem)、application.ticker,远超 PR 单测目标。
//    System 层只测两件事:
//      a. 名称/构造可达;
//      b. componentChanged ADD 路径会创建 armature display(用手工 stub
//         renderSystem 字段绕开 init()),其中需要 mock resource.getResource。
//
// 3. DragonBone 组件单测前先注入一个最小 fake gameObject —— 只在
//    armatureName 缺失抛错时使用 gameObject.name,正常路径根本不读它。

import dragonBones from '../lib/db';

jest.mock('../lib/db', () => {
  // jest.mock 的工厂函数不能引用外层变量,所以在内部 require。
  return require('./__mocks__/db').default;
});

// resource 必须在 import system 之前 mock,因为 system 顶层有
// resource.registerResourceType('DRAGONBONE') 副作用。我们走 lib 真实模块,
// 但在测试 add() 时再 spy getResource。
import { resource, OBSERVER_TYPE } from '@eva/eva.js';
import DragonBone from '../lib/component';
import DragonBoneSystem from '../lib/system';

// 类型化拿到 mock(经过 jest.mock 后已经是 stub)
const mockedDb = dragonBones as unknown as {
  PixiFactory: {
    factory: {
      buildArmatureDisplay: jest.Mock;
      parseDragonBonesData: jest.Mock;
      parseTextureAtlasData: jest.Mock;
      removeDragonBonesData: jest.Mock;
      removeTextureAtlasData: jest.Mock;
    };
    _clockHandler: jest.Mock;
  };
};

function makeFakeGameObject(name = 'dragon-host', id = 1) {
  return { name, id, transform: {} } as any;
}

describe('@eva/plugin-renderer-dragonbone — DragonBone Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该暴露 componentName=DragonBone 与默认字段', () => {
    expect(DragonBone.componentName).toBe('DragonBone');
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    expect(comp.name).toBe('DragonBone');
    expect(comp.resource).toBe('');
    expect(comp.armatureName).toBe('');
    expect(comp.animationName).toBe('');
    // 默认 autoPlay=true(组件级)
    expect(comp.autoPlay).toBe(true);
  });

  it('init() 解析 resource/armatureName/animationName/autoPlay 字段', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: false,
    });
    expect(comp.resource).toBe('hero');
    expect(comp.armatureName).toBe('Hero');
    expect(comp.animationName).toBe('idle');
    expect(comp.autoPlay).toBe(false);
  });

  it('init() 缺 armatureName 时抛错并把 gameObject.name 带在错误信息里', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject('badbone');
    expect(() =>
      comp.init({
        resource: 'hero',
        armatureName: undefined as unknown as string,
      }),
    ).toThrow(/badbone.*armatureName is required/);
  });

  it('init(autoPlay=true) 在 armature 未就绪时把 play 排队成 waitPlay', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: true,
    });
    // 还没设置 armature,play 走 waitPlayInfo 路径
    expect(comp.armature).toBeFalsy();
    // 注入一个 mock armature(模拟 system.add() 完成),应触发挂起的 play
    const armature = {
      play: jest.fn(),
      stop: jest.fn(),
    };
    comp.armature = armature as any;
    expect(armature.play).toHaveBeenCalledTimes(1);
    expect(armature.play).toHaveBeenCalledWith('idle', undefined);
  });

  it('play(name, times) 在 armature 已就绪时直接调底层 armature.play', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: false,
    });
    const armature = { play: jest.fn(), stop: jest.fn() };
    comp.armature = armature as any;
    // 切换播放
    comp.play('run', 2);
    expect(comp.animationName).toBe('run');
    expect(armature.play).toHaveBeenCalledWith('run', 2);
  });

  it('stop() 立即调底层 armature.stop 并清空 animationName', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: false,
    });
    const armature = { play: jest.fn(), stop: jest.fn() };
    comp.armature = armature as any;
    comp.stop('idle');
    expect(armature.stop).toHaveBeenCalledWith('idle');
    expect(comp.animationName).toBeNull();
  });

  it('armature setter 在收到非空值时回放 waitPlay/waitStop 队列', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    // 先 init 让 autoPlay=true 排好 waitPlay
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: true,
    });
    // 再额外排一个 stop(armature 仍未 ready)
    comp.stop('idle');
    const armature = { play: jest.fn(), stop: jest.fn() };
    // 装上 armature -> waitPlay 先放,再 waitStop
    comp.armature = armature as any;
    expect(armature.play).toHaveBeenCalled();
    expect(armature.stop).toHaveBeenCalled();
  });

  it('armature setter 接到 null 时不会再清空标志位(REMOVE 路径直接返回)', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      autoPlay: true,
    });
    // 此时 waitPlay=true(因 autoPlay 自动 play 失败排队)
    comp.armature = null as any;
    // 不抛错,且 armature getter 拿回 null
    expect(comp.armature).toBeNull();
  });

  it('onDestroy() 会清理事件 listener', () => {
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject();
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      autoPlay: false,
    });
    const handler = jest.fn();
    comp.on('complete', handler);
    comp.onDestroy();
    // emit 后 handler 不应被触发(已被 removeAllListeners 清掉)
    comp.emit('complete');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('@eva/plugin-renderer-dragonbone — DragonBoneSystem', () => {
  let system: DragonBoneSystem;

  beforeEach(() => {
    jest.clearAllMocks();
    system = new DragonBoneSystem();
  });

  it('应该暴露 systemName=DragonBone 与基础字段', () => {
    expect(DragonBoneSystem.systemName).toBe('DragonBone');
    expect(system.name).toBe('DragonBone');
    expect(system.armatures).toEqual({});
  });

  it('init() 期间会把自己的 tick handler 注册到 application.ticker 上(伪 game)', () => {
    // 伪造 RendererSystem 期望的最小形态
    const ticker = { add: jest.fn(), remove: jest.fn() };
    const fakeRenderSystem: any = {
      rendererManager: { register: jest.fn() },
      application: { ticker },
      containerManager: { getContainer: jest.fn() },
    };
    (system as any).game = {
      getSystem: jest.fn(() => fakeRenderSystem),
    };
    // 让 init 中 game.getSystem(RendererSystem) 走通
    system.init();
    expect(fakeRenderSystem.rendererManager.register).toHaveBeenCalledWith(system);
    expect(ticker.add).toHaveBeenCalledTimes(1);
    // System 自己接管 tick → 注册的是 system._tickHandler,context=system 本身。
    // (旧实现是 dragonBones.PixiFactory._clockHandler / PixiFactory,pixi v8
    // 下 callback 第一参数从 number 变成 Ticker 对象,旧公式产出 NaN,所以这层
    // 由 plugin 自接 ticker.deltaMS 推 advanceTime — 详见 system.ts:_tickHandler)
    expect(ticker.add).toHaveBeenCalledWith(
      (system as any)._tickHandler,
      system,
    );
    // 调用 handler 后,dragonBones._dragonBonesInstance.advanceTime 应被推进
    const advanceTimeSpy = jest.fn();
    (mockedDb.PixiFactory as any)._dragonBonesInstance = { advanceTime: advanceTimeSpy };
    (system as any)._tickHandler({ deltaMS: 33.3 });
    expect(advanceTimeSpy).toHaveBeenCalledTimes(1);
    expect(advanceTimeSpy.mock.calls[0][0]).toBeCloseTo(0.0333, 4);
  });

  it('componentChanged ADD 时拉资源 -> 建 armature -> 注册 9 种事件转发', async () => {
    // 1) 装上一个 stub renderSystem,避开 init()
    const armatureContainer: any[] = [];
    const fakeContainer = {
      addChildAt: jest.fn((armature: any) => armatureContainer.push(armature)),
      removeChild: jest.fn((armature: any) => {
        const i = armatureContainer.indexOf(armature);
        if (i >= 0) armatureContainer.splice(i, 1);
      }),
    };
    (system as any).renderSystem = {
      containerManager: {
        getContainer: jest.fn(() => fakeContainer),
      },
    };

    // 2) mock resource.getResource 直接 resolve
    const getResourceSpy = jest
      .spyOn(resource, 'getResource')
      .mockResolvedValue({ name: 'hero', type: 'DRAGONBONE' as any, instance: {} } as any);

    // 3) 准备组件 + changed 描述
    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject('hero-go', 42);
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: true,
    });
    const emitSpy = jest.spyOn(comp, 'emit');

    const changed = {
      type: OBSERVER_TYPE.ADD,
      componentName: 'DragonBone',
      component: comp,
      gameObject: comp.gameObject,
      prop: { prop: [] },
    } as any;

    await system.componentChanged(changed);
    // 等一拍让 await getResource 后的 then 链跑完
    await Promise.resolve();
    await Promise.resolve();

    expect(getResourceSpy).toHaveBeenCalledWith('hero');
    // armature 建出来并塞进 container
    expect(mockedDb.PixiFactory.factory.buildArmatureDisplay).toHaveBeenCalledWith('Hero');
    expect(fakeContainer.addChildAt).toHaveBeenCalledTimes(1);
    expect(system.armatures[42]).toBeDefined();

    // 9 种事件转发都注册了 -> 触发底层 emit 后,组件层 emit 也会发
    const armature = (system.armatures[42] as any).armature;
    armature.emit('start', { name: 'idle' });
    armature.emit('complete', { name: 'idle' });
    armature.emit('frameEvent', { name: 'foot' });
    expect(emitSpy).toHaveBeenCalledWith('start', expect.anything());
    expect(emitSpy).toHaveBeenCalledWith('complete', expect.anything());
    expect(emitSpy).toHaveBeenCalledWith('frameEvent', expect.anything());

    getResourceSpy.mockRestore();
  });

  it('componentChanged REMOVE 时销毁 armature 并清空 system.armatures', async () => {
    // 复用 ADD 路径建出 armature
    const fakeContainer = {
      addChildAt: jest.fn(),
      removeChild: jest.fn(),
    };
    (system as any).renderSystem = {
      containerManager: { getContainer: jest.fn(() => fakeContainer) },
    };
    const getResourceSpy = jest
      .spyOn(resource, 'getResource')
      .mockResolvedValue({ name: 'hero', type: 'DRAGONBONE' as any, instance: {} } as any);

    const comp = new DragonBone();
    comp.gameObject = makeFakeGameObject('hero-go', 7);
    comp.init({
      resource: 'hero',
      armatureName: 'Hero',
      animationName: 'idle',
      autoPlay: true,
    });

    await system.componentChanged({
      type: OBSERVER_TYPE.ADD,
      componentName: 'DragonBone',
      component: comp,
      gameObject: comp.gameObject,
      prop: { prop: [] },
    } as any);
    await Promise.resolve();
    await Promise.resolve();
    expect(system.armatures[7]).toBeDefined();
    const builtArmature = (system.armatures[7] as any).armature;

    await system.componentChanged({
      type: OBSERVER_TYPE.REMOVE,
      componentName: 'DragonBone',
      component: comp,
      gameObject: comp.gameObject,
      prop: { prop: [] },
    } as any);

    expect(fakeContainer.removeChild).toHaveBeenCalledWith(builtArmature);
    expect(builtArmature.removeAllListeners).toHaveBeenCalled();
    expect(builtArmature.destroy).toHaveBeenCalledWith({ children: true });
    expect(system.armatures[7]).toBeUndefined();
    expect(comp.armature).toBeNull();

    getResourceSpy.mockRestore();
  });
});
