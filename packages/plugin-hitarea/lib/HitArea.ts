import { Component, decorators } from '@eva/eva.js';
import type { HitAreaParams, HitShape } from './types';

/**
 * HitArea 组件 — Godot Area2D 等价物。
 *
 * 不依赖物理引擎。System 每帧扫描 layer ↔ mask 的相交,
 * emit 配置的 signalEnter / signalExit。
 *
 * DSL 用法:
 * ```json
 * { "type": "HitArea", "props": {
 *   "shape": { "type": "circle", "radius": 238 },
 *   "layer": ["monster"],
 *   "mask":  ["rocket"],
 *   "signalEnter": "monster:hit",
 *   "signalExit":  "monster:leave"
 * }}
 * ```
 */
@decorators.componentObserver({})
export class HitArea extends Component<HitAreaParams> {
  static componentName = 'HitArea';

  shape: HitShape = { type: 'circle', radius: 10 };
  layer: string[] = [];
  mask: string[] = [];
  signalEnter?: string;
  signalExit?: string;
  oneShot = false;
  enabled = true;

  /** System 用于内部状态:当前与该 hitarea 相交的对方 hitarea id 集合 */
  _overlapping: Set<number> = new Set();

  init(params?: HitAreaParams) {
    if (!params) return;
    if (params.shape) this.shape = params.shape;
    this.layer = params.layer ?? [];
    this.mask = params.mask ?? [];
    this.signalEnter = params.signalEnter;
    this.signalExit = params.signalExit;
    this.oneShot = params.oneShot ?? false;
    this.enabled = params.enabled ?? true;
  }
}
