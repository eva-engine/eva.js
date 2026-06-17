import { GameObject, Component } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { Tween, TweenSystem } from '../lib';

/**
 * 把 Tween 安装到一个临时 GameObject 上,返回 (go, tween)。
 * 直接 new Tween() 后挂上 gameObject 即可,Tween 自身没有 pixi 依赖。
 */
function makeTween(initParams?: Parameters<Tween['init']>[0]): { go: GameObject; tween: Tween } {
  const go = new GameObject('host');
  const tween = new Tween();
  // addComponent 会触发 init,但我们想自己控制 init 参数,所以直接绑 gameObject
  (tween as any).gameObject = go;
  if (initParams !== undefined) tween.init(initParams);
  return { go, tween };
}

/** 自定义业务组件,验证 components.<Name>.<key> 路径绑定 */
class FakeAimer extends Component {
  static componentName = 'FakeAimer';
  currentAngleDeg = 0;
  init() {}
}

/** advance helper */
function tick(t: Tween, ms: number) {
  t.update({ deltaTime: ms } as any);
}

describe('plugin-tween — Tween 组件', () => {
  beforeEach(() => getSignalBus().clear());

  describe('init 参数解析', () => {
    it('单步 step 会被规整成 steps[1]', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', to: 100, duration: 1000 },
      });
      tween.play();
      // play 之后 running 不为空 → 说明 step 被识别
      tick(tween, 1);
      expect(go.transform.position.x).toBeGreaterThan(0);
    });

    it('steps 数组按顺序执行(sequence 默认)', () => {
      const { go, tween } = makeTween({
        steps: [
          { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
          { target: 'transform.position.y', from: 0, to: 50, duration: 100 },
        ],
      });
      tween.play();
      tick(tween, 100);
      // 第一步走完,position.x 已到 100;第二步 0 推进
      expect(go.transform.position.x).toBeCloseTo(100, 5);
      expect(go.transform.position.y).toBeCloseTo(0, 5);
      tick(tween, 100);
      expect(go.transform.position.y).toBeCloseTo(50, 5);
    });

    it('既不传 step 也不传 steps,running 为空 → update 是 no-op', () => {
      const { go, tween } = makeTween({});
      tween.play();
      const beforeX = go.transform.position.x;
      tick(tween, 100);
      expect(go.transform.position.x).toBe(beforeX);
    });
  });

  describe('play / pause / resume / stop', () => {
    it('play 后 update 会推进', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 50);
      expect(go.transform.position.x).toBeCloseTo(50, 5);
    });

    it('pause 后 update 不推进,resume 可继续', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 30);
      tween.pause();
      const paused = go.transform.position.x;
      tick(tween, 50);
      expect(go.transform.position.x).toBe(paused);
      tween.resume();
      tick(tween, 70);
      expect(go.transform.position.x).toBeCloseTo(100, 5);
    });

    it('stop 清空 running,后续 resume 不会复活', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 30);
      tween.stop();
      const stopped = go.transform.position.x;
      tween.resume();
      tick(tween, 200);
      expect(go.transform.position.x).toBe(stopped);
    });
  });

  describe('autostart 与 awake', () => {
    it('autostart=true 时 awake 自动 play', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
        autostart: true,
      });
      tween.awake();
      tick(tween, 50);
      expect(go.transform.position.x).toBeCloseTo(50, 5);
    });

    it('autostart=false(默认)时 awake 不会播放', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
      });
      tween.awake();
      tick(tween, 50);
      expect(go.transform.position.x).toBe(0);
    });
  });

  describe('sequence 调度', () => {
    it('多步 sequence 按 cursor 顺序推进,前一步完成后下一步才开始', () => {
      const { go, tween } = makeTween({
        steps: [
          { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
          { target: 'transform.position.y', from: 0, to: 50, duration: 100 },
        ],
      });
      tween.play();
      // step1 走一半,step2 完全没动
      tick(tween, 50);
      expect(go.transform.position.x).toBeCloseTo(50, 5);
      expect(go.transform.position.y).toBeCloseTo(0, 5);
      // step1 走完
      tick(tween, 50);
      expect(go.transform.position.x).toBeCloseTo(100, 5);
      expect(go.transform.position.y).toBeCloseTo(0, 5);
      // step2 推进一半
      tick(tween, 50);
      expect(go.transform.position.y).toBeCloseTo(25, 5);
      // step2 走完
      tick(tween, 50);
      expect(go.transform.position.y).toBeCloseTo(50, 5);
    });
  });

  describe('parallel 调度', () => {
    it('parallel=true 时所有 step 同时推进', () => {
      const { go, tween } = makeTween({
        parallel: true,
        steps: [
          { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
          { target: 'transform.position.y', from: 0, to: 50, duration: 100 },
        ],
      });
      tween.play();
      tick(tween, 50);
      // 两轴同时推到一半
      expect(go.transform.position.x).toBeCloseTo(50, 5);
      expect(go.transform.position.y).toBeCloseTo(25, 5);
    });
  });

  describe('yoyo + loop=-1', () => {
    it('一轮结束后反向跑,loop=-1 永不结束', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
        yoyo: true,
        loop: -1,
      });
      tween.play();
      // 第一轮:0 → 100
      tick(tween, 100);
      expect(go.transform.position.x).toBeCloseTo(100, 5);
      // 第二轮反向:100 → 0
      tick(tween, 100);
      expect(go.transform.position.x).toBeCloseTo(0, 5);
      // 第三轮再正向
      tick(tween, 100);
      expect(go.transform.position.x).toBeCloseTo(100, 5);
    });
  });

  describe('signal emit', () => {
    it('finish 时 emit 自定义 signal + tween:finish', () => {
      const sig = jest.fn();
      const finish = jest.fn();
      getSignalBus().on('rocket:done', sig);
      getSignalBus().on('tween:finish', finish);

      const { tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
        signal: 'rocket:done',
      });
      tween.play();
      tick(tween, 100);
      expect(sig).toHaveBeenCalledTimes(1);
      expect(finish).toHaveBeenCalledTimes(1);
      // payload 携带 component 引用
      expect(sig.mock.calls[0][0]).toMatchObject({ component: tween });
    });

    it('未配置 signal 时只 emit tween:finish', () => {
      const finish = jest.fn();
      getSignalBus().on('tween:finish', finish);
      const { tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 100);
      expect(finish).toHaveBeenCalledTimes(1);
    });

    it('loop=-1 时永不 finish,不会 emit tween:finish', () => {
      const finish = jest.fn();
      getSignalBus().on('tween:finish', finish);
      const { tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
        loop: -1,
      });
      tween.play();
      tick(tween, 100);
      tick(tween, 100);
      tick(tween, 100);
      expect(finish).not.toHaveBeenCalled();
    });
  });

  describe('delay 字段', () => {
    it('delay 期间不写入,delay 过后才推进', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.position.x', from: 0, to: 100, duration: 100, delay: 50 },
      });
      tween.play();
      // 30ms < 50ms delay,不应推进
      tick(tween, 30);
      expect(go.transform.position.x).toBe(0);
    });
  });

  describe('from 缺省', () => {
    it('from 缺省时取 binding 当前值', () => {
      const go = new GameObject('host');
      go.transform.position.x = 42;
      const tween = new Tween();
      (tween as any).gameObject = go;
      tween.init({
        step: { target: 'transform.position.x', to: 142, duration: 100 },
      });
      tween.play();
      tick(tween, 100);
      // 100ms 走完 from=42 → to=142
      expect(go.transform.position.x).toBeCloseTo(142, 5);
    });
  });

  describe('binding miss → console.warn', () => {
    it('找不到的 path 触发 warn,对应 step 被跳过', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { go, tween } = makeTween({
        steps: [
          { target: 'transform.position.x', from: 0, to: 100, duration: 100 },
          { target: 'components.NopeNotExist.foo', from: 0, to: 100, duration: 100 },
        ],
      });
      tween.play();
      // step1 仍然能跑
      tick(tween, 100);
      expect(go.transform.position.x).toBeCloseTo(100, 5);
      expect(warn).toHaveBeenCalled();
      // 提示信息包含丢失路径
      const msgs = warn.mock.calls.map((c) => String(c[0])).join('\n');
      expect(msgs).toContain('components.NopeNotExist.foo');
      warn.mockRestore();
    });
  });

  describe('bindPath - transform.* 路径', () => {
    it('transform.rotation 单层 key 也能写入', () => {
      const { go, tween } = makeTween({
        step: { target: 'transform.rotation', from: 0, to: 1.5, duration: 100 },
      });
      tween.play();
      tick(tween, 100);
      expect(go.transform.rotation).toBeCloseTo(1.5, 5);
    });
  });

  describe('bindPath - components.* 路径', () => {
    it('components.<Name>.<key> 能命中已挂的 Component', () => {
      const go = new GameObject('host');
      const aimer = new FakeAimer();
      go.addComponent(aimer);

      const tween = new Tween();
      (tween as any).gameObject = go;
      tween.init({
        step: { target: 'components.FakeAimer.currentAngleDeg', from: -60, to: 60, duration: 100 },
      });
      tween.play();
      tick(tween, 50);
      expect(aimer.currentAngleDeg).toBeCloseTo(0, 5);
      tick(tween, 50);
      expect(aimer.currentAngleDeg).toBeCloseTo(60, 5);
    });
  });

  describe('bindPath - store.* 路径', () => {
    let storeBag: Record<string, any>;
    beforeEach(() => {
      storeBag = {};
      (window as any).mx = {
        store: {
          get: (k: string) => storeBag[k],
          update: (patch: Record<string, any>) => Object.assign(storeBag, patch),
        },
      };
    });
    afterEach(() => {
      delete (window as any).mx;
    });

    it('store.<key> 写入走 mx.store.update', () => {
      storeBag.score = 0;
      const { tween } = makeTween({
        step: { target: 'store.score', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 100);
      expect(storeBag.score).toBeCloseTo(100, 5);
    });

    it('mx.store 不存在时 binding miss → console.warn', () => {
      delete (window as any).mx;
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { tween } = makeTween({
        step: { target: 'store.foo', from: 0, to: 100, duration: 100 },
      });
      tween.play();
      tick(tween, 10);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('TweenSystem', () => {
    it('能实例化且名字正确', () => {
      const sys = new TweenSystem();
      expect(sys.name).toBe('Tween');
    });
  });
});
