/**
 * @pixi/ui v2.x 包装层 — 14 个 ECS Component 由 metadata 驱动生成。
 *
 * 替代旧的 14 份 lib/components/*.ts 样板文件。新增组件 = 在本文件加一份 metadata,无需新文件。
 *
 * RadioGroup 因跨实体协调(收集子 CheckBox 实例 + queueMicrotask)无法 metadata 化,
 * 保留在 ./radio-group.ts 单独维护。
 */

import {
  // 注意:@pixi/ui 的 Button 不继承 Container,无法直接挂到 PIXI stage。
  // 我们用 ButtonContainer(同样事件 API + 继承 Container)作为 Button wrapper 的 PIXI 实例。
  ButtonContainer as PixiButton,
  FancyButton as PixiFancyButton,
  CheckBox as PixiCheckBox,
  Switcher as PixiSwitcher,
  Slider as PixiSlider,
  DoubleSlider as PixiDoubleSlider,
  ProgressBar as PixiProgressBar,
  CircularProgressBar as PixiCircularProgressBar,
  Input as PixiInput,
  List as PixiList,
  ScrollBox as PixiScrollBox,
  Select as PixiSelect,
  Dialog as PixiDialog,
  MaskedFrame as PixiMaskedFrame,
} from '@pixi/ui';
import { Container as PixiContainer } from 'pixi.js';
import {
  defineUiComponent,
  type ComponentDefinition,
  type FieldSpec,
  type UiComponentClass,
} from './component-factory';
import type { ViewRef } from './internal/view-resolver';

// ============================================================
// Common helpers
// ============================================================

/** 绝大多数 wrapper 共享 enabled / bindToStore 字段。 */
const ENABLED: FieldSpec = { kind: 'scalar', default: true, inspector: { name: 'enabled', type: 'boolean' } };
const BIND_STORE: FieldSpec = { kind: 'scalar', inspector: { name: 'bindToStore', type: 'string' } };

/** 用 mixin 把 getProgressPct 注入 ProgressBar / CircularProgressBar */
function getProgressPctMixin(this: { value: number; valueRange: [number, number] }): number {
  const [min, max] = this.valueRange;
  if (max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, this.value));
  return ((clamped - min) / (max - min)) * 100;
}

/** Dialog backdropColor 字符串 → 数字转换 */
function backdropColorToNumber(c: number | string | undefined): number | undefined {
  if (c === undefined) return undefined;
  if (typeof c === 'string') return parseInt(c.replace('#', ''), 16);
  return c;
}

// ============================================================
// Type re-exports(wrapper Params 类型 — 历史 spec 引用,不能丢)
// ============================================================

// FancyButton states / view refs
export type FancyButtonState = 'default' | 'hover' | 'pressed' | 'disabled' | 'selected';
export interface FancyButtonViewRefs {
  default?: ViewRef; hover?: ViewRef; pressed?: ViewRef; disabled?: ViewRef;
}
export type FancyButtonOffset = {
  x?: number; y?: number;
  default?: { x?: number; y?: number };
  hover?: { x?: number; y?: number };
  pressed?: { x?: number; y?: number };
  disabled?: { x?: number; y?: number };
};
export interface FancyButtonParams {
  enabled?: boolean; state?: FancyButtonState; selected?: boolean; text?: string;
  views?: FancyButtonViewRefs; offset?: FancyButtonOffset; textOffset?: FancyButtonOffset;
  padding?: number; nineSliceSprite?: [number, number, number, number]; selectedTint?: string;
}

export interface ButtonParams { enabled?: boolean; view?: ViewRef; }

export interface CheckBoxStateStyle { alpha?: number; scale?: number; }
export interface CheckBoxParams {
  enabled?: boolean; checked?: boolean; text?: string; bindToStore?: string;
  views?: { checked?: ViewRef; unchecked?: ViewRef };
  disabledStyle?: CheckBoxStateStyle;
}

export type SwitcherTriggerEvent = 'onPress' | 'onDown' | 'onUp' | 'onHover' | 'onOut';
export interface SwitcherParams { active?: number; views?: ViewRef[]; triggerEvent?: SwitcherTriggerEvent; bindToStore?: string; }

export type SliderOrientation = 'horizontal' | 'vertical';
export interface SliderParams {
  enabled?: boolean; value?: number; min?: number; max?: number; step?: number;
  orientation?: SliderOrientation; showValue?: boolean;
  views?: { bg?: ViewRef; fill?: ViewRef; thumb?: ViewRef };
  bindToStore?: string;
}

