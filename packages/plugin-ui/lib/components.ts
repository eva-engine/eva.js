/**
 * @pixi/ui v2.x 包装层 — 14 个 ECS Component 由 metadata 驱动生成。
 *
 * 替代旧的 14 份 lib/components/*.ts 样板文件。新增组件 = 在本文件加一份 metadata,无需新文件。
 *
 * RadioGroup 因跨实体协调(收集子 CheckBox 实例 + queueMicrotask)无法 metadata 化,
 * 保留在 ./radio-group.ts 单独维护。
 */

import {
  Button as PixiBareButton,
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
import {
  BitmapFontManager as PixiBitmapFontManager,
  BitmapText as PixiBitmapText,
  Container as PixiContainer,
  Graphics as PixiGraphics,
  HTMLText as PixiHTMLText,
  Text as PixiText,
} from 'pixi.js';
import {
  defineUiComponent,
  type ComponentDefinition,
  type FieldSpec,
  type UiRenderSize,
  type UiComponentClass,
} from './component-factory';
import { applyListLayoutSize } from './internal/size-sync';
import { resolveTexture, type ViewRef } from './internal/view-resolver';

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
  default?: ViewRef; hover?: ViewRef; pressed?: ViewRef; disabled?: ViewRef; icon?: ViewRef;
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
  iconOffset?: FancyButtonOffset;
  padding?: number; nineSliceSprite?: [number, number, number, number]; selectedTint?: string;
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number; fontWeight?: string; dropShadow?: unknown };
  textClass?: 'text' | 'html' | 'bitmap';
  bitmapFontName?: string;
  defaultTextScale?: { x?: number; y?: number } | number;
  defaultIconScale?: { x?: number; y?: number } | number;
  defaultTextAnchor?: { x?: number; y?: number } | number;
  defaultIconAnchor?: { x?: number; y?: number } | number;
  anchor?: number; anchorX?: number; anchorY?: number; scale?: number;
  animations?: unknown; contentFittingMode?: 'default' | 'fill' | 'none'; ignoreRefitting?: boolean;
  width?: number; height?: number;
}

export interface ButtonParams { enabled?: boolean; view?: ViewRef; }

export interface CheckBoxStateStyle { alpha?: number; scale?: number; }
export interface CheckBoxParams {
  enabled?: boolean; checked?: boolean; text?: string; bindToStore?: string;
  views?: { checked?: ViewRef; unchecked?: ViewRef };
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number };
  textOffset?: { x?: number; y?: number };
  disabledStyle?: CheckBoxStateStyle;
}

export type SwitcherTriggerEvent = 'onPress' | 'onDown' | 'onUp' | 'onHover' | 'onOut' | 'onUpOut';
export interface SwitcherParams { active?: number; views?: ViewRef[]; triggerEvent?: SwitcherTriggerEvent | SwitcherTriggerEvent[]; bindToStore?: string; }

export type SliderOrientation = 'horizontal' | 'vertical';
export interface SliderParams {
  enabled?: boolean; value?: number; min?: number; max?: number; step?: number;
  orientation?: SliderOrientation; showValue?: boolean;
  views?: { bg?: ViewRef; fill?: ViewRef; thumb?: ViewRef };
  nineSliceSprite?: { bg?: [number, number, number, number]; fill?: [number, number, number, number] };
  fillPaddings?: ProgressBarFillPaddings;
  valueTextStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number };
  valueTextOffset?: { x?: number; y?: number };
  width?: number; height?: number;
  bindToStore?: string;
}

export interface DoubleSliderParams {
  enabled?: boolean; value1?: number; value2?: number; min?: number; max?: number; step?: number; showValue?: boolean;
  views?: { bg?: ViewRef; fill?: ViewRef; slider1?: ViewRef; slider2?: ViewRef };
  nineSliceSprite?: { bg?: [number, number, number, number]; fill?: [number, number, number, number] };
  fillPaddings?: ProgressBarFillPaddings;
  valueTextStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number };
  valueTextOffset?: { x?: number; y?: number };
  width?: number; height?: number;
  bindToStore1?: string; bindToStore2?: string;
}

export interface ProgressBarFillPaddings { top?: number; right?: number; bottom?: number; left?: number; }
export interface ProgressBarParams {
  value?: number; valueRange?: [number, number]; bgView?: ViewRef; fillView?: ViewRef;
  nineSliceSprite?: { bg?: [number, number, number, number]; fill?: [number, number, number, number] };
  fillPaddings?: ProgressBarFillPaddings; bindToStore?: string;
  width?: number; height?: number;
}

export interface CircularProgressBarParams {
  value?: number; valueRange?: [number, number];
  radius?: number; lineWidth?: number; startAngle?: number;
  backgroundColor?: number | string; fillColor?: number | string;
  backgroundAlpha?: number; fillAlpha?: number; cap?: 'round' | 'butt' | 'square'; bindToStore?: string;
  rotation?: number;
  offset?: { x?: number; y?: number };
}

export interface InputStyle { fontFamily?: string; fontSize?: number; fill?: string | number; align?: 'left' | 'center' | 'right'; }
export interface InputParams {
  enabled?: boolean; value?: string; placeholder?: string; maxLength?: number; secure?: boolean;
  align?: 'left' | 'center' | 'right'; padding?: [number, number, number, number];
  textStyle?: InputStyle; bgView?: ViewRef;
  nineSliceSprite?: [number, number, number, number]; cleanOnFocus?: boolean; addMask?: boolean; bindToStore?: string;
  width?: number; height?: number;
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
  vertPadding?: number; horPadding?: number; topPadding?: number; bottomPadding?: number;
  leftPadding?: number; rightPadding?: number;
  globalScroll?: boolean; shiftScroll?: boolean; proximityRange?: number; proximityDebounce?: number;
  inertia?: boolean; inertiaDecay?: number; bounceFactor?: number;
}

