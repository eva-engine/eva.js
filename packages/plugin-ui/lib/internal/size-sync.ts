import type {
  ComponentDefinition,
  UiRenderSize,
  UiSizeSyncContext,
} from '../component-factory';

interface ReadTransformSizeOptions {
  allowZero?: boolean;
}

export function readTransformRenderSize(
  go: any,
  options: ReadTransformSizeOptions = {},
): UiRenderSize | null {
  const size = go?.transform?.size;
  if (!size) return null;
  const width = normalizeSizeValue(size.width, options.allowZero);
  const height = normalizeSizeValue(size.height, options.allowZero);
  if (width === undefined && height === undefined) return null;
  return { width, height };
}

export function hasExplicitRenderSize(component: Record<string, any> | undefined): boolean {
  if (!component) return false;
  const explicitFields = component.__evaExplicitFields;
  if (explicitFields && typeof explicitFields.has === 'function') {
    return explicitFields.has('width') || explicitFields.has('height');
  }
  return component.width !== undefined || component.height !== undefined;
}

export function applyTransformSizeToInstance(
  def: ComponentDefinition,
  instance: any,
  component: Record<string, any> | undefined,
  go: any,
  source: UiSizeSyncContext['source'],
): boolean {
  const size = readTransformRenderSize(go, { allowZero: source === 'transform-change' });
  if (!size) return false;
  const context: UiSizeSyncContext = {
    componentName: def.name,
    component,
    gameObject: go,
    source,
  };
  if (def.applySize) def.applySize(instance, size, component ?? {}, context);
  else applyRuntimeSize(instance, size);
  return true;
}

export function applyRuntimeSize(instance: any, size: UiRenderSize): void {
  if (!instance || !size) return;
  const width = normalizeSizeValue(size.width, true);
  const height = normalizeSizeValue(size.height, true);
  if (width === undefined && height === undefined) return;

  const nextWidth = width ?? getCurrentSize(instance, 'width');
  const nextHeight = height ?? getCurrentSize(instance, 'height');
  let applied = false;

  if (typeof instance.setSize === 'function' && nextWidth !== undefined && nextHeight !== undefined) {
    try {
      instance.setSize(nextWidth, nextHeight);
      applied = true;
    } catch (_) {
      applied = false;
    }
  }

  if (!applied) {
    if (width !== undefined) instance.width = width;
    if (height !== undefined) instance.height = height;
  }

  relayoutRuntimeInstance(instance);
}

export function applyListLayoutSize(instance: any, size: UiRenderSize): void {
  const width = normalizeSizeValue(size.width, true);
  const height = normalizeSizeValue(size.height, true);
  if (width !== undefined) {
    try { instance.maxWidth = width; } catch (_) {}
  }
  if (height !== undefined) {
    try { instance.maxHeight = height; } catch (_) {}
  }
  relayoutRuntimeInstance(instance);
}

export function relayoutRuntimeInstance(instance: any): void {
  try { instance?.list?.arrangeChildren?.(); } catch (_) {}
  try { instance?.arrangeChildren?.(); } catch (_) {}
  try { instance?.resize?.(true); } catch (_) {}
}

function normalizeSizeValue(value: unknown, allowZero = false): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (allowZero ? n < 0 : n <= 0) return undefined;
  return n;
}

function getCurrentSize(instance: any, key: 'width' | 'height'): number | undefined {
  const n = Number(instance?.[key]);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
