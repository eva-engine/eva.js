import { Component } from '@eva/eva.js';
import { IExpandOpts, IOptions } from './types';
import { Sprite, Text, TextStyle, Graphics } from 'pixi.js';

interface ExtendOptions extends IOptions {
  autoStart: boolean;
}

/**
 * Lottie 动画组件
 *
 * Lottie 组件用于播放 Adobe After Effects 导出的 Lottie 动画文件。
 * Lottie 是一种基于 JSON 的动画格式，可以实现复杂的矢量动画效果，
 * 文件体积小、性能高，适用于图标动画、loading 动画、复杂 UI 动效等场景。
 *
 * 主要功能：
 * - 播放 Lottie JSON 动画
 * - 支持动画片段播放和循环
 * - 支持插槽（slot）动态替换内容
 * - 支持帧事件监听
 * - 支持交互热区绑定
 * - 支持动态替换动画数据
 *
 * @example
 * ```typescript
 * // 基础用法
 * const animation = new GameObject('animation');
 * animation.addComponent(new Lottie({
 *   resource: 'loadingAnimation', // Lottie JSON 资源
 *   autoStart: true
 * }));
 *
 * // 播放指定片段
 * const lottie = animation.getComponent('Lottie');
 * lottie.play([0, 60], { repeats: -1 }); // 播放 0-60 帧，无限循环
 *
 * // 动态替换插槽内容
 * lottie.play([0, 120], {
 *   slot: [{
 *     name: 'avatar',
 *     type: 'IMAGE',
 *     value: 'user-avatar.png',
 *     style: { width: 100, height: 100 }
 *   }, {
 *     name: 'username',
 *     type: 'TEXT',
 *     value: '玩家名称',
 *     style: { fontSize: 24 }
 *   }]
 * });
 *
 * // 监听特定帧事件
 * lottie.on('@30', () => {
 *   console.log('到达第 30 帧');
 * });
 *
 * // 绑定点击热区
 * lottie.onTap('buttonLayer', () => {
 *   console.log('按钮被点击');
 * });
 * ```
 */
export default class Lottie extends Component {
  /** 插槽配置 */
  // @decorators.IDEProp 复杂编辑后续添加
  slot: { [key: string]: string };

  /** 待替换的数据 */
  _replaceData: Record<string, string> | null = null;

  /** 组件名称 */
  static componentName: string = 'Lottie';

  /** Lottie 动画实例 */
  public anim: any;

  /** Lottie 配置选项 */
  public options: ExtendOptions;

  /** 是否资源就绪后自动播放 */
  public autoplay: boolean = false;

  /** 是否循环播放 */
  public loop: boolean = false;

  /** 完成事件回调 */
  public onComplete?: () => void;

  /** 循环完成事件回调 */
  public onLoopComplete?: () => void;

  private _speed: number = 1;

  /** 资源加载状态 */
  public loadStatus: boolean = false;

  /** 首次播放回调 */
  public firstPlay: () => void | null = null;

  /** 前一次的插槽内容 */
  public prevSlot: { [name: string]: any } = {};

  /** 当前的插槽内容 */
  public currentSlot: { [name: string]: any } = {};

  /**
   * 构造 Lottie 组件
   * @param options - Lottie 配置选项
   * @param options.resource - Lottie JSON 资源名称
   * @param options.autoStart - 是否自动开始播放
   */
  constructor(options: IOptions) {
    super();
    const autoStart = options.autoStart ?? options.autoplay ?? false;
    this.options = {
      ...options,
      autoStart,
    };
    this.autoplay = autoStart;
    this.loop = options.loop ?? false;
    this._speed = options.speed ?? 1;
    this.onComplete = options.onComplete;
    this.onLoopComplete = options.onLoopComplete;
    if (this.onComplete) this.on('complete', this.onComplete);
    if (this.onLoopComplete) this.on('loopComplete', this.onLoopComplete);
    this.on('success', () => {
      this.loadStatus = true;
      this.applySpeed();
      const { ip, op } = this.anim.keyframes;
      for (let i = ip; i <= op; i++) {
        const event = `@${i}`;
        this.anim.on(event, e => this.emit(event, e));
      }
      if (this.options.autoStart) this.play();
      this.firstPlay && this.firstPlay();
    });
  }