export interface SelectItem { text: string; id?: string; }
export interface SelectParams {
  items?: SelectItem[]; selectedIndex?: number; placeholder?: string;
  closedView?: ViewRef; openView?: ViewRef;
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number };
  nineSliceSprite?: [number, number, number, number]; bindToStore?: string;
  width?: number; height?: number; radius?: number; visibleItems?: number;
  itemWidth?: number; itemHeight?: number; itemBackgroundColor?: number | string; itemHoverColor?: number | string;
  selectedTextOffset?: { x?: number; y?: number };
  scrollBox?: Partial<ScrollBoxParams> & { offset?: { x?: number; y?: number } };
  textClass?: 'text' | 'html';
  open?: boolean;
}

export interface DialogParams {
  open?: boolean; title?: string; width?: number; height?: number; padding?: number;
  backdropColor?: number | string; backdropAlpha?: number;
  backdropView?: ViewRef; backgroundView?: ViewRef;
  closeOnBackdropClick?: boolean; contentChildName?: string;
  nineSliceSprite?: [number, number, number, number]; bindToStore?: string;
  titleStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number; fontWeight?: string; lineHeight?: number; dropShadow?: unknown };
  content?: string;
  contentStyle?: {
    fontFamily?: string; fontSize?: number; fill?: string | number; fontWeight?: string;
    align?: 'left' | 'center' | 'right'; wordWrap?: boolean; wordWrapWidth?: number; lineHeight?: number;
    dropShadow?: unknown;
  };
  contentButtons?: DialogButtonParams[];
  contentCheckBoxes?: DialogCheckBoxParams[];
  buttons?: DialogButtonParams[];
  buttonList?: { elementsMargin?: number; type?: ListType; padding?: number };
  buttonListOffset?: { x?: number; y?: number };
  scrollBox?: Partial<ScrollBoxParams> & {
    type?: ListType;
    offset?: { x?: number; y?: number };
    size?: { width?: number; height?: number };
  };
  animations?: unknown;
}

export interface DialogCheckBoxParams {
  text?: string;
  size?: number;
  radius?: number;
  checked?: boolean;
  uncheckedColor?: number | string;
  checkedColor?: number | string;
  strokeColor?: number | string;
  strokeWidth?: number;
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number; fontWeight?: string };
}

export interface DialogButtonParams {
  kind?: 'button' | 'fancy';
  text?: string;
  value?: string | number;
  closeOnPress?: boolean;
  reopenDelay?: number;
  width?: number;
  height?: number;
  radius?: number;
  color?: number | string;
  hoverColor?: number | string;
  pressedColor?: number | string;
  disabledColor?: number | string;
  defaultView?: string;
  hoverView?: string;
  pressedView?: string;
  disabledView?: string;
  nineSliceSprite?: [number, number, number, number];
  textStyle?: { fontFamily?: string; fontSize?: number; fill?: string | number; fontWeight?: string };
  disabled?: boolean;
  animations?: unknown;
}

