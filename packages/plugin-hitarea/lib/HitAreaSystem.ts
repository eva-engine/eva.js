import { System, decorators } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { HitArea } from './HitArea';
import type { HitShape } from './types';

interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
  shape: HitShape;
}

/**
 * HitAreaSystem:每帧扫描所有 HitArea,做层级过滤后两两测试相交。
 *
 * 算法说明:
 *   1. 收集所有 enabled 的 HitArea,计算世界坐标 AABB + center
 *   2. 用层级 mask 过滤后两两 test
 *   3. test 通过 → 维护 overlapping 集合 → emit enter / exit 信号
 *
 * 设计取舍:这是 broad-phase 直接 N²(N 通常 < 50,小游戏够用)。
 * 真要做关卡级数百实体,后续接 plugin-tick 的 group: physics + 接 quadtree。
 */
@decorators.componentObserver({ HitArea: ['enabled', 'layer', 'mask'] })
export class HitAreaSystem extends System {
  static systemName = 'HitArea';
  readonly name = 'HitArea';

  update() {
    const all = this.collect();
    const aabbs: AABB[] = all.map((c) => this.computeAABB(c));
    const N = all.length;
    for (let i = 0; i < N; i++) {
      const a = all[i];
      if (!a.enabled) continue;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const b = all[j];
        if (!b.enabled) continue;
        if (!this.layerMatch(a, b)) continue;
        const intersect = this.intersect(aabbs[i], aabbs[j]);
        const aWasOverlap = a._overlapping.has(b.gameObject.id);
        if (intersect && !aWasOverlap) {
          a._overlapping.add(b.gameObject.id);
          if (a.signalEnter) {
            getSignalBus().emit(a.signalEnter, {
              self: a,
              other: b,
              selfGo: a.gameObject,
              otherGo: b.gameObject,
            });
          }
          if (a.oneShot) a.enabled = false;
        } else if (!intersect && aWasOverlap) {
          a._overlapping.delete(b.gameObject.id);
          if (a.signalExit) {
            getSignalBus().emit(a.signalExit, {
              self: a,
              other: b,
              selfGo: a.gameObject,
              otherGo: b.gameObject,
            });
          }
        }
      }
    }
  }

  private collect(): HitArea[] {
    const result: HitArea[] = [];
    // componentObserver?.changed 在不同 eva.js 版本签名不同,此处一律走 fallback 全量扫
    // 兜底:从 game.gameObjects 全量扫
    const game: any = (this as any).game;
    if (!game) return result;
    const stack: any[] = [...(game.scene?.gameObjects ?? [])];
    while (stack.length) {
      const go = stack.pop();
      if (!go) continue;
      const comps: any[] = go.components || [];
      for (const c of comps) {
        if (c?.constructor?.componentName === HitArea.componentName) result.push(c as HitArea);
      }
      if (go.transform?.children?.length) {
        for (const child of go.transform.children) {
          stack.push(child.gameObject);
        }
      }
    }
    return result;
  }

  private computeAABB(c: HitArea): AABB {
    // 从 root 向上累加 transform 得到 world position(简化:直接用 transform.position)
    const t = c.gameObject.transform as any;
    const wx = t?.position?.x ?? 0;
    const wy = t?.position?.y ?? 0;
    const ox =
      (c.shape as any).offsetX ?? 0;
    const oy =
      (c.shape as any).offsetY ?? 0;
    const cx = wx + ox;
    const cy = wy + oy;
    if (c.shape.type === 'circle') {
      const r = c.shape.radius;
      return { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r, cx, cy, shape: c.shape };
    }
    if (c.shape.type === 'rect') {
      const hw = c.shape.width / 2;
      const hh = c.shape.height / 2;
      return { minX: cx - hw, minY: cy - hh, maxX: cx + hw, maxY: cy + hh, cx, cy, shape: c.shape };
    }
    // point
    return { minX: cx, minY: cy, maxX: cx, maxY: cy, cx, cy, shape: c.shape };
  }

  private layerMatch(a: HitArea, b: HitArea): boolean {
    // a 关心的对方层(a.mask)必须包含 b 的 layer 中至少一个
    if (a.mask.length === 0 && a.layer.length === 0) return true; // 兼容老 DSL,不配层就全配对
    for (const m of a.mask) {
      if (b.layer.includes(m)) return true;
    }
    return false;
  }

  private intersect(a: AABB, b: AABB): boolean {
    if (a.shape.type === 'circle' && b.shape.type === 'circle') {
      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const r = (a.shape.radius + b.shape.radius);
      return dx * dx + dy * dy <= r * r;
    }
    // AABB 兜底
    if (a.maxX < b.minX || a.minX > b.maxX) return false;
    if (a.maxY < b.minY || a.minY > b.maxY) return false;
    return true;
  }
}
