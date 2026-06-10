import { System, decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';
import SoundComponent from './Sound';
import { sound, utils, soundAsset } from '@pixi/sound';
import { extensions } from 'pixi.js';

sound.disableAutoPause = true;

utils?.extensions?.push?.('aac');
utils?.validateFormats?.({
  aac: 'audio/aac',
});

if (soundAsset) {
  extensions?.add?.(soundAsset);
}

interface SoundSystemParams {
  useLegacy?: boolean;
  autoPauseAndStart?: boolean;
  onError: (error: any) => void;
}

/**
 * 音频系统
 *
 * SoundSystem 负责管理游戏中所有音频组件的加载和播放。
 * 支持自动与游戏生命周期同步（暂停/恢复），
 * 提供全局音频控制功能（全部暂停/恢复/停止）。
 *
 * @example
 * ```typescript
 * const soundSystem = new SoundSystem({
 *   autoPauseAndStart: true,
 *   onError: (error) => console.error('Sound error:', error)
 * });
 *
 * game.addSystem(soundSystem);
 * ```
 */
@decorators.componentObserver({
  Sound: [],
})
class SoundSystem extends System {
  /** 系统名称 */
  static systemName = 'Sound';

  /** 是否与游戏生命周期同步暂停和启动 */
  private autoPauseAndStart = true;

  /** 错误回调函数 */
  private onError: (error: any) => void;

  /** 管理的音频组件列表 */
  private components: SoundComponent[] = [];

  /** 音频缓冲区缓存 */
  private audioBufferCache = {};

  constructor(obj?: SoundSystemParams) {
    super();
    Object.assign(this, obj);
    if (obj?.useLegacy) {
      sound.useLegacy = true;
    }
  }

  init(_params?: unknown) {}

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

  update(_frame?: unknown) {
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
    sound.removeAll?.();
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
