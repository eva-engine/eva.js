import { System, decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';
import SoundComponent from './Sound';
import { sound } from '@pixi/sound';
import { extensions } from 'pixi.js';
import { soundAsset } from '@pixi/sound';

extensions.add(soundAsset);

interface SoundSystemParams {
  autoPauseAndStart?: boolean;
  onError: (error: any) => void;
}

@decorators.componentObserver({
  Sound: [],
})
class SoundSystem extends System {
  static systemName = 'SoundSystem';

  /** 是否和游戏同步暂停和启动 */
  private autoPauseAndStart = true;

  private onError: (error: any) => void;

  private components: SoundComponent[] = [];

  private audioBufferCache = {};

  constructor(obj?: SoundSystemParams) {
    super();
    Object.assign(this, obj);
  }

  /**
   * 恢复播放所有被暂停的音频
   */
  resumeAll() {
    sound.resumeAll();
  }

  /**
   * 暂停所有正在播放的音频
   */
  pauseAll() {
    sound.pauseAll();
  }

  /**
   * 停止所有正在播放的音频
   */
  stopAll() {
    sound.stopAll();
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
    sound.removeAll();
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Sound') return;

    if (changed.type === OBSERVER_TYPE.ADD) {
      this.add(changed);
    }
  }

  private async add(changed: ComponentChanged) {
    const component = changed.component as SoundComponent;
    this.components.push(component);
    try {
      const { config } = component;
      component.state = 'loading';

      const audio = await resource.getResource(config.resource);
      if (!this.audioBufferCache[audio.name] && audio?.data?.audio) {
        this.audioBufferCache[audio.name] = audio?.data?.audio;
      }
      if (this.audioBufferCache[audio.name]) {
        component.onload(this.audioBufferCache[audio.name]);
      }
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}

export default SoundSystem;
