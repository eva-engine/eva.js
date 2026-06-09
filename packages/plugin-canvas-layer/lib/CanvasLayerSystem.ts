import { System, decorators } from '@eva/eva.js';
import { CanvasLayer } from './CanvasLayer';

/**
 * CanvasLayerSystem — 在 update 中保证子实体按 zIndex 排序。
 *
 * 当前实现是兜底:每帧扫所有挂 CanvasLayer 的实体,把其父 transform 的 children 按 zIndex 稳定排序。
 * 真正生产级方案应该接 PixiJS 的 sortableChildren/zIndex,这里先保证语义一致。
 */
@decorators.componentObserver({ CanvasLayer: ['zIndex'] })
export class CanvasLayerSystem extends System {
  static systemName = 'CanvasLayer';
  readonly name = 'CanvasLayer';

  update() {
    const game: any = (this as any).game;
    if (!game) return;
    const dirtyParents = new Set<any>();
    const stack: any[] = [...(game.scene?.gameObjects ?? [])];
    while (stack.length) {
      const go = stack.pop();
      if (!go) continue;
      const comps: any[] = go.components || [];
      for (const c of comps) {
        if (c?.constructor?.componentName === CanvasLayer.componentName) {
          const parent = go.transform?.parent;
          if (parent) dirtyParents.add(parent);
        }
      }
      if (go.transform?.children?.length) {
        for (const ch of go.transform.children) stack.push(ch.gameObject);
      }
    }
    for (const p of dirtyParents) {
      if (!Array.isArray(p.children)) continue;
      p.children.sort((a: any, b: any) => {
        const za = a._canvasLayerZ ?? a.zIndex ?? 0;
        const zb = b._canvasLayerZ ?? b.zIndex ?? 0;
        return za - zb;
      });
    }
  }
}
