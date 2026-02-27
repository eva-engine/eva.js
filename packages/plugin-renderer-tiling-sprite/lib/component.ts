import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';

export interface TilingSpriteParams {
  resource: string;
  tileScale: { x: number; y: number };
  tilePosition: { x: number; y: number };
}

/**
 * 平铺精灵组件
 *
 * TilingSprite 组件用于创建可平铺重复的纹理，支持无限滚动效果。
 * 纹理会在指定区域内重复平铺，并可以设置平铺的缩放和偏移，
 * 适用于背景滚动、地面贴图、水面波纹等需要重复纹理的场景。
 *
 * 主要功能：
 * - 纹理平铺重复
 * - 支持平铺缩放
 * - 支持平铺偏移（实现滚动效果）
 * - 性能优化（只渲染可见区域）
 *
 * @example
 * ```typescript
 * // 创建滚动背景
 * const background = new GameObject('background');
 * background.addComponent(new TilingSprite({
 *   resource: 'bgTile', // 平铺纹理资源
 *   tileScale: { x: 1, y: 1 }, // 平铺缩放
 *   tilePosition: { x: 0, y: 0 } // 平铺偏移
 * }));
 * background.transform.size = { width: 800, height: 600 };
 *
 * // 实现无限滚动
 * const tilingSprite = background.getComponent('TilingSprite');
 * let offset = 0;
 * setInterval(() => {
 *   offset += 1;
 *   tilingSprite.tilePosition = { x: offset, y: 0 };
 * }, 16);
 *
 * // 创建水面效果
 * const water = new GameObject('water');
 * water.addComponent(new TilingSprite({
 *   resource: 'waterTile',
 *   tileScale: { x: 2, y: 2 } // 放大 2 倍平铺
 * }));
 * ```
 */
export default class TilingSprite extends Component<TilingSpriteParams> {
  /** 组件名称 */
  static componentName: string = 'TilingSprite';

  /** 平铺纹理资源名称 */
  @type('string') resource: string = '';

  /** 平铺缩放比例 */
  @type('vector2') @step(0.1) tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };

  /** 平铺位置偏移（用于实现滚动效果） */
  @type('vector2') @step(1) tilePosition: TilingSpriteParams['tilePosition'] = {
    x: 0,
    y: 0,
  };

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 纹理资源名称
   * @param obj.tileScale - 平铺缩放
   * @param obj.tilePosition - 平铺偏移
   */
  init(obj?: TilingSpriteParams) {
    if (obj) {
      this.resource = obj.resource;
      this.tileScale = obj.tileScale;
      this.tilePosition = obj.tilePosition;
    }
  }
}
