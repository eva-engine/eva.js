import { Component, GameObject, Scene, decorators } from '@eva/eva.js';
import type { PoolParams, PoolFactory, PoolReset, PoolActivate, PoolScope } from './types';

const registry = new Map<string, Pool>();

/** 已经针对哪些池名警告过 scope 缺失,避免重复 spam */
const scopeWarnedNames = new Set<string>();

/**
 * Pool 组件 — 对象池(GameObject)。
 *
 * DSL 用法:
 * ```json
 * { "type": "Pool", "props": { "name": "rocket", "initialSize": 8, "maxSize": 32, "scope": "scene" } }
 * ```
 *
 * factory/reset/activate 不能从 DSL 配置(必须代码侧),因此真正接入是:
 * ```ts
 * const pool = Pool.get('rocket');
 * pool.setFactory(() => cloneFromPrefab('Rocket'));
 * pool.warmup();
 * const go = pool.acquire();   // ...用完后...
 * pool.release(go);
 * ```
 *
 * 用 GameObject.transform.children 维护"挂载 vs 池中"是不可靠的,所以这里用
 * GameObject.scene.removeGameObject / addGameObject + 调用方 reset/activate hook。
 *
 * # Scope 与 scene 生命周期
 *
 * `scope: 'scene'`(默认) 的池在 `game.emit('sceneChanged')` 时,由 `PoolSystem`
 * 调用 `releaseAll() + destroyFree()` 自动回收。这是为了避免 scene 切换后,
 * 旧 scene 的 GameObject 残留在 free 队列中,在新 scene acquire 时被错误复用。
 *
 * 跨 scene 共享的池必须显式声明 `scope: 'game'`。
 */
@decorators.componentObserver({})
export class Pool extends Component<PoolParams> {
  static componentName = 'Pool';

  name = '';
  initialSize = 0;
  maxSize = Number.POSITIVE_INFINITY;
  /** scene 切换时是否被自动回收,默认 'scene'(安全) */
  scope: PoolScope = 'scene';
  private factory?: PoolFactory;
  private resetFn?: PoolReset;
  private activateFn?: PoolActivate;
  private free: GameObject[] = [];
  private inUse = new Set<GameObject>();
  /** 当前绑定到的 scene,仅 scope='scene' 池使用;手动 bindToScene 设置 */
  private _boundScene: Scene | null = null;

  /** 累计 acquire 次数(包括复用 + 新建) */
  acquireCount = 0;
  /** acquire 命中 free pool 的次数 */
  hitCount = 0;
  /** acquire 走 factory() 新建的次数 */
  missCount = 0;
  /** 实际归还到 pool 的次数(no-op release 不计) */
  releaseCount = 0;

  init(params?: PoolParams) {
    if (!params) return;
    this.name = params.name;
    this.initialSize = params.initialSize ?? 0;
    this.maxSize = params.maxSize ?? Number.POSITIVE_INFINITY;
    this.factory = params.factory;
    this.resetFn = params.reset;
    this.activateFn = params.activate;

    // scope 默认 'scene'(安全),未显式声明时给一次性 warn 提示业务确认
    if (params.scope === undefined) {
      if (this.name && !scopeWarnedNames.has(this.name)) {
        scopeWarnedNames.add(this.name);
        // eslint-disable-next-line no-console
        console.warn(
          `[plugin-pool] pool "${this.name}" has no explicit scope; defaulting to 'scene' ` +
            `(will be auto-released on sceneChanged). ` +
            `Pass scope:'game' if you intend a cross-scene global pool.`
        );
      }
      this.scope = 'scene';
    } else {
      this.scope = params.scope;
    }

    if (this.name) registry.set(this.name, this);
  }

  /** 调用方注入工厂 / hooks */
  setFactory(factory: PoolFactory) {
    this.factory = factory;
  }
  setReset(fn: PoolReset) {
    this.resetFn = fn;
  }
  setActivate(fn: PoolActivate) {
    this.activateFn = fn;
  }

