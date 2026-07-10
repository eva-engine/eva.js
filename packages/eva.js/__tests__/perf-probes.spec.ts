/**
 * installPerfProbes 单元测试。
 *
 * 不依赖渲染器,只用真实 Ticker + RAF mock(__mocks__/requestAnimationFrame)
 * 让 ticker.update() 在测试可控地"跑帧"。
 *
 * 关键点:setupJestEnv.ts 的 afterEach 会捕获未断言的 console.warn,
 * 所以默认用 `warnOnViolation: false`;只有专门验证 warn 的用例打开。
 */
import { Game, GameObject, System, installPerfProbes } from '../lib';
import type { FrameParams } from '../lib';
import { requestAnimationFrameMock } from './__mocks__/requestAnimationFrame';

class SystemA extends System {
  static systemName = 'SystemA';
  readonly name = 'SystemA';
  update() {
    /* fast */
  }
  lateUpdate() {
    /* fast */
  }
}

class SystemB extends System {
  static systemName = 'SystemB';
  readonly name = 'SystemB';
  update() {
    /* duration is controlled by useSteppingPerformanceNow in timing tests */
  }
}

class PhysicalTimedSystem extends System {
  static systemName = 'PhysicalTimedSystem';
  readonly name = 'PhysicalTimedSystem';
  updateCalls = 0;
  lateUpdateCalls = 0;
  frameStartCalls = 0;
  frameUpdateCalls = 0;

  resetCounts() {
    this.updateCalls = 0;
    this.lateUpdateCalls = 0;
    this.frameStartCalls = 0;
    this.frameUpdateCalls = 0;
  }

  update() {
    this.updateCalls++;
  }

  lateUpdate() {
    this.lateUpdateCalls++;
  }

  frameStart() {
    this.frameStartCalls++;
  }

  frameUpdate() {
    this.frameUpdateCalls++;
  }
}

const frameDuration = 1000 / 60;

function startAtRafBaseline(game: Game) {
  game.start();
  requestAnimationFrameMock.stepTo(requestAnimationFrameMock.currentTime);
}

function advanceLogicalFrames(count = 1) {
  for (let frame = 0; frame < count; frame++) {
    requestAnimationFrameMock.advanceBy(frameDuration);
  }
}

function useSteppingPerformanceNow(step = 1) {
  let value = 0;
  return jest.spyOn(performance, 'now').mockImplementation(() => {
    const current = value;
    value += step;
    return current;
  });
}

