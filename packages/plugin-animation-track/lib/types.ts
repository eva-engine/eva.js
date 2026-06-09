import type { EasingName } from '@eva/plugin-easing';

export interface Keyframe {
  /** 时间(秒) */
  time: number;
  /** 该字段在该时刻的目标值 */
  value: number;
  /** 该 segment(到下一帧)的 ease 曲线;最后一帧无意义 */
  easing?: EasingName;
}

export interface Track {
  /** 字段路径,见 plugin-tween path 解析 */
  target: string;
  /** 关键帧列表,按 time 升序;允许同一 time 多帧表示瞬时跳转(后赢) */
  keyframes: Keyframe[];
}

export interface AnimationTrackParams {
  tracks: Track[];
  /** 总时长(秒);未传则取所有 track 最大 keyframe time */
  duration?: number;
  /** 自动播放 */
  autostart?: boolean;
  /** 循环 */
  loop?: boolean;
  /** 完成时 emit */
  signal?: string;
}
