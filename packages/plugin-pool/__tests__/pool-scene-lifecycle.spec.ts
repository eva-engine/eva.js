/**
 * Pool 与 scene 生命周期联动测试(P1-5)。
 *
 * 覆盖:
 * - 默认 scope='scene' + sceneChanged 自动回收(releaseAll + destroyFree)
 * - 显式 scope='game' 跨 scene 保留
 * - releaseAll / destroyFree / bindToScene / unbindScene 行为
 * - 未显式声明 scope 的 deprecation warn 只打一次
 * - PoolSystem.onDestroy 摘 listener 不泄漏
 */
import { Game, GameObject, Scene } from '@eva/eva.js';
import { Pool, PoolSystem } from '../lib';

/** 制造一个带 destroy spy 的 GameObject 工厂 */
function makeSpyFactory(): { factory: () => GameObject; destroyed: () => number } {
  let i = 0;
  let destroyed = 0;
  const factory = () => {
    const go = new GameObject(`pooled-${++i}`) as any;
    const origDestroy = go.destroy?.bind(go);
    go.destroy = () => {
      destroyed++;
      origDestroy?.();
    };
    return go as GameObject;
  };
  return { factory, destroyed: () => destroyed };
}

/**
 * 直接构造一个最小 Game-like EventEmitter,避免 plugin-renderer 依赖。
 * 我们只需要 emit('sceneChanged') 触发 PoolSystem 监听。
 */
function makeFakeGame(): Game {
  // Game 构造器无参,init() 才接受 GameParams;本测试只用其 EventEmitter 能力
  // (emit('sceneChanged')),不需要 init 创建 Ticker / 默认 Scene。
  return new Game();
}

