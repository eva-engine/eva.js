import { GameObject } from '@eva/eva.js';
import { Pool, PoolSystem } from '../lib';

function makeFactory(): () => GameObject {
  let i = 0;
  return () => new GameObject(`pooled-${++i}`);
}

describe('plugin-pool — 对象池', () => {
  describe('init 与 registry', () => {
    it('init 解析参数 + 全局注册', () => {
      const p = new Pool();
      p.init({ name: 'rocket', initialSize: 4, maxSize: 10 });
      expect(p.name).toBe('rocket');
      expect(Pool.get('rocket')).toBe(p);
    });

    it('init 不传参 OK,但 acquire 没 factory 时警告', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const p = new Pool();
      p.init();
      expect(p.acquire()).toBeNull();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('warmup / acquire / release', () => {
    let p: Pool;
    beforeEach(() => {
      p = new Pool();
      p.init({ name: `t-${Math.random()}`, initialSize: 3, maxSize: 5 });
      p.setFactory(makeFactory());
    });

    it('warmup 把 free 填到 initialSize', () => {
      p.warmup();
      expect(p.freeCount).toBe(3);
      expect(p.usedCount).toBe(0);
    });

    it('acquire 优先复用 free,然后才新建', () => {
      p.warmup();
      const a = p.acquire();
      expect(a).toBeInstanceOf(GameObject);
      expect(p.freeCount).toBe(2);
      expect(p.usedCount).toBe(1);
    });

    it('release 把对象塞回 free', () => {
      p.warmup();
      const a = p.acquire()!;
      p.release(a);
      expect(p.freeCount).toBe(3);
      expect(p.usedCount).toBe(0);
    });

    it('release 一个未 acquire 的对象是 no-op', () => {
      const stranger = new GameObject('stranger');
      expect(() => p.release(stranger)).not.toThrow();
      expect(p.freeCount).toBe(0);
    });

    it('reset / activate hook 在正确生命周期被调用', () => {
      const reset = jest.fn();
      const activate = jest.fn();
      p.setReset(reset);
      p.setActivate(activate);
      p.warmup(); // 每个新建都 reset
      expect(reset).toHaveBeenCalledTimes(3);
      const go = p.acquire()!; // activate 被调
      expect(activate).toHaveBeenCalledWith(go);
      p.release(go); // reset 又被调
      expect(reset).toHaveBeenCalledTimes(4);
    });

    it('maxSize 超出后释放对象被销毁(模拟 destroy)', () => {
      const small = new Pool();
      small.init({ name: 't-max', initialSize: 0, maxSize: 1 });
      let destroyed = 0;
      small.setFactory(() => {
        const go = new GameObject('x') as any;
        go.destroy = () => { destroyed++; };
        return go;
      });
      const a = small.acquire()!;
      const b = small.acquire()!;
      small.release(a);
      small.release(b); // 已经 1 个在 free,b 超出 maxSize,被销毁
      expect(small.freeCount).toBe(1);
      expect(destroyed).toBe(1);
    });
  });

  describe('Pool.get / onDestroy', () => {
    it('Pool.get 拿到同一实例', () => {
      const p = new Pool();
      p.init({ name: 'unique-x', initialSize: 0 });
      expect(Pool.get('unique-x')).toBe(p);
    });

    it('onDestroy 清理 registry', () => {
      const p = new Pool();
      p.init({ name: 'unique-y', initialSize: 0 });
      p.onDestroy();
      expect(Pool.get('unique-y')).toBeUndefined();
    });
  });

  describe('PoolSystem', () => {
    it('能实例化且名字正确', () => {
      const sys = new PoolSystem();
      expect(sys.name).toBe('Pool');
    });
  });
});
