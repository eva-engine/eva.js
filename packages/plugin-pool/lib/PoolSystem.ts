import { System } from '@eva/eva.js';

/** 注册用空 System;Pool 自身用 static registry,运行无需 system 调度 */
export class PoolSystem extends System {
  static systemName = 'Pool';
  readonly name = 'Pool';
}
