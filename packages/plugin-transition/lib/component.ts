import Animation from './Animation';
import { Component } from '@eva/eva.js';
import { Group } from '@tweenjs/tween.js';

interface AnimationStruct {
  name: string;
  component: Component;
  values: {
    time: number;
    value: number;
    tween?: string;
  }[];
}
interface TransitionParams {
  group: Record<string, AnimationStruct[]>;
}
/**
 * 过渡动画组件（基于 Tween.js）
 *
 * Transition 组件为游戏对象提供补间动画功能，可以平滑地改变组件属性。
 * 它基于 Tween.js 实现，支持多种缓动函数、动画组、循环播放等高级功能。
 *
 * 主要功能：
 * - 支持多个命名动画组
 * - 可配置关键帧和缓动函数
 * - 支持动画循环和迭代次数
 * - 提供播放、暂停、停止控制
 * - 支持动画完成和更新事件
 *
 * @example
 * ```typescript
 * const sprite = new GameObject('sprite');
 * sprite.addComponent(new Transition({
 *   group: {
 *     fadeIn: [{
 *       name: 'alpha',
 *       component: sprite.getComponent('Sprite'),
 *       values: [
 *         { time: 0, value: 0, tween: 'ease-in' },
 *         { time: 1000, value: 1 }
 *       ]
 *     }],
 *     moveRight: [{
 *       name: 'position.x',
 *       component: sprite.getComponent('Transform'),
 *       values: [
 *         { time: 0, value: 0 },
 *         { time: 2000, value: 500, tween: 'ease-out-quad' }
 *       ]
 *     }]
 *   }
 * }));
 *
 * // 播放动画
 * const transition = sprite.getComponent('Transition');
 * transition.play('fadeIn'); // 播放一次
 * transition.play('moveRight', Infinity); // 无限循环
 *
 * // 监听动画事件
 * transition.on('finish', (name) => {
 *   console.log('动画完成:', name);
 * });
 * ```
 */
export default class Transition extends Component<TransitionParams> {
  /** 组件名称 */
  static componentName: string = 'Transition';

  /** 动画实例映射表 */
  private animations: Record<string, Animation> = {};

  /** Tween.js 动画组 */
  tweenGroup: Group;

  /** 动画组配置，key 为动画名称，value 为动画配置数组 */
  group: Record<string, AnimationStruct[]> = {};

  /** 当前时间戳 */
  private currentTime: number = 0;

  /** 待播放的动画队列 */
  private needPlay: { name: string; iteration?: number }[] = [];

  /**
   * 初始化组件
   *
   * @param params - 初始化参数
   * @param params.group - 动画组配置对象
   */
  init({ group } = { group: {} }) {
    this.group = group;
    this.tweenGroup = new Group();
  }

  awake() {
    for (const name in this.group) {
      this.newAnimation(name);
    }
  }

  /**
   * 播放动画
   *
   * @param name - 动画名称，如果不传则播放第一个动画
   * @param iteration - 循环次数，默认 1，传 Infinity 为无限循环
   *
   * @example
   * ```typescript
   * transition.play('fadeIn'); // 播放一次
   * transition.play('rotate', 3); // 循环播放 3 次
   * transition.play('bounce', Infinity); // 无限循环
   * ```
   */
  play(name: string, iteration?: number) {
    if (!name) {
      name = Object.keys(this.group)[0];
    }
    if (name && !this.animations[name] && this.group[name]) {
      this.newAnimation(name);
    }
    if (name && this.animations[name]) {
      this.needPlay.push({ name, iteration });
    }
  }

  /**
   * 停止动画
   *
   * @param name - 动画名称，如果不传则停止所有动画
   *
   * @example
   * ```typescript
   * transition.stop('fadeIn'); // 停止指定动画
   * transition.stop(); // 停止所有动画
   * ```
   */
  stop(name) {
    if (!name) {
      for (const key in this.animations) {
        this.animations[key]?.stop();
      }
    } else {
      this.animations[name]?.stop();
    }
  }

  onPause() {
    for (const key in this.animations) {
      this.animations[key]?.pause();
    }
  }

  onResume() {
    for (const key in this.animations) {
      this.animations[key]?.resume();
    }
  }

  onDestroy() {
    for (const key in this.animations) {
      this.animations[key]?.destroy();
    }
    this.tweenGroup.removeAll();
    this.tweenGroup = null;
    this.group = null;
    this.animations = null;
    this.removeAllListeners();
  }
  update(e) {
    this.currentTime = e.time;
    for (const key in this.animations) {
      this.animations[key].currentTime = e.time;
    }
    this.tweenGroup.update(e.time);
    for (const play of this.needPlay) {
      this.animations[play.name]?.play(play.iteration, this.currentTime);
    }
    this.needPlay.length = 0;
  }

  newAnimation(name) {
    const animation = new Animation(this.group[name], this.tweenGroup);
    animation.on('finish', () => this.emit('finish', name));
    animation.on('update', value => this.emit('update', { name, value }));
    this.animations[name] = animation;
  }
}
