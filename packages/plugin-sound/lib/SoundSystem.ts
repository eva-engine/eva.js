import { System, decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';
import SoundComponent from './Sound';

interface SoundSystemParams {
  autoPauseAndStart?: boolean;
  onError: (error: any) => void;
}

@decorators.componentObserver({
  Sound: [],
})
class SoundSystem extends System {
  static systemName = 'SoundSystem';

  private ctx: AudioContext;

  private gainNode: GainNode;

  /** 是否和游戏同步暂停和启动 */
  private autoPauseAndStart = true;

  private onError: (error: any) => void;

  private components: SoundComponent[] = [];

  private pausedComponents: SoundComponent[] = [];

  private audioBufferCache = {};

  private decodeAudioPromiseMap = {};

  get muted(): boolean {
    return this.gainNode ? this.gainNode.gain.value === 0 : false;
  }

  set muted(v: boolean) {
    if (!this.gainNode) {
      return;
    }
    this.gainNode.gain.setValueAtTime(v ? 0 : 1, 0);
  }

  get volume(): number {
    return this.gainNode ? this.gainNode.gain.value : 1;
  }

  set volume(v: number) {
    if (!this.gainNode || typeof v !== 'number' || v < 0 || v > 1) {
      return;
    }
    this.gainNode.gain.setValueAtTime(v, 0);
  }

  get audioLocked(): boolean {
    if (!this.ctx) {
      return true;
    }
    return this.ctx.state !== 'running';
  }

  constructor(obj?: SoundSystemParams) {
    super();
    Object.assign(this, obj);
  }

  /**
   * 恢复播放所有被暂停的音频
   */
  resumeAll() {
    const handleResume = () => {
      this.pausedComponents.forEach(component => {
        component.play();
      });
      // 清理之前缓存的暂停列表
      this.pausedComponents = [];
    };
    this.ctx.resume().then(handleResume, handleResume);
  }

  /**
   * 暂停所有正在播放的音频
   */
  pauseAll() {
    this.components.forEach(component => {
      if (component.playing) {
        this.pausedComponents.push(component);
        component.pause();
      }
    });
    this.ctx.suspend().then();
  }

  /**
   * 停止所有正在播放的音频
   */
  stopAll() {
    this.components.forEach(component => {
      if (component.playing) {
        component.stop();
      }
    });
    // 清理之前缓存的暂停列表
    this.pausedComponents = [];
    this.ctx.suspend().then();
  }

  /**
   * System 初始化用，可以配置参数，游戏未开始
   *
   * System init, set params, game is not begain
   */
  init() {
    this.setupAudioContext();
  }

  update() {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      this.componentChanged(changed);
    }
  }

  /**
   * 游戏开始和游戏暂停后开始播放的时候调用。
   *
   * Called while the game to play when game pause.
   */
  onResume() {
    if (!this.autoPauseAndStart) {
      return;
    }
    this.resumeAll();
  }

  /**
   * 游戏暂停的时候调用。
   *
   * Called while the game paused.
   */
  onPause() {
    if (!this.autoPauseAndStart) {
      return;
    }
    this.pauseAll();
  }

  /**
   * System 被销毁的时候调用。
   * Called while the system be destroyed.
   */
  onDestroy() {
    this.components.forEach(component => {
      component.onDestroy();
    });
    this.components = [];
    if (this.ctx) {
      this.gainNode.disconnect();
      this.gainNode = null;
      this.ctx.close();
      this.ctx = null;
    }
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Sound') return;

    if (changed.type === OBSERVER_TYPE.ADD) {
      this.add(changed);
    }
  }

  private setupAudioContext() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }

    if (!this.ctx) {
      return;
    }
    this.gainNode =
      typeof this.ctx.createGain === 'undefined' ? (this.ctx as any).createGainNode() : this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
    this.unlockAudio();
  }

  private unlockAudio() {
    if (!this.ctx || !this.audioLocked) {
      return;
    }

    const unlock = () => {
      if (this.ctx) {
        const removeListenerFn = () => {
          document.body.removeEventListener('touchstart', unlock);
          document.body.removeEventListener('touchend', unlock);
          document.body.removeEventListener('click', unlock);
        };
        this.ctx.resume().then(removeListenerFn, removeListenerFn);
      }
    };
    document.body.addEventListener('touchstart', unlock);
    document.body.addEventListener('touchend', unlock);
    document.body.addEventListener('click', unlock);
  }

  private async add(changed: ComponentChanged) {
    const component = changed.component as SoundComponent;
    this.components.push(component);
    try {
      const { config } = component;
      component.state = 'loading';

      const audio = await resource.getResource(config.resource);
      if (!this.audioBufferCache[audio.name] && audio?.data?.audio) {
        this.audioBufferCache[audio.name] = await this.decodeAudioData(audio.data.audio, audio.name);
      }
      if (this.audioBufferCache[audio.name]) {
        component.systemContext = this.ctx;
        component.systemDestination = this.gainNode;
        component.onload(this.audioBufferCache[audio.name]);
      }
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  private decodeAudioData(arraybuffer: ArrayBuffer, name: string) {
    if (this.decodeAudioPromiseMap[name]) {
      return this.decodeAudioPromiseMap[name];
    }
    const promise = new Promise<AudioBuffer>((resolve, reject) => {
      if (!this.ctx) {
        reject(new Error('No audio support'));
      }
      const error = (err: DOMException) => {
        if (this.decodeAudioPromiseMap[name]) {
          delete this.decodeAudioPromiseMap[name];
        }
        reject(new Error(`${err}. arrayBuffer byteLength: ${arraybuffer ? arraybuffer.byteLength : 0}`));
      };
      const success = (decodedData: AudioBuffer) => {
        if (this.decodeAudioPromiseMap[name]) {
          delete this.decodeAudioPromiseMap[name];
        }
        if (decodedData) {
          resolve(decodedData);
        } else {
          reject(new Error(`Error decoding audio ${name}`));
        }
      };

      this.ctx.decodeAudioData(arraybuffer, success, error);
    });
    this.decodeAudioPromiseMap[name] = promise;
    return promise;
  }
}

export default SoundSystem;
