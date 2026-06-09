export interface Waypoint {
  x: number;
  y: number;
}

export interface PathFollowParams {
  /** 路径点(世界/本地;由 transform 决定) */
  waypoints: Waypoint[];
  /** 速度,像素/秒 */
  speed: number;
  /** 循环模式: "once"|"loop"|"pingpong" */
  loop?: 'once' | 'loop' | 'pingpong';
  /** 自动启动 */
  autostart?: boolean;
  /** 沿切线对齐 transform.rotation(弧度) */
  rotateToFace?: boolean;
  /** 完成时 emit */
  signal?: string;
}
