/**
 * Generic ECS wrapper factory for @pixi/ui components.
 *
 * 设计目标:每个 @pixi/ui 类的 ECS wrapper 只需声明一份 metadata(字段定义 + view ref keys
 * + options builder + signal map + change syncer),不再写 class 样板。
 *
 * 不能塌缩进 metadata 的特殊行为(由 ComponentDefinition 上的 hook 字段表达):
 *   - postCreate: 初始 prop sync(enabled / selectedTint 等)
 *   - onAttachedExtra: ADD 完成后跑(Dialog 挂 contentChild、MaskedFrame 挂 borderView)
 *   - syncOnChange:    CHANGE 时把 wrapper 字段写回 @pixi/ui 实例
 *   - mixin:           额外 instance method(ProgressBar.getProgressPct)
 *
 * RadioGroup 因跨实体协调 + queueMicrotask 时序耦合,**不走** factory,保留独立 class。
 */

import { Component } from '@eva/eva.js';
import type { Container } from 'pixi.js';
import type { ViewRef } from './internal/view-resolver';
import { resolveViewRef } from './internal/view-resolver';

// ============================================================
// Field definitions(metadata 描述 wrapper 字段语义)
// ============================================================

export type FieldKind =
  | 'scalar'        // 单值原子赋值(string/number/boolean/enum)
  | 'shallowMerge'  // { ...this.x, ...p.x }(views/offset/textOffset/style 等)
  | 'arrayCopy'     // .slice() 复制(switcher views / select items)
  | 'tuple'         // 长度校验(valueRange [2]、padding [4])
  | 'opaque';       // 任意复杂值,直接 = (用于 nineSliceSprite 等)

export interface FieldSpec {
  kind: FieldKind;
  /** tuple 长度 / 默认值 */
  tupleLength?: number;
  /** Inspector metadata 字段定义,用于生成 getInspectorMetadata */
  inspector?: InspectorChild;
  /** 默认值(field initial state) */
  default?: unknown;
}

export interface InspectorChild {
  name: string;
  type: string;
  isArray?: boolean;
  isFolder?: boolean;
  step?: number;
  children?: InspectorChild[];
}

// ============================================================
// View ref schema(declarative)
// ============================================================

export type ViewSchema =
  | { kind: 'single'; key: string; required: boolean }
  | { kind: 'object'; folder: string; keys: { name: string; required: boolean }[] }
  | { kind: 'array'; key: string; minLength: number };

// ============================================================
// Component definition
// ============================================================

export interface ResolvedViews {
  /** single key -> Container | null */
  single?: Container | null;
  /** object folder -> { [key]: Container | null } */
  object?: Record<string, Container | null>;
  /** array key -> Container[] */
  array?: Container[];
}

export interface ComponentDefinition<TParams = any, TInstance = any> {
  /** Eva ECS component name(必须与 PIXI class import 名 / DSL type 字符串一致) */
  name: string;
  /** signal-bridge prefix(通常 = name.toLowerCase()) */
  signalPrefix: string;
  /** @pixi/ui 类构造器(或自定义构造函数) */
  pixiClass: new (...args: any[]) => TInstance;
  /** 字段表 - field name -> spec */
  fields: Record<string, FieldSpec>;
  /** view ref schema */
  views?: ViewSchema;
  /** 由字段值 + 解析后 views 生成 PIXI 实例构造参数(options 对象 | 位置参数数组) */
  optionsBuilder: (
    component: TParams & Record<string, any>,
    views: ResolvedViews,
  ) => unknown[] | unknown;
  /** 是否用位置参数构造(@pixi/ui Switcher),默认 false 走 options 对象 */
  positional?: boolean;
  /** 创建后立即同步的 prop(enabled / initial state)*/
  postCreate?: (instance: TInstance, component: TParams & Record<string, any>) => void;
  /** Signal -> 写回 component 字段的桥接 map(供 bridgeSignals) */
  signalMap?: (
    component: TParams & Record<string, any>,
  ) => Record<string, true | ((...args: any[]) => Record<string, any>)>;
  /** CHANGE 事件触发,把字段写回 PIXI 实例 */
  syncOnChange?: (instance: TInstance, component: TParams & Record<string, any>) => void;
  /** Transform.size -> @pixi/ui 实例尺寸同步。未提供时由 UISystem 使用通用 setSize/width/height 策略。 */
  applySize?: (
    instance: TInstance,
    size: UiRenderSize,
    component: TParams & Record<string, any>,
    context: UiSizeSyncContext,
  ) => void;
  /** ADD 完成后跑(Dialog 挂 content / MaskedFrame 挂 border)*/
  onAttachedExtra?: (
    instance: TInstance,
    component: TParams & Record<string, any>,
    go: any,
    game: any,
  ) => void;
  /** 实例方法 mixin(注入到 wrapper class.prototype) */
  mixin?: Record<string, Function>;
}

export interface UiRenderSize {
  width?: number;
  height?: number;
}

export interface UiSizeSyncContext {
  componentName: string;
  component?: Record<string, any>;
  gameObject?: any;
  source: 'initial-transform' | 'transform-change' | 'component-change';
}

// ============================================================
// Generated wrapper base class
// ============================================================

/**
 * 由 defineUiComponent 创建的 wrapper class 基础形状。
 * 所有由 factory 生成的 class 共享下面这套 init / applyDeclarativeProps / getInspectorMetadata
 * / 内部状态计数器逻辑。
 */
