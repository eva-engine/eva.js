import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

/**
 * 精灵图组件
 *
 * Sprite 组件用于渲染精灵图集（Sprite Sheet）中的单个精灵。
 * 它从一个包含多个小图的大图资源中提取指定的子图进行渲染，
 * 这种方式可以减少纹理切换，提高渲染性能。
 *
 * @example
 * ```typescript
 * // 渲染精灵图集中的某个精灵
 * const player = new GameObject('player');
 * player.addComponent(new Sprite({
 *   resource: 'playerAtlas', // 资源名称
 *   spriteName: 'player_idle_01.png' // 精灵图集中的子图名称
 * }));
 * ```
 */
export default class Sprite extends Component<SpriteParams> {
  /** 组件名称 */
  static componentName: string = 'Sprite';

  /** 精灵图集资源名称 */
  @type('string') resource: string = '';

  /** 精灵图集中的子图名称 */
  @type('string') spriteName: string = '';

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 资源名称
   * @param obj.spriteName - 精灵名称
   */
  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
