import { GameObject } from '@eva/eva.js';
import { Camera2D, Camera2DSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-camera2d — 相机跟随 / shake', () => {
  beforeEach(() => getSignalBus().clear());

  function makeScene(...gos: GameObject[]) {
    return { gameObjects: gos, game: null as any };
  }

  function tick(c: Camera2D, ms: number) {
    c.update({ deltaTime: ms } as any);
  }

  // 注意:GameObject.addComponent 会同步触发 init+awake;init 取的是
  // new Camera2D(params).__componentDefaultParams,所以必须把 params
  // 通过 constructor 传入,不能在 addComponent 之后再 init。
  function attach(go: GameObject, params: any): Camera2D {
    const c = new Camera2D(params);
    go.addComponent(c);
    return c;
  }

  function wireScene(c: Camera2D, ...gos: GameObject[]) {
    // 直接写 _scene 私有字段,避开 setter 内的 addGameObject 调用(scene mock 没这个方法)
    (c as any).gameObject._scene = { game: { scene: makeScene(...gos) } };
  }

  it('init 不抛错;awake 订阅 camera:shake', () => {
    const cam = new GameObject('Cam');
    const c = attach(cam, { followEntity: 'P', worldRoot: 'world' });
    // 触发 shake 信号 — 应在 update 时反映
    getSignalBus().emit('camera:shake', { intensity: 5, duration: 50 });
    expect((c as any).shake).toBeTruthy();
  });

  it('找不到 worldRoot 时 update 静默', () => {
    const player = new GameObject('P', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, { followEntity: 'P', worldRoot: 'nope' });
    wireScene(c, player, cam);
    expect(() => tick(c, 16)).not.toThrow();
  });

  it('跟随 player 把 worldRoot 反向平移', () => {
    const player = new GameObject('P', { position: { x: 100, y: 0 } });
    const world = new GameObject('world', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, { followEntity: 'P', worldRoot: 'world', viewportCenter: { x: 0, y: 0 } });
    wireScene(c, player, world, cam);
    tick(c, 16);
    // damping 默认 0(立即跟到位):cx = 0 - 100 = -100
    expect(world.transform.position.x).toBeCloseTo(-100, 0);
  });

  it('damping = 0.5 时一帧内只补 50%', () => {
    const player = new GameObject('P', { position: { x: 100, y: 0 } });
    const world = new GameObject('world', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, {
      followEntity: 'P', worldRoot: 'world',
      viewportCenter: { x: 0, y: 0 }, damping: 0.5,
    });
    wireScene(c, player, world, cam);
    tick(c, 16);
    expect(world.transform.position.x).toBeCloseTo(-50, 0);
  });

  it('deadzone 内不平移', () => {
    const player = new GameObject('P', { position: { x: 30, y: 0 } });
    const world = new GameObject('world', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, {
      followEntity: 'P', worldRoot: 'world',
      viewportCenter: { x: 0, y: 0 }, deadzone: { x: 50, y: 50 },
    });
    wireScene(c, player, world, cam);
    tick(c, 16);
    expect(world.transform.position.x).toBe(0);
  });

  it('limits 夹紧 cx', () => {
    const player = new GameObject('P', { position: { x: 1000, y: 0 } });
    const world = new GameObject('world', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, {
      followEntity: 'P', worldRoot: 'world',
      viewportCenter: { x: 0, y: 0 }, limits: { minX: -200, maxX: 0 },
    });
    wireScene(c, player, world, cam);
    tick(c, 16);
    expect(world.transform.position.x).toBeGreaterThanOrEqual(-200);
    expect(world.transform.position.x).toBeLessThanOrEqual(0);
  });

  it('camera:shake 期间偏移不为 0,duration 后归零', () => {
    const player = new GameObject('P', { position: { x: 0, y: 0 } });
    const world = new GameObject('world', { position: { x: 0, y: 0 } });
    const cam = new GameObject('Cam');
    const c = attach(cam, { followEntity: 'P', worldRoot: 'world', viewportCenter: { x: 0, y: 0 } });
    wireScene(c, player, world, cam);
    getSignalBus().emit('camera:shake', { intensity: 100, duration: 100 });
    tick(c, 16);
    expect(Math.abs(world.transform.position.x)).toBeGreaterThan(0);
    tick(c, 200);
    expect((c as any).shake).toBeNull();
  });

  it('onDestroy 清理 shake 订阅', () => {
    const cam = new GameObject('Cam');
    const c = attach(cam, {});
    c.onDestroy();
    getSignalBus().emit('camera:shake');
    expect((c as any).shake).toBeNull();
  });

  describe('Camera2DSystem', () => {
    it('能实例化', () => {
      expect(new Camera2DSystem().name).toBe('Camera2D');
    });
  });
});
