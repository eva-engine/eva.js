import { SpineSystem as SpineSystemBase } from '@eva/spine-base';
// @ts-ignore
import pixiSpine from 'pixi-spine';

/**
 * Spine 骨骼动画渲染系统（pixi-spine 4.2 版本）
 *
 * 此系统继承自 `@eva/spine-base` 的 SpineSystem 基类，使用 pixi-spine 4.2 版本。
 * 负责管理所有 Spine 组件的骨架创建、动画更新和资源管理。
 *
 * 适用于需要使用 Spine 4.2 格式骨骼动画的场景。
 *
 * 详细的 API 文档请参考 `@eva/spine-base` 中的 SpineSystem 类。
 *
 * @see {@link @eva/spine-base.SpineSystem} 基类文档
 * @see {@link Spine} 配套组件
 *
 * @example
 * ```typescript
 * import { Game } from '@eva/eva.js';
 * import { RendererSystem } from '@eva/plugin-renderer';
 * import { SpineSystem } from '@eva/plugin-renderer-spine';
 *
 * const game = new Game({
 *   systems: [
 *     new RendererSystem({
 *       canvas: document.getElementById('canvas'),
 *       width: 750,
 *       height: 1000,
 *     }),
 *     new SpineSystem(),
 *   ],
 * });
 * ```
 */
export default class SpineSystem extends SpineSystemBase {
  /**
   * 初始化系统，注入 pixi-spine 4.2 版本
   * @override
   */
  init() {
    super.init({ pixiSpine });
  }
}