describe('installPerfProbes', () => {
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  it.each([
    ['zero', 0, 1],
    ['two', 2, frameDuration * 2],
    ['five (capped)', 5, frameDuration * 10],
  ])(
    'emits one physical sample for %s logical updates and aggregates System timings',
    async (_label, expectedUpdates, rafDeltaTime) => {
      const nowSpy = useSteppingPerformanceNow();
      const game = new Game();
      const system = new PhysicalTimedSystem();
      let probes: ReturnType<typeof installPerfProbes> | null = null;
      try {
        await game.init({ systems: [system], autoStart: false, needScene: false });
        probes = installPerfProbes(game, { warnOnViolation: false });
        const frames: any[] = [];
        probes.onFrame(frame => frames.push(frame));

        startAtRafBaseline(game);
        frames.length = 0;
        system.resetCounts();
        requestAnimationFrameMock.advanceBy(rafDeltaTime);

        expect(frames).toHaveLength(1);
        const sample = frames[0];
        const systemSample = sample.systems.find(item => item.name === system.name);
        expect(sample.updatesThisFrame).toBe(expectedUpdates);
        expect(sample.rafDeltaTime).toBeCloseTo(rafDeltaTime, 8);
        expect(system.updateCalls).toBe(expectedUpdates);
        expect(system.lateUpdateCalls).toBe(expectedUpdates);
        expect(system.frameStartCalls).toBe(1);
        expect(system.frameUpdateCalls).toBe(1);
        expect(systemSample.updateMs).toBe(expectedUpdates);
        expect(systemSample.lateUpdateMs).toBe(expectedUpdates);
        expect(systemSample.frameUpdateMs).toBe(1);
        expect(systemSample).not.toHaveProperty('frameStartMs');

        const systemSum = systemSample.updateMs + systemSample.lateUpdateMs + systemSample.frameUpdateMs;
        expect(sample.gameObjectsMs).toBe(Math.max(0, sample.frameMs - systemSum));
      } finally {
        probes?.uninstall();
        game.destroy();
        nowSpy.mockRestore();
      }
    },
  );

  it('derives FPS from positive RAF intervals and excludes the baseline from averages', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false });

    startAtRafBaseline(game);
    expect((probes.current()! as any).rafDeltaTime).toBe(0);
    requestAnimationFrameMock.advanceBy(20);

    expect((probes.current()! as any).rafDeltaTime).toBe(20);
    expect(probes.current()!.fps).toBeCloseTo(50, 8);
    expect(probes.average()!.fps).toBeCloseTo(50, 8);

    probes.uninstall();
    game.destroy();
  });

  it('registers prologue/epilogue at physical priorities and removes them from the captured ticker', () => {
    const ticker = {
      addFrameStart: jest.fn(),
      removeFrameStart: jest.fn(),
      addFrame: jest.fn(),
      removeFrame: jest.fn(),
    };
    const replacementTicker = {
      addFrameStart: jest.fn(),
      removeFrameStart: jest.fn(),
      addFrame: jest.fn(),
      removeFrame: jest.fn(),
    };
    const game = {
      ticker,
      systems: [],
      gameObjects: [],
      on: jest.fn(),
      off: jest.fn(),
    } as any;

    const probes = installPerfProbes(game, { warnOnViolation: false });
    expect(ticker.addFrameStart).toHaveBeenCalledWith(expect.any(Function), -Infinity);
    expect(ticker.addFrame).toHaveBeenCalledWith(expect.any(Function), Infinity);
    const prologue = ticker.addFrameStart.mock.calls[0][0];
    const epilogue = ticker.addFrame.mock.calls[0][0];

    game.ticker = replacementTicker;
    probes.uninstall();

    expect(ticker.removeFrameStart).toHaveBeenCalledWith(prologue);
    expect(ticker.removeFrame).toHaveBeenCalledWith(epilogue);
    expect(replacementTicker.removeFrameStart).not.toHaveBeenCalled();
    expect(replacementTicker.removeFrame).not.toHaveBeenCalled();
  });

  it('preserves user method replacements installed above every probe wrapper', () => {
    class OwnedMethodsSystem extends System {
      static systemName = 'OwnedMethodsSystem';
      update() {}
      lateUpdate() {}
      frameStart() {}
      frameUpdate() {}
    }
    const system = new OwnedMethodsSystem();
    const ticker = {
      addFrameStart: jest.fn(),
      removeFrameStart: jest.fn(),
      addFrame: jest.fn(),
      removeFrame: jest.fn(),
    };
    const game = {
      ticker,
      systems: [system],
      gameObjects: [],
      on: jest.fn(),
      off: jest.fn(),
    } as any;
    const originals = {
      update: system.update,
      lateUpdate: system.lateUpdate,
      frameStart: system.frameStart,
      frameUpdate: system.frameUpdate,
    };

    const probes = installPerfProbes(game, { warnOnViolation: false });
    expect(system.update).not.toBe(originals.update);
    expect(system.lateUpdate).not.toBe(originals.lateUpdate);
    expect(system.frameStart).not.toBe(originals.frameStart);
    expect(system.frameUpdate).not.toBe(originals.frameUpdate);

    const replacements = {
      update: jest.fn(),
      lateUpdate: jest.fn(),
      frameStart: jest.fn(),
      frameUpdate: jest.fn(),
    };
    system.update = replacements.update;
    system.lateUpdate = replacements.lateUpdate;
    system.frameStart = replacements.frameStart;
    system.frameUpdate = replacements.frameUpdate;

    probes.uninstall();

    expect(system.update).toBe(replacements.update);
    expect(system.lateUpdate).toBe(replacements.lateUpdate);
    expect(system.frameStart).toBe(replacements.frameStart);
    expect(system.frameUpdate).toBe(replacements.frameUpdate);
  });

  it('includes frameUpdateMs in System budgets and average aggregation', async () => {
    const nowSpy = useSteppingPerformanceNow(2);
    const game = new Game();
    const system = new PhysicalTimedSystem();
    let probes: ReturnType<typeof installPerfProbes> | null = null;
    try {
      await game.init({ systems: [system], autoStart: false, needScene: false });
      const seen: any[] = [];
      probes = installPerfProbes(game, {
        warnOnViolation: false,
        budget: { maxSystemMs: { PhysicalTimedSystem: 1 }, sustainedFrames: 1 },
      });
      probes.onViolation(violation => seen.push(violation));

      startAtRafBaseline(game);

      expect(seen.some(violation => violation.name === 'system:PhysicalTimedSystem')).toBe(true);
      expect((probes.current()!.systems[0] as any).frameUpdateMs).toBe(2);
      expect((probes.average()!.systems[0] as any).frameUpdateMs).toBe(2);
    } finally {
      probes?.uninstall();
      game.destroy();
      nowSpy.mockRestore();
    }
  });

  it('patches a System added during frameStart before its same-frame logical and physical hooks', async () => {
    const nowSpy = useSteppingPerformanceNow();
    const game = new Game();
    class SameFrameSystem extends System {
      static systemName = 'SameFrameSystem';
      readonly name = 'SameFrameSystem';
      update() {}
      lateUpdate() {}
      frameUpdate() {}
    }
    const sameFrameSystem = new SameFrameSystem();
    class AddingSystem extends System {
      static systemName = 'AddingSystem';
      added = false;
      frameStart(frame: FrameParams) {
        if (frame.rafDeltaTime <= 0 || this.added) return;
        this.added = true;
        void this.game.addSystem(sameFrameSystem);
      }
    }
    class AfterUninstallSystem extends System {
      static systemName = 'AfterUninstallSystem';
      update() {}
    }

    let probes: ReturnType<typeof installPerfProbes> | null = null;
    try {
      await game.init({ systems: [new AddingSystem()], autoStart: false, needScene: false });
      expect(game.listenerCount('systemAdded')).toBe(0);
      probes = installPerfProbes(game, { warnOnViolation: false });
      expect(game.listenerCount('systemAdded')).toBe(1);

      startAtRafBaseline(game);
      requestAnimationFrameMock.advanceBy(frameDuration);

      expect(game.systems).toContain(sameFrameSystem);
      const sample = probes.current()!;
      const systemSample = sample.systems.find(system => system.name === 'SameFrameSystem')!;
      expect(systemSample.updateMs).toBe(1);
      expect(systemSample.lateUpdateMs).toBe(1);
      expect(systemSample.frameUpdateMs).toBe(1);
      expect(sample.gameObjectsMs).toBe(sample.frameMs - 3);

      probes.uninstall();
      probes = null;
      expect(game.listenerCount('systemAdded')).toBe(0);

      const afterUninstall = new AfterUninstallSystem();
      const originalUpdate = afterUninstall.update;
      await game.addSystem(afterUninstall);
      expect(afterUninstall.update).toBe(originalUpdate);
      expect(Object.prototype.hasOwnProperty.call(afterUninstall, 'update')).toBe(false);
    } finally {
      probes?.uninstall();
      game.destroy();
      nowSpy.mockRestore();
    }
  });

  it('install 后跑几帧能拿到 current() 含 system 时长', async () => {
    const game = new Game();
    await game.init({
      systems: [new SystemA(), new SystemB()],
      autoStart: false,
      needScene: false,
    });
    const probes = installPerfProbes(game, { warnOnViolation: false });
    startAtRafBaseline(game);
    advanceLogicalFrames(3);

    const cur = probes.current();
    expect(cur).not.toBeNull();
    const names = cur!.systems.map(s => s.name).sort();
    expect(names).toEqual(['SystemA', 'SystemB']);
    expect(cur!.frameMs).toBeGreaterThanOrEqual(0);
    expect(cur!.gameObjectsMs).toBeGreaterThanOrEqual(0);

    probes.uninstall();
    game.destroy();
  });

  it('uninstall 后 system.update 还原成原方法,新帧不再被探针记录', async () => {
    const game = new Game();
    const a = new SystemA();
    await game.init({ systems: [a], autoStart: false, needScene: false });

    const origUpdate = (a as any).update;
    const probes = installPerfProbes(game, { warnOnViolation: false });
    // install 之后 update 应该被替换
    expect((a as any).update).not.toBe(origUpdate);

    probes.uninstall();
    // uninstall 之后 — 因为 update 是定义在原型上的,delete 实例属性会回到原型
    // 这里直接断言:实例自身不再带 own update
    const ownUpdate = Object.prototype.hasOwnProperty.call(a, 'update');
    expect(ownUpdate).toBe(false);
    // 行为上等价:a.update 仍可调用,且就是原型上的原方法
    expect((a as any).update).toBe(origUpdate);

    game.destroy();
  });

  it('average() 在 sampleSize 帧后不为空,数值合理', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false, sampleSize: 5 });
    startAtRafBaseline(game);
    advanceLogicalFrames(6);

    const avg = probes.average();
    expect(avg).not.toBeNull();
    expect(avg!.systems.length).toBe(1);
    expect(avg!.fps).toBeGreaterThan(0);
    expect(Number.isFinite(avg!.frameMs)).toBe(true);

    probes.uninstall();
    game.destroy();
  });

  it('系统持续超 budget 累计到 sustainedFrames 后触发 onViolation 一次', async () => {
    const nowSpy = useSteppingPerformanceNow(2);
    const game = new Game();
    const b = new SystemB();
    let probes: ReturnType<typeof installPerfProbes> | null = null;
    try {
      await game.init({ systems: [b], autoStart: false, needScene: false });

      const seen: any[] = [];
      probes = installPerfProbes(game, {
        warnOnViolation: false, // 不让 setupJestEnv afterEach 抓未断言 warn
        sampleSize: 5,
        budget: {
          maxSystemMs: { SystemB: 1 },
          sustainedFrames: 3,
        },
      });
      probes.onViolation(v => seen.push(v));
      startAtRafBaseline(game);

      // baseline 之后跑 3 个逻辑帧应该触发一次
      advanceLogicalFrames(3);
      expect(seen.length).toBeGreaterThanOrEqual(1);
      expect(seen[0].name).toBe('system:SystemB');
      expect(seen[0].actual).toBeGreaterThan(seen[0].threshold);
      expect(probes.violations().some(v => v.name === 'system:SystemB')).toBe(true);
    } finally {
      probes?.uninstall();
      game.destroy();
      nowSpy.mockRestore();
    }
  });

  it('onFrame 订阅 + dispose 后停止收到', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false });

    const calls: number[] = [];
    const dispose = probes.onFrame(f => {
      calls.push(f.frameCount);
    });

    startAtRafBaseline(game);
    advanceLogicalFrames(2);
    const before = calls.length;
    expect(before).toBeGreaterThanOrEqual(1);

    dispose();
    advanceLogicalFrames(3);
    expect(calls.length).toBe(before);

    probes.uninstall();
    game.destroy();
  });

  it('uninstall 后再次 install 工作正常,没有嵌套 hook', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const p1 = installPerfProbes(game, { warnOnViolation: false });
    startAtRafBaseline(game);
    advanceLogicalFrames();
    expect(p1.current()).not.toBeNull();
    p1.uninstall();

    // 再次 install
    const p2 = installPerfProbes(game, { warnOnViolation: false });
    advanceLogicalFrames();
    const cur = p2.current();
    expect(cur).not.toBeNull();
    expect(cur!.systems.map(s => s.name)).toContain('SystemA');
    p2.uninstall();
    game.destroy();
  });

  it('install 时 ticker 还没启动也不抛异常,start 后能拿到采样', async () => {
    const game = new Game();
    await game.init({
      systems: [new SystemA()],
      autoStart: false, // ticker 已经 init 但未 start
      needScene: false,
    });
    let probes: ReturnType<typeof installPerfProbes> | null = null;
    expect(() => {
      probes = installPerfProbes(game, { warnOnViolation: false });
    }).not.toThrow();
    startAtRafBaseline(game);
    advanceLogicalFrames();
    expect(probes!.current()).not.toBeNull();
    probes!.uninstall();
    game.destroy();
  });

  it('install 之后 addSystem 的 system 也会被自动 patch 到', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false });
    startAtRafBaseline(game);
    advanceLogicalFrames();

    // install 之后再加一个 system
    await game.addSystem(SystemB);
    advanceLogicalFrames(2);

    const cur = probes.current();
    expect(cur!.systems.map(s => s.name).sort()).toEqual(['SystemA', 'SystemB']);

    probes.uninstall();
    game.destroy();
  });

  it('onViolation 回调内部 dispose 自身不引发遍历崩溃', async () => {
    const nowSpy = useSteppingPerformanceNow(2);
    const game = new Game();
    const b = new SystemB();
    let probes: ReturnType<typeof installPerfProbes> | null = null;
    try {
      await game.init({ systems: [b], autoStart: false, needScene: false });
      probes = installPerfProbes(game, {
        warnOnViolation: false,
        budget: { maxSystemMs: { SystemB: 1 }, sustainedFrames: 1 },
      });

      let calls = 0;
      const dispose = probes.onViolation(() => {
        calls += 1;
        dispose(); // 在回调内取消自己
      });
      startAtRafBaseline(game);
      advanceLogicalFrames(3);
      // 至少触发了一次,dispose 后续不再触发
      expect(calls).toBe(1);
    } finally {
      probes?.uninstall();
      game.destroy();
      nowSpy.mockRestore();
    }
  });

  it('gameObjects 时长非负,gameObjectCount 反映实际 GameObject 数', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false });
    // 有默认 scene,加几个 gameObject
    const go1 = new GameObject('a');
    const go2 = new GameObject('b');
    game.scene.addGameObject(go1);
    game.scene.addGameObject(go2);

    const probes = installPerfProbes(game, { warnOnViolation: false });
    startAtRafBaseline(game);
    advanceLogicalFrames(2);

    const cur = probes.current();
    expect(cur).not.toBeNull();
    expect(cur!.gameObjectsMs).toBeGreaterThanOrEqual(0);
    // scene 自身 + 两个 gameObject(scene.gameObjects 包含 scene 本身,见 scene.spec.ts)
    expect(cur!.gameObjectCount).toBeGreaterThanOrEqual(2);

    probes.uninstall();
    game.destroy();
  });
});
