import { Spine as SpineBase } from '@eva/spine-base';

/**
 * Spine 骨骼动画组件（pixi-spine 3.8 版本）
 *
 * 此组件继承自 `@eva/spine-base` 的 Spine 基类，使用 pixi-spine 3.8 版本。
 * 适用于需要使用 Spine 3.8 格式骨骼动画的场景。
 *
 * 详细的 API 文档和使用示例请参考 `@eva/spine-base` 中的 Spine 类。
 *
 * @see {@link @eva/spine-base.Spine} 基类文档
 * @see {@link SpineSystem} 配套系统
 *
 * @example
 * ```typescript
 * import { Spine } from '@eva/plugin-renderer-spine';
 *
 * const character = new GameObject('character');
 * const spine = new Spine({
 *   resource: 'heroSpine',
 *   animationName: 'idle',
 *   autoPlay: true,
 * });
 * character.addComponent(spine);
 * ```
 */
export default class Spine extends SpineBase {}
