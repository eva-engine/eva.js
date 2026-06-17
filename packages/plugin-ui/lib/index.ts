// @eva/plugin-ui v2 — based on @pixi/ui v2.x
//
// 16 个 ECS Component:
//   - UI(基础形状,@pixi/ui 无对应,自渲染走 @eva/plugin-renderer-graphics)
//   - 14 个 @pixi/ui factory wrapper(metadata-driven,from ./components):
//       Button / FancyButton / CheckBox / Switcher
//       ProgressBar / CircularProgressBar / Slider / DoubleSlider
//       Input / List / ScrollBox / Select / Dialog / MaskedFrame
//   - RadioGroup(独立保留,跨实体协调)

// === UI(基础形状)===
export { default as UI } from './component';
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

// === @pixi/ui factory-generated wrappers ===
export {
  Button,
  FancyButton,
  CheckBox,
  Switcher,
  Slider,
  DoubleSlider,
  ProgressBar,
  CircularProgressBar,
  Input,
  List,
  ScrollBox,
  Select,
  Dialog,
  MaskedFrame,
  COMPONENT_DEFINITIONS,
} from './components';
export type {
  ButtonParams,
  FancyButtonParams,
  FancyButtonState,
  FancyButtonViewRefs,
  FancyButtonOffset,
  CheckBoxParams,
  CheckBoxStateStyle,
  SwitcherParams,
  SwitcherTriggerEvent,
  SliderParams,
  SliderOrientation,
  DoubleSliderParams,
  ProgressBarParams,
  ProgressBarFillPaddings,
  CircularProgressBarParams,
  InputParams,
  InputStyle,
  ListParams,
  ListType,
  ScrollBoxParams,
  ScrollDirection,
  SelectParams,
  SelectItem,
  DialogParams,
  MaskedFrameParams,
} from './components';

// === RadioGroup(独立)===
export { default as RadioGroup } from './radio-group';
export type { RadioGroupParams } from './radio-group';

// === Component factory(供下游扩展)===
export {
  defineUiComponent,
  PixiUiComponent,
} from './component-factory';
export type {
  ComponentDefinition,
  FieldKind,
  FieldSpec,
  ViewSchema,
  ResolvedViews,
} from './component-factory';

// === ViewRef DSL schema ===
export type { ViewRef, InlineShape } from './internal/view-resolver';

// === System ===
export { default as UISystem } from './system';

// === 兼容别名(历史代码 import { PluginUiSystem } from '@eva/plugin-ui')===
export { default as PluginUiSystem } from './system';
