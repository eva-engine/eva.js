import { type } from '@eva/inspector-decorator';

import DragonboneEngine from './engine';
import { Component, ComponentParams } from '@eva/eva.js';

export interface DragonBoneParams extends ComponentParams {
  resource: string;
  armatureName: string;
  animationName?: string;
  autoPlay?: boolean;
}

/**
 * DragonBones 骨骼动画组件
 *
 * DragonBone 组件用于播放 DragonBones 骨骼动画。
 * DragonBones 是一个开源的 2D 骨骼动画解决方案，
 * 支持复杂的角色动画、换装、动画融合等高级功能，
 * 适用于游戏角色、UI 动效等需要骨骼动画的场景。
 *
 * 主要功能：
 * - 播放 DragonBones 骨骼动画
 * - 支持多个骨架（Armature）
 * - 支持动画切换和融合
 * - 支持骨骼和插槽操作
 * - 支持换装和皮肤切换
 * - 提供动画事件监听
 *
 * @example
 * ```typescript
 * // 基础用法
 * const character = new GameObject('character');
 * character.addComponent(new DragonBone({
 *   resource: 'heroAnimation', // DragonBones 资源
 *   armatureName: 'Hero', // 骨架名称
 *   animationName: 'idle', // 默认动画
 *   autoPlay: true
 * }));
 *
 * // 切换动画
 * const dragonbone = character.getComponent('DragonBone');
 * dragonbone.play('run'); // 播放跑步动画
 * dragonbone.play('attack', 1); // 播放攻击动画 1 次
 *
 * // 停止动画
 * dragonbone.stop();
 * dragonbone.stop('walk'); // 停止指定动画
 * ```
 */
export default class DragonBone extends Component<DragonBoneParams> {
  /** 组件名称 */
  static componentName: string = 'DragonBone';

  /** DragonBones 骨架实例 */
  private _armature: DragonboneEngine;

  /** 等待播放标志 */
  private waitPlay: boolean = false;

  /** 等待停止标志 */
  private waitStop: boolean = false;

  /** 待播放的动画信息 */
  private waitPlayInfo: { animationName: string; times?: number } = {
    animationName: null,
  };

  /** DragonBones 资源名称 */
  @type('string') resource: string = '';

  /** 骨架名称 */
  @type('string') armatureName: string = '';

  /** 动画名称 */
  @type('string') animationName: string = '';

  /** 是否自动播放 */
  @type('boolean') autoPlay: boolean = true;

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - DragonBones 资源名称
   * @param obj.armatureName - 骨架名称（必填）
   * @param obj.animationName - 默认动画名称
   * @param obj.autoPlay - 是否自动播放
   * @throws 如果未提供 armatureName 则抛出错误
   */
  init(obj?: DragonBoneParams) {
    if (!obj) return;
    if (!obj.armatureName) {
      throw new Error(`The dragonBone component on ${this.gameObject.name}, armatureName is required!`);
    }
    Object.assign(this, obj);
    if (this.autoPlay) {
      this.play(this.animationName);
    }
  }

  play(name?: string, times?: number) {
    if (name) this.animationName = name;
    if (!this.armature) {
      this.waitPlayInfo = { animationName: name, times };
      this.waitPlay = true;
    } else {
      this.armature.play(this.animationName, times);
    }
  }
  stop(name?: string) {
    if (!this.armature) {
      this.waitPlayInfo = { animationName: name };
      this.waitStop = true;
    } else {
      this.armature.stop(name);
    }
    this.animationName = null;
  }
  set armature(val) {
    this._armature = val;
    if (!val) return;
    const { animationName, times } = this.waitPlayInfo;
    this.waitPlay && this.play(animationName, times);
    this.waitStop && this.stop(animationName);
    this.waitPlay = false;
    this.waitStop = false;
  }
  get armature() {
    return this._armature;
  }
  onDestroy() {
    this.removeAllListeners();
  }
}
