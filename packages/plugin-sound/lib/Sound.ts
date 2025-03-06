import { Component } from '@eva/eva.js';
import { Sound as PIXISound, sound } from '@ali/pixi-sound';

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

class Sound extends Component<SoundParams> {
  static componentName = 'Sound';

  get systemContext(): AudioContext {
    return sound.context.audioContext;
  }

  systemDestination: GainNode;

  get playing() {
    if (!this.buffer) return false;
    return this.buffer.isPlaying;
  }

  state: 'unloaded' | 'loading' | 'loaded' = 'unloaded';

  config: SoundParams = {
    resource: '',
    autoplay: false,
    muted: false,
    volume: 1,
    loop: false,
    seek: 0,
    speed: 1,
  };

  private actionQueue: (() => void)[] = [];
  public startTime: number = 0;

  private buffer: PIXISound;

  get muted(): boolean {
    return this.buffer?.muted || false;
  }

  set muted(v: boolean) {
    if (this.buffer) this.buffer.muted = v;
  }

  get volume(): number {
    return this.buffer?.volume || 0;
  }

  set volume(v: number) {
    if (this.buffer) this.buffer.volume = v;
  }

  init(obj?: SoundParams) {
    if (!obj) {
      return;
    }
    Object.assign(this.config, obj);
    if (this.config.autoplay) {
      this.actionQueue.push(this.play.bind(this));
    }
  }

  play() {
    if (this.state !== 'loaded') {
      this.actionQueue.push(this.play.bind(this));
    }
    if (!this.buffer) return;
    this.startTime = this.systemContext.currentTime;
    this.buffer.play();
  }

  resume() {
    if (!this.buffer) return;
    this.buffer.resume();
  }

  pause() {
    if (!this.buffer) return;
    this.buffer.pause();
  }

  stop() {
    if (!this.buffer) return;
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