export interface DoubleSliderParams {
  enabled?: boolean; value1?: number; value2?: number; min?: number; max?: number; step?: number; showValue?: boolean;
  views?: { bg?: ViewRef; fill?: ViewRef; slider1?: ViewRef; slider2?: ViewRef };
  bindToStore1?: string; bindToStore2?: string;
}

export interface ProgressBarFillPaddings { top?: number; right?: number; bottom?: number; left?: number; }
export interface ProgressBarParams {
  value?: number; valueRange?: [number, number]; bgView?: ViewRef; fillView?: ViewRef;
  nineSliceSprite?: { bg?: [number, number, number, number]; fill?: [number, number, number, number] };
  fillPaddings?: ProgressBarFillPaddings; bindToStore?: string;
}

export interface CircularProgressBarParams {
  value?: number; valueRange?: [number, number];
  radius?: number; lineWidth?: number; startAngle?: number;
  backgroundColor?: number | string; fillColor?: number | string;
  backgroundAlpha?: number; fillAlpha?: number; bindToStore?: string;
}

export interface InputStyle { fontFamily?: string; fontSize?: number; fill?: string | number; align?: 'left' | 'center' | 'right'; }
export interface InputParams {
  enabled?: boolean; value?: string; placeholder?: string; maxLength?: number; secure?: boolean;
  align?: 'left' | 'center' | 'right'; padding?: [number, number, number, number];
  textStyle?: InputStyle; bgView?: ViewRef;
  nineSliceSprite?: [number, number, number, number]; cleanOnFocus?: boolean; addMask?: boolean; bindToStore?: string;
}

export type ListType = 'horizontal' | 'vertical' | 'bidirectional';
export interface ListParams {
  type?: ListType; elementsMargin?: number; padding?: number;
  vertPadding?: number; horPadding?: number; topPadding?: number; bottomPadding?: number;
  leftPadding?: number; rightPadding?: number; maxWidth?: number; maxHeight?: number;
  itemsChildName?: string;
}

export type ScrollDirection = 'horizontal' | 'vertical' | 'both';
export interface ScrollBoxParams {
  width?: number; height?: number; direction?: ScrollDirection; contentChildName?: string;
  background?: number | string; radius?: number; elementsMargin?: number;
  disableDynamicRendering?: boolean; disableEasing?: boolean; padding?: number;
  inertia?: boolean; inertiaDecay?: number; bounceFactor?: number;
}

export interface SelectItem { text: string; id?: string; }
export interface SelectParams {
  items?: SelectItem[]; selectedIndex?: number; placeholder?: string;
  closedView?: ViewRef; openView?: ViewRef;
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number };
  nineSliceSprite?: [number, number, number, number]; bindToStore?: string;
}

export interface DialogParams {
  open?: boolean; title?: string; width?: number; height?: number; padding?: number;
  backdropColor?: number | string; backdropAlpha?: number;
  backdropView?: ViewRef; backgroundView?: ViewRef;
  closeOnBackdropClick?: boolean; contentChildName?: string;
  nineSliceSprite?: [number, number, number, number]; bindToStore?: string;
}

export interface MaskedFrameParams {
  targetView?: ViewRef; maskView?: ViewRef; borderView?: ViewRef;
}

// ============================================================
// 14 个 component definitions
// ============================================================

const BUTTON_DEF: ComponentDefinition<ButtonParams> = {
  name: 'Button',
  signalPrefix: 'button',
  pixiClass: PixiButton,
  fields: {
    enabled: ENABLED,
    view: { kind: 'opaque', inspector: { name: 'view', type: 'object' } },
  },
  views: { kind: 'single', key: 'view', required: true },
  // PixiButton 构造是位置参数: new PixiButton(view)
  positional: true,
  optionsBuilder: (_c, v) => [v.single],
  postCreate: (inst: any, c: any) => { inst.enabled = c.enabled; },
  signalMap: (c: any) => ({
    press: () => { c.pressCount += 1; return {}; },
    down: true, up: true, hover: true,
  }),
  syncOnChange: (inst: any, c: any) => { inst.enabled = c.enabled; },
};