  get speed() {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
    this.options.speed = value;
    this.applySpeed();
  }

  play(
    params: number[] = [],
    expandOpts: IExpandOpts = {
      repeats: 0,
    },
  ) {
    if (!this.loadStatus) {
      this.firstPlay = () => {
        this.play(params, expandOpts);
      };
      return;
    }

    const playOptions = {
      ...expandOpts,
      repeats: expandOpts.repeats ?? (this.loop ? -1 : 0),
    };
    const { slot = [] } = playOptions;
    slot.forEach(({ name, type, value, style = {} }) => {
      const { x, y, anchor = { x: 0, y: 0 }, pivot = { x: 0, y: 0 }, width, height } = style;
      if (type === 'IMAGE') {
        this.currentSlot[name] = Sprite.from(value);
      } else if (type === 'TEXT') {
        this.currentSlot[name] = new Text({
          text: value,
          style: new TextStyle(style),
        });
      }
      if (x) this.currentSlot[name].x = x;
      if (y) this.currentSlot[name].y = y;
      if (width) this.currentSlot[name].width = width;
      if (height) this.currentSlot[name].height = height;
      this.currentSlot[name].anchor.set(anchor.x || 0, anchor.y || 0);
      this.currentSlot[name].pivot.set(
        this.currentSlot[name].width * (pivot.x || 0),
        this.currentSlot[name].height * (pivot.y || 0),
      );
      if (this.prevSlot[name]) this.anim.unbindSlot(name, this.prevSlot[name]);
      this.anim.bindSlot(name, this.currentSlot[name]);
      this.prevSlot[name] = this.currentSlot[name];
    });

    this.anim.playSegment(this.playParamsHandle(params), playOptions);
  }

  pause() {
    if (this.anim?.pause) this.anim.pause();
  }

  stop() {
    if (this.anim?.stop) this.anim.stop();
    else if (this.anim?.goToAndStop) this.anim.goToAndStop(0, true);
  }

  goToFrame(frame: number) {
    if (this.anim?.goToAndStop) this.anim.goToAndStop(frame, true);
  }

  load() {
    if (this.loadStatus || this.anim) return;
    this.firstPlay = this.firstPlay ?? (() => {});
  }

  replaceData(data: Record<string, string>) {
    if (data) {
      if (this.anim) this.anim.replaceData(data);
      else this._replaceData = data;
    }
  }

  playParamsHandle(params) {
    let p = [].concat(params);
    const { keyframes } = this.anim;
    if (!p.length || p.length > 2) {
      p = [keyframes.ip, keyframes.op];
    } else if (p.length === 1) {
      p = [p[0] % keyframes.op, keyframes.op];
    }
    return p;
  }

  onTap(name, callback) {
    const g = new Graphics();
    this.on('success', () => {
      const ele = this.anim.querySelector(name);
      const display = ele.display;
      g.rect(0, 0, 100, 100).fill(0xffffff);
      g.alpha = 0;
      display.addChild(g);
      ele.display.interactive = true;
      ele.display.on('pointertap', () => {
        callback();
      });
    });
  }

  destroy() {
    Object.keys(this.prevSlot).forEach(name => {
      const slot = this.prevSlot[name];
      if (this.anim?.unbindSlot && slot) this.anim.unbindSlot(name, slot);
      if (slot?.destroy) slot.destroy();
    });
    this.prevSlot = {};
    this.currentSlot = {};
    if (this.anim?.destroy) this.anim.destroy();
    this.anim = null;
    this.loadStatus = false;
  }

  private applySpeed() {
    if (this.anim?.setSpeed) this.anim.setSpeed(this._speed);
    else if (this.anim) this.anim.timeScale = this._speed;
  }
}
