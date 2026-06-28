export { BehaviorScript } from './BehaviorScript';
export type { BehaviorScriptInitFlat } from './BehaviorScript';
export {
  assertScriptIdValid,
  isScriptIdShapeValid,
  normalizePropsArrayToSchema,
  RESERVED_BUILTIN_COMPONENT_NAMES,
  BehaviorScriptIdError,
} from './props-schema';
export type {
  AssetRefSchema,
  ArraySchema,
  BehaviorPropSchema,
  BehaviorPropsSchema,
  BooleanSchema,
  ColorSchema,
  EntityRefSchema,
  EnumSchema,
  IntegerSchema,
  NodeRefSchema,
  NumberSchema,
  ObjectSchema,
  RefSchema,
  SignalRefSchema,
  StorePathSchema,
  StringSchema,
  UnionSchema,
  Vec2Schema,
} from './props-schema';
export { exportScriptCatalog } from './catalog-export';
export type { BehaviorScriptCatalogExport } from './catalog-export';
export { BehaviorScriptSystem } from './BehaviorScriptSystem';
export { createBehaviorScriptBinding, resolveBehaviorScriptProps, validateBehaviorScriptBinding } from './binding';
export {
  createBehaviorScriptCodeFrame,
  createBehaviorScriptDiagnostic,
  parseBehaviorScriptStackLocation,
  resolveBehaviorScriptDiagnosticSource,
} from './diagnostics';
export { createBehaviorScriptExtension, createBehaviorScriptDslExtension } from './extension';
export type { BehaviorScriptDslExtensionConfig } from './extension';
export { behaviorValueTypeToInspectorType, createBehaviorScriptInspectorMetadata } from './inspector';
export {
  DEFAULT_BEHAVIOR_LIFECYCLE_HINTS,
  defineBehaviorScript,
  getBehaviorScriptManifest,
  normalizeBehaviorScriptManifest,
  validateBehaviorScriptManifest,
} from './manifest';
export { BehaviorScriptRegistry } from './registry';
export { behaviorValueTypeToTypescript, createBehaviorScriptTypeHints } from './type-hints';
export {
  deriveBehaviorScriptValidationPlan,
  runBehaviorScriptValidation,
  runBehaviorScriptValidationAsync,
  validateBehaviorScript,
  validateBehaviorScriptAsync,
} from './validation';
export { createBehaviorScriptWorkflow } from './workflow';
export type { BehaviorScriptPluginStruct } from './extension';
export type { BehaviorScriptInspectorFieldMetadata, BehaviorScriptInspectorOptions } from './inspector';
export type {
  BehaviorScriptBindingIssue,
  BehaviorScriptBindingOptions,
  BehaviorScriptBindingValidationOptions,
  BehaviorScriptDslComponent,
} from './binding';
export type { BehaviorScriptDiagnosticOptions, BehaviorScriptStackLocation } from './diagnostics';
export type {
  BehaviorScriptCompletionEntry,
  BehaviorScriptTypeHintKind,
  BehaviorScriptTypeHintOptions,
  BehaviorScriptTypeHints,
} from './type-hints';
export type {
  BehaviorEnumOption,
  BehaviorEventHint,
  BehaviorGroupHint,
  BehaviorInputHint,
  BehaviorLifecycleHint,
  BehaviorManifestIssue,
  BehaviorNodeHint,
  BehaviorPropertyHint,
  BehaviorResourceHint,
  BehaviorScriptDefinition,
  BehaviorScriptFlatDefinition,
  BehaviorScriptLegacyDefinition,
  BehaviorScriptManifest,
  BehaviorSignalHint,
  BehaviorValueType,
} from './manifest';
export type {
  BehaviorScriptValidationAssertion,
  BehaviorScriptDerivedValidationPlan,
  BehaviorScriptValidationAutoPlanOptions,
  BehaviorScriptValidationContext,
  BehaviorScriptValidationError,
  BehaviorScriptValidationEventTarget,
  BehaviorScriptValidationMissingNode,
  BehaviorScriptValidationMissingResource,
  BehaviorScriptValidationPlan,
  BehaviorScriptValidationReport,
  BehaviorScriptValidationResult,
  BehaviorScriptValidationStep,
} from './validation';
export type { BehaviorScriptWorkflowOptions, BehaviorScriptWorkflowResult } from './workflow';
export type {
  BehaviorContext,
  BehaviorCleanupDisposer,
  BehaviorCleanupHandle,
  BehaviorDomEventTarget,
  BehaviorEmitterTarget,
  BehaviorEventHandle,
  BehaviorEventListener,
  BehaviorEventTarget,
  BehaviorFixedFrame,
  BehaviorInputEvent,
  BehaviorScriptAsyncResult,
  BehaviorScriptDiagnostic,
  BehaviorScriptFactory,
  BehaviorScriptHotReloadOptions,
  BehaviorScriptCatalog,
  BehaviorScriptCatalogEntry,
  BehaviorScriptModule,
  BehaviorScriptModuleRegistration,
  BehaviorScriptNodeResolution,
  BehaviorScriptParams,
  BehaviorScriptPauseMode,
  BehaviorScriptPhase,
  BehaviorScriptPluginConfig,
  BehaviorScriptReloadOptions,
  BehaviorScriptRegistryChange,
  BehaviorScriptRegistryChangeHandle,
  BehaviorScriptRegistryChangeListener,
  BehaviorScriptRegistryLike,
  BehaviorScriptResourceResolution,
  BehaviorScriptRunMode,
  BehaviorScriptRuntimeSnapshot,
  BehaviorScriptRuntimeSnapshotEntry,
  BehaviorScriptRuntimeStatus,
  BehaviorScriptSource,
  BehaviorScriptSystemPauseMode,
  BehaviorScriptSystemParams,
  EvaBehaviorScript,
} from './types';
