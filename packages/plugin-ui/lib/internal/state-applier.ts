/**
 * State applier — 把 Eva ECS Component 的字段 diff 翻译成 @pixi/ui 实例的 setter 调用,
 * 实现 Editor Inspector 的 hot-sync 契约 (RuntimeEditableComponent.applyDeclarativeProps)。
 *
 * @pixi/ui 类的字段访问模式很统一:
 *   instance.value = ...            // Slider/Stepper
 *   instance.checked = ...           // CheckBox
 *   instance.progress = ...          // ProgressBar / CircularProgressBar
 *   instance.enabled = ...           // FancyButton / Button
 *   instance.text = ...              // FancyButton / CheckBox / Input
 *
 * 我们把 Eva Component 字段的"props 子集" → @pixi/ui setter 的映射统一在这,
 * 子组件 wrapper 调 applyFields(instance, fields, mapping) 即可。
 */

export type FieldMapping<T = unknown> =
  | string                       // 同名字段直传:'value' -> instance.value = value
  | { setter: string; transform?: (v: T) => unknown }  // 不同名 / 需要 transform
  | { method: string; args?: (v: T) => unknown[] };   // 调方法而非 setter

/**
 * 把 props 对象按 mapping 应用到 @pixi/ui 实例。
 * - undefined 字段会被跳过(不覆盖 @pixi/ui 实例的默认值)
 * - 设值前会比较旧值,相同则跳过(避免 @pixi/ui 内部重渲染抖动)
 */
export function applyFields(
  instance: any,
  props: Record<string, unknown>,
  mapping: Record<string, FieldMapping>,
): void {
  if (!instance) return;
  for (const [propKey, m] of Object.entries(mapping)) {
    const value = props[propKey];
    if (value === undefined) continue;
    try {
      if (typeof m === 'string') {
        if (instance[m] !== value) instance[m] = value;
      } else if ('setter' in m) {
        const next = m.transform ? m.transform(value as any) : value;
        if (instance[m.setter] !== next) instance[m.setter] = next;
      } else if ('method' in m) {
        const args = m.args ? m.args(value as any) : [value];
        if (typeof instance[m.method] === 'function') {
          instance[m.method](...args);
        }
      }
    } catch (_) {
      // 静默失败 — Inspector 调试时的非致命字段错误不应中断 hot-sync
    }
  }
}

/**
 * 0~100 范围归一化为 0~1。@pixi/ui Slider/ProgressBar 的 progress 属性范围是 0~100。
 * Eva ProgressBar 旧 API 是 [valueRange.min, valueRange.max] -> value 任意刻度。
 */
export function normalizeProgress(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, value));
  return ((clamped - min) / (max - min)) * 100;
}
