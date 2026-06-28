import type { Component, Game, GameObject, System, UpdateParams } from '@eva/eva.js';
import type { SignalHandle, SignalListener } from '@eva/plugin-signal-bus';
import type { BehaviorScriptManifest } from './manifest';

export interface BehaviorScriptSource {
  uri?: string;
  exportName?: string;
  line?: number;
  column?: number;
  content?: string;
}

export interface BehaviorScriptHotReloadOptions {
  enabled?: boolean;
  keepState?: boolean;
}

export interface BehaviorScriptReloadOptions {
  keepState?: boolean;
  force?: boolean;
  rollbackOnError?: boolean;
}

export type BehaviorScriptRunMode = 'play' | 'edit';
export type BehaviorScriptPauseMode = 'inherit' | 'stop' | 'process';
export type BehaviorScriptSystemPauseMode = Exclude<BehaviorScriptPauseMode, 'inherit'>;

export interface BehaviorScriptParams<Props extends Record<string, any> = Record<string, any>> {
  scriptId?: string;
  props?: Props;
  source?: BehaviorScriptSource;
  hotReload?: BehaviorScriptHotReloadOptions;
  enabled?: boolean;
  priority?: number;
  groups?: string[];
  nodes?: Record<string, string>;
  resources?: Record<string, string>;
  executeInEditMode?: boolean;
  pauseMode?: BehaviorScriptPauseMode;
}

export type BehaviorScriptPhase =
  | 'factory'
  | 'setup'
  | 'restoreState'
  | 'enterTree'
  | 'ready'
  | 'process'
  | 'lateProcess'
  | 'physicsProcess'
  | 'input'
  | 'unhandledInput'
  | 'event'
  | 'signal'
  | 'timer'
  | 'propsChanged'
  | 'enable'
  | 'disable'
  | 'enabledChanged'
  | 'groupCall'
  | 'pause'
  | 'resume'
  | 'cleanup'
  | 'sceneSwitch'
  | 'serializeState'
  | 'exitTree'
  | 'destroy';

/**
 * Context passed to `onSceneSwitch` when DSL switches the active scene.
 *
 * `fromSceneId` / `toSceneId` may both be undefined during the very first
 * `createScene` boot, where there is no previous scene yet. Scripts living
 * on `globalEntities` (e.g. `gameDirector`, `metaFlowFsm`, `bulletSpawner`)
 * should use this hook to drop per-scene caches / counters before the new
 * scene's children come online.
 */
export interface BehaviorSceneSwitchContext {
  fromSceneId?: string;
  toSceneId?: string;
}

export interface BehaviorScriptDiagnostic {
  id: string;
  severity: 'error' | 'warning';
  scriptId: string;
  phase: BehaviorScriptPhase;
  message: string;
  stack?: string;
  timestamp: number;
  gameObjectName?: string;
  componentName: 'BehaviorScript';
  source?: BehaviorScriptSource;
  codeFrame?: string;
}

export interface BehaviorInputEvent<Payload = any> {
  action?: string;
  phase?: 'press' | 'release' | 'hold' | 'move' | 'cancel' | 'custom';
  source?: string;
  payload?: Payload;
  originalEvent?: any;
  handled?: boolean;
  timestamp?: number;
}

export interface BehaviorFixedFrame {
  deltaTime: number;
  fixedDeltaTime: number;
  step: number;
  time?: number;
}

export interface BehaviorSignalBridge {
  emit<T = any>(name: string, payload?: T): void;
  on<T = any>(name: string, listener: SignalListener<T>): SignalHandle;
  once<T = any>(name: string, listener: SignalListener<T>): SignalHandle;
  off<T = any>(name: string, listener?: SignalListener<T>): void;
}

export type BehaviorEventListener<T = any> = (payload: T, ...args: any[]) => void;

export interface BehaviorEventHandle {
  dispose(): void;
}

export type BehaviorCleanupDisposer = (() => void) | { dispose(): void } | { destroy(): void };

export interface BehaviorCleanupHandle {
  dispose(): void;
}

export interface BehaviorEmitterTarget {
  on?(name: string, listener: (...args: any[]) => void): any;
  off?(name: string, listener: (...args: any[]) => void): any;
  removeListener?(name: string, listener: (...args: any[]) => void): any;
  emit?(name: string, payload?: any): any;
}

export interface BehaviorDomEventTarget {
  addEventListener?(name: string, listener: (...args: any[]) => void): any;
  removeEventListener?(name: string, listener: (...args: any[]) => void): any;
  dispatchEvent?(event: Event): any;
}

export type BehaviorEventTarget = BehaviorEmitterTarget | BehaviorDomEventTarget;

export interface BehaviorScriptNodeResolution {
  name: string;
  path: string;
  resolved: boolean;
  gameObjectName?: string;
  required?: boolean;
  multiple?: boolean;
}

export interface BehaviorScriptResourceResolution {
  name: string;
  resource: string;
  available: boolean;
  loaded?: boolean;
  type?: string;
  required?: boolean;
  preload?: boolean;
}

