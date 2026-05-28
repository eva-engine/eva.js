import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

/**
 * Phaser-style Video 组件入参(MVP)。
 *
 * 注意:
 * - `src` 既可以是已注册到资源加载器的资源 key,也可以直接是 .mp4/.webm 等可播放 URL。
 * - 浏览器的 autoplay 限制要求视频必须 muted=true 才能在没有用户交互时播放。
 * - 视频通过隐藏的 `<video>` 元素 + PixiJS `Texture.from(video)` 接入 ECS 渲染管线。
 */
export interface VideoParams {
  /** 视频 URL 或 DSL assets 中的资源 key。 */
  src: string;
  /** 是否循环播放,默认 false。 */
  loop?: boolean;
  /** 是否在加载完成后自动开始播放,默认 true。 */
  autoplay?: boolean;
  /** 是否静音,默认 true(浏览器自动播放限制下必须为 true)。 */
  muted?: boolean;
  /** 音量 0~1,默认 1。 */
  volume?: number;
  /** 播放速率,默认 1。 */
  playbackRate?: number;
  /** 显示宽度;不填则使用 video 的 videoWidth(回落到 256)。 */
  width?: number;
  /** 显示高度;不填则使用 video 的 videoHeight(回落到 256)。 */
  height?: number;
  /** Sprite anchor X,默认 0.5。 */
  anchorX?: number;
  /** Sprite anchor Y,默认 0.5。 */
  anchorY?: number;
  /** 命名钩子:视频播放结束 (ended 事件)时触发,DSL 中保存事件 key 供宿主消费。 */
  onComplete?: string;
  /** 跨域设置,默认 'anonymous'(允许 canvas 取像素 / snapshot)。 */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** 是否 inline 播放(iOS 必需),默认 true。 */
  playsInline?: boolean;
}

/**
 * Phaser 风格的 Video 渲染组件(Eva.js MVP 实现)。
 *
 * 行为:
 * 1. ADD 时 VideoSystem 会创建一个 detached 的 `<video>` DOM 元素 + PixiJS Texture + Sprite,
 *    Sprite 加入到 GameObject 的 PixiJS Container;
 * 2. video 的源 (`<video>.src`) 由 `src` 决定:
 *    - 若注册过同名 VIDEO/IMAGE 资源(且 instance.src 可用),取注册的 url;
 *    - 否则直接当作 URL 使用。
 * 3. 视频进入 `loadeddata` 后即可绘制;
 * 4. CHANGE prop 时按属性增量更新(loop/muted/volume/playbackRate/src);
 * 5. REMOVE/destroy 时停止播放、销毁 video/texture/sprite。
 *
 * 不支持(明确 SKIP):
 * - HLS/DASH/MSE 高级流;
 * - getUserMedia / 透明视频(alpha video / chroma key);
 * - 作为 shader 纹理(Eva.js 无 GLSL 注入);
 * - Phaser saveTexture 把视频转 sprite atlas 的工作流。
 */
export default class Video extends Component<VideoParams> {
  static componentName: string = 'Video';

  @type('string') src: string = '';
  @type('boolean') loop: boolean = false;
  @type('boolean') autoplay: boolean = true;
  @type('boolean') muted: boolean = true;
  @type('number') volume: number = 1;
  @type('number') playbackRate: number = 1;
  width?: number;
  height?: number;
  @type('number') anchorX: number = 0.5;
  @type('number') anchorY: number = 0.5;
  onComplete?: string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '' = 'anonymous';
  @type('boolean') playsInline: boolean = true;

  /** Runtime 标记:System 设置,表示视频已经触发过 `ended`。 */
  completed: boolean = false;

  /** 由 System 在 ADD 后写回,便于业务侧 component.play()/pause() 直接操控底层 video。 */
  videoElement?: HTMLVideoElement;

  init(obj?: VideoParams) {
    if (obj) Object.assign(this, obj);
  }

  /** 立即播放(若 video 已就绪)。 */
  play(): Promise<void> | void {
    if (!this.videoElement) return;
    try {
      const ret = this.videoElement.play();
      if (ret && typeof (ret as Promise<void>).catch === 'function') {
        return (ret as Promise<void>).catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[Video] play() rejected:', e);
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Video] play() threw:', e);
    }
  }

  /** 暂停。 */
  pause() {
    if (!this.videoElement) return;
    try {
      this.videoElement.pause();
    } catch {
      /* ignore */
    }
  }

  /** 跳转到指定时间(秒)。 */
  setCurrentTime(seconds: number) {
    if (!this.videoElement) return;
    try {
      this.videoElement.currentTime = Math.max(0, seconds);
    } catch {
      /* ignore */
    }
  }

  /** 把当前帧画到一个独立 canvas 上并返回,用于 snapshot(失败时返回 null)。 */
  snapshot(area?: { x: number; y: number; width: number; height: number }): HTMLCanvasElement | null {
    const v = this.videoElement;
    if (!v || v.readyState < 2) return null;
    const w = area?.width ?? v.videoWidth;
    const h = area?.height ?? v.videoHeight;
    if (w <= 0 || h <= 0) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(v, area?.x ?? 0, area?.y ?? 0, w, h, 0, 0, w, h);
      return canvas;
    } catch {
      return null;
    }
  }
}
