import type { GameObject } from '@eva/eva.js';

/** 实例化函数:创建一个新的 GameObject(通常是 prefab clone) */
export type PoolFactory = () => GameObject;

/** 重置函数:GameObject 进入池中前调用,允许使用方清理状态 */
export type PoolReset = (go: GameObject) => void;

/** 启用函数:GameObject 离开池被使用前调用,允许使用方激活状态 */
export type PoolActivate = (go: GameObject) => void;

/**
 * 池的生命周期 scope。
 * - `'scene'`(默认): scene 切换时 PoolSystem 自动 releaseAll + destroyFree,
 *   防止旧 scene 的 GameObject 被新 scene acquire 复用导致引用错乱。
 *   业务在新 scene 启动时需要重新 warmup / 重新填充池。
 * - `'game'`: 跨 scene 持久存活,sceneChanged 不会被自动回收。
 *   适用于全局粒子、UI 元素等明确希望复用的池。业务自行管理生命周期。
 */
export type PoolScope = 'scene' | 'game';

export interface PoolParams {
  /** 池标识,全局唯一,用于 Pool.get('name') 查找 */
  name: string;
  /** 初始预热数量 */
  initialSize?: number;
  /** 最多缓存多少个 free 实例;超过则销毁,默认 Infinity */
  maxSize?: number;
  /** 实例化函数,必须由调用方提供(代码侧 setFactory) */
  factory?: PoolFactory;
  /** 进入池时调用 */
  reset?: PoolReset;
  /** 离开池时调用 */
  activate?: PoolActivate;
  /**
   * 生命周期作用域,默认 `'scene'`。
   *
   * 未显式声明时会在 init 阶段打一次 deprecation warn,提示业务确认归属。
   * 历史 "全局池" 业务必须显式声明 `scope:'game'`,否则会在 sceneChanged 时被回收。
   */
  scope?: PoolScope;
}