describe('Pool — scene 生命周期联动 (P1-5)', () => {
  beforeEach(() => {
    // 每个用例独立 registry 状态
    for (const p of Pool.all()) p.onDestroy();
    Pool.__resetScopeWarnings();
  });

  describe('显式 scope 行为', () => {
    it("scope:'scene' (默认) 在 sceneChanged 时被回收", () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const game = makeFakeGame();
      const sys = new PoolSystem();
      (sys as any).game = game;
      sys.awake();

      const { factory, destroyed } = makeSpyFactory();
      const pool = new Pool();
      pool.init({ name: 'rocket', initialSize: 0, maxSize: 5 });
      pool.setFactory(factory);

      const a = pool.acquire()!;
      pool.acquire()!; // b 留在 inUse,不需要引用
      pool.release(a); // free=[a], inUse={b}

      expect(pool.freeCount).toBe(1);
      expect(pool.usedCount).toBe(1);

      // 触发 sceneChanged
      game.emit('sceneChanged', { scene: null, mode: 0, params: {} });

      // free 全部物理 destroy,inUse 经 release 进 free 再 destroyFree → 全部清空
      expect(pool.freeCount).toBe(0);
      expect(pool.usedCount).toBe(0);
      expect(destroyed()).toBe(2); // a 和 b 都被 destroy
      warn.mockRestore();
    });

    it("scope:'game' 在 sceneChanged 时被保留", () => {
      const game = makeFakeGame();
      const sys = new PoolSystem();
      (sys as any).game = game;
      sys.awake();

      const { factory, destroyed } = makeSpyFactory();
      const pool = new Pool();
      pool.init({ name: 'global-fx', initialSize: 0, maxSize: 5, scope: 'game' });
      pool.setFactory(factory);

      const a = pool.acquire()!;
      pool.release(a);
      expect(pool.freeCount).toBe(1);

      game.emit('sceneChanged', { scene: null, mode: 0, params: {} });

      // 保留
      expect(pool.freeCount).toBe(1);
      expect(destroyed()).toBe(0);
    });

    it('多池混合:scene 池被回收,game 池保留', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const game = makeFakeGame();
      const sys = new PoolSystem();
      (sys as any).game = game;
      sys.awake();

      const f1 = makeSpyFactory();
      const f2 = makeSpyFactory();

      const scenePool = new Pool();
      scenePool.init({ name: 'enemy', initialSize: 0, maxSize: 10, scope: 'scene' });
      scenePool.setFactory(f1.factory);

      const gamePool = new Pool();
      gamePool.init({ name: 'particles', initialSize: 0, maxSize: 10, scope: 'game' });
      gamePool.setFactory(f2.factory);

      scenePool.release(scenePool.acquire()!);
      gamePool.release(gamePool.acquire()!);

      game.emit('sceneChanged', { scene: null, mode: 0, params: {} });

      expect(scenePool.freeCount).toBe(0);
      expect(f1.destroyed()).toBe(1);

      expect(gamePool.freeCount).toBe(1);
      expect(f2.destroyed()).toBe(0);
      warn.mockRestore();
    });
  });

  describe('默认 scope 与 deprecation warn', () => {
    it('未显式声明 scope 时打 warn,且默认 scope = scene', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const pool = new Pool();
      pool.init({ name: 'no-scope', initialSize: 0 });

      expect(pool.scope).toBe('scene');
      const calls = warn.mock.calls.flat().join('\n');
      expect(calls).toContain('no explicit scope');
      expect(calls).toContain("scope:'game'");

      warn.mockRestore();
    });

    it('同名池只警告一次(避免 spam)', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const p1 = new Pool();
      p1.init({ name: 'dup', initialSize: 0 });
      const warnCallsAfterFirst = warn.mock.calls.length;

      const p2 = new Pool();
      p2.init({ name: 'dup', initialSize: 0 });

      expect(warn.mock.calls.length).toBe(warnCallsAfterFirst);
      warn.mockRestore();
    });

    it('显式声明 scope:scene 不打 warn', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const pool = new Pool();
      pool.init({ name: 'explicit-scene', initialSize: 0, scope: 'scene' });

      const explicitWarnCalls = warn.mock.calls.filter(args =>
        String(args[0] ?? '').includes('no explicit scope')
      );
      expect(explicitWarnCalls.length).toBe(0);
      expect(pool.scope).toBe('scene');
      warn.mockRestore();
    });

    it('显式声明 scope:game 不打 warn', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const pool = new Pool();
      pool.init({ name: 'explicit-game', initialSize: 0, scope: 'game' });

      const explicitWarnCalls = warn.mock.calls.filter(args =>
        String(args[0] ?? '').includes('no explicit scope')
      );
      expect(explicitWarnCalls.length).toBe(0);
      expect(pool.scope).toBe('game');
      warn.mockRestore();
    });
  });

  describe('releaseAll / destroyFree', () => {
    it('releaseAll 把 inUse 全部回收(走 resetFn),不超 maxSize 时进 free', () => {
      const pool = new Pool();
      pool.init({ name: 'ra-1', initialSize: 0, maxSize: 10, scope: 'game' });
      const { factory } = makeSpyFactory();
      const reset = jest.fn();
      pool.setFactory(factory);
      pool.setReset(reset);

      pool.acquire();
      pool.acquire();
      pool.acquire();
      expect(pool.usedCount).toBe(3);

      pool.releaseAll();

      expect(pool.usedCount).toBe(0);
      expect(pool.freeCount).toBe(3);
      expect(reset).toHaveBeenCalledTimes(3);
    });

    it('releaseAll 超 maxSize 的部分被 destroy', () => {
      const pool = new Pool();
      pool.init({ name: 'ra-2', initialSize: 0, maxSize: 1, scope: 'game' });
      const { factory, destroyed } = makeSpyFactory();
      pool.setFactory(factory);

      pool.acquire();
      pool.acquire();
      pool.acquire();
      pool.releaseAll();

      expect(pool.freeCount).toBe(1);
      expect(destroyed()).toBe(2);
    });

    it('destroyFree 物理 destroy free 队列并清空', () => {
      const pool = new Pool();
      pool.init({ name: 'df-1', initialSize: 0, maxSize: 10, scope: 'game' });
      const { factory, destroyed } = makeSpyFactory();
      pool.setFactory(factory);

      const a = pool.acquire()!;
      const b = pool.acquire()!;
      pool.release(a);
      pool.release(b);
      expect(pool.freeCount).toBe(2);

      pool.destroyFree();

      expect(pool.freeCount).toBe(0);
      expect(destroyed()).toBe(2);
    });

    it('releaseAll + destroyFree 组合清空整池', () => {
      const pool = new Pool();
      pool.init({ name: 'combo', initialSize: 0, maxSize: 10, scope: 'game' });
      const { factory, destroyed } = makeSpyFactory();
      pool.setFactory(factory);

      pool.acquire();
      pool.acquire();
      pool.release(pool.acquire()!);

      pool.releaseAll();
      pool.destroyFree();

      expect(pool.freeCount).toBe(0);
      expect(pool.usedCount).toBe(0);
      expect(destroyed()).toBe(3);
    });
  });

  describe('bindToScene / unbindScene', () => {
    it('bindToScene 记录 scene,unbindScene 清空', () => {
      const pool = new Pool();
      pool.init({ name: 'bind-test', initialSize: 0, scope: 'scene' });

      expect(pool.boundScene).toBeNull();

      const scene = new Scene('s1');
      pool.bindToScene(scene);
      expect(pool.boundScene).toBe(scene);

      const scene2 = new Scene('s2');
      pool.bindToScene(scene2);
      expect(pool.boundScene).toBe(scene2);

      pool.unbindScene();
      expect(pool.boundScene).toBeNull();
    });

    it('onDestroy 也清空 boundScene', () => {
      const pool = new Pool();
      pool.init({ name: 'bind-destroy', initialSize: 0, scope: 'scene' });
      pool.bindToScene(new Scene('s'));
      expect(pool.boundScene).not.toBeNull();
      pool.onDestroy();
      expect(pool.boundScene).toBeNull();
    });
  });

  describe('PoolSystem listener 生命周期', () => {
    it('PoolSystem.onDestroy 摘 listener,后续 sceneChanged 不再回收', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const game = makeFakeGame();
      const sys = new PoolSystem();
      (sys as any).game = game;
      sys.awake();

      const pool = new Pool();
      pool.init({ name: 'lifecycle', initialSize: 0, maxSize: 5 });
      const { factory } = makeSpyFactory();
      pool.setFactory(factory);
      pool.release(pool.acquire()!);
      expect(pool.freeCount).toBe(1);

      // 摘 listener
      sys.destroy();

      // 再 emit 不应触发回收
      game.emit('sceneChanged', { scene: null, mode: 0, params: {} });
      expect(pool.freeCount).toBe(1);

      warn.mockRestore();
    });

    it('PoolSystem 没有 game 引用时 awake 不抛错', () => {
      const sys = new PoolSystem();
      expect(() => sys.awake()).not.toThrow();
    });
  });

  describe('向后兼容', () => {
    it('Pool.get / Pool.all 与现有 API 行为不变', () => {
      const p = new Pool();
      p.init({ name: 'compat', initialSize: 0, scope: 'game' });

      expect(Pool.get('compat')).toBe(p);
      expect(Pool.all()).toContain(p);
    });
  });
});
