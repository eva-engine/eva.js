export type HitShape =
  | { type: 'circle'; radius: number; offsetX?: number; offsetY?: number }
  | { type: 'rect'; width: number; height: number; offsetX?: number; offsetY?: number }
  | { type: 'point'; offsetX?: number; offsetY?: number };

export interface HitAreaParams {
  shape: HitShape;
  /** 自身归属层 */
  layer: string[];
  /** 关心哪些层(本 hitarea 只与 mask 包含的层比对) */
  mask: string[];
  /** enter 信号 */
  signalEnter?: string;
  /** exit 信号 */
  signalExit?: string;
  /** 是否一次性(进入即销毁) */
  oneShot?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}