export interface MaskedFrameParams {
  targetView?: ViewRef; maskView?: ViewRef; borderView?: ViewRef;
  borderWidth?: number; borderColor?: number | string;
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
    press: () => {
      c.pressCount += 1;
      c.lastSignal = 'press';
      c.visualState = 'default';
      return { pressCount: c.pressCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
    down: () => {
      c.downCount += 1;
      c.lastSignal = 'down';
      c.visualState = 'pressed';
      return { downCount: c.downCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
    up: () => {
      c.upCount += 1;
      c.lastSignal = 'up';
      c.visualState = 'default';
      return { upCount: c.upCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
    hover: () => {
      c.hoverCount += 1;
      c.lastSignal = 'hover';
      c.visualState = 'hover';
      return { hoverCount: c.hoverCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
    out: () => {
      c.outCount += 1;
      c.lastSignal = 'out';
      c.visualState = 'default';
      return { outCount: c.outCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
    upOut: () => {
      c.upOutCount += 1;
      c.lastSignal = 'upOut';
      c.visualState = 'default';
      return { upOutCount: c.upOutCount, lastSignal: c.lastSignal, visualState: c.visualState };
    },
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
      { name: 'icon', type: 'object' },
    ] } },
    offset: { kind: 'shallowMerge', default: {} },
    textOffset: { kind: 'shallowMerge', default: {} },
    iconOffset: { kind: 'shallowMerge', default: {} },
    nineSliceSprite: { kind: 'opaque' },
    textStyle: { kind: 'shallowMerge', default: {} },
    textClass: { kind: 'scalar', default: 'text' },
    bitmapFontName: { kind: 'scalar', default: 'TitleFont' },
    defaultTextScale: { kind: 'opaque' },
    defaultIconScale: { kind: 'opaque' },
    defaultTextAnchor: { kind: 'opaque' },
    defaultIconAnchor: { kind: 'opaque' },
    anchor: { kind: 'scalar' },
    anchorX: { kind: 'scalar' },
    anchorY: { kind: 'scalar' },
    scale: { kind: 'scalar' },
    animations: { kind: 'opaque' },
    contentFittingMode: { kind: 'scalar' },
    ignoreRefitting: { kind: 'scalar' },
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
  },
  views: {
    kind: 'object', folder: 'views',
    keys: [
      { name: 'default', required: false },
      { name: 'hover', required: false },
      { name: 'pressed', required: false },
      { name: 'disabled', required: false },
      { name: 'icon', required: false },
    ],
  },
  optionsBuilder: (c, v) => {
    // FancyButton 内部 updateView 不接受 null;只把已 resolve 的 view 字段传过去
    const opts: any = {
      text: makeFancyButtonText(c), padding: c.padding,
      offset: c.offset, textOffset: c.textOffset, iconOffset: c.iconOffset,
      nineSliceSprite: c.nineSliceSprite,
      defaultTextScale: c.defaultTextScale,
      defaultIconScale: c.defaultIconScale,
      defaultTextAnchor: c.defaultTextAnchor,
      defaultIconAnchor: c.defaultIconAnchor,
      anchor: c.anchor, anchorX: c.anchorX, anchorY: c.anchorY,
      scale: c.scale, animations: c.animations,
      contentFittingMode: c.contentFittingMode,
      ignoreRefitting: c.ignoreRefitting,
    };
    if (v.object?.default) opts.defaultView = getFancyButtonView(c, 'default', v.object.default);
    if (v.object?.hover) opts.hoverView = getFancyButtonView(c, 'hover', v.object.hover);
    if (v.object?.pressed) opts.pressedView = getFancyButtonView(c, 'pressed', v.object.pressed);
    if (v.object?.disabled) opts.disabledView = getFancyButtonView(c, 'disabled', v.object.disabled);
    if (v.object?.icon) opts.icon = v.object.icon;
    return opts;
  },
  postCreate: (inst: any, c: any) => {
    inst.enabled = c.enabled;
    if (c.state && typeof inst.setState === 'function') inst.setState(c.state, true);
    applyFancyButtonAnchor(inst, c);
    applyOptionalSize(inst, c);
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
    if (c.textOffset !== undefined) inst.textOffset = c.textOffset;
    if (c.iconOffset !== undefined) inst.iconOffset = c.iconOffset;
    if (c.defaultTextScale !== undefined) inst.defaultTextScale = c.defaultTextScale;
    if (c.defaultIconScale !== undefined) inst.defaultIconScale = c.defaultIconScale;
    if (c.defaultTextAnchor !== undefined) inst.defaultTextAnchor = c.defaultTextAnchor;
    if (c.defaultIconAnchor !== undefined) inst.defaultIconAnchor = c.defaultIconAnchor;
    if (c.contentFittingMode !== undefined) inst.contentFittingMode = c.contentFittingMode;
    if (c.ignoreRefitting !== undefined && inst.options) inst.options.ignoreRefitting = c.ignoreRefitting;
    if (c.state && typeof inst.setState === 'function') inst.setState(c.state, true);
    applyFancyButtonAnchor(inst, c);
    applyOptionalSize(inst, c);
    applySelectedTint(inst, c);
  },
};
function applyFancyButtonAnchor(inst: any, c: any): void {
  const hasAnchor = c.anchor !== undefined || c.anchorX !== undefined || c.anchorY !== undefined;
  if (!hasAnchor || !inst?.anchor?.set) return;
  const x = c.anchorX ?? c.anchor ?? inst.anchor.x ?? 0;
  const y = c.anchorY ?? c.anchor ?? inst.anchor.y ?? 0;
  try { inst.anchor.set(x, y); } catch (_) {}
}
function makeFancyButtonText(c: any): any {
  if (c.text === undefined) return undefined;
  const text = String(c.text);
  if (c.textClass === 'html') {
    return new PixiHTMLText({ text, style: c.textStyle as any });
  }
  if (c.textClass === 'bitmap') {
    const fontFamily = c.bitmapFontName ?? 'TitleFont';
    ensureBitmapFont(fontFamily, c.textStyle);
    return new PixiBitmapText({
      text,
      style: {
        fontFamily,
        fontSize: c.textStyle?.fontSize ?? 40,
      },
    });
  }
  if (c.textStyle && Object.keys(c.textStyle).length > 0) {
    return new PixiText({ text, style: c.textStyle as any });
  }
  return c.text;
}
const installedBitmapFonts = new Set<string>();
function ensureBitmapFont(name: string, style: Record<string, unknown> | undefined): void {
  if (installedBitmapFonts.has(name)) return;
  try {
    PixiBitmapFontManager.install({ name, style: (style ?? {}) as any });
  } catch (_) {
    // Reinstalling an existing font can throw in Pixi; rendering can still use the current font.
  }
  installedBitmapFonts.add(name);
}
function getFancyButtonView(c: any, key: keyof FancyButtonViewRefs, resolved: any): any {
  const ref = c.views?.[key];
  if (c.nineSliceSprite && ref && 'texture' in ref) return getTextureView(ref.texture);
  return resolved;
}
function applySelectedTint(inst: any, c: any): void {
  try {
    const dv: any = inst.defaultView;
    if (dv && 'tint' in dv) dv.tint = c.selected ? c.selectedTint : 0xFFFFFF;
  } catch (_) {}
}
function syncCheckBoxTextStyle(inst: any, c: any): void {
  const style = inst.style;
  if (!style || (!c.textStyle && !c.textOffset)) return;
  const nextStyle = {
    ...style,
    text: c.textStyle ?? style.text,
    textOffset: c.textOffset ?? style.textOffset,
  };

  // @pixi/ui CheckBox.style rebuilds checked/unchecked views. If RadioGroup is
  // listening, that rebuild can emit onChange while only one view exists.
  inst._style = nextStyle;
  if (inst.labelText && c.textStyle) inst.labelText.style = c.textStyle;
  try { inst.alignText?.(); } catch (_) {}
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
    textStyle: { kind: 'shallowMerge', default: { fill: 0xffffff } },
    textOffset: { kind: 'shallowMerge', default: {} },
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
    style: { checked: v.object!.checked, unchecked: v.object!.unchecked, text: c.textStyle, textOffset: c.textOffset },
    text: c.text, checked: c.checked,
  }),
  signalMap: (c: any) => ({
    check: (state: boolean) => { c.checked = state; c.toggleCount += 1; return { value: state }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.checked !== c.checked) inst.checked = c.checked;
    if (c.text !== undefined && inst.text !== c.text) inst.text = c.text;
    syncCheckBoxTextStyle(inst, c);
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
    if (c.triggerEvent !== undefined) inst.triggerEvents = c.triggerEvent;
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
    nineSliceSprite: { kind: 'opaque' },
    fillPaddings: { kind: 'shallowMerge', default: {} },
    valueTextStyle: { kind: 'shallowMerge', default: { fill: 0xffffff } },
    valueTextOffset: { kind: 'shallowMerge', default: {} },
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
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
    const bg = getSliderView(c.views?.bg, v.object!.bg);
    const fill = getSliderView(c.views?.fill, v.object!.fill);
    const thumb = getSliderView(c.views?.thumb, v.object!.thumb);
    return {
      bg, fill, slider: thumb,
      min: c.min, max: c.max, step: c.step, value: c.value, showValue: c.showValue,
      fillPaddings: c.fillPaddings,
      nineSliceSprite: c.nineSliceSprite,
      valueTextStyle: c.valueTextStyle,
      valueTextOffset: c.valueTextOffset,
    };
  },
  postCreate: (inst: any, c: any) => applyOptionalSize(inst, c),
  signalMap: (c: any) => ({
    update: (vv: number) => { c.value = vv; c.updateCount += 1; return { value: vv }; },
    change: (vv: number) => { c.value = vv; c.changeCount += 1; return { value: vv }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value !== c.value) inst.value = c.value;
    applyOptionalSize(inst, c);
  },
};

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
    nineSliceSprite: { kind: 'opaque' },
    fillPaddings: { kind: 'shallowMerge', default: {} },
    valueTextStyle: { kind: 'shallowMerge', default: { fill: 0xffffff } },
    valueTextOffset: { kind: 'shallowMerge', default: {} },
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
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
    const bg = getSliderView(c.views?.bg, v.object!.bg);
    const fill = getSliderView(c.views?.fill, v.object!.fill);
    const slider1 = getSliderView(c.views?.slider1, v.object!.slider1);
    const slider2 = getSliderView(c.views?.slider2, v.object!.slider2);
    return {
      bg, fill,
      slider1, slider2,
      min: c.min, max: c.max, step: c.step, value1: c.value1, value2: c.value2, showValue: c.showValue,
      fillPaddings: c.fillPaddings,
      nineSliceSprite: c.nineSliceSprite,
      valueTextStyle: c.valueTextStyle,
      valueTextOffset: c.valueTextOffset,
    };
  },
  postCreate: (inst: any, c: any) => applyOptionalSize(inst, c),
  signalMap: (c: any) => ({
    update: (v1: number, v2: number) => { c.value1 = v1; c.value2 = v2; c.updateCount += 1; return { value1: v1, value2: v2 }; },
    change: (v1: number, v2: number) => { c.value1 = v1; c.value2 = v2; c.changeCount += 1; return { value1: v1, value2: v2 }; },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value1 !== c.value1) inst.value1 = c.value1;
    if (inst.value2 !== c.value2) inst.value2 = c.value2;
    applyOptionalSize(inst, c);
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
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
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
    bg: c.__resolved_bg_view, fill: c.__resolved_fill_view,
    fillPaddings: c.fillPaddings,
    nineSliceSprite: c.nineSliceSprite,
    progress: computeProgressPct(c),
  }),
  postCreate: (inst: any, c: any) => applyOptionalSize(inst, c),
  syncOnChange: (inst: any, c: any) => {
    const pct = computeProgressPct(c);
    if (inst.progress !== pct) inst.progress = pct;
    applyOptionalSize(inst, c);
  },
  mixin: { getProgressPct: getProgressPctMixin },
};

function getSliderView(ref: ViewRef | undefined, resolved: any): any {
  if (ref && 'texture' in ref) {
    return getTextureView(ref.texture);
  }
  return resolved;
}

function getProgressView(ref: ViewRef | undefined, resolved: any, nineSliceSprite: unknown): any {
  if (nineSliceSprite && ref && 'texture' in ref) {
    return getTextureView(ref.texture);
  }
  return resolved;
}

function getTextureView(textureKey: string): any {
  return resolveTexture(undefined, textureKey) ?? textureKey;
}

function applyOptionalSize(inst: any, c: { width?: number; height?: number }): void {
  if (c.width === undefined && c.height === undefined) return;
  const width = c.width ?? inst.width;
  const height = c.height ?? inst.height;
  if (typeof inst.setSize === 'function') {
    try { inst.setSize(width, height); return; } catch (_) {}
  }
  if (c.width !== undefined) inst.width = c.width;
  if (c.height !== undefined) inst.height = c.height;
}

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
    cap: { kind: 'scalar', inspector: { name: 'cap', type: 'string' } },
    rotation: { kind: 'scalar', default: 0 },
    offset: { kind: 'shallowMerge', default: {} },
    bindToStore: BIND_STORE,
  },
  optionsBuilder: (c) => ({
    radius: c.radius, lineWidth: c.lineWidth,
    backgroundColor: c.backgroundColor, fillColor: c.fillColor,
    backgroundAlpha: c.backgroundAlpha, fillAlpha: c.fillAlpha,
    cap: c.cap,
    value: computeProgressPct(c as any),
  }),
  postCreate: (inst: any, c: any) => applyCircularProgressTransform(inst, c),
  syncOnChange: (inst: any, c: any) => {
    const pct = computeProgressPct(c);
    if (inst.progress !== pct) inst.progress = pct;
    applyCircularProgressTransform(inst, c);
  },
  mixin: { getProgressPct: getProgressPctMixin },
};

function applyCircularProgressTransform(
  inst: any,
  c: { rotation?: number; offset?: { x?: number; y?: number } },
): void {
  if (c.rotation !== undefined) inst.rotation = c.rotation;
  if (c.offset) {
    inst.x = c.offset.x ?? 0;
    inst.y = c.offset.y ?? 0;
  }
}

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
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
    bindToStore: BIND_STORE,
  },
  views: { kind: 'single', key: 'bgView', required: true },
  optionsBuilder: (c, v) => ({
    bg: getProgressView(c.bgView, v.single, c.nineSliceSprite), textStyle: c.textStyle,
    placeholder: c.placeholder, value: c.value, maxLength: c.maxLength, secure: c.secure,
    align: c.align, padding: c.padding,
    cleanOnFocus: c.cleanOnFocus, nineSliceSprite: c.nineSliceSprite, addMask: c.addMask,
  }),
  postCreate: (inst: any, c: any) => { inst.enabled = c.enabled; applyOptionalSize(inst, c); },
  signalMap: (c: any) => ({
    change: (text: string) => { c.value = text; c.changeCount += 1; return { value: text }; },
    enter: (text: string) => ({ value: text }),
  }),
  syncOnChange: (inst: any, c: any) => {
    if (inst.value !== c.value) inst.value = c.value;
    if (inst.enabled !== c.enabled) inst.enabled = c.enabled;
    applyOptionalSize(inst, c);
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
  }),
  postCreate: (inst: any, c: any) => {
    for (const item of c.__resolved_items ?? []) {
      try { inst.addChild(item); } catch (_) {}
    }
    if (typeof inst.arrangeChildren === 'function') inst.arrangeChildren();
  },
  syncOnChange: (inst: any, c: any) => {
    if (inst.type !== c.type) inst.type = c.type;
    if (inst.elementsMargin !== c.elementsMargin) inst.elementsMargin = c.elementsMargin;
    if (typeof inst.arrangeChildren === 'function') inst.arrangeChildren();
  },
  applySize: applyListLayoutSize,
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
    background: { kind: 'scalar', inspector: { name: 'background', type: 'color' } },
    radius: { kind: 'scalar', default: 0, inspector: { name: 'radius', type: 'number' } },
    elementsMargin: { kind: 'scalar', default: 0 },
    disableDynamicRendering: { kind: 'scalar', default: false },
    disableEasing: { kind: 'scalar', default: false, inspector: { name: 'disableEasing', type: 'boolean' } },
    padding: { kind: 'scalar', default: 0 },
    vertPadding: { kind: 'scalar' },
    horPadding: { kind: 'scalar' },
    topPadding: { kind: 'scalar' },
    bottomPadding: { kind: 'scalar' },
    leftPadding: { kind: 'scalar' },
    rightPadding: { kind: 'scalar' },
    globalScroll: { kind: 'scalar', default: true },
    shiftScroll: { kind: 'scalar', default: false },
    proximityRange: { kind: 'scalar' },
    proximityDebounce: { kind: 'scalar' },
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
      vertPadding: c.vertPadding, horPadding: c.horPadding,
      topPadding: c.topPadding, bottomPadding: c.bottomPadding,
      leftPadding: c.leftPadding, rightPadding: c.rightPadding,
      disableEasing: c.disableEasing, disableDynamicRendering: c.disableDynamicRendering,
      globalScroll: c.globalScroll, shiftScroll: c.shiftScroll,
      proximityRange: c.proximityRange, proximityDebounce: c.proximityDebounce,
    };
  },
  signalMap: () => ({
    scroll: (v: any) => ({ value: v }),
  }),
  postCreate: (inst: any, c: any) => {
    if (typeof inst.addItems === 'function') {
      try { inst.addItems(c.__resolved_items ?? []); } catch (_) {}
    }
    if (typeof inst.list?.arrangeChildren === 'function') inst.list.arrangeChildren();
    if (typeof inst.resize === 'function') {
      try { inst.resize(); } catch (_) {}
    }
  },
  syncOnChange: (inst: any, c: any) => {
    applyOptionalSize(inst, c);
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
    width: { kind: 'scalar', inspector: { name: 'width', type: 'number' } },
    height: { kind: 'scalar', inspector: { name: 'height', type: 'number' } },
    radius: { kind: 'scalar', default: 4 },
    visibleItems: { kind: 'scalar' },
    itemWidth: { kind: 'scalar' },
    itemHeight: { kind: 'scalar' },
    itemBackgroundColor: { kind: 'scalar', default: 0x000000 },
    itemHoverColor: { kind: 'scalar', default: 0x666666 },
    selectedTextOffset: { kind: 'shallowMerge', default: {} },
    scrollBox: { kind: 'shallowMerge', default: {} },
    textClass: { kind: 'scalar', default: 'text' },
    open: { kind: 'scalar', default: false },
    bindToStore: BIND_STORE,
  },
  views: {
    kind: 'object', folder: '__select_views__', keys: [],
  },
  optionsBuilder: (c: any) => ({
    closedBG: c.__resolved_closedView,
    openBG: c.__resolved_openView,
    textStyle: c.textStyle,
    TextClass: c.textClass === 'html' ? PixiHTMLText : undefined,
    selectedTextOffset: c.selectedTextOffset,
    items: {
      items: (c.items ?? []).map((it: any) => it.text),
      backgroundColor: c.itemBackgroundColor,
      hoverColor: c.itemHoverColor,
      width: c.itemWidth ?? c.width ?? 200,
      height: c.itemHeight ?? c.height ?? 30,
      textStyle: c.textStyle,
      TextClass: c.textClass === 'html' ? PixiHTMLText : undefined,
      radius: c.radius,
    },
    selected: c.selectedIndex >= 0 ? c.selectedIndex : undefined,
    visibleItems: c.visibleItems,
    scrollBox: {
      width: c.width,
      height: c.height && c.visibleItems ? c.height * c.visibleItems : undefined,
      radius: c.radius,
      ...c.scrollBox,
    },
    nineSliceSprite: c.nineSliceSprite,
  }),
  postCreate: (inst: any, c: any) => {
    if (c.open && typeof inst.open === 'function') inst.open();
  },
  signalMap: (c: any) => ({
    select: (value: number, text: string) => {
      c.selectedIndex = value; c.selectCount += 1;
      return { index: value, text };
    },
  }),
  syncOnChange: (inst: any, c: any) => {
    if (c.open && typeof inst.open === 'function') inst.open();
    if (!c.open && typeof inst.close === 'function') inst.close();
  },
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
    titleStyle: { kind: 'shallowMerge', default: {} },
    content: { kind: 'scalar' },
    contentStyle: { kind: 'shallowMerge', default: {} },
    contentButtons: { kind: 'arrayCopy', default: [] },
    contentCheckBoxes: { kind: 'arrayCopy', default: [] },
    buttons: { kind: 'arrayCopy', default: [] },
    buttonList: { kind: 'shallowMerge', default: {} },
    buttonListOffset: { kind: 'shallowMerge', default: {} },
    scrollBox: { kind: 'shallowMerge', default: {} },
    animations: { kind: 'opaque' },
    bindToStore: BIND_STORE,
  },
  optionsBuilder: (c: any) => {
    const background = c.nineSliceSprite && c.backgroundView && 'texture' in c.backgroundView
      ? c.backgroundView.texture
      : (c.__resolved_background_view ?? new PixiContainer());
    return {
      backdrop: c.__resolved_backdropView,
      backdropColor: backdropColorToNumber(c.backdropColor),
      backdropAlpha: c.backdropAlpha,
      background,
      title: makeDialogText(c.title, c.titleStyle),
      content: makeDialogContent(c),
      buttons: makeDialogButtons(c.buttons),
      buttonList: c.buttonList,
      scrollBox: c.scrollBox,
      width: c.width, height: c.height, padding: c.padding,
      closeOnBackdropClick: c.closeOnBackdropClick,
      nineSliceSprite: c.nineSliceSprite,
      animations: c.animations,
    };
  },
  postCreate: (inst: any, c: any) => {
    alignDialogAnchoredContent(inst, c);
    if (c.open && typeof inst.open === 'function') inst.open();
  },
  applySize: applyDialogSize,
  onAttachedExtra: (inst: any, c: any, go: any) => {
    wireDialogContentButtonPresses(inst, c, go);
  },
  signalMap: (c: any) => ({
    close: () => { c.open = false; return {}; },
    select: (idx: number, text: string) => ({ index: idx, text }),
  }),
  syncOnChange: (inst: any, c: any) => {
    alignDialogAnchoredContent(inst, c);
    if (c.open && !inst.isOpen && typeof inst.open === 'function') inst.open();
    else if (!c.open && inst.isOpen && typeof inst.close === 'function') inst.close();
  },
};

