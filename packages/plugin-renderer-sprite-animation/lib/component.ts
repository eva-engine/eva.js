import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
import { SpriteAnimation as SpriteAnimationEngine } from '@eva/renderer-adapter';

export interface SpriteAnimationParams {
  resource: string;
  autoPlay?: boolean;
  speed?: number;
  /** Stop at last frame */
  forwards?: boolean;
  animations?: Record<string, SpriteAnimationClip>;
  onComplete?: () => void;
  onFrameChange?: (frame?: number) => void;
}

export interface SpriteAnimationClip {
  start: number;
  end: number;
  speed?: number;
}

/**
 * 精灵动画组件
 *
 * SpriteAnimation 组件用于播放帧动画（序列帧动画）。
 * 通过快速切换精灵图集中的不同帧，实现动画效果，
 * 适用于角色动作、特效、UI 动画等场景。
 *
 * 主要功能：
 * - 支持自动播放和手动控制
 * - 可配置播放速度和循环次数
 * - 支持跳转到指定帧
 * - 提供播放完成事件
 * - 支持 forwards 模式（停在最后一帧）
 *
 * @example
 * ```typescript
 * // 基础用法 - 自动播放
 * const character = new GameObject('character');
 * character.addComponent(new SpriteAnimation({
 *   resource: 'walkAnimation', // 帧动画资源
 *   autoPlay: true,
 *   speed: 100 // 播放速度（毫秒/帧）
 * }));
 *
 * // 控制播放
 * const anim = character.getComponent('SpriteAnimation');
 * anim.play(3); // 播放 3 次
 * anim.play(Infinity); // 无限循环
 * anim.stop(); // 停止播放
 * anim.gotoAndPlay(10); // 跳到第 10 帧并播放
 * anim.gotoAndStop(0); // 跳到第 0 帧并停止
 *
 * // 监听播放完成
 * anim.on('complete', () => {
 *   console.log('动画播放完成');
 * });
 * ```
 */
export default class SpriteAnimation extends Component<SpriteAnimationParams> {
  /** 组件名称 */
  static componentName: string = 'SpriteAnimation';

  /** 帧动画资源名称 */
  @type('string') resource: string = '';

  /** 是否自动播放 */
  @type('boolean') autoPlay: boolean = true;

  /** 播放速度（毫秒/帧） */
  @type('number') @step(10) speed: number = 100;

  /** 是否在最后一帧停止（forwards 模式） */
  @type('boolean') forwards: boolean = false;

  /** 命名动画片段，供编辑器和脚本按动作名播放 */
  animations: Record<string, SpriteAnimationClip> = {};

  /** 当前正在播放或等待播放的动画名 */
  currentAnimation?: string;

  /** 动画完成事件回调 */
  onComplete?: () => void;

  /** 帧变化事件回调 */
  onFrameChange?: (frame?: number) => void;

  /** 动画引擎实例 */
  _animate: SpriteAnimationEngine;

  /** 等待播放标志（资源加载前调用 play） */
  private waitPlay: boolean = false;

  private waitAnimation?: string;

  private waitLoop: boolean = false;

  /** 等待停止标志 */
  private waitStop: boolean = false;

  /** 播放次数 */
  private times: number = Infinity;

  /** 当前已播放次数 */
  private count: number = 0;

  /** 是否播放完成 */
  private complete: boolean = false;

  private listenerBound: boolean = false;

  constructor(params?: SpriteAnimationParams) {
    super(params);
    this.init(params);
  }

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 帧动画资源名称
   * @param obj.autoPlay - 是否自动播放
   * @param obj.speed - 播放速度
   * @param obj.forwards - 是否停在最后一帧
   */
  init(obj?: SpriteAnimationParams) {
    obj && Object.assign(this, obj);
    if (!this.listenerBound) {
      this.listenerBound = true;
      this.on('loop', () => {
        if (++this.count >= this.times) {
          if (this.forwards) {
            this.gotoAndStop(this.totalFrames - 1);
          } else {
            this.animate?.stop();
          }
          this.complete = true;
          this.emit('complete');
        }
      });
      this.on('complete', () => {
        this.onComplete?.();
      });
      this.on('frameChange', () => {
        this.onFrameChange?.(this.currentFrame);
      });
    }
  }
  play(nameOrTimes: string | number = Infinity, loop: boolean = false) {
    let times = typeof nameOrTimes === 'number' ? nameOrTimes : loop ? Infinity : 1;
    let startFrame: number | undefined;
    if (typeof nameOrTimes === 'string') {
      this.currentAnimation = nameOrTimes;
      const clip = this.animations[nameOrTimes];
      if (clip) {
        startFrame = clip.start;
        if (clip.speed !== undefined) this.speed = clip.speed;
      }
    }
    if (times === 0) {
      return;
    }
    this.times = times;
    if (!this.animate) {
      this.waitPlay = true;
      this.waitAnimation = typeof nameOrTimes === 'string' ? nameOrTimes : undefined;
      this.waitLoop = loop;
    } else {
      if (this.complete) {
        this.gotoAndStop(0);
      }
      if (startFrame !== undefined) {
        this.animate.gotoAndPlay(startFrame);
      } else {
        this.animate.play();
      }
      this.count = 0;
      this.complete = false;
    }
  }
  stop() {
    if (!this.animate) {
      this.waitStop = true;
    } else {
      this.animate.stop();
    }
  }
  set animate(val) {
    this._animate = val;
    if (this.waitPlay) {
      this.waitPlay = false;
      const waitAnimation = this.waitAnimation;
      this.waitAnimation = undefined;
      this.play(waitAnimation ?? this.times, this.waitLoop);
    }
    if (this.waitStop) {
      this.waitStop = false;
      this.stop();
    }
  }
  get animate() {
    return this._animate;
  }
  gotoAndPlay(frameNumber) {
    this.animate.gotoAndPlay(frameNumber);
  }
  gotoAndStop(frameNumber) {
    this.animate.gotoAndStop(frameNumber);
  }
  get currentFrame() {
    return this.animate?.animatedSprite?.currentFrame;
  }
  get totalFrames() {
    return this.animate?.animatedSprite?.totalFrames;
  }
}
