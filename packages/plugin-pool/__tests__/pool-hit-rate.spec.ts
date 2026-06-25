/**
 * Pool 命中率统计字段单元测试。
 *
 * 只断言新加的 4 个字段 + hitRate getter,不影响 pool.spec.ts 既有用例。
 */
import { GameObject } from '@eva/eva.js';
import { Pool } from '../lib';

function makeFactory(): () => GameObject {
  let i = 0;
  return () => new GameObject(`pooled-${++i}`);
}

describe('Pool — 命中率统计字段', () => {
  it('初始计数全部为 0,hitRate=0', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, scope: 'game' });
    expect(p.acquireCount).toBe(0);
    expect(p.hitCount).toBe(0);
    expect(p.missCount).toBe(0);
    expect(p.releaseCount).toBe(0);
    expect(p.hitRate).toBe(0);
  });

  it('首次 acquire 没有 free → missCount=1', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, scope: 'game' });
    p.setFactory(makeFactory());

    const a = p.acquire();
    expect(a).toBeInstanceOf(GameObject);
    expect(p.acquireCount).toBe(1);
    expect(p.hitCount).toBe(0);
    expect(p.missCount).toBe(1);
    expect(p.hitRate).toBe(0);
  });

  it('release 后再 acquire 走复用 → hitCount=1', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, maxSize: 10, scope: 'game' });
    p.setFactory(makeFactory());

    const a = p.acquire()!; // miss
    p.release(a); // releaseCount=1
    const b = p.acquire(); // hit

    expect(b).toBe(a);
    expect(p.acquireCount).toBe(2);
    expect(p.hitCount).toBe(1);
    expect(p.missCount).toBe(1);
    expect(p.releaseCount).toBe(1);
    expect(p.hitRate).toBeCloseTo(0.5);
  });

  it('warmup 后 acquire 直接 hit', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 3, maxSize: 10, scope: 'game' });
    p.setFactory(makeFactory());
    p.warmup(); // free=3,这里不计 acquire/miss(warmup 不走 acquire)

    p.acquire();
    p.acquire();
    p.acquire();

    expect(p.acquireCount).toBe(3);
    expect(p.hitCount).toBe(3);
    expect(p.missCount).toBe(0);
    expect(p.hitRate).toBe(1);
  });

  it('release 一个未 acquire 的对象不计 releaseCount', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, maxSize: 10, scope: 'game' });
    p.setFactory(makeFactory());

    const stranger = new GameObject('stranger');
    p.release(stranger); // no-op
    expect(p.releaseCount).toBe(0);
  });

  it('factory 缺失时 acquire 返回 null,不增加任何计数', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, scope: 'game' });
    expect(p.acquire()).toBeNull();
    expect(p.acquireCount).toBe(0);
    expect(p.missCount).toBe(0);
    expect(p.hitCount).toBe(0);
    warn.mockRestore();
  });

  it('多次 acquire/release 计数累加正确', () => {
    const p = new Pool();
    p.init({ name: `hr-${Math.random()}`, initialSize: 0, maxSize: 10, scope: 'game' });
    p.setFactory(makeFactory());

    // 第一轮:全 miss
    const a = p.acquire()!;
    const b = p.acquire()!;
    const c = p.acquire()!;
    expect(p.missCount).toBe(3);
    expect(p.hitCount).toBe(0);

    // release 三个
    p.release(a);
    p.release(b);
    p.release(c);
    expect(p.releaseCount).toBe(3);

    // 第二轮:全 hit
    p.acquire();
    p.acquire();
    p.acquire();
    expect(p.hitCount).toBe(3);
    expect(p.missCount).toBe(3);
    expect(p.acquireCount).toBe(6);
    expect(p.hitRate).toBeCloseTo(0.5);
  });
});