function applyDialogSize(inst: any, size: UiRenderSize, c: any): void {
  const width = readPositiveSize(size.width ?? c.width ?? inst?.options?.width);
  const height = readPositiveSize(size.height ?? c.height ?? inst?.options?.height);
  if (width === undefined && height === undefined) return;

  inst.options = inst.options ?? {};
  if (width !== undefined) inst.options.width = width;
  if (height !== undefined) inst.options.height = height;

  const dialogWidth = width ?? (Number(inst.options.width) || Number(inst.innerView?.width) || 0);
  const dialogHeight = height ?? (Number(inst.options.height) || Number(inst.innerView?.height) || 0);
  const padding = Number(c.padding ?? inst.options.padding ?? 20) || 20;

  if (inst.innerView) {
    if (width !== undefined) inst.innerView.width = width;
    if (height !== undefined) inst.innerView.height = height;
    if ('anchor' in inst.innerView && inst.innerView.anchor?.set) {
      inst.innerView.anchor.set(0.5, 0.5);
    } else {
      try { inst.innerView.pivot?.set?.(dialogWidth / 2, dialogHeight / 2); } catch (_) {}
    }
  }

  if (inst.titleText) {
    inst.titleText.x = dialogWidth / 2;
    inst.titleText.y = padding;
  }

  const titleHeight = Number(inst.titleText?.height) || 0;
  const buttonHeight = Number(inst.buttonContainer?.height) || 0;
  if (inst.buttonContainer) {
    inst.buttonContainer.x = dialogWidth / 2 - ((Number(inst.buttonContainer.width) || 0) / 2);
    inst.buttonContainer.y = dialogHeight - padding - buttonHeight;
  }

  if (inst.scrollBox) {
    inst.scrollBox.x = padding;
    inst.scrollBox.y = padding + titleHeight;
    const overrideSize = c.scrollBox?.size;
    const scrollWidth = readPositiveSize(overrideSize?.width) ?? Math.max(0, dialogWidth - (padding * 2));
    const scrollHeight = readPositiveSize(overrideSize?.height)
      ?? Math.max(0, dialogHeight - (padding * 2) - titleHeight - buttonHeight);
    if (typeof inst.scrollBox.setSize === 'function') inst.scrollBox.setSize(scrollWidth, scrollHeight);
    else {
      inst.scrollBox.width = scrollWidth;
      inst.scrollBox.height = scrollHeight;
    }
    try { inst.scrollBox.resize?.(true); } catch (_) {}
  }

  alignDialogAnchoredContent(inst, { ...c, width: dialogWidth, height: dialogHeight });
}

