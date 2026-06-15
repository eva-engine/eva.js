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

// MVP v0.1 components
export { default as ProgressBar } from './components/progress-bar';
export { default as ProgressBarSystem } from './systems/progress-bar-system';
export type { ProgressBarParams, ProgressBarFillMode, ProgressBarLayerStyle } from './components/progress-bar';

export { default as FancyButton } from './components/fancy-button';
export { default as FancyButtonSystem } from './systems/fancy-button-system';
export type { FancyButtonParams, FancyButtonState, FancyButtonStateStyle } from './components/fancy-button';
