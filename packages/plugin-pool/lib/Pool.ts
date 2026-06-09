import { Component, GameObject, decorators } from '@eva/eva.js';
import type { PoolParams, PoolFactory, PoolReset, PoolActivate } from './types';

const registry = new Map<string, Pool>();

/**
 * Pool 组件 — 对象池(GameObject)。
 *
 * DSL 用法:
 * ```json
 * { "type": "Pool", "props": { "name": "rocket", "initialSize": 8, "maxSize": 32 } }
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
 */
@decorators.componentObserver({})
export class Pool extends Component<PoolParams> {
  static componentName = 'Pool';

  name = '';
  initialSize = 0;
  maxSize = Number.POSITIVE_INFINITY;
  private factory?: PoolFactory;
  private resetFn?: PoolReset;
  private activateFn?: PoolActivate;
  private free: GameObject[] = [];
  private inUse = new Set<GameObject>();

  init(params?: PoolParams) {
    if (!params) return;
    this.name = params.name;
    this.initialSize = params.initialSize ?? 0;
    this.maxSize = params.maxSize ?? Number.POSITIVE_INFINITY;
    this.factory = params.factory;
    this.resetFn = params.reset;
    this.activateFn = params.activate;
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
    let go = this.free.pop();
    if (!go) go = this.factory();
    this.inUse.add(go);
    if (this.activateFn) this.activateFn(go);
    return go;
  }

  /** 归还 */
  release(go: GameObject): void {
    if (!this.inUse.has(go)) return;
    this.inUse.delete(go);
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

  /** 当前空闲个数 */
  get freeCount(): number {
    return this.free.length;
  }
  /** 当前占用个数 */
  get usedCount(): number {
    return this.inUse.size;
  }

  /** 全局查 */
  static get(name: string): Pool | undefined {
    return registry.get(name);
  }

  onDestroy() {
    if (this.name && registry.get(this.name) === this) registry.delete(this.name);
    this.free = [];
    this.inUse.clear();
  }
}
