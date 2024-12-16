import { Component } from '@eva/eva.js';
import { Sound as PIXISound } from '@pixi/sound';

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

  systemContext: AudioContext;

  systemDestination: GainNode;

  get playing() {
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

  private buffer: PIXISound;

  get muted(): boolean {
    return this.buffer.muted;
  }

  set muted(v: boolean) {
    this.buffer.muted = v;
  }

  get volume(): number {
    return this.buffer.volume;
  }

  set volume(v: number) {
    this.buffer.volume = v;
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
    this.buffer.play();
  }

  resume() {
    this.buffer.resume();
  }

  pause() {
    this.buffer.pause();
  }

  stop() {
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
    this.buffer.destroy();
    this.buffer = null;
  }
}

export default Sound;