export interface BehaviorContext<Props extends Record<string, any> = Record<string, any>> {
  scriptId: string;
  props: Props;
  component: Component;
  gameObject?: GameObject;
  game?: Game;
  system: System;
  runMode: BehaviorScriptRunMode;
  isEnabled(): boolean;
  getPriority(): number;
  getGroups(): string[];
  isInGroup(group: string): boolean;
  addToGroup(group: string): void;
  removeFromGroup(group: string): void;
  callGroup(group: string, method: string, ...args: any[]): number;
  getNode(refOrPath: string): GameObject | undefined;
  getRequiredNode(refOrPath: string): GameObject;
  getNodes(refOrPath: string): GameObject[];
  getResourceName(refOrName: string): string;
  hasResource(refOrName: string): boolean;
  loadResource<T = any>(refOrName: string): Promise<T | undefined>;
  loadRequiredResource<T = any>(refOrName: string): Promise<T>;
  isPaused(): boolean;
  getPauseMode(): BehaviorScriptSystemPauseMode;
  signals: BehaviorSignalBridge;
  onSignal<T = any>(name: string, listener: SignalListener<T>): SignalHandle;
  emitSignal<T = any>(name: string, payload?: T): void;
  onEvent<T = any>(target: BehaviorEventTarget, name: string, listener: BehaviorEventListener<T>): BehaviorEventHandle;
  emitEvent<T = any>(target: BehaviorEventTarget, name: string, payload?: T): void;
  addDisposer(disposer: BehaviorCleanupDisposer): BehaviorCleanupHandle;
  setTimeout(listener: () => void, delay: number): BehaviorCleanupHandle;
  setInterval(listener: () => void, delay: number): BehaviorCleanupHandle;
  reportDiagnostic(diagnostic: Omit<BehaviorScriptDiagnostic, 'id' | 'timestamp' | 'componentName'>): void;
  /**
   * ADR-0024B — 跨 plugin 直链 API:在 BehaviorScript factory 内一行
   * "attach 到指定 entity 的 StateMachine"。
   *
   * Replace 旧 alert-chase.json 类 Trigger callMethod 模板的 8 条配置(状态切
   * BehaviorScript.enabled 的 hidden broken state)— 一行 ctx.fsm.attach 即可。
   */
  fsm: BehaviorFsmBridge;
}

/**
 * ADR-0024B — BehaviorScript ↔ StateMachine 直链桥接。
 *
 * 通过 attach 把当前脚本 instance 绑定到指定 entity 上的 StateMachine,
 * 返回 handle:
 *   - `detach()`            — 取消绑定(`onDestroy` 时自动调用,user 通常不用手动调)
 *   - `getFsm()`            — 取真实 StateMachine 实例(查不到时返回 null)
 *   - `reset()`             — 主动调 fsm.reset()
 *   - `goto(to, opts)`      — 主动调 fsm.goto()
 *
 * attach 时机:setup / ready hook 内调用,framework 通过 `record.cleanupHandles`
 * 在 detach 时自动 dispose(避免泄漏)。
 */
export interface BehaviorFsmBridge {
  attach(
    entityName: string,
    fsmName?: string,
    options?: BehaviorFsmAttachOptions,
  ): BehaviorFsmAttachHandle;
}

export interface BehaviorFsmAttachOptions {
  /**
   * 目标实体 / FSM 不存在时的行为(ADR-0024B):
   *   - `'wait'`  — attach 返回延迟 handle,FSM 出现前不抛错;getFsm() 返回 null
   *   - `'warn'`  — 立即 console.warn 一次(默认行为,兼容性最好)
   *   - `'throw'` — 立即抛 Error(strict 模式,适合开发期严格检查)
   *
   * 默认 'warn'。
   */
  onMissing?: 'wait' | 'warn' | 'throw';
  /**
   * 同 entity 同 componentName 多 StateMachine 实例时的实例区分符
   * (复用 ADR-0021 BehaviorScript `ref` 字段命名约定)。
   */
  ref?: string;
}

export interface BehaviorFsmAttachHandle {
  getFsm(): any | null;
  reset(payload?: any): void;
  goto(to: string, opts?: string | Record<string, any>): void;
  detach(): void;
}

export interface EvaBehaviorScript<Props extends Record<string, any> = Record<string, any>, State = any> {
  [method: string]: any;
  setup?(context: BehaviorContext<Props>): BehaviorScriptAsyncResult;
  enterTree?(): BehaviorScriptAsyncResult;
  ready?(): BehaviorScriptAsyncResult;
  process?(frame: UpdateParams): BehaviorScriptAsyncResult;
  lateProcess?(frame: UpdateParams): BehaviorScriptAsyncResult;
  physicsProcess?(frame: BehaviorFixedFrame): BehaviorScriptAsyncResult;
  input?(event: BehaviorInputEvent): BehaviorScriptAsyncResult;
  unhandledInput?(event: BehaviorInputEvent): BehaviorScriptAsyncResult;
  onSignal?(name: string, payload?: any): BehaviorScriptAsyncResult;
  onEvent?(name: string, payload?: any, target?: BehaviorEventTarget): BehaviorScriptAsyncResult;
  propsChanged?(props: Props, previousProps: Props): BehaviorScriptAsyncResult;
  enable?(): BehaviorScriptAsyncResult;
  disable?(): BehaviorScriptAsyncResult;
  enabledChanged?(enabled: boolean, previousEnabled: boolean): BehaviorScriptAsyncResult;
  pause?(): BehaviorScriptAsyncResult;
  resume?(): BehaviorScriptAsyncResult;
  onSceneSwitch?(ctx: BehaviorSceneSwitchContext): BehaviorScriptAsyncResult;
  exitTree?(): BehaviorScriptAsyncResult;
  destroy?(): BehaviorScriptAsyncResult;
  serializeState?(): State;
  restoreState?(state: State): BehaviorScriptAsyncResult;
}

