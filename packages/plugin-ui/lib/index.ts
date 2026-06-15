export { default as UI } from './component';
export { default as UISystem } from './system';
export { UIShapeType } from './component';
export type {
  UIParams,
  UIComponentParams,
  UIStyle,
  RectStyle,
  CircleStyle,
  EllipseStyle,
  RoundedRectStyle,
  UIShape,
} from './component';

// Phase 0 验收 stub。MVP 起会被真实组件替换。
export { default as PluginUiStub } from './stub';
export type { PluginUiStubParams, PluginUiStubStateStyle } from './stub';