export class PixiUiComponent<TParams = any> extends Component<TParams> {
  /** runtime 计数,供 spec / debug 验证(toggleCount / pressCount / hoverCount / ...)*/
  toggleCount = 0;
  pressCount = 0;
  downCount = 0;
  upCount = 0;
  hoverCount = 0;
  outCount = 0;
  upOutCount = 0;
  changeCount = 0;
  updateCount = 0;
  selectCount = 0;
  lastSignal = 'idle';
  visualState = 'default';
  /** Input 私有 focused */
  focused = false;
  /** DSL/constructor 中显式传入过的字段,用于区分 metadata default 与用户配置。 */
  __evaExplicitFields = new Set<string>();
  /** 由 factory 通过 metadata 注入的动态字段(views / value / checked / ...)*/
  [key: string]: any;

  override init(p?: TParams) {
    if (p) this.applyParams(p as any);
  }

  applyDeclarativeProps(next: TParams, _prev?: TParams): void {
    this.applyParams(next as any);
  }

  /** 通用字段 apply 循环:按 fieldSpec 走对应分支 */
  protected applyParams(p: Record<string, any>): void {
    const def = (this.constructor as any).__def as ComponentDefinition;
    if (!def) return;
    for (const [name, spec] of Object.entries(def.fields)) {
      if (!(name in p)) continue;
      const v = (p as any)[name];
      if (v === undefined) continue;
      this.__evaExplicitFields.add(name);
      switch (spec.kind) {
        case 'scalar':
          (this as any)[name] = v;
          break;
        case 'shallowMerge':
          (this as any)[name] = { ...(this as any)[name], ...v };
          break;
        case 'arrayCopy':
          if (Array.isArray(v)) (this as any)[name] = v.slice();
          break;
        case 'tuple':
          if (Array.isArray(v) && (!spec.tupleLength || v.length === spec.tupleLength)) {
            (this as any)[name] = v.slice();
          }
          break;
        case 'opaque':
          (this as any)[name] = v;
          break;
      }
    }
  }
}

// ============================================================
// Factory
// ============================================================

export type UiComponentClass<TParams = any> = new () => PixiUiComponent<TParams>;

export function defineUiComponent<TParams = any, TInstance = any>(
  def: ComponentDefinition<TParams, TInstance>,
): UiComponentClass<TParams> {
  const factoryName = def.name;

  // 用 anonymous class + 静态 cast 绕过 TS2417(static __def 类型与 base 不严格匹配)
  class Generated extends PixiUiComponent<TParams> {
    componentName?: string = factoryName;

    constructor(params?: TParams) {
      super(params);
      // 所有 field 都必须在实例上预声明(即使是 undefined),否则 Eva
      // componentObserver 的 `(key in obj)` 检查会失败,导致 prop 不被监听。
      for (const [name, spec] of Object.entries(def.fields)) {
        if (spec.default !== undefined) {
          (this as any)[name] = cloneDefault(spec.default);
        } else if (!(name in this)) {
          (this as any)[name] = undefined;
        }
      }
    }

    static override getInspectorMetadata(): any {
      return buildInspectorMetadata(def);
    }
  }

  // 必要 cast,因为 TypeScript 不支持\"派生类窄化 static 字段类型\"
  const Cls = Generated as unknown as UiComponentClass<TParams> & {
    componentName: string;
    __def: ComponentDefinition;
  };
  (Cls as any).componentName = factoryName;
  (Cls as any).__def = def;

  // class.name(jest snapshot / Inspector 反射用)
  try { Object.defineProperty(Cls, 'name', { value: factoryName }); } catch (_) {}

  // mixin 注入 prototype(ProgressBar.getProgressPct 等)
  if (def.mixin) {
    for (const [k, fn] of Object.entries(def.mixin)) {
      (Generated.prototype as any)[k] = fn;
    }
  }

  return Cls;
}

function cloneDefault(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.slice();
  return { ...(v as object) };
}

function buildInspectorMetadata(def: ComponentDefinition): InspectorChild {
  const children: InspectorChild[] = [];
  for (const [name, spec] of Object.entries(def.fields)) {
    if (spec.inspector) {
      children.push({ ...spec.inspector, name: spec.inspector.name || name });
    }
  }
  return {
    name: def.name,
    type: 'object',
    isArray: false,
    isFolder: true,
    children,
  };
}

// ============================================================
// View resolution helper(by ViewSchema)
// ============================================================

export function resolveViewsBySchema(
  game: any,
  go: any,
  component: Record<string, any>,
  schema: ViewSchema | undefined,
): ResolvedViews | null {
  if (!schema) return {};
  switch (schema.kind) {
    case 'single': {
      const ref = component[schema.key] as ViewRef | undefined;
      const v = resolveViewRef(game, go, ref);
      if (schema.required && !v) return null;
      return { single: v };
    }
    case 'object': {
      const folder = (component[schema.folder] as Record<string, ViewRef | undefined>) ?? {};
      const out: Record<string, Container | null> = {};
      for (const { name, required } of schema.keys) {
        const v = resolveViewRef(game, go, folder[name]);
        if (required && !v) return null;
        out[name] = v;
      }
      return { object: out };
    }
    case 'array': {
      const refs = (component[schema.key] as ViewRef[] | undefined) ?? [];
      const out = refs.map((r) => resolveViewRef(game, go, r)).filter(Boolean) as Container[];
      if (out.length < schema.minLength) return null;
      return { array: out };
    }
  }
}