  /** 一次性预热到 initialSize */
  warmup(): void {
    if (!this.factory) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-pool] pool "${this.name}" has no factory yet`);
      return;
    }
    while (this.free.length < this.initialSize) {
      const go = this.factory();
      if (this.resetFn) this.resetFn(go);
      this.free.push(go);
    }
  }

  /** 取一个出来用 */
  acquire(): GameObject | null {
    if (!this.factory) {
      // eslint-disable-next-line no-console
      console.warn(`[plugin-pool] pool "${this.name}" has no factory`);
      return null;
    }
    this.acquireCount += 1;
    let go = this.free.pop();
    if (go) {
      this.hitCount += 1;
    } else {
      go = this.factory();
      this.missCount += 1;
    }
    this.inUse.add(go);
    if (this.activateFn) this.activateFn(go);
    return go;
  }

  /** 归还 */
  release(go: GameObject): void {
    if (!this.inUse.has(go)) return;
    this.inUse.delete(go);
    this.releaseCount += 1;
    if (this.resetFn) this.resetFn(go);
    if (this.free.length >= this.maxSize) {
      // 超出容量直接销毁
      try {
        (go as any).destroy?.();
      } catch {}
      return;
    }
    this.free.push(go);
  }

  /**
   * 把 inUse 里所有 GameObject 强制 release(走 resetFn,可能进 free 或 destroy)。
   *
   * 用于 scene 切换 / 关卡重置 / 池销毁前的批量回收。
   */
  releaseAll(): void {
    // 拷贝一份避免在迭代时 mutate Set
    const all = Array.from(this.inUse);
    for (const go of all) {
      this.release(go);
    }
  }

  /**
   * 物理 destroy free 队列里所有 GameObject,并清空队列。
   *
   * 注意:只清 free,不动 inUse(用 releaseAll 先回收)。
   * 通常和 releaseAll 配套使用:`releaseAll(); destroyFree();`。
   */
  destroyFree(): void {
    for (const go of this.free) {
      try {
        (go as any).destroy?.();
      } catch {}
    }
    this.free = [];
  }

  /**
   * 标记池绑定到某个 scene。
   *
   * 同一 Pool 多次绑定后取最新 scene。仅用作归属标记,
   * PoolSystem 在 sceneChanged 时仍按 scope 字段判断是否回收。
   */
  bindToScene(scene: Scene): void {
    this._boundScene = scene;
  }

  /** 解绑(通常由 PoolSystem 在 sceneDestroyed / 池清理时调用) */
  unbindScene(): void {
    this._boundScene = null;
  }

  /** 当前绑定的 scene,只读 */
  get boundScene(): Scene | null {
    return this._boundScene;
  }

  /** 当前空闲个数 */
  get freeCount(): number {
    return this.free.length;
  }
  /** 当前占用个数 */
  get usedCount(): number {
    return this.inUse.size;
  }
  /** 命中率 = hitCount / acquireCount,无 acquire 时 0 */
  get hitRate(): number {
    return this.acquireCount === 0 ? 0 : this.hitCount / this.acquireCount;
  }

  /** 全局查 */
  static get(name: string): Pool | undefined {
    return registry.get(name);
  }

  /** 列出所有命名池(供 perf-probes / 监控用) */
  static all(): Pool[] {
    return Array.from(registry.values());
  }

  /**
   * 测试 hook:重置 scope 缺失警告状态。
   *
   * 仅供单元测试在 beforeEach 中重置全局状态使用,生产代码不要调用。
   * @internal
   */
  static __resetScopeWarnings(): void {
    scopeWarnedNames.clear();
  }

  onDestroy() {
    if (this.name && registry.get(this.name) === this) registry.delete(this.name);
    this.free = [];
    this.inUse.clear();
    this._boundScene = null;
  }
}
