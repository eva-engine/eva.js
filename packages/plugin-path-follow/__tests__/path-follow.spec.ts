import { GameObject } from '@eva/eva.js';
import { PathFollow, PathFollowSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-path-follow — Waypoint 路径行进', () => {
  beforeEach(() => getSignalBus().clear());

  function tick(p: PathFollow, ms: number) {
    p.update({ deltaTime: ms } as any);
  }

  function make(params: any): { go: GameObject; pf: PathFollow } {
    const go = new GameObject('runner', { position: { x: 0, y: 0 } });
    const pf = new PathFollow();
    go.addComponent(pf);
    pf.init(params);
    return { go, pf };
  }

  it('init 解析参数,rebuild 后 totalLen 正确', () => {
    const { pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
      speed: 100,
    });
    // 100 + 100 = 200
    expect((pf as any).totalLen).toBe(200);
  });

  it('autostart=false 时 awake 不前进', () => {
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
    });
    pf.awake();
    tick(pf, 1000);
    expect(go.transform.position.x).toBe(0);
  });

  it('once 走到底停止 + emit signal', () => {
    const fn = jest.fn();
    getSignalBus().on('done', fn);
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
      autostart: true,
      signal: 'done',
      loop: 'once',
    });
    pf.awake();
    tick(pf, 500); // 500ms * 100/s = 50px
    expect(go.transform.position.x).toBeCloseTo(50, 1);
    tick(pf, 600); // 总 110ms,超出 100,触发 finish
    expect(go.transform.position.x).toBe(100);
    expect(fn).toHaveBeenCalled();
    // 再 tick 不应继续
    tick(pf, 100);
    expect(go.transform.position.x).toBe(100);
  });

  it('loop=loop 走到底回头不停', () => {
    const fn = jest.fn();
    getSignalBus().on('path:finish', fn);
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
      autostart: true,
      loop: 'loop',
    });
    pf.awake();
    tick(pf, 1500); // 1.5 周期
    // 总长 100, 走 150,模 100 → 50
    expect(go.transform.position.x).toBeCloseTo(50, 1);
    expect(fn).not.toHaveBeenCalled();
  });

  it('loop=pingpong 反向再返回', () => {
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
      autostart: true,
      loop: 'pingpong',
    });
    pf.awake();
    tick(pf, 1000); // 走到 100,触发 pingpong 反向
    // 再走 500ms 反向 50,position 应当 ≈ 50
    tick(pf, 500);
    expect(go.transform.position.x).toBeLessThan(100);
  });

  it('rotateToFace=true 时按 segment 角度写 rotation', () => {
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 0, y: 100 }],
      speed: 100,
      autostart: true,
      rotateToFace: true,
    });
    pf.awake();
    tick(pf, 100);
    // 朝向 +y,atan2(100,0) = PI/2
    expect(go.transform.rotation).toBeCloseTo(Math.PI / 2, 3);
  });

  it('totalLen=0(单点)时 update 不前进', () => {
    const { go, pf } = make({
      waypoints: [{ x: 5, y: 7 }],
      speed: 100,
      autostart: true,
    });
    pf.awake();
    tick(pf, 1000);
    expect(go.transform.position.x).toBe(0); // applyAt 没走任何 segment
  });

  it('stop 把 dist 归零并 applyAt(0)', () => {
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
      autostart: true,
    });
    pf.awake();
    tick(pf, 500);
    pf.stop();
    expect(go.transform.position.x).toBe(0);
  });

  it('pause/play 暂停后位置稳定', () => {
    const { go, pf } = make({
      waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      speed: 100,
      autostart: true,
    });
    pf.awake();
    tick(pf, 200);
    pf.pause();
    const x = go.transform.position.x;
    tick(pf, 500);
    expect(go.transform.position.x).toBe(x);
    pf.play();
    tick(pf, 100);
    expect(go.transform.position.x).toBeGreaterThan(x);
  });

  describe('PathFollowSystem', () => {
    it('能实例化', () => {
      expect(new PathFollowSystem().name).toBe('PathFollow');
    });
  });
});
