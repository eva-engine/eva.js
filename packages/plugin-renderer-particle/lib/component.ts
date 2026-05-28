import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export type RangeValue =
  | number
  | { min: number; max: number }
  | { start: number; end: number; ease?: string }
  | number[];

export type ZoneShape =
  | { type: 'point'; x?: number; y?: number }
  | { type: 'rect'; x?: number; y?: number; width: number; height: number }
  | { type: 'circle'; x?: number; y?: number; radius: number }
  | { type: 'ellipse'; x?: number; y?: number; rx: number; ry: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number };

export interface EmitZoneSpec {
  type?: 'random' | 'edge';
  shape: ZoneShape;
  total?: number;
  stepRate?: number;
}

export interface DeathZoneSpec {
  shape: ZoneShape;
  mode?: 'onEnter' | 'onLeave';
}

export interface ParticleEmitterParams {
  resource: string;
  /** atlas frame 名;Phase 2 支持。 */
  frame?: string | string[];
  /** 是否自动开始发射,默认 true。 */
  auto?: boolean;
  /** 一次性爆发 N 个粒子(等价于 Phaser explode);设置后 frequency 不再生效。 */
  explode?: number;
  /** 单位 ms,emitter 持续时间;-1 = 无限。 */
  duration?: number;
  /** 累计发射 N 个后停止。 */
  stopAfter?: number;
  /** 单位 ms,两次发射间隔(每次产生 quantity 个);默认 250。 */
  frequency?: number;
  /** 每次 emit 的粒子个数,默认 1。 */
  quantity?: number;
  /** 粒子最大存活数(性能上限),默认 500。 */
  maxParticles?: number;

  lifespan?: RangeValue;

  speed?: RangeValue;
  speedX?: RangeValue;
  speedY?: RangeValue;
  /** 角度,单位:度。Phaser 默认 0~360。 */
  angle?: RangeValue;

  rotate?: RangeValue;

  scale?: RangeValue;
  scaleX?: RangeValue;
  scaleY?: RangeValue;

  alpha?: RangeValue;
  /** 单色 hex 或多色随机数组。 */
  tint?: number | number[];

  gravityX?: number;
  gravityY?: number;
  accelerationX?: RangeValue;
  accelerationY?: RangeValue;

  /** 粒子目标点;设置后 speed/angle 用于计算朝目标的 vx/vy。 */
  moveTo?: { x: number; y: number };

  emitZone?: EmitZoneSpec;
  deathZone?: DeathZoneSpec;

  /** 命名钩子,由宿主自定义解析(DSL 中存事件 key)。 */
  onEmit?: string;
  onUpdate?: string;
}

export default class ParticleEmitter extends Component<ParticleEmitterParams> {
  static componentName: string = 'ParticleEmitter';

  @type('string') resource: string = '';
  frame?: string | string[];
  @type('boolean') auto: boolean = true;
  explode?: number;
  @type('number') duration: number = -1;
  stopAfter?: number;
  @type('number') frequency: number = 250;
  @type('number') quantity: number = 1;
  @type('number') maxParticles: number = 500;
  lifespan?: RangeValue = 1000;
  speed?: RangeValue;
  speedX?: RangeValue;
  speedY?: RangeValue;
  angle?: RangeValue;
  rotate?: RangeValue;
  scale?: RangeValue;
  scaleX?: RangeValue;
  scaleY?: RangeValue;
  alpha?: RangeValue;
  tint?: number | number[];
  @type('number') gravityX: number = 0;
  @type('number') gravityY: number = 0;
  accelerationX?: RangeValue;
  accelerationY?: RangeValue;
  moveTo?: { x: number; y: number };
  emitZone?: EmitZoneSpec;
  deathZone?: DeathZoneSpec;
  onEmit?: string;
  onUpdate?: string;

  /** Runtime 标记:由 System 设置,触发时立即停止发射。 */
  paused: boolean = false;

  init(obj?: ParticleEmitterParams) {
    if (obj) Object.assign(this, obj);
  }

  /** 立刻停止发射(已存在的粒子继续运行直至 lifespan 到期)。 */
  stop() {
    this.paused = true;
  }

  /** 恢复发射。 */
  start() {
    this.paused = false;
  }
}
