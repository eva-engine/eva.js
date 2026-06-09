import { Component, decorators } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import type { PathFollowParams, Waypoint } from './types';

/**
 * PathFollow 组件 — 让 GameObject 沿一组 waypoint 行进。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "PathFollow",
 *   "props": {
 *     "speed": 200,
 *     "loop": "pingpong",
 *     "autostart": true,
 *     "rotateToFace": true,
 *     "waypoints": [{ "x": 0, "y": 0 }, { "x": 100, "y": 0 }, { "x": 100, "y": 100 }]
 *   }
 * }
 * ```
 *
 * 算法:
 * - 把所有 segment 按距离累计,curDist 沿总长前进。
 * - loop=once 走到底停止;loop=loop 总长循环;loop=pingpong 来回振荡。
 * - rotateToFace 时按当前 segment 的 atan2 设 transform.rotation。
 */
@decorators.componentObserver({})
export class PathFollow extends Component<PathFollowParams> {
  static componentName = 'PathFollow';

  private waypoints: Waypoint[] = [];
  private segments: { len: number; ax: number; ay: number; bx: number; by: number; theta: number }[] = [];
  private totalLen = 0;
  private speed = 0;
  private loop: 'once' | 'loop' | 'pingpong' = 'once';
  private autostart = false;
  private rotateToFace = false;
  private signal?: string;

  private dist = 0;
  private dir: 1 | -1 = 1;
  private playing = false;

  init(params?: PathFollowParams) {
    if (!params) return;
    this.waypoints = params.waypoints ?? [];
    this.speed = params.speed ?? 0;
    this.loop = params.loop ?? 'once';
    this.autostart = !!params.autostart;
    this.rotateToFace = !!params.rotateToFace;
    this.signal = params.signal;
    this.rebuild();
  }

  awake() {
    if (this.autostart) this.play();
  }

  private rebuild() {
    this.segments = [];
    this.totalLen = 0;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      this.segments.push({ len, ax: a.x, ay: a.y, bx: b.x, by: b.y, theta: Math.atan2(dy, dx) });
      this.totalLen += len;
    }
  }

  play() {
    this.playing = true;
  }
  pause() {
    this.playing = false;
  }
  stop() {
    this.playing = false;
    this.dist = 0;
    this.applyAt(0);
  }

  update(e: { deltaTime: number }) {
    if (!this.playing || this.totalLen <= 0) return;
    this.dist += (this.speed * e.deltaTime) / 1000 * this.dir;

    if (this.dist >= this.totalLen) {
      if (this.loop === 'loop') {
        this.dist = this.dist % this.totalLen;
      } else if (this.loop === 'pingpong') {
        this.dist = this.totalLen - (this.dist - this.totalLen);
        this.dir = -1;
      } else {
        this.dist = this.totalLen;
        this.playing = false;
        this.applyAt(this.dist);
        const bus = getSignalBus();
        bus.emit('path:finish', { component: this });
        if (this.signal) bus.emit(this.signal, { component: this });
        return;
      }
    } else if (this.dist < 0) {
      if (this.loop === 'pingpong') {
        this.dist = -this.dist;
        this.dir = 1;
      } else {
        this.dist = 0;
        this.playing = false;
      }
    }
    this.applyAt(this.dist);
  }

  private applyAt(d: number) {
    let acc = 0;
    for (const s of this.segments) {
      if (acc + s.len >= d) {
        const u = s.len > 0 ? (d - acc) / s.len : 0;
        const x = s.ax + (s.bx - s.ax) * u;
        const y = s.ay + (s.by - s.ay) * u;
        const t = this.gameObject.transform as any;
        if (t?.position) {
          t.position.x = x;
          t.position.y = y;
        }
        if (this.rotateToFace && t) {
          t.rotation = s.theta;
        }
        return;
      }
      acc += s.len;
    }
  }
}