const FANCY_BUTTON_DEF: ComponentDefinition<FancyButtonParams> = {
  name: 'FancyButton',
  signalPrefix: 'fancybutton',
  pixiClass: PixiFancyButton,
  fields: {
    enabled: ENABLED,
    state: { kind: 'scalar', default: 'default', inspector: { name: 'state', type: 'string' } },
    selected: { kind: 'scalar', default: false, inspector: { name: 'selected', type: 'boolean' } },
    text: { kind: 'scalar', inspector: { name: 'text', type: 'string' } },
    padding: { kind: 'scalar', inspector: { name: 'padding', type: 'number' } },
    selectedTint: { kind: 'scalar', default: '#FFD680', inspector: { name: 'selectedTint', type: 'color' } },
    views: { kind: 'shallowMerge', default: {}, inspector: { name: 'views', type: 'object', isFolder: true, children: [
      { name: 'default', type: 'object' }, { name: 'hover', type: 'object' },
      { name: 'pressed', type: 'object' }, { name: 'disabled', type: 'object' },
    ] } },
    offset: { kind: 'shallowMerge', default: {} },
    textOffset: { kind: 'shallowMerge', default: {} },
    nineSliceSprite: { kind: 'opaque' },
  },
  views: {
    kind: 'object', folder: 'views',
    keys: [
      { name: 'default', required: false },
      { name: 'hover', required: false },
      { name: 'pressed', required: false },
      { name: 'disabled', required: false },
    ],
  },
  optionsBuilder: (c, v) => {
    // FancyButton 内部 updateView 不接受 null;只把已 resolve 的 view 字段传过去
    const opts: any = {
      text: c.text, padding: c.padding,
      offset: c.offset, textOffset: c.textOffset,
      nineSliceSprite: c.nineSliceSprite,
    };
    if (v.object?.default) opts.defaultView = v.object.default;
    if (v.object?.hover) opts.hoverView = v.object.hover;
    if (v.object?.pressed) opts.pressedView = v.object.pressed;
    if (v.object?.disabled) opts.disabledView = v.object.disabled;
    return opts;
  },
  postCreate: (inst: any, c: any) => {
    inst.enabled = c.enabled;
    if (c.selected) applySelectedTint(inst, c);
  },
  signalMap: (c: any) => ({
    press: () => { c.pressCount += 1; return {}; },
    hover: () => { c.hoverCount += 1; return {}; },
    down: true, up: true,
  }),
  syncOnChange: (inst: any, c: any) => {
    inst.enabled = c.enabled;
    if (c.text !== undefined && inst.text !== c.text) inst.text = c.text;
    if (c.padding !== undefined && inst.padding !== c.padding) inst.padding = c.padding;
    applySelectedTint(inst, c);
  },
};
function applySelectedTint(inst: any, c: any): void {
  try {
    const dv: any = inst.defaultView;
    if (dv && 'tint' in dv) dv.tint = c.selected ? c.selectedTint : 0xFFFFFF;
  } catch (_) {}
}