function readPositiveSize(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function alignDialogAnchoredContent(
  inst: any,
  c: {
    width?: number;
    height?: number;
    buttonListOffset?: { x?: number; y?: number };
    scrollBox?: { offset?: { x?: number; y?: number }; size?: { width?: number; height?: number } };
  },
): void {
  const innerView = inst?.innerView;
  const contentView = inst?.contentView;
  if (innerView?.anchor && contentView && c.width && c.height) {
    contentView.x = -c.width / 2;
    contentView.y = -c.height / 2;
  }
  applyDialogOffset(inst, 'buttonListOffset', inst.buttonContainer, c.buttonListOffset);
  applyDialogOffset(inst, 'scrollBoxOffset', inst.scrollBox, c.scrollBox?.offset);
  applyDialogScrollBoxSize(inst, c.scrollBox?.size);
}

function applyDialogOffset(
  inst: any,
  key: string,
  target: { x: number; y: number } | undefined,
  nextOffset: { x?: number; y?: number } | undefined,
): void {
  if (!target) return;
  const applied = inst.__evaDialogAppliedOffsets ?? {};
  const prev = applied[key] ?? { x: 0, y: 0 };
  const next = { x: nextOffset?.x ?? 0, y: nextOffset?.y ?? 0 };
  target.x += next.x - prev.x;
  target.y += next.y - prev.y;
  inst.__evaDialogAppliedOffsets = { ...applied, [key]: next };
}

function applyDialogScrollBoxSize(
  inst: any,
  nextSize: { width?: number; height?: number } | undefined,
): void {
  const scrollBox = inst?.scrollBox;
  if (!scrollBox) return;
  const base = inst.__evaDialogBaseScrollBoxSize ?? {
    width: scrollBox.width,
    height: scrollBox.height,
  };
  inst.__evaDialogBaseScrollBoxSize = base;
  const wasApplied = inst.__evaDialogAppliedScrollBoxSize;
  if (!nextSize && !wasApplied) return;
  const width = nextSize?.width ?? base.width;
  const height = nextSize?.height ?? base.height;
  if (typeof scrollBox.setSize === 'function') scrollBox.setSize(width, height);
  else {
    scrollBox.width = width;
    scrollBox.height = height;
  }
  if (typeof scrollBox.resize === 'function') scrollBox.resize(true);
  inst.__evaDialogAppliedScrollBoxSize = !!nextSize;
}

function makeDialogText(text: string | undefined, style?: Record<string, unknown>): any {
  if (text === undefined) return undefined;
  if (style && Object.keys(style).length > 0) {
    return new PixiText({ text, style: style as any });
  }
  return text;
}

function makeDialogContent(c: {
  content?: string;
  contentStyle?: Record<string, unknown>;
  contentButtons?: DialogButtonParams[];
  contentCheckBoxes?: DialogCheckBoxParams[];
  __dialogContentButtons?: Array<{ button: any; params: DialogButtonParams; index: number }>;
}): any {
  if (c.contentButtons?.length) {
    const records: Array<{ button: any; params: DialogButtonParams; index: number }> = [];
    const buttons = c.contentButtons.map((button, index) => {
      const pixiButton = new PixiFancyButton(makeDialogButtonOptions(button));
      applyOptionalSize(pixiButton, button);
      if (button.disabled !== undefined) pixiButton.enabled = !button.disabled;
      records.push({ button: pixiButton, params: button, index });
      return pixiButton;
    });
    c.__dialogContentButtons = records;
    return buttons;
  }
  if (c.contentCheckBoxes?.length) {
    return c.contentCheckBoxes.map((checkBox) => new PixiCheckBox(makeDialogCheckBoxOptions(checkBox)));
  }
  return makeDialogText(c.content, c.contentStyle);
}

function wireDialogContentButtonPresses(inst: any, c: any, go: any): void {
  const records = c.__dialogContentButtons;
  if (!Array.isArray(records) || records.length === 0 || inst.__evaDialogContentButtonPressesWired) return;
  inst.__evaDialogContentButtonPressesWired = true;
  inst.__evaDialogContentButtonPressCleanups = records.map((record) => {
    const signal = record.button?.onPress;
    if (!signal || typeof signal.connect !== 'function') return undefined;
    const conn = signal.connect(() => {
      const value = record.params.value ?? record.params.text ?? record.index;
      c.selectedContentIndex = record.index;
      c.selectedContentValue = value;
      c.selectCount = (c.selectCount ?? 0) + 1;
      c.lastSignal = 'select';
      emitDialogSelection(go, { index: record.index, text: String(record.params.text ?? ''), value });
      if (record.params.closeOnPress && typeof inst.close === 'function') inst.close();
      const reopenDelay = Number(record.params.reopenDelay);
      if (Number.isFinite(reopenDelay) && reopenDelay >= 0 && typeof inst.open === 'function') {
        setTimeout(() => {
          try { inst.open(); } catch (_) {}
        }, reopenDelay);
      }
    });
    return () => { try { conn.disconnect(); } catch (_) {} };
  }).filter(Boolean);
}

function emitDialogSelection(go: any, payload: { index: number; text: string; value: unknown }): void {
  const eventPayload = { entityName: go?.name, ...payload };
  try { go?.emit?.('select', eventPayload); } catch (_) {}
  try { go?.emit?.('dialog:select', eventPayload); } catch (_) {}
  const mx: any = (typeof globalThis !== 'undefined' ? (globalThis as any).mx : undefined);
  if (mx?.event?.emit) {
    try { mx.event.emit('dialog:select', eventPayload); } catch (_) {}
  }
}

function makeDialogButtons(buttons: DialogButtonParams[] | undefined): any[] | undefined {
  if (!buttons?.length) return undefined;
  return buttons.map((button) => {
    const options = makeDialogButtonOptions(button);
    const shouldMaterialize = button.disabled !== undefined
      || !!(button.nineSliceSprite && (button.width !== undefined || button.height !== undefined));
    if (button.kind === 'button' || !shouldMaterialize) return options;
    const pixiButton = new PixiFancyButton(options);
    applyOptionalSize(pixiButton, button);
    pixiButton.enabled = !button.disabled;
    return pixiButton;
  });
}

function makeDialogButtonOptions(button: DialogButtonParams): any {
  if (button.kind === 'button') return makeDialogBareButton(button);
  const width = button.width ?? 110;
  const height = button.height ?? 48;
  const radius = button.radius ?? 12;
  const color = button.color ?? pixiStoryDefaultButtonColor;
  return {
    text: makeDialogText(button.text, button.textStyle),
    defaultView: resolveDialogButtonView(button.defaultView) ?? makeDialogButtonView(width, height, radius, color),
    hoverView: resolveDialogButtonView(button.hoverView) ?? makeDialogButtonView(width, height, radius, button.hoverColor ?? color),
    pressedView: resolveDialogButtonView(button.pressedView) ?? makeDialogButtonView(width, height, radius, button.pressedColor ?? color),
    disabledView: resolveDialogButtonView(button.disabledView) ?? (button.disabledColor ? makeDialogButtonView(width, height, radius, button.disabledColor) : undefined),
    nineSliceSprite: button.nineSliceSprite,
    enabled: button.disabled === undefined ? undefined : !button.disabled,
    animations: button.animations,
  };
}

function resolveDialogButtonView(view: string | undefined): any {
  return view ? getTextureView(view) : undefined;
}

const pixiStoryDefaultButtonColor = '#e91e63';
const pixiStoryDefaultTextColor = '#ffffff';

function makeDialogButtonView(width: number, height: number, radius: number, color: number | string): PixiGraphics {
  return new PixiGraphics()
    .roundRect(0, 0, width, height, radius)
    .fill(color as any);
}

function makeDialogBareButton(button: DialogButtonParams): any {
  const width = button.width ?? 110;
  const height = button.height ?? 48;
  const radius = button.radius ?? 12;
  const view = makeDialogButtonView(width, height, radius, button.color ?? pixiStoryDefaultButtonColor);
  const label = makeDialogText(button.text, button.textStyle);
  if (label) {
    label.x = width / 2;
    label.y = height / 2;
    try { label.anchor?.set?.(0.5); } catch (_) {}
    view.addChild(label);
  }
  const pixiButton = new PixiBareButton(view);
  if (button.disabled !== undefined) pixiButton.enabled = !button.disabled;
  return pixiButton;
}

function makeDialogCheckBoxOptions(checkBox: DialogCheckBoxParams): any {
  const size = checkBox.size ?? 30;
  const radius = checkBox.radius ?? 5;
  const strokeColor = checkBox.strokeColor ?? pixiStoryDefaultTextColor;
  const strokeWidth = checkBox.strokeWidth ?? 2;
  return {
    style: {
      unchecked: new PixiGraphics()
        .roundRect(0, 0, size, size, radius)
        .fill((checkBox.uncheckedColor ?? '#3e3f40') as any)
        .stroke({ color: strokeColor as any, width: strokeWidth }),
      checked: new PixiGraphics()
        .roundRect(0, 0, size, size, radius)
        .fill((checkBox.checkedColor ?? pixiStoryDefaultButtonColor) as any)
        .stroke({ color: strokeColor as any, width: strokeWidth }),
      text: checkBox.textStyle,
    },
    text: checkBox.text,
    checked: checkBox.checked,
  };
}

const MASKED_FRAME_DEF: ComponentDefinition<MaskedFrameParams> = {
  name: 'MaskedFrame',
  signalPrefix: 'maskedframe',
  pixiClass: PixiMaskedFrame,
  fields: {
    targetView: { kind: 'opaque' },
    maskView: { kind: 'opaque' },
    borderView: { kind: 'opaque' },
    borderWidth: { kind: 'scalar', default: 0, inspector: { name: 'borderWidth', type: 'number' } },
    borderColor: { kind: 'scalar', default: 0x000000, inspector: { name: 'borderColor', type: 'color' } },
  },
  optionsBuilder: (c: any) => ({
    target: c.__resolved_target_view,
    mask: c.__resolved_mask_view,
    borderWidth: c.borderWidth,
    borderColor: c.borderColor,
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
