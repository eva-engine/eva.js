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
  busyMs = 0;
  update() {
    if (this.busyMs > 0) {
      const target = Date.now() + this.busyMs;
      // 忙等模拟耗时,确保 perf.now 看到延时
      // eslint-disable-next-line no-empty
      while (Date.now() < target) {}
    }
  }
}

/** 推一帧:补 sleep + triggerNextAnimationFrame */
async function advanceFrame(intervalMs = 17) {
  await new Promise((r) => setTimeout(r, intervalMs));
  requestAnimationFrameMock.triggerNextAnimationFrame();
}

describe('installPerfProbes', () => {
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  it('install 后跑几帧能拿到 current() 含 system 时长', async () => {
    const game = new Game();
    await game.init({
      systems: [new SystemA(), new SystemB()],
      autoStart: false,
      needScene: false,
    });
    const probes = installPerfProbes(game, { warnOnViolation: false });
    game.start();

    for (let i = 0; i < 3; i++) await advanceFrame();

    const cur = probes.current();
    expect(cur).not.toBeNull();
    const names = cur!.systems.map((s) => s.name).sort();
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
    game.start();

    for (let i = 0; i < 6; i++) await advanceFrame();

    const avg = probes.average();
    expect(avg).not.toBeNull();
    expect(avg!.systems.length).toBe(1);
    expect(avg!.fps).toBeGreaterThan(0);
    expect(Number.isFinite(avg!.frameMs)).toBe(true);

    probes.uninstall();
    game.destroy();
  });

  it('系统持续超 budget 累计到 sustainedFrames 后触发 onViolation 一次', async () => {
    const game = new Game();
    const b = new SystemB();
    b.busyMs = 5; // 每帧 update 至少 5ms
    await game.init({ systems: [b], autoStart: false, needScene: false });

    const seen: any[] = [];
    const probes = installPerfProbes(game, {
      warnOnViolation: false, // 不让 setupJestEnv afterEach 抓未断言 warn
      sampleSize: 5,
      budget: {
        maxSystemMs: { SystemB: 1 }, // 1ms 上限,5ms 必然超
        sustainedFrames: 3,
      },
    });
    probes.onViolation((v) => seen.push(v));
    game.start();

    // 跑 3 帧应该触发一次
    for (let i = 0; i < 3; i++) await advanceFrame();
    expect(seen.length).toBeGreaterThanOrEqual(1);
    expect(seen[0].name).toBe('system:SystemB');
    expect(seen[0].actual).toBeGreaterThan(seen[0].threshold);
    expect(probes.violations().some((v) => v.name === 'system:SystemB')).toBe(true);

    probes.uninstall();
    game.destroy();
  });

  it('onFrame 订阅 + dispose 后停止收到', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false });

    const calls: number[] = [];
    const dispose = probes.onFrame((f) => {
      calls.push(f.frameCount);
    });

    game.start();
    for (let i = 0; i < 2; i++) await advanceFrame();
    const before = calls.length;
    expect(before).toBeGreaterThanOrEqual(1);

    dispose();
    for (let i = 0; i < 3; i++) await advanceFrame();
    expect(calls.length).toBe(before);

    probes.uninstall();
    game.destroy();
  });

  it('uninstall 后再次 install 工作正常,没有嵌套 hook', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const p1 = installPerfProbes(game, { warnOnViolation: false });
    game.start();
    await advanceFrame();
    expect(p1.current()).not.toBeNull();
    p1.uninstall();

    // 再次 install
    const p2 = installPerfProbes(game, { warnOnViolation: false });
    await advanceFrame();
    const cur = p2.current();
    expect(cur).not.toBeNull();
    expect(cur!.systems.map((s) => s.name)).toContain('SystemA');
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
    probes!.uninstall();
    game.destroy();
  });

  it('install 之后 addSystem 的 system 也会被自动 patch 到', async () => {
    const game = new Game();
    await game.init({ systems: [new SystemA()], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, { warnOnViolation: false });
    game.start();
    await advanceFrame();

    // install 之后再加一个 system
    await game.addSystem(SystemB);
    for (let i = 0; i < 2; i++) await advanceFrame();

    const cur = probes.current();
    expect(cur!.systems.map((s) => s.name).sort()).toEqual(['SystemA', 'SystemB']);

    probes.uninstall();
    game.destroy();
  });

  it('onViolation 回调内部 dispose 自身不引发遍历崩溃', async () => {
    const game = new Game();
    const b = new SystemB();
    b.busyMs = 5;
    await game.init({ systems: [b], autoStart: false, needScene: false });
    const probes = installPerfProbes(game, {
      warnOnViolation: false,
      budget: { maxSystemMs: { SystemB: 1 }, sustainedFrames: 1 },
    });

    let calls = 0;
    const dispose = probes.onViolation(() => {
      calls += 1;
      dispose(); // 在回调内取消自己
    });
    game.start();
    for (let i = 0; i < 3; i++) await advanceFrame();
    // 至少触发了一次,dispose 后续不再触发
    expect(calls).toBe(1);

    probes.uninstall();
    game.destroy();
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
    game.start();
    for (let i = 0; i < 2; i++) await advanceFrame();

    const cur = probes.current();
    expect(cur).not.toBeNull();
    expect(cur!.gameObjectsMs).toBeGreaterThanOrEqual(0);
    // scene 自身 + 两个 gameObject(scene.gameObjects 包含 scene 本身,见 scene.spec.ts)
    expect(cur!.gameObjectCount).toBeGreaterThanOrEqual(2);

    probes.uninstall();
    game.destroy();
  });
});