export interface BehaviorScriptFactoryMeta {
  manifest?: BehaviorScriptManifest;
}

export type BehaviorScriptFactory<Props extends Record<string, any> = Record<string, any>, State = any> = ((
  context: BehaviorContext<Props>,
) => EvaBehaviorScript<Props, State>) &
  BehaviorScriptFactoryMeta;

export interface BehaviorScriptRegistryLike {
  registerScript(scriptId: string, factory: BehaviorScriptFactory, sourceUri?: string): BehaviorScriptFactory;
  unregisterScript(scriptId: string): void;
  hasScript(scriptId: string): boolean;
  getFactory(scriptId: string): BehaviorScriptFactory | undefined;
  getManifest(scriptId: string): BehaviorScriptManifest | undefined;
  getManifests(): BehaviorScriptManifest[];
  registerModule?(module: BehaviorScriptModule): BehaviorScriptModuleRegistration;
  registerModules?(modules: BehaviorScriptModule[]): BehaviorScriptModuleRegistration[];
  getCatalog?(): BehaviorScriptCatalog;
  onDidChange?(listener: BehaviorScriptRegistryChangeListener): BehaviorScriptRegistryChangeHandle;
  getScriptIds?(): string[];
  getSourceUri?(scriptId: string): string | undefined;
  clear?(): void;
}

export interface BehaviorScriptRegistryChange {
  type: 'register' | 'unregister' | 'clear';
  scriptId?: string;
  factory?: BehaviorScriptFactory;
  manifest?: BehaviorScriptManifest;
  sourceUri?: string;
}

export type BehaviorScriptRegistryChangeListener = (change: BehaviorScriptRegistryChange) => void;

export interface BehaviorScriptRegistryChangeHandle {
  dispose(): void;
}

export interface BehaviorScriptModule {
  uri?: string;
  exports: Record<string, any> | any[];
}

export interface BehaviorScriptModuleRegistration {
  uri?: string;
  registered: string[];
  skipped: string[];
}

export interface BehaviorScriptCatalogEntry {
  scriptId: string;
  manifest?: BehaviorScriptManifest;
  sourceUri?: string;
}

export interface BehaviorScriptCatalog {
  scripts: BehaviorScriptCatalogEntry[];
}

export type BehaviorScriptRuntimeStatus = 'bound' | 'deferred';

export interface BehaviorScriptRuntimeSnapshotEntry {
  status: BehaviorScriptRuntimeStatus;
  scriptId: string;
  gameObjectName?: string;
  source?: BehaviorScriptSource;
  manifest?: BehaviorScriptManifest;
  bound: boolean;
  deferred: boolean;
  active: boolean;
  enabled: boolean;
  priority: number;
  groups: string[];
  nodes: BehaviorScriptNodeResolution[];
  resources: BehaviorScriptResourceResolution[];
  order?: number;
  runMode: BehaviorScriptRunMode;
  paused: boolean;
  pauseMode: BehaviorScriptSystemPauseMode;
  componentPauseMode: BehaviorScriptPauseMode;
  executeInEditMode: boolean;
  hotReload: BehaviorScriptHotReloadOptions;
  diagnostics: number;
  errors: number;
  warnings: number;
}

export interface BehaviorScriptRuntimeSnapshot {
  runMode: BehaviorScriptRunMode;
  paused: boolean;
  defaultPauseMode: BehaviorScriptSystemPauseMode;
  catalog: BehaviorScriptCatalog;
  diagnostics: BehaviorScriptDiagnostic[];
  scripts: BehaviorScriptRuntimeSnapshotEntry[];
}

export interface BehaviorScriptSystemParams {
  scripts?: Record<string, BehaviorScriptFactory>;
  scriptModules?: BehaviorScriptModule[];
  registry?: BehaviorScriptRegistryLike;
  eventTargets?: Record<string, BehaviorEventTarget>;
  runMode?: BehaviorScriptRunMode;
  defaultPauseMode?: BehaviorScriptSystemPauseMode;
  autoReload?: boolean;
  failFast?: boolean;
  onDiagnostic?: (diagnostic: BehaviorScriptDiagnostic) => void;
}

export interface BehaviorScriptPluginConfig extends BehaviorScriptSystemParams {}

export interface BehaviorScriptRuntimeBinding {
  instance: EvaBehaviorScript;
  dispose(): void;
}

export type BehaviorScriptAsyncResult<T = any> = T | Promise<T>;
