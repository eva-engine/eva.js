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
    this.options = {
      autoStart: false,
      ...options,
    };
    this.on('success', () => {
      this.loadStatus = true;
      const { ip, op } = this.anim.keyframes;
      for (let i = ip; i <= op; i++) {
        const event = `@${i}`;
        this.anim.on(event, e => this.emit(event, e));
      }
      this.firstPlay && this.firstPlay();
    });
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

    const { slot = [] } = expandOpts;
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

    this.anim.playSegment(this.playParamsHandle(params), expandOpts);
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
}
