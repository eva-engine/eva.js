import { Component } from '@eva/eva.js';

export interface SoundParams {
  resource: string;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  loop?: boolean;
  seek?: number;
  duration?: number;
  onEnd?: () => void;
}

class Sound extends Component {
  static componentName = 'Sound';

  systemContext: AudioContext;

  systemDestination: GainNode;

  playing: boolean;

  state: 'unloaded' | 'loading' | 'loaded' = 'unloaded';

  config: SoundParams = {
    resource: '',
    autoplay: false,
    muted: false,
    volume: 1,
    loop: false,
    seek: 0,
  };

  private buffer: AudioBuffer;

  private sourceNode: AudioBufferSourceNode;

  private gainNode: GainNode;

  private paused: boolean;

  private playTime: number = 0;

  // @ts-ignore
  private startTime: number = 0;

  private duration: number = 0;

  private actionQueue: (() => void)[] = [];

  private endedListener: () => void;

  get muted(): boolean {
    return this.gainNode ? this.gainNode.gain.value === 0 : false;
  }

  set muted(v: boolean) {
    if (!this.gainNode) {
      return;
    }
    this.gainNode.gain.setValueAtTime(v ? 0 : this.config.volume, 0);
  }

  get volume(): number {
    return this.gainNode ? this.gainNode.gain.value : 1;
  }

  set volume(v: number) {
    if (typeof v !== 'number' || v < 0 || v > 1) {
      return;
    }
    this.config.volume = v;
    if (!this.gainNode) {
      return;
    }
    this.gainNode.gain.setValueAtTime(v, 0);
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

  play(arg = { overlap: true }) {
    if (this.state !== 'loaded') {
      this.actionQueue.push(this.play.bind(this));
    }
    if (arg.overlap){
      this.destroySource(); // not cover last play
    }
    this.createSource();

    if (!this.sourceNode) {
      return;
    }
    const when = this.systemContext.currentTime;
    const offset = this.config.seek;
    const duration = this.config.duration;

    this.sourceNode.start(0, offset, duration);

    this.startTime = when;
    this.playTime = when - offset;
    this.paused = false;
    this.playing = true;
    this.resetConfig();
    this.endedListener = () => {
      if (!this.sourceNode) {
        return;
      }
      if (this.config.onEnd) {
        this.config.onEnd();
      }
      // 非交互事件播放完成需要销毁资源
      if (this.playing) {
        this.destroySource();
      }
    };
    this.sourceNode.addEventListener('ended', this.endedListener);
  }

  pause() {
    if (this.state !== 'loaded') {
      this.actionQueue.push(this.pause.bind(this));
    }
    if (this.paused || !this.playing) {
      return;
    }
    this.paused = true;
    this.playing = false;
    this.config.seek = this.getCurrentTime();
    this.destroySource();
  }

  stop() {
    if (this.state !== 'loaded') {
      this.actionQueue.push(this.stop.bind(this));
    }
    if (!this.paused && !this.playing) {
      return;
    }
    this.playing = false;
    this.paused = false;
    this.destroySource();
    this.resetConfig();
  }

  onload(buffer: AudioBuffer) {
    this.state = 'loaded';
    this.buffer = buffer;
    this.duration = this.buffer.duration;
    this.actionQueue.forEach((action) => action());
    this.actionQueue = [];
  }

  onDestroy() {
    this.destroySource();
  }

  private resetConfig() {
    this.config.seek = 0;
  }

  private getCurrentTime() {
    if (this.config.loop && this.duration > 0) {
      return (this.systemContext.currentTime - this.playTime) % this.duration;
    }

    return this.systemContext.currentTime - this.playTime;
  }

  private createSource() {
    if (!this.systemContext || this.state !== 'loaded') {
      return;
    }
    this.sourceNode = this.systemContext.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = this.config.loop;

    if (!this.gainNode) {
      this.gainNode = this.systemContext.createGain();
      this.gainNode.connect(this.systemDestination);
      Object.assign(this, this.config);
    }
    this.sourceNode.connect(this.gainNode);
  }

  private destroySource() {
    if (!this.sourceNode) {
      return;
    }
    this.sourceNode.removeEventListener('ended', this.endedListener);
    this.sourceNode.stop();
    this.sourceNode.disconnect();
    this.sourceNode = null;
    this.startTime = 0;
    this.playTime = 0;
    this.playing = false;
  }
}

export default Sound;
