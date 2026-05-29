import { Particle, ParticleContainer, Texture } from 'pixi.js';
import type {
  EmitZoneSpec,
  ParticleEmitterParams,
  RangeValue,
  ZoneShape,
} from './component';

interface LiveParticle {
  particle: Particle;
  age: number;
  lifespan: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  rotateSpeed: number;
  scaleStart?: { x: number; y: number };
  scaleEnd?: { x: number; y: number };
  scaleEase?: (t: number) => number;
  alphaStart?: number;
  alphaEnd?: number;
  alphaEase?: (t: number) => number;
}

const TAU = Math.PI * 2;

const easings: Record<string, (t: number) => number> = {
  linear: (t) => t,
  'sine.in': (t) => 1 - Math.cos((t * Math.PI) / 2),
  'sine.out': (t) => Math.sin((t * Math.PI) / 2),
  'sine.inout': (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  'quad.in': (t) => t * t,
  'quad.out': (t) => 1 - (1 - t) * (1 - t),
  'quad.inout': (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  'cubic.in': (t) => t * t * t,
  'cubic.out': (t) => 1 - Math.pow(1 - t, 3),
  'expo.out': (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

function resolveEase(name?: string): (t: number) => number {
  if (!name) return easings.linear;
  const k = name.toLowerCase();
  return easings[k] || easings.linear;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Range 取值:每次 emit 时算一次具体值。`{start, end}` 留给粒子自己每帧插值。 */
function sampleRange(value: RangeValue | undefined, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value[Math.floor(Math.random() * value.length)];
  if ('min' in value && 'max' in value) return rand(value.min, value.max);
  if ('start' in value && 'end' in value) return value.start;
  return fallback;
}

function getRangeBounds(value: RangeValue | undefined): { start: number; end: number; ease?: string } | null {
  if (value == null || typeof value === 'number' || Array.isArray(value)) return null;
  if ('start' in value && 'end' in value) return value;
  return null;
}

function samplePosition(zone: EmitZoneSpec | undefined): { x: number; y: number } {
  if (!zone) return { x: 0, y: 0 };
  return sampleShape(zone.shape, zone.type === 'edge');
}

function sampleShape(shape: ZoneShape, edgeOnly: boolean): { x: number; y: number } {
  switch (shape.type) {
    case 'point':
      return { x: shape.x ?? 0, y: shape.y ?? 0 };
    case 'rect': {
      const x0 = shape.x ?? 0;
      const y0 = shape.y ?? 0;
      if (edgeOnly) {
        const perim = 2 * (shape.width + shape.height);
        const t = Math.random() * perim;
        if (t < shape.width) return { x: x0 + t, y: y0 };
        if (t < shape.width + shape.height) return { x: x0 + shape.width, y: y0 + (t - shape.width) };
        if (t < 2 * shape.width + shape.height) return { x: x0 + shape.width - (t - shape.width - shape.height), y: y0 + shape.height };
        return { x: x0, y: y0 + shape.height - (t - 2 * shape.width - shape.height) };
      }
      return { x: rand(x0, x0 + shape.width), y: rand(y0, y0 + shape.height) };
    }
    case 'circle': {
      const cx = shape.x ?? 0;
      const cy = shape.y ?? 0;
      const angle = Math.random() * TAU;
      const r = edgeOnly ? shape.radius : shape.radius * Math.sqrt(Math.random());
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    }
    case 'ellipse': {
      const cx = shape.x ?? 0;
      const cy = shape.y ?? 0;
      const angle = Math.random() * TAU;
      const k = edgeOnly ? 1 : Math.sqrt(Math.random());
      return { x: cx + Math.cos(angle) * shape.rx * k, y: cy + Math.sin(angle) * shape.ry * k };
    }
    case 'line': {
      const t = Math.random();
      return { x: shape.x1 + (shape.x2 - shape.x1) * t, y: shape.y1 + (shape.y2 - shape.y1) * t };
    }
  }
}

function pointInShape(shape: ZoneShape, px: number, py: number): boolean {
  switch (shape.type) {
    case 'rect': {
      const x0 = shape.x ?? 0;
      const y0 = shape.y ?? 0;
      return px >= x0 && px <= x0 + shape.width && py >= y0 && py <= y0 + shape.height;
    }
    case 'circle': {
      const dx = px - (shape.x ?? 0);
      const dy = py - (shape.y ?? 0);
      return dx * dx + dy * dy <= shape.radius * shape.radius;
    }
    case 'ellipse': {
      const dx = (px - (shape.x ?? 0)) / shape.rx;
      const dy = (py - (shape.y ?? 0)) / shape.ry;
      return dx * dx + dy * dy <= 1;
    }
    case 'point':
    case 'line':
      return false;
  }
}

export class Emitter {
  private params: ParticleEmitterParams;
  private container: ParticleContainer;
  private texture: Texture;
  private frameTextures: Texture[] | null = null;
  private particles: LiveParticle[] = [];
  private elapsed = 0;
  private emittedTotal = 0;
  private emitTimer = 0;
  private explodeDone = false;

  constructor(params: ParticleEmitterParams, container: ParticleContainer, texture: Texture) {
    this.params = params;
    this.container = container;
    this.texture = texture;
  }

  setTexture(texture: Texture) {
    this.texture = texture;
  }

  /** Provide a texture pool when component.frame is set; emitOne samples from it. */
  setFrameTextures(textures: Texture[] | null) {
    this.frameTextures = textures && textures.length > 0 ? textures : null;
  }

  setParams(params: ParticleEmitterParams) {
    this.params = params;
  }

  destroy() {
    this.particles.length = 0;
    this.container.particleChildren.length = 0;
    this.container.update();
  }

  update(dt: number) {
    this.elapsed += dt;
    this.advanceParticles(dt);
    this.spawn(dt);
    this.container.update();
  }

  private advanceParticles(dt: number) {
    const dtSec = dt / 1000;
    const out: LiveParticle[] = [];
    for (const lp of this.particles) {
      lp.age += dt;
      if (lp.age >= lp.lifespan) {
        continue;
      }
      lp.vx += lp.ax * dtSec + (this.params.gravityX ?? 0) * dtSec;
      lp.vy += lp.ay * dtSec + (this.params.gravityY ?? 0) * dtSec;
      lp.particle.x += lp.vx * dtSec;
      lp.particle.y += lp.vy * dtSec;
      lp.particle.rotation += lp.rotateSpeed * dtSec;

      const t = lp.age / lp.lifespan;
      if (lp.scaleStart && lp.scaleEnd) {
        const k = (lp.scaleEase || easings.linear)(t);
        lp.particle.scaleX = lp.scaleStart.x + (lp.scaleEnd.x - lp.scaleStart.x) * k;
        lp.particle.scaleY = lp.scaleStart.y + (lp.scaleEnd.y - lp.scaleStart.y) * k;
      }
      if (lp.alphaStart != null && lp.alphaEnd != null) {
        const k = (lp.alphaEase || easings.linear)(t);
        lp.particle.alpha = lp.alphaStart + (lp.alphaEnd - lp.alphaStart) * k;
      }

      if (this.params.deathZone && this.shouldDie(lp.particle.x, lp.particle.y)) {
        continue;
      }
      out.push(lp);
    }
    this.particles = out;
    this.container.particleChildren.length = 0;
    for (const lp of this.particles) this.container.particleChildren.push(lp.particle);
  }

  private shouldDie(x: number, y: number): boolean {
    const dz = this.params.deathZone;
    if (!dz) return false;
    const inside = pointInShape(dz.shape, x, y);
    return dz.mode === 'onLeave' ? !inside : inside;
  }

  private spawn(dt: number) {
    const p = this.params;
    if (p.duration != null && p.duration > 0 && this.elapsed > p.duration) return;
    if (p.stopAfter != null && this.emittedTotal >= p.stopAfter) return;
    if ((p as any).paused) return;

    const max = p.maxParticles ?? 500;
    if (this.particles.length >= max) return;

    if (p.explode != null && !this.explodeDone) {
      const n = Math.min(p.explode, max - this.particles.length);
      for (let i = 0; i < n; i++) this.emitOne();
      this.explodeDone = true;
      return;
    }
    if (p.explode != null) return;

    if (p.auto === false) return;

    this.emitTimer += dt;
    const freq = p.frequency ?? 250;
    const quantity = p.quantity ?? 1;
    while (this.emitTimer >= freq && this.particles.length < max) {
      for (let i = 0; i < quantity && this.particles.length < max; i++) {
        if (p.stopAfter != null && this.emittedTotal >= p.stopAfter) break;
        this.emitOne();
      }
      this.emitTimer -= freq;
    }
  }

  private emitOne() {
    const p = this.params;
    const pos = samplePosition(p.emitZone);

    const speedScalar = sampleRange(p.speed, 0);
    let vx: number;
    let vy: number;
    if (p.moveTo) {
      const dx = p.moveTo.x - pos.x;
      const dy = p.moveTo.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      vx = (dx / len) * (speedScalar || 100);
      vy = (dy / len) * (speedScalar || 100);
    } else if (p.speedX != null || p.speedY != null) {
      vx = sampleRange(p.speedX, 0);
      vy = sampleRange(p.speedY, 0);
    } else {
      const angleDeg = sampleRange(p.angle, 0);
      const angleRad = (angleDeg * Math.PI) / 180;
      vx = Math.cos(angleRad) * speedScalar;
      vy = Math.sin(angleRad) * speedScalar;
    }

    const ax = sampleRange(p.accelerationX, 0);
    const ay = sampleRange(p.accelerationY, 0);

    const scaleX = p.scaleX != null ? sampleRange(p.scaleX, 1) : sampleRange(p.scale, 1);
    const scaleY = p.scaleY != null ? sampleRange(p.scaleY, 1) : sampleRange(p.scale, 1);
    const alpha = sampleRange(p.alpha, 1);
    const rotation = sampleRange(p.rotate, 0);
    const tintNum = Array.isArray(p.tint)
      ? p.tint[Math.floor(Math.random() * p.tint.length)]
      : (p.tint ?? 0xffffff);

    const tex = this.frameTextures
      ? this.frameTextures[Math.floor(Math.random() * this.frameTextures.length)]
      : this.texture;
    const particle = new Particle({
      texture: tex,
      x: pos.x,
      y: pos.y,
      scaleX,
      scaleY,
      alpha,
      rotation,
      tint: tintNum,
      anchorX: 0.5,
      anchorY: 0.5,
    });

    const lp: LiveParticle = {
      particle,
      age: 0,
      lifespan: sampleRange(p.lifespan, 1000),
      vx,
      vy,
      ax,
      ay,
      rotateSpeed: 0,
    };

    const scaleBounds = getRangeBounds(p.scale);
    const scaleXBounds = getRangeBounds(p.scaleX);
    const scaleYBounds = getRangeBounds(p.scaleY);
    if (scaleBounds || scaleXBounds || scaleYBounds) {
      const sxs = scaleXBounds?.start ?? scaleBounds?.start ?? scaleX;
      const sxe = scaleXBounds?.end ?? scaleBounds?.end ?? scaleX;
      const sys = scaleYBounds?.start ?? scaleBounds?.start ?? scaleY;
      const sye = scaleYBounds?.end ?? scaleBounds?.end ?? scaleY;
      lp.scaleStart = { x: sxs, y: sys };
      lp.scaleEnd = { x: sxe, y: sye };
      lp.scaleEase = resolveEase(scaleXBounds?.ease ?? scaleBounds?.ease);
      particle.scaleX = sxs;
      particle.scaleY = sys;
    }

    const alphaBounds = getRangeBounds(p.alpha);
    if (alphaBounds) {
      lp.alphaStart = alphaBounds.start;
      lp.alphaEnd = alphaBounds.end;
      lp.alphaEase = resolveEase(alphaBounds.ease);
      particle.alpha = alphaBounds.start;
    }

    this.particles.push(lp);
    this.emittedTotal++;
  }
}