const CHECKBOX_DEF: ComponentDefinition<CheckBoxParams> = {
  name: 'CheckBox',
  signalPrefix: 'checkbox',
  pixiClass: PixiCheckBox,
  fields: {
    enabled: ENABLED,
    checked: { kind: 'scalar', default: false, inspector: { name: 'checked', type: 'boolean' } },
    text: { kind: 'scalar', inspector: { name: 'text', type: 'string' } },
    bindToStore: BIND_STORE,
    views: { kind: 'shallowMerge', default: {}, inspector: { name: 'views', type: 'object', isFolder: true, children: [
      { name: 'checked', type: 'object' }, { name: 'unchecked', type: 'object' },
    ] } },
    disabledStyle: { kind: 'shallowMerge', default: { alpha: 0.4, scale: 1 } },
  },
  views: {
    kind: 'object', folder: 'views',
    keys: [
      { name: 'checked', required: true },
      { name: 'unchecked', required: true },
    ],
  },
  optionsBuilder: (c, v) => ({
    style: { checked: v.object!.checked, unchecked: v.object!.unchecked },
    text: c.text, checked: c.checked,
  }),
  signalMap: (c: any) => ({
    check: (state: boolean) => { c.checked = state; c.toggleCount += 1; return { value: state }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.checked !== c.checked) inst.checked = c.checked;
  },
};

const SWITCHER_DEF: ComponentDefinition<SwitcherParams> = {
  name: 'Switcher',
  signalPrefix: 'switcher',
  pixiClass: PixiSwitcher,
  fields: {
    active: { kind: 'scalar', default: 0, inspector: { name: 'active', type: 'number' } },
    views: { kind: 'arrayCopy', default: [] },
    triggerEvent: { kind: 'scalar', default: 'onPress', inspector: { name: 'triggerEvent', type: 'string' } },
    bindToStore: BIND_STORE,
  },
  views: { kind: 'array', key: 'views', minLength: 2 },
  // PixiSwitcher 构造是位置参数: new PixiSwitcher(views, triggerEvent, activeViewID)
  positional: true,
  optionsBuilder: (c, v) => [v.array, c.triggerEvent, c.active],
  signalMap: (c: any) => ({
    change: (state: number | boolean) => {
      c.active = typeof state === 'number' ? state : (state ? 1 : 0);
      c.changeCount += 1;
      return { active: c.active };
    },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.active !== c.active) inst.active = c.active;
  },
};

const SLIDER_DEF: ComponentDefinition<SliderParams> = {
  name: 'Slider',
  signalPrefix: 'slider',
  pixiClass: PixiSlider,
  fields: {
    enabled: ENABLED,
    value: { kind: 'scalar', default: 0, inspector: { name: 'value', type: 'number' } },
    min: { kind: 'scalar', default: 0, inspector: { name: 'min', type: 'number' } },
    max: { kind: 'scalar', default: 100, inspector: { name: 'max', type: 'number' } },
    step: { kind: 'scalar', default: 1, inspector: { name: 'step', type: 'number' } },
    orientation: { kind: 'scalar', default: 'horizontal', inspector: { name: 'orientation', type: 'string' } },
    showValue: { kind: 'scalar', default: false, inspector: { name: 'showValue', type: 'boolean' } },
    views: { kind: 'shallowMerge', default: {} },
    bindToStore: BIND_STORE,
  },
  views: {
    kind: 'object', folder: 'views',
    keys: [
      { name: 'bg', required: true },
      { name: 'fill', required: true },
      { name: 'thumb', required: true },
    ],
  },
  optionsBuilder: (c, v) => {
    centerThumbPivot(v.object!.thumb);
    return {
      bg: v.object!.bg, fill: v.object!.fill, slider: v.object!.thumb,
      min: c.min, max: c.max, step: c.step, value: c.value, showValue: c.showValue,
    };
  },
  signalMap: (c: any) => ({
    update: (vv: number) => { c.value = vv; c.updateCount += 1; return { value: vv }; },
    change: (vv: number) => { c.value = vv; c.changeCount += 1; return { value: vv }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value !== c.value) inst.value = c.value;
  },
};

/**
 * @pixi/ui Slider 的 update 逻辑:
 *   slider.x = (bg.width/100 * progress) - (slider.width / 2)   // x 已居中
 *   slider.y = bg.height / 2                                    // y 未居中(bug)
 *
 * 因 y 维度 @pixi/ui 假设 thumb anchor / pivot 在中心(对 Sprite 自动 anchor.set(0.5),
 * 但 Graphics 没 anchor),Graphics 渲染时左上角对齐 bg 中线,thumb 中心落到中线下方。
 *
 * 修法:只设 pivot.y = h/2 让 thumb 沿 y 居中。pivot.x 保持 0(x 在 update
 * 里已用 -width/2 居中过,再设 pivot.x 会双倍偏移)。
 */
function centerThumbPivot(thumb: any): void {
  if (!thumb) return;
  if ((thumb as any).anchor) return; // Sprite — @pixi/ui 自己 anchor.set(0.5)
  let h = 0;
  try {
    const b = thumb.getBounds?.();
    h = b?.height ?? thumb.height ?? 0;
  } catch (_) {
    h = thumb.height ?? 0;
  }
  if (h > 0 && thumb.pivot) {
    thumb.pivot.set(0, h / 2);
  }
}

const DOUBLE_SLIDER_DEF: ComponentDefinition<DoubleSliderParams> = {
  name: 'DoubleSlider',
  signalPrefix: 'doubleslider',
  pixiClass: PixiDoubleSlider,
  fields: {
    enabled: ENABLED,
    value1: { kind: 'scalar', default: 0, inspector: { name: 'value1', type: 'number' } },
    value2: { kind: 'scalar', default: 100, inspector: { name: 'value2', type: 'number' } },
    min: { kind: 'scalar', default: 0, inspector: { name: 'min', type: 'number' } },
    max: { kind: 'scalar', default: 100, inspector: { name: 'max', type: 'number' } },
    step: { kind: 'scalar', default: 1 },
    showValue: { kind: 'scalar', default: false, inspector: { name: 'showValue', type: 'boolean' } },
    views: { kind: 'shallowMerge', default: {} },
    bindToStore1: { kind: 'scalar' },
    bindToStore2: { kind: 'scalar' },
  },
  views: {
    kind: 'object', folder: 'views',
    keys: [
      { name: 'bg', required: true }, { name: 'fill', required: true },
      { name: 'slider1', required: true }, { name: 'slider2', required: true },
    ],
  },
  optionsBuilder: (c, v) => {
    centerThumbPivot(v.object!.slider1);
    centerThumbPivot(v.object!.slider2);
    return {
      bg: v.object!.bg, fill: v.object!.fill,
      slider1: v.object!.slider1, slider2: v.object!.slider2,
      min: c.min, max: c.max, value1: c.value1, value2: c.value2, showValue: c.showValue,
    };
  },
  signalMap: (c: any) => ({
    update: (v1: number, v2: number) => { c.value1 = v1; c.value2 = v2; c.updateCount += 1; return { value1: v1, value2: v2 }; },
    change: (v1: number, v2: number) => { c.value1 = v1; c.value2 = v2; c.changeCount += 1; return { value1: v1, value2: v2 }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value1 !== c.value1) inst.value1 = c.value1;
    if (inst.value2 !== c.value2) inst.value2 = c.value2;
  },
};

const PROGRESS_BAR_DEF: ComponentDefinition<ProgressBarParams> = {
  name: 'ProgressBar',
  signalPrefix: 'progressbar',
  pixiClass: PixiProgressBar,
  fields: {
    value: { kind: 'scalar', default: 0, inspector: { name: 'value', type: 'number' } },
    valueRange: { kind: 'tuple', tupleLength: 2, default: [0, 100], inspector: { name: 'valueRange', type: 'number', isArray: true } },
    bgView: { kind: 'opaque' },
    fillView: { kind: 'opaque' },
    nineSliceSprite: { kind: 'opaque' },
    fillPaddings: { kind: 'shallowMerge', default: {} },
    bindToStore: BIND_STORE,
  },
  views: {
    kind: 'object', folder: '__progress_views__', // 不是 wrapper 字段,自己手 resolve
    keys: [], // 用空 keys 让 resolveViewsBySchema 跳过(下面用 customViewResolver 替代)
  },
  // 因为 ProgressBar 的 view ref 在两个独立字段(bgView/fillView),不在同一个 folder 对象里
  // 这里用 inline resolution(在 system.ts handleGeneric 里有 fast path 处理 views=undefined 的情形,
  // optionsBuilder 接受 raw component 自己 resolve)
  optionsBuilder: (c: any, _v) => ({
    bg: c.__resolved_bg, fill: c.__resolved_fill,
    fillPaddings: c.fillPaddings,
    progress: computeProgressPct(c),
  }),
  syncOnChange: (inst: any, c: any) => {
    const pct = computeProgressPct(c);
    if (inst.progress !== pct) inst.progress = pct;
  },
  mixin: { getProgressPct: getProgressPctMixin },
};

function computeProgressPct(c: { value: number; valueRange: [number, number] }): number {
  const [min, max] = c.valueRange;
  if (max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, c.value));
  return ((clamped - min) / (max - min)) * 100;
}

const CIRCULAR_PROGRESS_BAR_DEF: ComponentDefinition<CircularProgressBarParams> = {
  name: 'CircularProgressBar',
  signalPrefix: 'circularprogressbar',
  pixiClass: PixiCircularProgressBar,
  fields: {
    value: { kind: 'scalar', default: 0, inspector: { name: 'value', type: 'number' } },
    valueRange: { kind: 'tuple', tupleLength: 2, default: [0, 100], inspector: { name: 'valueRange', type: 'number', isArray: true } },
    radius: { kind: 'scalar', default: 60, inspector: { name: 'radius', type: 'number' } },
    lineWidth: { kind: 'scalar', default: 12, inspector: { name: 'lineWidth', type: 'number' } },
    startAngle: { kind: 'scalar', default: -90, inspector: { name: 'startAngle', type: 'number', step: 5 } },
    backgroundColor: { kind: 'scalar', default: '#1f2937', inspector: { name: 'backgroundColor', type: 'color' } },
    fillColor: { kind: 'scalar', default: '#22c55e', inspector: { name: 'fillColor', type: 'color' } },
    backgroundAlpha: { kind: 'scalar', default: 1, inspector: { name: 'backgroundAlpha', type: 'number', step: 0.05 } },
    fillAlpha: { kind: 'scalar', default: 1, inspector: { name: 'fillAlpha', type: 'number', step: 0.05 } },
    bindToStore: BIND_STORE,
  },
  optionsBuilder: (c) => ({
    radius: c.radius, lineWidth: c.lineWidth,
    backgroundColor: c.backgroundColor, fillColor: c.fillColor,
    backgroundAlpha: c.backgroundAlpha, fillAlpha: c.fillAlpha,
    value: computeProgressPct(c as any),
  }),
  syncOnChange: (inst: any, c: any) => {
    const pct = computeProgressPct(c);
    if (inst.progress !== pct) inst.progress = pct;
  },
  mixin: { getProgressPct: getProgressPctMixin },
};

const INPUT_DEF: ComponentDefinition<InputParams> = {
  name: 'Input',
  signalPrefix: 'input',
  pixiClass: PixiInput,
  fields: {
    enabled: ENABLED,
    value: { kind: 'scalar', default: '', inspector: { name: 'value', type: 'string' } },
    placeholder: { kind: 'scalar', default: '', inspector: { name: 'placeholder', type: 'string' } },
    maxLength: { kind: 'scalar', default: 100, inspector: { name: 'maxLength', type: 'number' } },
    secure: { kind: 'scalar', default: false, inspector: { name: 'secure', type: 'boolean' } },
    align: { kind: 'scalar', default: 'left', inspector: { name: 'align', type: 'string' } },
    padding: { kind: 'tuple', tupleLength: 4, default: [8, 8, 8, 8] },
    textStyle: { kind: 'shallowMerge', default: { fontFamily: 'Arial', fontSize: 16, fill: '#222' } },
    bgView: { kind: 'opaque' },
    nineSliceSprite: { kind: 'opaque' },
    cleanOnFocus: { kind: 'scalar', default: false, inspector: { name: 'cleanOnFocus', type: 'boolean' } },
    addMask: { kind: 'scalar', default: false, inspector: { name: 'addMask', type: 'boolean' } },
    bindToStore: BIND_STORE,
  },
  views: { kind: 'single', key: 'bgView', required: true },
  optionsBuilder: (c, v) => ({
    bg: v.single, textStyle: c.textStyle,
    placeholder: c.placeholder, value: c.value, maxLength: c.maxLength, secure: c.secure,
    align: c.align, padding: c.padding,
    cleanOnFocus: c.cleanOnFocus, nineSliceSprite: c.nineSliceSprite, addMask: c.addMask,
  }),
  signalMap: (c: any) => ({
    change: (text: string) => { c.value = text; c.changeCount += 1; return { value: text }; },
    enter: (text: string) => ({ value: text }),
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value !== c.value) inst.value = c.value;
  },
};

const LIST_DEF: ComponentDefinition<ListParams> = {
  name: 'List',
  signalPrefix: 'list',
  pixiClass: PixiList,
  fields: {
    type: { kind: 'scalar', default: 'vertical', inspector: { name: 'type', type: 'string' } },
    elementsMargin: { kind: 'scalar', default: 0, inspector: { name: 'elementsMargin', type: 'number' } },
    padding: { kind: 'scalar' },
    vertPadding: { kind: 'scalar' },
    horPadding: { kind: 'scalar' },
    topPadding: { kind: 'scalar' },
    bottomPadding: { kind: 'scalar' },
    leftPadding: { kind: 'scalar' },
    rightPadding: { kind: 'scalar' },
    maxWidth: { kind: 'scalar' },
    maxHeight: { kind: 'scalar' },
    itemsChildName: { kind: 'scalar', default: 'items' },
  },
  // List 不走 ViewSchema,view 是 collectChildContainers 副作用,system.ts 处理
  optionsBuilder: (c: any, _v) => ({
    type: c.type,
    elementsMargin: c.elementsMargin,
    padding: c.padding,
    vertPadding: c.vertPadding, horPadding: c.horPadding,
    topPadding: c.topPadding, bottomPadding: c.bottomPadding,
    leftPadding: c.leftPadding, rightPadding: c.rightPadding,
    maxWidth: c.maxWidth, maxHeight: c.maxHeight,
    children: c.__resolved_items ?? [],
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.type !== c.type) inst.type = c.type;
    if (inst.elementsMargin !== c.elementsMargin) inst.elementsMargin = c.elementsMargin;
    if (typeof inst.arrangeChildren === 'function') inst.arrangeChildren();
  },
};

const SCROLL_BOX_DEF: ComponentDefinition<ScrollBoxParams> = {
  name: 'ScrollBox',
  signalPrefix: 'scrollbox',
  pixiClass: PixiScrollBox,
  fields: {
    width: { kind: 'scalar', default: 320, inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', default: 240, inspector: { name: 'height', type: 'number' } },
    direction: { kind: 'scalar', default: 'vertical', inspector: { name: 'direction', type: 'string' } },
    contentChildName: { kind: 'scalar', default: 'content' },
    background: { kind: 'scalar', default: 0x111111, inspector: { name: 'background', type: 'color' } },
    radius: { kind: 'scalar', default: 0, inspector: { name: 'radius', type: 'number' } },
    elementsMargin: { kind: 'scalar', default: 0 },
    disableDynamicRendering: { kind: 'scalar', default: false },
    disableEasing: { kind: 'scalar', default: false, inspector: { name: 'disableEasing', type: 'boolean' } },
    padding: { kind: 'scalar', default: 0 },
    // legacy fields(spec 兼容)
    inertia: { kind: 'scalar', default: true },
    inertiaDecay: { kind: 'scalar', default: 0.92 },
    bounceFactor: { kind: 'scalar', default: 0.18 },
  },
  // legacy spec hooks(applyOffset / getBounds 默认空实现 in mixin)
  mixin: {
    applyOffset() { /* @pixi/ui ScrollBox 内部接管 */ },
    getBounds() { return { minX: 0, maxX: 0, minY: 0, maxY: 0 }; },
  },
  optionsBuilder: (c: any, _v) => {
    const typeMap: Record<string, 'horizontal' | 'vertical' | 'bidirectional'> = {
      horizontal: 'horizontal', vertical: 'vertical', both: 'bidirectional',
    };
    return {
      width: c.width, height: c.height,
      type: typeMap[c.direction] ?? 'vertical',
      background: c.background, radius: c.radius,
      elementsMargin: c.elementsMargin, padding: c.padding,
      disableEasing: c.disableEasing, disableDynamicRendering: c.disableDynamicRendering,
      items: c.__resolved_items ?? [],
    };
  },
  signalMap: () => ({
    scroll: (v: any) => ({ value: v }),
  }),
  syncOnChange: (inst: any, c: any) => {
    if (typeof inst.resize === 'function') {
      try { inst.resize(c.width, c.height); } catch (_) {}
    }
  },
};

const SELECT_DEF: ComponentDefinition<SelectParams> = {
  name: 'Select',
  signalPrefix: 'select',
  pixiClass: PixiSelect,
  fields: {
    items: { kind: 'arrayCopy', default: [] },
    selectedIndex: { kind: 'scalar', default: -1, inspector: { name: 'selectedIndex', type: 'number' } },
    placeholder: { kind: 'scalar', default: '', inspector: { name: 'placeholder', type: 'string' } },
    closedView: { kind: 'opaque' },
    openView: { kind: 'opaque' },
    textStyle: { kind: 'shallowMerge', default: { fontFamily: 'Arial', fontSize: 14, fill: '#222' } },
    nineSliceSprite: { kind: 'opaque' },
    bindToStore: BIND_STORE,
  },
  views: {
    kind: 'object', folder: '__select_views__', keys: [],
  },
  optionsBuilder: (c: any) => ({
    closedBG: c.__resolved_closedView,
    openBG: c.__resolved_openView,
    textStyle: c.textStyle,
    items: {
      items: (c.items ?? []).map((it: any) => it.text),
      backgroundColor: 0x000000, hoverColor: 0x666666,
      width: 200, height: 30, textStyle: c.textStyle, radius: 4,
    },
    selected: c.selectedIndex >= 0 ? c.selectedIndex : undefined,
    nineSliceSprite: c.nineSliceSprite,
  }),
  signalMap: (c: any) => ({
    select: (value: number, text: string) => {
      c.selectedIndex = value; c.selectCount += 1;
      return { index: value, text };
    },
  }),
};

const DIALOG_DEF: ComponentDefinition<DialogParams> = {
  name: 'Dialog',
  signalPrefix: 'dialog',
  pixiClass: PixiDialog,
  fields: {
    open: { kind: 'scalar', default: false, inspector: { name: 'open', type: 'boolean' } },
    title: { kind: 'scalar', inspector: { name: 'title', type: 'string' } },
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
    padding: { kind: 'scalar', inspector: { name: 'padding', type: 'number' } },
    backdropColor: { kind: 'scalar', default: 0x000000, inspector: { name: 'backdropColor', type: 'color' } },
    backdropAlpha: { kind: 'scalar', default: 0.5, inspector: { name: 'backdropAlpha', type: 'number', step: 0.05 } },
    backdropView: { kind: 'opaque' },
    backgroundView: { kind: 'opaque' },
    closeOnBackdropClick: { kind: 'scalar', default: true, inspector: { name: 'closeOnBackdropClick', type: 'boolean' } },
    contentChildName: { kind: 'scalar', default: 'content', inspector: { name: 'contentChildName', type: 'string' } },
    nineSliceSprite: { kind: 'opaque' },
    bindToStore: BIND_STORE,
  },
  optionsBuilder: (c: any) => ({
    backdrop: c.__resolved_backdropView,
    backdropColor: backdropColorToNumber(c.backdropColor),
    backdropAlpha: c.backdropAlpha,
    background: c.__resolved_backgroundView ?? new PixiContainer(),
    title: c.title,
    width: c.width, height: c.height, padding: c.padding,
    closeOnBackdropClick: c.closeOnBackdropClick,
    nineSliceSprite: c.nineSliceSprite,
  }),
  postCreate: (inst: any, c: any) => {
    if (c.open && typeof inst.open === 'function') inst.open();
  },
  signalMap: (c: any) => ({
    close: () => { c.open = false; return {}; },
    select: (idx: number, text: string) => ({ index: idx, text }),
  }),
  syncOnChange: (inst: any, c: any) => {
    if (c.open && !inst.isOpen && typeof inst.open === 'function') inst.open();
    else if (!c.open && inst.isOpen && typeof inst.close === 'function') inst.close();
  },
};

const MASKED_FRAME_DEF: ComponentDefinition<MaskedFrameParams> = {
  name: 'MaskedFrame',
  signalPrefix: 'maskedframe',
  pixiClass: PixiMaskedFrame,
  fields: {
    targetView: { kind: 'opaque' },
    maskView: { kind: 'opaque' },
    borderView: { kind: 'opaque' },
  },
  optionsBuilder: (c: any) => ({
    target: c.__resolved_targetView,
    mask: c.__resolved_maskView,
    borderWidth: 0,
    borderColor: 0,
  }),
};

// ============================================================
// Generate 14 Component classes
// ============================================================

export const Button: UiComponentClass<ButtonParams> = defineUiComponent(BUTTON_DEF);
export const FancyButton: UiComponentClass<FancyButtonParams> = defineUiComponent(FANCY_BUTTON_DEF);
export const CheckBox: UiComponentClass<CheckBoxParams> = defineUiComponent(CHECKBOX_DEF);
export const Switcher: UiComponentClass<SwitcherParams> = defineUiComponent(SWITCHER_DEF);
export const Slider: UiComponentClass<SliderParams> = defineUiComponent(SLIDER_DEF);
export const DoubleSlider: UiComponentClass<DoubleSliderParams> = defineUiComponent(DOUBLE_SLIDER_DEF);
export const ProgressBar: UiComponentClass<ProgressBarParams> = defineUiComponent(PROGRESS_BAR_DEF);
export const CircularProgressBar: UiComponentClass<CircularProgressBarParams> = defineUiComponent(CIRCULAR_PROGRESS_BAR_DEF);
export const Input: UiComponentClass<InputParams> = defineUiComponent(INPUT_DEF);
export const List: UiComponentClass<ListParams> = defineUiComponent(LIST_DEF);
export const ScrollBox: UiComponentClass<ScrollBoxParams> = defineUiComponent(SCROLL_BOX_DEF);
export const Select: UiComponentClass<SelectParams> = defineUiComponent(SELECT_DEF);
export const Dialog: UiComponentClass<DialogParams> = defineUiComponent(DIALOG_DEF);
export const MaskedFrame: UiComponentClass<MaskedFrameParams> = defineUiComponent(MASKED_FRAME_DEF);

// 暴露 metadata 表给 system.ts(generic handler 路由)
export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  Button: BUTTON_DEF,
  FancyButton: FANCY_BUTTON_DEF,
  CheckBox: CHECKBOX_DEF,
  Switcher: SWITCHER_DEF,
  Slider: SLIDER_DEF,
  DoubleSlider: DOUBLE_SLIDER_DEF,
  ProgressBar: PROGRESS_BAR_DEF,
  CircularProgressBar: CIRCULAR_PROGRESS_BAR_DEF,
  Input: INPUT_DEF,
  List: LIST_DEF,
  ScrollBox: SCROLL_BOX_DEF,
  Select: SELECT_DEF,
  Dialog: DIALOG_DEF,
  MaskedFrame: MASKED_FRAME_DEF,
};
