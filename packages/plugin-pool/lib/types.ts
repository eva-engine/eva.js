import type { GameObject } from '@eva/eva.js';

/** 实例化函数:创建一个新的 GameObject(通常是 prefab clone) */
export type PoolFactory = () => GameObject;

/** 重置函数:GameObject 进入池中前调用,允许使用方清理状态 */
export type PoolReset = (go: GameObject) => void;

/** 启用函数:GameObject 离开池被使用前调用,允许使用方激活状态 */
export type PoolActivate = (go: GameObject) => void;

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
}
