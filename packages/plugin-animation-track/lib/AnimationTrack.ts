import { Component, decorators } from '@eva/eva.js';
import { applyEase } from '@eva/plugin-easing';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { bindPath, PathBinding } from './path';
import type { AnimationTrackParams, Track, Keyframe } from './types';

interface ResolvedTrack {
  binding: PathBinding;
  keyframes: Keyframe[];
}

/**
 * AnimationTrack 组件 — 多 track 关键帧动画。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "AnimationTrack",
 *   "props": {
 *     "duration": 2,
 *     "loop": true,
 *     "autostart": true,
 *     "tracks": [
 *       { "target": "transform.position.x",
 *         "keyframes": [
 *           { "time": 0, "value": 0, "easing": "easeInOutCubic" },
 *           { "time": 1, "value": 200, "easing": "easeOutBack" },
 *           { "time": 2, "value": 0 }
 *         ] }
 *     ]
 *   }
 * }
 * ```
 *
 * 行为:
 * - 每帧累加 dt,在每条 track 上插值。
 * - 不同 track 时间共享(同一 timeline)。
 * - duration 未传则取所有 keyframe time 最大值。
 * - 完成时 emit `track:finish` + props.signal。
 */
@decorators.componentObserver({})
export class AnimationTrack extends Component<AnimationTrackParams> {
  static componentName = 'AnimationTrack';

  private rawTracks: Track[] = [];
  private tracks: ResolvedTrack[] = [];
  private duration = 0;
  private loop = false;
  private autostart = false;
  private signal?: string;
  private elapsed = 0;
  private playing = false;
  private resolved = false;

  init(params?: AnimationTrackParams) {
    if (!params) return;
    this.rawTracks = params.tracks ?? [];
    this.duration = params.duration ?? 0;
    this.loop = !!params.loop;
    this.autostart = !!params.autostart;
    this.signal = params.signal;
  }

  awake() {
    if (!this.resolved) this.setTracks(this.rawTracks, this.duration);
    if (this.autostart) this.play();
  }

  /** 公共 API:外部直接喂 tracks */
  setTracks(tracks: Track[], duration?: number) {
    this.tracks = [];
    let max = 0;
    for (const t of tracks) {
      const binding = bindPath(this.gameObject, t.target);
      if (!binding) continue;
      this.tracks.push({ binding, keyframes: [...t.keyframes].sort((a, b) => a.time - b.time) });
      const last = t.keyframes[t.keyframes.length - 1];
      if (last && last.time > max) max = last.time;
    }
    if (duration != null && duration > 0) this.duration = duration;
    if (!this.duration) this.duration = max;
    this.resolved = true;
  }

  play() {
    this.playing = true;
  }
  pause() {
    this.playing = false;
  }
  stop() {
    this.playing = false;
    this.elapsed = 0;
    this.evaluate(0);
  }
  seek(t: number) {
    this.elapsed = Math.max(0, Math.min(this.duration, t));
    this.evaluate(this.elapsed);
  }

  update(e: { deltaTime: number }) {
    if (!this.playing || !this.resolved) return;
    this.elapsed += e.deltaTime / 1000;
    if (this.elapsed >= this.duration) {
      if (this.loop) {
        this.elapsed = this.elapsed % (this.duration || 1);
      } else {
        this.elapsed = this.duration;
        this.playing = false;
        this.evaluate(this.elapsed);
        const bus = getSignalBus();
        bus.emit('track:finish', { component: this });
        if (this.signal) bus.emit(this.signal, { component: this });
        return;
      }
    }
    this.evaluate(this.elapsed);
  }

  private evaluate(time: number) {
    for (const track of this.tracks) {
      const kfs = track.keyframes;
      if (!kfs.length) continue;
      if (time <= kfs[0].time) {
        if (!track.binding) continue;
      track.binding.write(kfs[0].value);
        continue;
      }
      if (time >= kfs[kfs.length - 1].time) {
        if (!track.binding) continue;
      track.binding.write(kfs[kfs.length - 1].value);
        continue;
      }
      // 找包围帧
      for (let i = 0; i < kfs.length - 1; i++) {
        const a = kfs[i];
        const b = kfs[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = b.time - a.time;
          const u = span > 0 ? (time - a.time) / span : 1;
          const eased = applyEase(a.easing, u);
          const v = a.value + (b.value - a.value) * eased;
          if (!track.binding) continue;
      track.binding.write(v);
          break;
        }
      }
    }
  }
}
