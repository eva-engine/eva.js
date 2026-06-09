import { GameObject } from '@eva/eva.js';
import { AnimationTrack, AnimationTrackSystem } from '../lib';
import { getSignalBus } from '@eva/plugin-signal-bus';

describe('plugin-animation-track — 关键帧动画', () => {
  beforeEach(() => getSignalBus().clear());

  function makeGo(): GameObject {
    return new GameObject('a', { position: { x: 0, y: 0 } });
  }

  // 注意:GameObject.addComponent 会立即同步调用 init + awake
  // (用 component.__componentDefaultParams,即 new Component(params) 传入的值)
  // 我们测试需要在 addComponent 时就把 params 传给 init,所以走 `new AnimationTrack(params)` 然后 addComponent
  function attach(go: GameObject, params: any): AnimationTrack {
    const a = new AnimationTrack(params);
    go.addComponent(a);
    return a;
  }

  function tick(t: AnimationTrack, ms: number) {
    t.update({ deltaTime: ms } as any);
  }

  it('init 解析 tracks/duration/loop/autostart', () => {
    const a = new AnimationTrack();
    a.init({
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 2,
      autostart: true,
      loop: true,
      signal: 'done',
    });
    expect((a as any).rawTracks).toHaveLength(1);
    expect((a as any).duration).toBe(2);
    expect((a as any).loop).toBe(true);
  });

  it('awake 时绑定 path,duration 默认取 max keyframe time', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1.5, value: 100 }] }],
    });
    expect((a as any).duration).toBe(1.5);
    expect((a as any).tracks).toHaveLength(1);
  });

  it('autostart=true 时 awake 后立即 playing', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      autostart: true,
    });
    expect((a as any).playing).toBe(true);
  });

  it('线性插值在中点写入正确值', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
    });
    a.play();
    tick(a, 500); // 0.5s
    expect((go.transform as any).position.x).toBeCloseTo(50, 1);
  });

  it('完成时 emit track:finish 与 signal,且 stop', () => {
    const fin = jest.fn();
    const sig = jest.fn();
    getSignalBus().on('track:finish', fin);
    getSignalBus().on('done', sig);
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
      signal: 'done',
    });
    a.play();
    tick(a, 1500); // 超出
    expect(fin).toHaveBeenCalled();
    expect(sig).toHaveBeenCalled();
    expect((a as any).playing).toBe(false);
    expect((go.transform as any).position.x).toBe(100);
  });

  it('loop=true 时不发 finish,elapsed 取模继续', () => {
    const fin = jest.fn();
    getSignalBus().on('track:finish', fin);
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
      loop: true,
    });
    a.play();
    tick(a, 1500);
    expect(fin).not.toHaveBeenCalled();
    expect((a as any).playing).toBe(true);
  });

  it('seek 跳到指定时间并写入值', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
    });
    a.seek(0.5);
    expect((go.transform as any).position.x).toBeCloseTo(50, 1);
  });

  it('seek 越界自动夹紧', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
    });
    a.seek(-5);
    expect((go.transform as any).position.x).toBe(0);
    a.seek(99);
    expect((go.transform as any).position.x).toBe(100);
  });

  it('pause 后 update 不再推进', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }],
      duration: 1,
    });
    a.play();
    tick(a, 200);
    a.pause();
    const x1 = (go.transform as any).position.x;
    tick(a, 500);
    expect((go.transform as any).position.x).toBe(x1);
  });

  it('stop 把 elapsed 归零并写入 t=0 的值', () => {
    const go = makeGo();
    const a = attach(go, {
      tracks: [{ target: 'transform.position.x', keyframes: [{ time: 0, value: 5 }, { time: 1, value: 100 }] }],
      duration: 1,
    });
    a.play();
    tick(a, 800);
    a.stop();
    expect((go.transform as any).position.x).toBe(5);
  });

  it('未知 path 静默忽略,不抛错', () => {
    const go = makeGo();
    expect(() => attach(go, {
      tracks: [{ target: 'components.NoSuch.value', keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }],
    })).not.toThrow();
  });

  describe('AnimationTrackSystem', () => {
    it('能实例化', () => {
      expect(new AnimationTrackSystem().name).toBe('AnimationTrack');
    });
  });
});
