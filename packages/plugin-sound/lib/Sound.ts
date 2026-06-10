import { Component } from '@eva/eva.js';
import { Sound as PIXISound, sound } from '@pixi/sound';

export interface SoundParams {
  resource: string;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  loop?: boolean;
  seek?: number;
  speed?: number;
  duration?: number;
  onEnd?: () => void;
}

/**
 * 音频组件
 *
 * Sound 组件用于在游戏对象上播放音频。
 * 支持音频的播放、暂停、停止、音量控制、循环播放等功能。
 * 基于 PixiJS Sound 库实现，提供了 Web Audio API 的完整功能。
 *
 * @example
 * ```typescript
 * const gameObject = new GameObject('bgm');
 * gameObject.addComponent(new Sound({
 *   resource: 'background-music',
 *   autoplay: true,
 *   loop: true,
 *   volume: 0.5
 * }));
 * ```
 */
class Sound extends Component<SoundParams> {
  /** 组件名称 */
  static componentName = 'Sound';

  /** 获取音频系统上下文 */
  get systemContext(): AudioContext {
    return sound.context.audioContext;
  }

  /** 音频系统目标节点 */
  systemDestination: GainNode;

  /** 音频是否正在播放 */
  get playing() {
    if (!this.buffer) return false;
    return this.buffer.isPlaying;
  }

  /** 音频加载状态 */
  state: 'unloaded' | 'loading' | 'loaded' = 'unloaded';

  /** 音频配置参数 */
  config: SoundParams = {
    resource: '',
    autoplay: false,
    muted: false,
    volume: 1,
    loop: false,
    seek: 0,
    speed: 1,
  };

  /** 待执行的操作队列（用于资源加载前的操作缓存） */
  private actionQueue: (() => void)[] = [];

  /** 音频开始播放的时间 */
  public startTime: number = 0;

  /** PixiJS Sound 缓冲区 */
  private buffer: PIXISound;

  constructor(params?: SoundParams) {
    super(params);
    this.init(params);
  }

  get muted(): boolean {
    return this.buffer?.muted ?? this.config.muted ?? false;
  }

  set muted(v: boolean) {
    this.config.muted = v;
    if (this.buffer) this.buffer.muted = v;
  }

  get volume(): number {
    return this.buffer?.volume ?? this.config.volume ?? 1;
  }

  set volume(v: number) {
    const nextVolume = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 1));
    this.config.volume = nextVolume;
    if (this.buffer) this.buffer.volume = nextVolume;
  }

  init(obj?: SoundParams) {
    if (!obj) {
      return;
    }
    Object.assign(this.config, obj);
    this.config.volume = Math.max(0, Math.min(1, this.config.volume ?? 1));
    if (this.config.autoplay) {
      this.actionQueue.push(this.play.bind(this));
    }
  }

  play() {
    if (this.state !== 'loaded') {
      this.actionQueue.push(this.play.bind(this));
    }
    if (!this.buffer) {
      sound.play?.(this.config.resource);
      return;
    }
    this.startTime = this.systemContext?.currentTime ?? 0;
    this.buffer.play();
  }

  resume() {
    if (!this.buffer) {
      sound.resume?.(this.config.resource);
      return;
    }
    this.buffer.resume();
  }

  pause() {
    if (!this.buffer) {
      sound.pause?.(this.config.resource);
      return;
    }
    this.buffer.pause();
  }

  stop() {
    if (!this.buffer) {
      sound.stop?.(this.config.resource);
      return;
    }
    this.buffer.stop();
  }

  onload(buffer: PIXISound) {
    this.state = 'loaded';
    this.buffer = buffer;
    this.buffer.muted = this.config.muted;
    this.buffer.volume = this.config.volume;
    this.buffer.loop = this.config.loop;
    this.buffer.speed = this.config.speed;
    this.actionQueue.forEach(action => action());
    this.actionQueue.length = 0;
  }

  onDestroy() {
    this.actionQueue.length = 0;
    this.startTime = 0;
    if (this.buffer) {
      this.buffer.destroy();
      this.buffer = null;
    }
  }
}

export default Sound;
