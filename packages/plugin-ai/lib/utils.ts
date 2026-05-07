import type { GameObject } from '@eva/eva.js';

const COMPONENT_TYPES = [
  'Img',
  'Text',
  'BitmapText',
  'HTMLText',
  'Sprite',
  'SpriteAnimation',
  'Spine',
  'Lottie',
  'Graphics',
  'NinePatch',
  'TilingSprite',
  'PerspectiveMesh',
  'DragonBone',
];

export function detectComponentType(gameObject: GameObject): string {
  for (const type of COMPONENT_TYPES) {
    if (gameObject.getComponent(type)) {
      return type;
    }
  }
  return 'Container';
}

export function generateDescription(gameObject: GameObject, type: string): string {
  const name = gameObject.name || `GameObject_${gameObject.id}`;
  return `${type}: ${name}`;
}

/**
 * Extract rendering-related properties from the primary visual component of a GameObject.
 * Returns a key-value map suitable for data-* attributes.
 */
export function extractRenderInfo(gameObject: GameObject, container?: any): Record<string, string> {
  const info: Record<string, string> = {};

  // --- Text content ---
  const text = gameObject.getComponent('Text') as any;
  if (text) {
    info.text = text.text || '';
    if (text.style) {
      if (text.style.fontSize) info['font-size'] = String(text.style.fontSize);
      if (text.style.fill) info['color'] = String(text.style.fill);
      if (text.style.fontFamily) info['font-family'] = String(text.style.fontFamily);
      if (text.style.fontWeight) info['font-weight'] = String(text.style.fontWeight);
      if (text.style.align) info['text-align'] = String(text.style.align);
    }
    return info;
  }

  const bitmapText = gameObject.getComponent('BitmapText') as any;
  if (bitmapText) {
    info.text = bitmapText.text || '';
    if (bitmapText.style) {
      if (bitmapText.style.fontSize) info['font-size'] = String(bitmapText.style.fontSize);
      if (bitmapText.style.fill) info['color'] = String(bitmapText.style.fill);
    }
    return info;
  }

  const htmlText = gameObject.getComponent('HTMLText') as any;
  if (htmlText) {
    info.text = htmlText.text || '';
    return info;
  }

  // --- Image ---
  const img = gameObject.getComponent('Img') as any;
  if (img) {
    info.resource = img.resource || '';
    return info;
  }

  // --- Sprite ---
  const sprite = gameObject.getComponent('Sprite') as any;
  if (sprite) {
    info.resource = sprite.resource || '';
    if (sprite.spriteName) info['sprite-name'] = sprite.spriteName;
    return info;
  }

  // --- SpriteAnimation ---
  const spriteAnim = gameObject.getComponent('SpriteAnimation') as any;
  if (spriteAnim) {
    info.resource = spriteAnim.resource || '';
    info.speed = String(spriteAnim.speed);
    info.playing = String(spriteAnim.autoPlay);
    return info;
  }

  // --- Spine ---
  const spine = gameObject.getComponent('Spine') as any;
  if (spine) {
    info.resource = spine.resource || '';
    info.animation = spine.animationName || '';
    return info;
  }

  // --- Lottie ---
  const lottie = gameObject.getComponent('Lottie') as any;
  if (lottie) {
    info.resource = lottie.options?.resource || '';
    return info;
  }

  // --- Graphics ---
  const graphics = gameObject.getComponent('Graphics') as any;
  if (graphics && graphics.graphics) {
    const g = graphics.graphics;
    // Try multiple paths to find fill color in PixiJS Graphics
    const color = extractGraphicsColor(g, container);
    if (color) {
      info['fill-color'] = color;
    }
    return info;
  }

  // --- NinePatch ---
  const ninePatch = gameObject.getComponent('NinePatch') as any;
  if (ninePatch) {
    info.resource = ninePatch.resource || '';
    if (ninePatch.spriteName) info['sprite-name'] = ninePatch.spriteName;
    return info;
  }

  // --- TilingSprite ---
  const tiling = gameObject.getComponent('TilingSprite') as any;
  if (tiling) {
    info.resource = tiling.resource || '';
    return info;
  }

  // --- PerspectiveMesh ---
  const mesh = gameObject.getComponent('PerspectiveMesh') as any;
  if (mesh) {
    info.resource = mesh.resource || '';
    return info;
  }

  return info;
}

/**
 * Extract visibility/render state from the Render component.
 */
export function extractVisibility(gameObject: GameObject): Record<string, string> {
  const info: Record<string, string> = {};
  const render = gameObject.getComponent('Render') as any;
  if (render) {
    if (render.alpha !== undefined && render.alpha !== 1) {
      info.alpha = String(render.alpha);
    }
    if (render.visible !== undefined && !render.visible) {
      info.visible = 'false';
    }
    if (render.zIndex !== undefined && render.zIndex !== 0) {
      info['z-index'] = String(render.zIndex);
    }
  }
  return info;
}

/**
 * Check if the GameObject has an Event component (interactive).
 */
export function isInteractive(gameObject: GameObject): boolean {
  return !!gameObject.getComponent('Event');
}

function extractGraphicsColor(g: any, container?: any): string | null {
  // PixiJS v8: context._instructions with fill action
  const instructions = g.context?._instructions;
  if (instructions) {
    for (const inst of instructions) {
      if (inst.action === 'fill' && inst.data?.style?.color != null) {
        return colorToHex(inst.data.style.color);
      }
    }
  }
  // PixiJS v8: check _context.instructions
  const ctx = g._context;
  if (ctx?.instructions) {
    for (const inst of ctx.instructions) {
      if (inst.action === 'fill' && inst.data?.style?.color != null) {
        return colorToHex(inst.data.style.color);
      }
    }
  }
  // PixiJS v7: _fillStyle
  if (g._fillStyle?.color != null) {
    return colorToHex(g._fillStyle.color);
  }
  // Try reading from container's child graphics (the actual pixi Graphics on stage)
  if (container?.children) {
    for (const child of container.children) {
      if (child.context?._instructions) {
        for (const inst of child.context._instructions) {
          if (inst.action === 'fill' && inst.data?.style?.color != null) {
            return colorToHex(inst.data.style.color);
          }
        }
      }
    }
  }
  return null;
}

function colorToHex(color: any): string {
  if (typeof color === 'string') return color;
  if (typeof color === 'number') {
    return '#' + color.toString(16).padStart(6, '0');
  }
  return String(color);
}
