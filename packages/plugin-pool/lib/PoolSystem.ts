import { System } from '@eva/eva.js';
import { Pool } from './Pool';

/**
 * PoolSystem — 监听 scene 生命周期事件,把 scope='scene' 的池在 sceneChanged 时回收。
 *
 * # 为什么需要
 *
 * `Pool` 用 module 级 `registry: Map<string, Pool>` 全局管理命名池,且 `acquire`
 * 不会 reparent GameObject 到当前 scene。如果 scene A 把对象 release 进池,
 * scene 切到 B 后,B 调用 `Pool.get('rocket').acquire()` 会拿到一个 `scene`
 * 字段仍指向已销毁 A 的孤儿 GameObject,渲染/事件全部错乱。
 *
 * 本 System 在游戏 awake 时挂 `'sceneChanged'` 监听:
 * - 对 `scope === 'scene'` 的池:`releaseAll() + destroyFree()`,业务需在新 scene
 *   启动时重新 warmup / 填充。
 * - 对 `scope === 'game'` 的池:跳过,保留跨 scene 复用。
 *
 * 在 game.destroy → system.destroy 时摘掉 listener,避免内存泄漏。
 */
export class PoolSystem extends System {
  static systemName = 'Pool';
  readonly name = 'Pool';

  /** 绑定后的监听函数引用,用于 onDestroy 时摘 listener */
  private _onSceneChanged?: () => void;

  awake() {
    if (!this.game) return;
    this._onSceneChanged = () => {
      this._recycleScenePools();
    };
    this.game.on('sceneChanged', this._onSceneChanged);
  }

  /** 遍历 registry,对 scope='scene' 的池做 releaseAll + destroyFree */
  private _recycleScenePools(): void {
    const pools = Pool.all();
    for (const pool of pools) {
      if (pool.scope !== 'scene') continue;
      try {
        pool.releaseAll();
        pool.destroyFree();
        pool.unbindScene();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`[plugin-pool] failed to recycle pool "${pool.name}" on sceneChanged`, e);
      }
    }
  }

  onDestroy() {
    if (this.game && this._onSceneChanged) {
      this.game.off('sceneChanged', this._onSceneChanged);
    }
    this._onSceneChanged = undefined;
  }
}
