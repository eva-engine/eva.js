import type { Game, GameObject } from '@eva/eva.js';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { getEvaContainer } from './attach-helper';

/**
 * DSL 中 plugin-ui 组件用 ViewRef 引用视觉资源,而不是 Eva v2.0 的 *ChildName 模式。
 *
 * - { entityName: "background" }  — 引用同 GameObject 的子 entity 的 PIXI.Container,
 *   这个 child entity 必须先 ADD,然后我们把它的 Container "借走" 交给 @pixi/ui 实例。
 *   原 child entity 仍然存在(Transform/逻辑组件还在),只是 PIXI 显示对象被重新 parent。
 * - { shape: { type, style } } — 内联 shape,生成一个新的 PIXI.Graphics(临时,与 Shape 组件不同源)
 * - { texture: "loading.png" } — 从已加载的 Eva 资源池查 texture,生成 PIXI.Sprite
 * - { color: 0xRRGGBB, width, height }  — 生成纯色矩形 Graphics
 * - { fallback: <ViewRef> } — 当主 ref 解析失败时使用
 */

export type ViewRef =
  | { entityName: string; fallback?: ViewRef }
  | { shape: InlineShape; fallback?: ViewRef }
  | { ui: InlineShape; fallback?: ViewRef }
  | { texture: string; fallback?: ViewRef }
  | { color: number | string; width: number; height: number; radius?: number; fallback?: ViewRef };

export interface InlineShape {
  type: 'rect' | 'roundedRect' | 'circle' | 'ellipse';
  style: {
    width?: number;
    height?: number;
    radius?: number;
    fill?: number | string;
    stroke?: number | string;
    lineWidth?: number;
    alpha?: number;
  };
}

/**
 * 把 ViewRef 解析为 PIXI 显示对象 (Container | Sprite | Graphics)。
 *
 * @param game  Game 实例(用来反查 RendererSystem.containerManager / resource)
 * @param go    宿主 GameObject(entityName 类型 ViewRef 在它的子里查找)
 * @returns     PIXI 显示对象,失败返回 null
 */
export function resolveViewRef(game: Game | undefined, go: GameObject, ref: ViewRef | undefined): Container | null {
  if (!ref) return null;

  if ('entityName' in ref) {
    const child = findChildEntity(go, ref.entityName);
    if (child) {
      const childContainer = getEvaContainer(game, child);
      if (childContainer) {
        // 把子 entity 的 PIXI Container 从原父 detach,@pixi/ui 内部会 addChild 它
        try {
          if ((childContainer as any).parent) {
            (childContainer as any).parent.removeChild(childContainer);
          }
        } catch (_) {}
        return wrapBorrowedEntityView(childContainer, child.name);
      }
    }
    if (ref.fallback) return resolveViewRef(game, go, ref.fallback);
    return null;
  }

  if ('shape' in ref) {
    return drawInlineShape(ref.shape) ?? (ref.fallback ? resolveViewRef(game, go, ref.fallback) : null);
  }

  if ('ui' in ref) {
    return drawInlineShape(ref.ui) ?? (ref.fallback ? resolveViewRef(game, go, ref.fallback) : null);
  }

  if ('texture' in ref) {
    const tex = resolveTexture(game, ref.texture);
    if (tex) return new Sprite(tex);
    if (ref.fallback) return resolveViewRef(game, go, ref.fallback);
    return null;
  }

  if ('color' in ref) {
    try {
      const g = new Graphics();
      if (ref.radius && ref.radius > 0) {
        g.roundRect(0, 0, ref.width, ref.height, ref.radius);
      } else {
        g.rect(0, 0, ref.width, ref.height);
      }
      g.fill(ref.color as any);
      return g;
    } catch (e) {
      console.error('[view-resolver] color view create failed', e);
      return null;
    }
  }

  return null;
}

function wrapBorrowedEntityView(childContainer: Container, childName?: string): Container {
  const wrapper = new Container();
  (wrapper as any).label = childName ? `${childName}:view-ref` : 'plugin-ui-view-ref';
  wrapper.addChild(childContainer);
  return wrapper;
}

/** 把 ViewRef 解析为已存在的 Texture(用于 ProgressBar/Slider/Input 的 nineSlice 路径) */
export function resolveTexture(game: Game | undefined, key: string): Texture | null {
  // 1) Eva resource pool
  const resourceModule: any = (game as any)?.resource ?? null;
  if (resourceModule?.instances?.[key]) {
    const inst = resourceModule.instances[key];
    if (inst instanceof Texture) return inst;
    if (inst?.image instanceof Texture) return inst.image;
  }
  // 2) global asset cache (Texture.from)
  try {
    return Texture.from(key) ?? null;
  } catch (_) {
    return null;
  }
}

function drawInlineShape(shape: InlineShape): Graphics | null {
  if (!shape || !shape.type) return null;
  const g = new Graphics();
  const { style } = shape;
  const w = style.width ?? 0;
  const h = style.height ?? 0;
  const r = style.radius ?? 0;
  switch (shape.type) {
    case 'rect':
      g.rect(0, 0, w, h);
      break;
    case 'roundedRect':
      g.roundRect(0, 0, w, h, r);
      break;
    case 'circle':
      g.circle(r, r, r);
      break;
    case 'ellipse':
      g.ellipse(w / 2, h / 2, w / 2, h / 2);
      break;
  }
  if (style.fill !== undefined) g.fill(style.fill as any);
  if (style.stroke !== undefined && style.lineWidth !== undefined) {
    g.stroke({ color: style.stroke as any, width: style.lineWidth });
  } else if (style.stroke !== undefined) {
    g.stroke({ color: style.stroke as any, width: 1 });
  }
  if (style.alpha !== undefined) g.alpha = style.alpha;
  try {
    Object.defineProperty(g, 'clone', {
      value: () => drawInlineShape(shape) ?? new Graphics(),
      configurable: true,
    });
  } catch (_) {}
  return g;
}

/**
 * 在 GameObject 的 transform.children 中查找指定名字的子 entity。
 * 不递归 — plugin-ui 的视觉子项语义只允许直接子节点。
 */
export function findChildEntity(go: GameObject, name: string): GameObject | null {
  if (typeof (go as any).findChildByName === 'function') {
    try {
      const c = (go as any).findChildByName(name);
      if (c) return c;
    } catch (_) {}
  }
  const children = (go as any).transform?.children ?? [];
  for (const tf of children) {
    if (tf?.gameObject?.name === name) return tf.gameObject;
  }
  return null;
}
