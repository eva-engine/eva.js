import { OBSERVER_TYPE, System, decorators, resource as evaResource } from '@eva/eva.js';
import type { ComponentChanged, GameObject, UpdateParams } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import type { SignalHandle } from '@eva/plugin-signal-bus';
import { BehaviorScript } from './BehaviorScript';
import { createBehaviorScriptDiagnostic } from './diagnostics';
import { BehaviorScriptRegistry } from './registry';
import type { BehaviorEventHint, BehaviorScriptManifest } from './manifest';
import type {
  BehaviorFixedFrame,
  BehaviorCleanupDisposer,
  BehaviorCleanupHandle,
  BehaviorEventHandle,
  BehaviorEventListener,
  BehaviorEventTarget,
  BehaviorInputEvent,
  BehaviorSceneSwitchContext,
  BehaviorScriptCatalog,
  BehaviorScriptDiagnostic,
  BehaviorScriptFactory,
  BehaviorScriptModule,
  BehaviorScriptModuleRegistration,
  BehaviorScriptParams,
  BehaviorScriptPauseMode,
  BehaviorScriptPhase,
  BehaviorScriptReloadOptions,
  BehaviorScriptRegistryChange,
  BehaviorScriptRegistryChangeHandle,
  BehaviorScriptRegistryLike,
  BehaviorScriptNodeResolution,
  BehaviorScriptResourceResolution,
  BehaviorScriptRuntimeSnapshot,
  BehaviorScriptRuntimeSnapshotEntry,
  BehaviorScriptRunMode,
  BehaviorScriptSystemPauseMode,
  BehaviorScriptSystemParams,
  EvaBehaviorScript,
} from './types';

interface BoundBehaviorScript {
  component: BehaviorScript;
  scriptId: string;
  factory: BehaviorScriptFactory;
  sourceUri?: string;
  order: number;
  instance: EvaBehaviorScript;
  signalHandles: SignalHandle[];
  eventHandles: BehaviorEventHandle[];
  cleanupHandles: BehaviorCleanupHandle[];
  inputSignalKeys: Set<string>;
  lastProps: Record<string, any>;
  lastEnabled: boolean;
}

interface InputSignalSubscription {
  action: string;
  phase: BehaviorInputPhase;
  handle: SignalHandle;
  refs: number;
}

interface AttachOptions {
  restoredState?: any;
  keepDiagnostics?: boolean;
}

interface DetachOptions {
  keepDiagnostics?: boolean;
}

let diagnosticCounter = 0;
let recordOrderCounter = 0;
type BehaviorInputPhase = NonNullable<BehaviorInputEvent['phase']>;
const DEFAULT_INPUT_PHASES: BehaviorInputPhase[] = ['press', 'release', 'hold'];
const ACTIVE_BEHAVIOR_PHASES = new Set<BehaviorScriptPhase>([
  'process',
  'lateProcess',
  'physicsProcess',
  'input',
  'unhandledInput',
  'event',
  'signal',
  'timer',
  'groupCall',
]);

@decorators.componentObserver({
  BehaviorScript: [
    'scriptId',
    { prop: 'props', deep: true },
    { prop: 'hotReload', deep: true },
    'enabled',
    'priority',
    { prop: 'groups', deep: true },
    { prop: 'nodes', deep: true },
    { prop: 'resources', deep: true },
    'executeInEditMode',
    'pauseMode',
  ],
})
export class BehaviorScriptSystem extends System<BehaviorScriptSystemParams> {
  static systemName = 'BehaviorScript';
  readonly name = 'BehaviorScript';

  private registry: BehaviorScriptRegistryLike = new BehaviorScriptRegistry();
  private ownsRegistry = true;
  private registryChangeHandle?: BehaviorScriptRegistryChangeHandle;
  private suppressRegistryChange = false;
  private records = new Map<BehaviorScript, BoundBehaviorScript>();
  private inputSignalSubscriptions = new Map<string, InputSignalSubscription>();
  private eventTargets: Record<string, BehaviorEventTarget> = {};
  private deferredComponents = new Set<BehaviorScript>();
  private asyncTasks = new Set<Promise<void>>();
  private failFast = false;
  private onDiagnostic?: (diagnostic: BehaviorScriptDiagnostic) => void;
  private runMode: BehaviorScriptRunMode = 'play';
  private paused = false;
  private defaultPauseMode: BehaviorScriptSystemPauseMode = 'stop';
  private sceneChangedListener?: (payload: { scene?: any; fromSceneId?: any; toSceneId?: any }) => void;
  private lastKnownSceneId?: string;

  diagnostics: BehaviorScriptDiagnostic[] = [];

  init(params?: BehaviorScriptSystemParams) {
    this.registryChangeHandle?.dispose();
    this.registry = params?.registry ?? new BehaviorScriptRegistry();
    this.ownsRegistry = !params?.registry;
    if (params?.autoReload !== false) {
      this.registryChangeHandle = this.registry.onDidChange?.(change => this.onRegistryChange(change));
    }
    this.failFast = Boolean(params?.failFast);
    this.onDiagnostic = params?.onDiagnostic;
    this.eventTargets = params?.eventTargets ?? {};
    this.runMode = params?.runMode ?? 'play';
    this.defaultPauseMode = params?.defaultPauseMode ?? 'stop';
    this.paused = false;
    if (params?.scripts) {
      for (const scriptId of Object.keys(params.scripts)) {
        this.registerScript(scriptId, params.scripts[scriptId]);
      }
    }
    if (params?.scriptModules) {
      this.registerModules(params.scriptModules);
    }

    this.bindSceneSwitchListener();
  }

  /**
   * Subscribe to `game.on('dsl:scene-switch', ...)` so global-entity behavior
   * scripts (gameDirector / metaFlowFsm / bulletSpawner) can react to scene
   * boundaries without each writing its own SignalBus glue.
   *
   * **不监听 plugin-renderer 的 `'sceneChanged'`**:那是 LOAD_SCENE_MODE 协议事件,
   * mode 严格只 `SINGLE/MULTI_CANVAS`;DSL runtime emit 的是 `'dsl:scene-switch'`
   * 私有协议(参见 GlobalEntitiesManager.switchScene)。
   *
   * Resolution of `fromSceneId` / `toSceneId`:
   *   1. Prefer explicit `payload.fromSceneId` / `payload.toSceneId` from
   *      `GlobalEntitiesManager.switchScene(scene, ctx)`.
   *   2. Otherwise fall back to introspecting the scene GameObject — DSL
   *      runtime stamps `__evaDslSceneId` on the scene root in
   *      SceneManager.createScene, so the inferred toSceneId is the new scene.
   *   3. The very first boot has no previous scene, so fromSceneId remains
   *      `undefined`. This matches the documented BehaviorSceneSwitchContext.
   */
  private bindSceneSwitchListener(): void {
    if (!this.game || typeof (this.game as any).on !== 'function') return;

    this.sceneChangedListener = (payload: { scene?: any; fromSceneId?: any; toSceneId?: any }) => {
      const inferredToId =
        typeof payload?.toSceneId === 'string'
          ? payload.toSceneId
          : typeof payload?.scene?.__evaDslSceneId === 'string'
          ? payload.scene.__evaDslSceneId
          : undefined;
      const ctx: BehaviorSceneSwitchContext = {
        fromSceneId:
          typeof payload?.fromSceneId === 'string' ? payload.fromSceneId : this.lastKnownSceneId,
        toSceneId: inferredToId,
      };
      this.lastKnownSceneId = inferredToId ?? this.lastKnownSceneId;
      this.dispatchSceneSwitch(ctx);
    };

    (this.game as any).on('dsl:scene-switch', this.sceneChangedListener);
  }

  private dispatchSceneSwitch(ctx: BehaviorSceneSwitchContext): void {
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'sceneSwitch', () => record.instance.onSceneSwitch?.(ctx));
    }
  }

  registerScript(scriptId: string, factory: BehaviorScriptFactory, sourceUri?: string) {
    this.registry.registerScript(scriptId, factory, sourceUri);
  }

  registerModule(module: BehaviorScriptModule): BehaviorScriptModuleRegistration {
    if (!this.registry.registerModule) {
      throw new Error('BehaviorScript registry does not support module registration');
    }
    return this.registry.registerModule(module);
  }

  registerModules(modules: BehaviorScriptModule[]): BehaviorScriptModuleRegistration[] {
    if (this.registry.registerModules) return this.registry.registerModules(modules);
    return modules.map(module => this.registerModule(module));
  }

  /**
   * Drop every script registered under the given `sourceUri`. Idempotent.
   * Used by `ExtensionSetupHook.teardown` (ADR-0023) to clean up factory refs
   * during HMR / engine destroy.
   */
  unregisterModule(sourceUri: string): string[] {
    const reg: any = this.registry;
    if (typeof reg.unregisterModule === 'function') {
      return reg.unregisterModule(sourceUri);
    }
    return [];
  }

  unregisterScript(scriptId: string) {
    this.registry.unregisterScript(scriptId);
  }

  hasScript(scriptId: string): boolean {
    return this.registry.hasScript(scriptId);
  }

  getFactory(scriptId: string): BehaviorScriptFactory | undefined {
    return this.registry.getFactory(scriptId);
  }

  getManifest(scriptId: string): BehaviorScriptManifest | undefined {
    return this.registry.getManifest(scriptId);
  }

  getManifests(): BehaviorScriptManifest[] {
    return this.registry.getManifests();
  }

  getScriptIds(): string[] {
    return this.registry.getScriptIds?.() ?? this.getManifests().map(manifest => manifest.scriptId);
  }

  getCatalog(): BehaviorScriptCatalog {
    return (
      this.registry.getCatalog?.() ?? {
        scripts: this.getScriptIds().map(scriptId => ({
          scriptId,
          manifest: this.getManifest(scriptId),
          sourceUri: this.registry.getSourceUri?.(scriptId),
        })),
      }
    );
  }

  getBoundScripts(): BehaviorScript[] {
    return this.getOrderedRecords().map(record => record.component);
  }

  getGroupScripts(group: string): BehaviorScript[] {
    const normalized = normalizeGroup(group);
    if (!normalized) return [];
    return this.getOrderedRecords()
      .filter(record => hasGroup(record.component, normalized))
      .map(record => record.component);
  }

  addToGroup(component: BehaviorScript, group: string) {
    const normalized = normalizeGroup(group);
    if (!normalized || hasGroup(component, normalized)) return;
    component.groups = [...(component.groups ?? []), normalized];
  }

  removeFromGroup(component: BehaviorScript, group: string) {
    const normalized = normalizeGroup(group);
    if (!normalized) return;
    component.groups = (component.groups ?? []).filter(existing => existing !== normalized);
  }

  isInGroup(component: BehaviorScript, group: string): boolean {
    return hasGroup(component, group);
  }

  dispatchInputToGroup(group: string, event: BehaviorInputEvent) {
    this.dispatchInputToRecords(this.selectGroupRecords(group), event);
  }

  dispatchSignalToGroup<T = any>(group: string, name: string, payload?: T) {
    for (const record of this.selectGroupRecords(group)) {
      this.run(record, 'signal', () => record.instance.onSignal?.(name, payload));
    }
  }

  callGroup(group: string, method: string, ...args: any[]): number {
    let invoked = 0;

    for (const record of this.selectGroupRecords(group)) {
      const fn = record.instance[method];
      if (typeof fn !== 'function') continue;
      if (this.shouldSkipActivePhase(record, 'groupCall')) continue;
      invoked += 1;
      this.run(record, 'groupCall', () => fn.apply(record.instance, args));
    }

    return invoked;
  }

  getRuntimeSnapshot(): BehaviorScriptRuntimeSnapshot {
    const scripts: BehaviorScriptRuntimeSnapshotEntry[] = [];
    const seen = new Set<BehaviorScript>();

    for (const record of this.getOrderedRecords()) {
      scripts.push(this.createRuntimeSnapshotEntry(record.component, record));
      seen.add(record.component);
    }

    const deferred = Array.from(this.deferredComponents)
      .filter(component => !seen.has(component))
      .sort(compareBehaviorScriptComponent);
    for (const component of deferred) {
      scripts.push(this.createRuntimeSnapshotEntry(component));
    }

    return {
      runMode: this.runMode,
      paused: this.paused,
      defaultPauseMode: this.defaultPauseMode,
      catalog: this.getCatalog(),
      diagnostics: this.diagnostics,
      scripts,
    };
  }

  async flushAsyncTasks(maxIterations = 8): Promise<void> {
    for (let index = 0; index < maxIterations; index += 1) {
      if (!this.asyncTasks.size) {
        await Promise.resolve();
        if (!this.asyncTasks.size) return;
      }

      const tasks = Array.from(this.asyncTasks);
      await Promise.allSettled(tasks);
    }
  }

  getRunMode(): BehaviorScriptRunMode {
    return this.runMode;
  }

  isPaused(): boolean {
    return this.paused;
  }

  getDefaultPauseMode(): BehaviorScriptSystemPauseMode {
    return this.defaultPauseMode;
  }

  setRunMode(mode: BehaviorScriptRunMode) {
    if (this.runMode === mode) return;
    this.runMode = mode;

    if (mode === 'play') {
      for (const component of Array.from(this.deferredComponents)) {
        this.attach(component);
      }
      return;
    }

    for (const record of this.getOrderedRecords()) {
      if (record.component.executeInEditMode) continue;
      this.deferredComponents.add(record.component);
      this.detach(record.component, { keepDiagnostics: true });
    }
  }

  attach(component: BehaviorScript, options: AttachOptions = {}): EvaBehaviorScript | undefined {
    if (!this.canExecute(component)) {
      this.deferredComponents.add(component);
      this.detach(component, { keepDiagnostics: true });
      return;
    }

    this.deferredComponents.delete(component);

    if (!component.scriptId) {
      this.report(component, 'factory', new Error('BehaviorScript.scriptId is required'));
      return;
    }

    this.detach(component, { keepDiagnostics: true });
    if (!options.keepDiagnostics) component.clearDiagnostics();

    const factory = this.registry.getFactory(component.scriptId);
    if (!factory) {
      this.report(component, 'factory', new Error(`Missing behavior script factory: ${component.scriptId}`));
      return;
    }

    const record: BoundBehaviorScript = {
      component,
      scriptId: component.scriptId,
      factory,
      sourceUri: this.registry.getSourceUri?.(component.scriptId),
      order: recordOrderCounter++,
      instance: undefined as any,
      signalHandles: [],
      eventHandles: [],
      cleanupHandles: [],
      inputSignalKeys: new Set<string>(),
      lastProps: { ...(component.props ?? {}) },
      lastEnabled: component.enabled !== false,
    };

    const signals = getSignalBus();
    const context = {
      scriptId: component.scriptId,
      props: component.props,
      component,
      gameObject: component.gameObject,
      game: this.game,
      system: this,
      runMode: this.runMode,
      isEnabled: () => component.enabled,
      getPriority: () => normalizePriority(component.priority),
      getGroups: () => [...(component.groups ?? [])],
      isInGroup: (group: string) => this.isInGroup(component, group),
      addToGroup: (group: string) => this.addToGroup(component, group),
      removeFromGroup: (group: string) => this.removeFromGroup(component, group),
      callGroup: (group: string, method: string, ...args: any[]) => this.callGroup(group, method, ...args),
      getNode: (refOrPath: string) => this.getNode(component, refOrPath),
      getRequiredNode: (refOrPath: string) => this.getRequiredNode(component, refOrPath),
      getNodes: (refOrPath: string) => this.getNodes(component, refOrPath),
      getResourceName: (refOrName: string) => this.getResourceName(component, refOrName),
      hasResource: (refOrName: string) => this.hasResource(component, refOrName),
      loadResource: <T = any>(refOrName: string) => this.loadResource<T>(component, refOrName),
      loadRequiredResource: <T = any>(refOrName: string) => this.loadRequiredResource<T>(component, refOrName),
      isPaused: () => this.isPaused(),
      getPauseMode: () => this.resolvePauseMode(component),
      signals,
      onSignal: <T = any>(name: string, listener: (payload: T) => void) => {
        const handle = signals.on<T>(name, payload => {
          this.run(record, 'signal', () => listener(payload));
        });
        record.signalHandles.push(handle);
        return handle;
      },
      emitSignal: <T = any>(name: string, payload?: T) => {
        signals.emit<T>(name, payload);
      },
      onEvent: <T = any>(target: BehaviorEventTarget, name: string, listener: BehaviorEventListener<T>) =>
        this.bindEvent(record, target, name, listener),
      emitEvent: <T = any>(target: BehaviorEventTarget, name: string, payload?: T) => {
        this.emitEvent(target, name, payload);
      },
      addDisposer: (disposer: BehaviorCleanupDisposer) => this.addCleanup(record, disposer),
      setTimeout: (listener: () => void, delay: number) => this.setManagedTimer(record, listener, delay, false),
      setInterval: (listener: () => void, delay: number) => this.setManagedTimer(record, listener, delay, true),
      reportDiagnostic: (diagnostic: Omit<BehaviorScriptDiagnostic, 'id' | 'timestamp' | 'componentName'>) => {
        this.pushDiagnostic({
          ...diagnostic,
          id: this.nextDiagnosticId(diagnostic.scriptId, diagnostic.phase),
          timestamp: Date.now(),
          componentName: 'BehaviorScript',
        });
      },
      // ADR-0024B — 跨 plugin 直链 API,内部用 record.cleanupHandles 注册
      // detach 时自动 dispose attach handle。
      fsm: {
        attach: (entityName: string, fsmName?: string, options?: any) =>
          this.attachFsm(record, entityName, fsmName, options),
      },
    };

    const instance = this.run(component, 'factory', () => factory(context as any));
    if (!instance) return;

    record.instance = instance;
    this.records.set(component, record);
    component.__bindRuntime({
      instance,
      dispose: () => this.detach(component),
    });
    this.bindManifestSignals(record, factory);
    this.bindManifestInputs(record, factory);
    this.bindManifestEvents(record, factory);

    this.run(record, 'setup', () => instance.setup?.(context as any));
    if (options.restoredState !== undefined) {
      this.run(record, 'restoreState', () => instance.restoreState?.(options.restoredState));
    }
    this.run(record, 'enterTree', () => instance.enterTree?.());
    this.run(record, 'ready', () => instance.ready?.());
    this.run(record, record.lastEnabled ? 'enable' : 'disable', () =>
      record.lastEnabled ? instance.enable?.() : instance.disable?.(),
    );
    return instance;
  }

  detach(component: BehaviorScript, options: DetachOptions = {}) {
    const record = this.records.get(component);
    if (!record) return;

    this.records.delete(component);
    if (!options.keepDiagnostics) component.clearDiagnostics();
    for (const key of record.inputSignalKeys) this.releaseInputSignalSubscription(key);
    record.inputSignalKeys.clear();
    for (const handle of record.signalHandles) handle.dispose();
    record.signalHandles = [];
    for (const handle of record.eventHandles) handle.dispose();
    record.eventHandles = [];
    this.disposeCleanupHandles(record);
    component.__clearRuntimeBinding();

    this.run(record, 'exitTree', () => record.instance.exitTree?.());
    this.run(record, 'destroy', () => record.instance.destroy?.());
  }

  reloadScript(scriptId: string, factory: BehaviorScriptFactory, options: BehaviorScriptReloadOptions = {}) {
    this.suppressRegistryChange = true;
    try {
      this.registerScript(scriptId, factory);
    } finally {
      this.suppressRegistryChange = false;
    }
    this.reloadBoundScript(scriptId, options);
  }

  reloadBoundScript(scriptId: string, options: BehaviorScriptReloadOptions = {}) {
    const matches = this.getOrderedRecords().filter(record => record.scriptId === scriptId);

    for (const record of matches) {
      if (record.component.hotReload?.enabled === false && !options.force) {
        continue;
      }
      this.reloadRecord(record, options);
    }
  }

  dispatchInput(event: BehaviorInputEvent, target?: BehaviorScript) {
    const records = this.selectRecords(target);
    this.dispatchInputToRecords(records, event);
  }

  setEnabled(component: BehaviorScript, enabled: boolean) {
    const nextEnabled = enabled !== false;
    if (component.enabled === nextEnabled) return;
    component.enabled = nextEnabled;
    this.change(component, 'enabled');
  }

  private dispatchInputToRecords(records: BoundBehaviorScript[], event: BehaviorInputEvent) {
    const inputEvent = { ...event, timestamp: event.timestamp ?? Date.now() };

    for (const record of records) {
      this.run(record, 'input', () => record.instance.input?.(inputEvent));
      if (inputEvent.handled) return;
    }

    for (const record of records) {
      this.run(record, 'unhandledInput', () => record.instance.unhandledInput?.(inputEvent));
      if (inputEvent.handled) return;
    }
  }

  emitSignal<T = any>(name: string, payload?: T) {
    getSignalBus().emit(name, payload);
  }

  emitEvent<T = any>(target: BehaviorEventTarget, name: string, payload?: T) {
    const eventTarget = target as any;

    if (hasFunction(eventTarget, 'emit')) {
      eventTarget.emit(name, payload);
      return;
    }

    if (hasFunction(eventTarget, 'dispatchEvent') && typeof CustomEvent !== 'undefined') {
      eventTarget.dispatchEvent(new CustomEvent(name, { detail: payload }));
      return;
    }

    if (hasFunction(eventTarget, 'dispatchEvent') && typeof Event !== 'undefined') {
      const event = new Event(name);
      (event as any).detail = payload;
      eventTarget.dispatchEvent(event);
      return;
    }

    throw new Error(`Unsupported BehaviorScript event target for "${name}"`);
  }

  dispatchSignal<T = any>(name: string, payload?: T, target?: BehaviorScript) {
    for (const record of this.selectRecords(target)) {
      this.run(record, 'signal', () => record.instance.onSignal?.(name, payload));
    }
  }

  fixedUpdate(frame: BehaviorFixedFrame) {
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'physicsProcess', () => record.instance.physicsProcess?.(frame));
    }
  }

  update(frame: UpdateParams) {
    this.flushComponentChanges();
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'process', () => record.instance.process?.(frame));
    }
  }

  lateUpdate(frame: UpdateParams) {
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'lateProcess', () => record.instance.lateProcess?.(frame));
    }
  }

  onPause() {
    this.paused = true;
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'pause', () => record.instance.pause?.());
    }
  }

  onResume() {
    this.paused = false;
    for (const record of this.getOrderedRecords()) {
      this.run(record, 'resume', () => record.instance.resume?.());
    }
  }

  onDestroy() {
    this.registryChangeHandle?.dispose();
    this.registryChangeHandle = undefined;
    if (this.sceneChangedListener && this.game && typeof (this.game as any).off === 'function') {
      (this.game as any).off('dsl:scene-switch', this.sceneChangedListener);
    }
    this.sceneChangedListener = undefined;
    for (const component of Array.from(this.records.keys())) {
      this.detach(component);
    }
    for (const subscription of this.inputSignalSubscriptions.values()) {
      subscription.handle.dispose();
    }
    this.inputSignalSubscriptions.clear();
    if (this.ownsRegistry) this.registry.clear?.();
  }

  componentChanged(changed: ComponentChanged) {
    if (!(changed.component instanceof BehaviorScript)) return;

    switch (changed.type) {
      case OBSERVER_TYPE.ADD:
        this.attach(changed.component);
        break;
      case OBSERVER_TYPE.REMOVE:
        this.deferredComponents.delete(changed.component);
        this.detach(changed.component);
        break;
      case OBSERVER_TYPE.CHANGE:
        this.change(changed.component, changed.prop?.prop?.[0]);
        break;
    }
  }

  private onRegistryChange(change: BehaviorScriptRegistryChange) {
    if (this.suppressRegistryChange) return;

    if (change.type === 'register' && change.scriptId) {
      this.reloadBoundScript(change.scriptId);
      return;
    }

    if (change.type === 'unregister' && change.scriptId) {
      this.detachMissingScript(change.scriptId, `Behavior script unregistered: ${change.scriptId}`);
      return;
    }

    if (change.type === 'clear') {
      for (const record of this.getOrderedRecords()) {
        this.detachMissingScript(record.scriptId, 'Behavior script registry cleared');
      }
    }
  }

  private change(component: BehaviorScript, prop?: string) {
    const record = this.records.get(component);

    if (prop === 'executeInEditMode' || !prop) {
      if (!this.canExecute(component)) {
        this.deferredComponents.add(component);
        this.detach(component, { keepDiagnostics: true });
        return;
      }
      if (!record) {
        this.attach(component);
        return;
      }
    }

    if (!record || prop === 'scriptId') {
      const previousState = record?.instance.serializeState?.();
      this.detach(component, { keepDiagnostics: true });
      this.attach(component, { restoredState: previousState });
      return;
    }

    if (prop === 'enabled' || !prop) {
      this.updateEnabledState(record);
    }

    if (prop === 'props' || !prop) {
      const previousProps = record.lastProps;
      record.lastProps = { ...(component.props ?? {}) };
      this.run(record, 'propsChanged', () =>
        record.instance.propsChanged?.(component.props as BehaviorScriptParams['props'], previousProps),
      );
    }

    if (prop === 'groups' || !prop) {
      component.groups = normalizeGroups(component.groups);
    }

    if (prop === 'nodes' || !prop) {
      component.nodes = normalizeNodes(component.nodes);
    }

    if (prop === 'resources' || !prop) {
      component.resources = normalizeResources(component.resources);
    }
  }

  private flushComponentChanges() {
    const changes = this.componentObserver?.clear?.() ?? [];
    for (const changed of changes) {
      this.componentChanged(changed);
    }
  }

  private selectRecords(target?: BehaviorScript): BoundBehaviorScript[] {
    if (target) {
      const record = this.records.get(target);
      return record ? [record] : [];
    }
    return this.getOrderedRecords();
  }

  private selectInputRecords(action: string, phase: BehaviorInputPhase): BoundBehaviorScript[] {
    const key = createInputSignalKey(action, phase);
    return this.getOrderedRecords().filter(record => record.inputSignalKeys.has(key));
  }

  private selectGroupRecords(group: string): BoundBehaviorScript[] {
    const normalized = normalizeGroup(group);
    if (!normalized) return [];
    return this.getOrderedRecords().filter(record => hasGroup(record.component, normalized));
  }

  private canExecute(component: BehaviorScript): boolean {
    return this.runMode === 'play' || component.executeInEditMode;
  }

  private resolvePauseMode(component: BehaviorScript): BehaviorScriptSystemPauseMode {
    const pauseMode: BehaviorScriptPauseMode = component.pauseMode ?? 'inherit';
    return pauseMode === 'inherit' ? this.defaultPauseMode : pauseMode;
  }

  private shouldSkipForPause(record: BoundBehaviorScript, phase: BehaviorScriptPhase): boolean {
    return this.paused && ACTIVE_BEHAVIOR_PHASES.has(phase) && this.resolvePauseMode(record.component) === 'stop';
  }

  private shouldSkipForEnabled(record: BoundBehaviorScript, phase: BehaviorScriptPhase): boolean {
    return record.component.enabled === false && ACTIVE_BEHAVIOR_PHASES.has(phase);
  }

  private shouldSkipActivePhase(record: BoundBehaviorScript, phase: BehaviorScriptPhase): boolean {
    return this.shouldSkipForEnabled(record, phase) || this.shouldSkipForPause(record, phase);
  }

  private getOrderedRecords(): BoundBehaviorScript[] {
    return Array.from(this.records.values()).sort(compareBoundBehaviorScript);
  }

  private updateEnabledState(record: BoundBehaviorScript) {
    const enabled = record.component.enabled !== false;
    const previousEnabled = record.lastEnabled;
    if (enabled === previousEnabled) return;

    record.lastEnabled = enabled;
    this.run(record, 'enabledChanged', () => record.instance.enabledChanged?.(enabled, previousEnabled));
    this.run(record, enabled ? 'enable' : 'disable', () =>
      enabled ? record.instance.enable?.() : record.instance.disable?.(),
    );
  }

  private createRuntimeSnapshotEntry(
    component: BehaviorScript,
    record?: BoundBehaviorScript,
  ): BehaviorScriptRuntimeSnapshotEntry {
    const diagnostics = component.diagnostics ?? [];
    const pauseMode = this.resolvePauseMode(component);
    const enabled = component.enabled !== false;
    const bound = Boolean(record);
    const source = resolveSnapshotSource(component, record, this.registry);

    return {
      status: bound ? 'bound' : 'deferred',
      scriptId: component.scriptId,
      gameObjectName: component.gameObject?.name,
      source,
      manifest: component.scriptId ? this.registry.getManifest(component.scriptId) : undefined,
      bound,
      deferred: !bound,
      active: bound && enabled && !(this.paused && pauseMode === 'stop'),
      enabled,
      priority: normalizePriority(component.priority),
      groups: [...(component.groups ?? [])],
      nodes: this.resolveSnapshotNodes(component, record),
      resources: this.resolveSnapshotResources(component, record),
      order: record?.order,
      runMode: this.runMode,
      paused: this.paused,
      pauseMode,
      componentPauseMode: component.pauseMode ?? 'inherit',
      executeInEditMode: Boolean(component.executeInEditMode),
      hotReload: { enabled: true, keepState: true, ...(component.hotReload ?? {}) },
      diagnostics: diagnostics.length,
      errors: diagnostics.filter(diagnostic => diagnostic.severity === 'error').length,
      warnings: diagnostics.filter(diagnostic => diagnostic.severity === 'warning').length,
    };
  }

  private getNode(component: BehaviorScript, refOrPath: string) {
    return this.resolveNode(component, refOrPath);
  }

  private getRequiredNode(component: BehaviorScript, refOrPath: string) {
    const node = this.getNode(component, refOrPath);
    if (!node) {
      throw new Error(`BehaviorScript node reference not found: ${refOrPath}`);
    }
    return node;
  }

  private getNodes(component: BehaviorScript, refOrPath: string) {
    return this.resolveNodes(component, refOrPath);
  }

  private getResourceName(component: BehaviorScript, refOrName: string): string {
    return this.resolveResourceName(component, refOrName);
  }

  private hasResource(component: BehaviorScript, refOrName: string): boolean {
    const resourceName = this.getResourceName(component, refOrName);
    return Boolean(resourceName && getRegisteredResource(resourceName));
  }

  private async loadResource<T = any>(component: BehaviorScript, refOrName: string): Promise<T | undefined> {
    const resourceName = this.getResourceName(component, refOrName);
    if (!resourceName || !getRegisteredResource(resourceName)) return;
    const loaded = await evaResource.getResource(resourceName);
    return (loaded && (loaded as any).name ? loaded : undefined) as T | undefined;
  }

  private async loadRequiredResource<T = any>(component: BehaviorScript, refOrName: string): Promise<T> {
    const resourceName = this.getResourceName(component, refOrName);
    const loaded = await this.loadResource<T>(component, refOrName);
    if (!loaded) {
      throw new Error(
        `BehaviorScript resource reference not found: ${refOrName}${resourceName ? ` -> ${resourceName}` : ''}`,
      );
    }
    return loaded;
  }

  private resolveNode(component: BehaviorScript, refOrPath: string): GameObject | undefined {
    return this.resolveNodes(component, refOrPath)[0];
  }

  private resolveNodes(component: BehaviorScript, refOrPath: string): GameObject[] {
    const path = this.resolveNodePath(component, refOrPath);
    if (!path) return [];

    const self = component.gameObject;
    if (!self) return [];
    if (path === '.' || path === 'self') return [self];

    if (path === '..') {
      return self.parent ? [self.parent] : [];
    }

    const hasPathSeparator = path.includes('/');
    if (!hasPathSeparator) {
      const directChild = findChildByName(self, path);
      if (directChild) return [directChild];
      return this.game?.findAllByName?.(path) ?? self.scene?.findAllByName(path) ?? [];
    }

    const resolved = resolveGameObjectPath(self, path);
    return resolved ? [resolved] : [];
  }

  private resolveNodePath(component: BehaviorScript, refOrPath: string): string {
    const ref = normalizeNodePath(refOrPath);
    if (!ref) return '';
    if (component.nodes?.[ref]) return component.nodes[ref];

    const manifest = this.registry.getManifest(component.scriptId);
    const hint = manifest?.nodes?.find(node => node.name === ref);
    return component.nodes?.[ref] ?? hint?.path ?? ref;
  }

  private resolveResourceName(component: BehaviorScript, refOrName: string): string {
    const ref = normalizeResourceName(refOrName);
    if (!ref) return '';
    if (component.resources?.[ref]) return component.resources[ref];

    const manifest = this.registry.getManifest(component.scriptId);
    const hint = manifest?.resources?.find(resource => resource.name === ref);
    return component.resources?.[ref] ?? hint?.resource ?? ref;
  }

  private resolveSnapshotNodes(
    component: BehaviorScript,
    record?: BoundBehaviorScript,
  ): BehaviorScriptNodeResolution[] {
    const manifest = record?.factory.manifest ?? this.registry.getManifest(component.scriptId);
    const refs = new Map<string, { path: string; required?: boolean; multiple?: boolean }>();

    for (const node of manifest?.nodes ?? []) {
      if (!node.name) continue;
      refs.set(node.name, {
        path: component.nodes?.[node.name] ?? node.path ?? node.name,
        required: node.required,
        multiple: node.multiple,
      });
    }

    for (const [name, path] of Object.entries(component.nodes ?? {})) {
      if (!name || !path) continue;
      const existing = refs.get(name);
      refs.set(name, { ...existing, path });
    }

    return Array.from(refs.entries()).map(([name, ref]) => {
      const nodes = this.resolveNodes(component, ref.path);
      return {
        name,
        path: ref.path,
        resolved: nodes.length > 0,
        gameObjectName: nodes[0]?.name,
        required: ref.required,
        multiple: ref.multiple,
      };
    });
  }

  private resolveSnapshotResources(
    component: BehaviorScript,
    record?: BoundBehaviorScript,
  ): BehaviorScriptResourceResolution[] {
    const manifest = record?.factory.manifest ?? this.registry.getManifest(component.scriptId);
    const refs = new Map<string, { resource: string; type?: string; required?: boolean; preload?: boolean }>();

    for (const resource of manifest?.resources ?? []) {
      if (!resource.name) continue;
      refs.set(resource.name, {
        resource: component.resources?.[resource.name] ?? resource.resource ?? resource.name,
        type: resource.type,
        required: resource.required,
        preload: resource.preload,
      });
    }

    for (const [name, resourceName] of Object.entries(component.resources ?? {})) {
      if (!name || !resourceName) continue;
      const existing = refs.get(name);
      refs.set(name, { ...existing, resource: resourceName });
    }

    return Array.from(refs.entries()).map(([name, ref]) => {
      const registered = getRegisteredResource(ref.resource);
      return {
        name,
        resource: ref.resource,
        available: Boolean(registered),
        loaded: registered ? Boolean(registered.complete) : undefined,
        type: ref.type ?? (registered?.type ? String(registered.type) : undefined),
        required: ref.required,
        preload: ref.preload,
      };
    });
  }

  private bindEvent<T = any>(
    record: BoundBehaviorScript,
    target: BehaviorEventTarget,
    name: string,
    listener: BehaviorEventListener<T>,
  ): BehaviorEventHandle {
    const eventTarget = target as any;
    const wrapped = (payload: T, ...args: any[]) => {
      this.run(record, 'event', () => listener(payload, ...args));
    };

    let handle: BehaviorEventHandle;

    if (hasFunction(eventTarget, 'addEventListener')) {
      eventTarget.addEventListener(name, wrapped);
      handle = {
        dispose: () => {
          eventTarget.removeEventListener?.(name, wrapped);
        },
      };
    } else if (hasFunction(eventTarget, 'on')) {
      eventTarget.on(name, wrapped);
      handle = {
        dispose: () => {
          if (eventTarget.off) {
            eventTarget.off(name, wrapped);
          } else {
            eventTarget.removeListener?.(name, wrapped);
          }
        },
      };
    } else {
      throw new Error(`Unsupported BehaviorScript event target for "${name}"`);
    }

    record.eventHandles.push(handle);
    return handle;
  }

  private addCleanup(record: BoundBehaviorScript, disposer: BehaviorCleanupDisposer): BehaviorCleanupHandle {
    const handle = createCleanupHandle(disposer);
    record.cleanupHandles.push(handle);
    return handle;
  }

  /**
   * ADR-0024B `ctx.fsm.attach` 实现。
   *
   * 在 BehaviorScript factory 内一行 attach 到指定 entity 上的 StateMachine,
   * 返回 handle 提供 detach / reset / goto / getFsm。framework 通过
   * `record.cleanupHandles` 在 component detach 时自动 dispose,避免泄漏。
   *
   * 实现走 duck-typed walk(避免硬依赖 @eva/plugin-state-machine):
   *   - 在 game.gameObjects 递归找 `gameObject.name === entityName` 的实体
   *   - 在其 components 列表里找 `constructor.componentName === fsmName`(默认 'StateMachine')
   *   - 若设 options.ref,按 (componentName, ref) 三元组定位(与 plugin-trigger
   *     ref 字段语义一致)
   *
   * onMissing 三模式:
   *   - 'wait'  — 返回延迟 handle,getFsm() 持续重新 walk(适合 globalEntities
   *               FSM 在 setup 阶段还没就位的场景)
   *   - 'warn'  — 立即 console.warn 一次,handle.getFsm() 返回 null
   *   - 'throw' — 立即抛 Error
   *
   * 默认 'warn'(兼容性最好;'wait' 模式预留给 ADR-0024B Phase 3+ scene-switch
   * 路径优化)。
   */
  private attachFsm(
    record: BoundBehaviorScript,
    entityName: string,
    fsmName?: string,
    options?: { onMissing?: 'wait' | 'warn' | 'throw'; ref?: string },
  ): any {
    const componentName = fsmName ?? 'StateMachine';
    const onMissing = options?.onMissing ?? 'warn';
    const ref = options?.ref;

    let cached: any = null;
    let detached = false;

    const findFsm = (): any => {
      if (detached) return null;
      const game: any = (this as any).game;
      if (!game) return null;
      const stack: any[] = [...(game.scene?.gameObjects ?? []), ...(game.gameObjects ?? [])];
      while (stack.length) {
        const go = stack.pop();
        if (!go || typeof go !== 'object') continue;
        if (go.name === entityName) {
          const comps: any[] = go.components ?? [];
          const c = comps.find((c: any) => {
            if (c?.constructor?.componentName !== componentName) return false;
            if (!ref) return true;
            if (typeof c.ref === 'string' && c.ref === ref) return true;
            if (typeof c.name === 'string' && c.name === ref) return true;
            return false;
          });
          if (c) return c;
        }
        if (Array.isArray(go.transform?.children)) {
          for (const ch of go.transform.children) stack.push(ch.gameObject);
        }
      }
      return null;
    };

    const ensureFsm = (): any | null => {
      if (detached) return null;
      if (cached && !cached.destroyed) return cached;
      cached = findFsm();
      return cached;
    };

    // 首次 attach 时按 onMissing 处理 not-found
    const firstAttempt = findFsm();
    cached = firstAttempt;
    if (!firstAttempt) {
      const msg =
        `[plugin-behavior-script] ctx.fsm.attach: ` +
        `${componentName}${ref ? `[ref=${ref}]` : ''} not found on entity "${entityName}"` +
        ` (script ${record.scriptId})`;
      if (onMissing === 'throw') {
        throw new Error(msg);
      } else if (onMissing === 'warn') {
        // eslint-disable-next-line no-console
        console.warn(msg);
      }
      // 'wait' — silent,后续 getFsm() 持续重试
    }

    // 注册 cleanup,detach 时清空 cached + 标记 detached
    const cleanup = this.addCleanup(record, () => {
      detached = true;
      cached = null;
    });

    return {
      getFsm: () => ensureFsm(),
      reset: (payload?: any) => {
        const fsm = ensureFsm();
        if (fsm && typeof fsm.reset === 'function') fsm.reset(payload);
      },
      goto: (to: string, opts?: string | Record<string, any>) => {
        const fsm = ensureFsm();
        if (fsm && typeof fsm.goto === 'function') fsm.goto(to, opts as any);
      },
      detach: () => {
        if (detached) return;
        cleanup.dispose();
      },
    };
  }

  private setManagedTimer(
    record: BoundBehaviorScript,
    listener: () => void,
    delay: number,
    interval: boolean,
  ): BehaviorCleanupHandle {
    const timerApi = globalThis as any;
    const startTimer = interval ? timerApi.setInterval : timerApi.setTimeout;
    const stopTimer = interval ? timerApi.clearInterval : timerApi.clearTimeout;

    if (typeof startTimer !== 'function' || typeof stopTimer !== 'function') {
      throw new Error('BehaviorScript timer APIs are not available in this runtime');
    }

    const id = startTimer(() => {
      this.run(record, 'timer', listener);
    }, delay);
    return this.addCleanup(record, () => stopTimer(id));
  }

  private disposeCleanupHandles(record: BoundBehaviorScript) {
    const handles = record.cleanupHandles.splice(0);

    for (const handle of handles) {
      this.run(record, 'cleanup', () => handle.dispose());
    }
  }

  private bindManifestSignals(record: BoundBehaviorScript, factory: BehaviorScriptFactory) {
    if (!hasFunction(record.instance, 'onSignal')) return;

    const manifest = factory.manifest ?? this.registry.getManifest(record.scriptId);
    const listenableSignals =
      manifest?.signals?.filter(signal => signal.direction === 'listen' || signal.direction === 'both') ?? [];
    const seen = new Set<string>();

    for (const signal of listenableSignals) {
      if (!signal.name || seen.has(signal.name)) continue;
      seen.add(signal.name);

      const handle = getSignalBus().on(signal.name, payload => {
        this.run(record, 'signal', () => record.instance.onSignal?.(signal.name, payload));
      });
      record.signalHandles.push(handle);
    }
  }

  private bindManifestInputs(record: BoundBehaviorScript, factory: BehaviorScriptFactory) {
    const manifest = factory.manifest ?? this.registry.getManifest(record.scriptId);
    const inputs = manifest?.inputs ?? [];

    for (const input of inputs) {
      if (!input.action) continue;
      const phases = input.phases?.length ? input.phases : DEFAULT_INPUT_PHASES;
      for (const phase of phases) {
        const key = createInputSignalKey(input.action, phase);
        if (record.inputSignalKeys.has(key)) continue;
        record.inputSignalKeys.add(key);
        this.retainInputSignalSubscription(input.action, phase);
      }
    }
  }

  private bindManifestEvents(record: BoundBehaviorScript, factory: BehaviorScriptFactory) {
    if (!hasFunction(record.instance, 'onEvent')) return;

    const manifest = factory.manifest ?? this.registry.getManifest(record.scriptId);
    const listenableEvents =
      manifest?.events?.filter(event => event.direction === 'listen' || event.direction === 'both') ?? [];
    const seen = new Set<string>();

    for (const event of listenableEvents) {
      if (!event.name) continue;

      const target = this.resolveManifestEventTarget(record, event);
      if (!target) continue;

      const key = `${event.target ?? 'component'}:${event.name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      this.bindEvent(record, target, event.name, payload => {
        record.instance.onEvent?.(event.name, payload, target);
      });
    }
  }

  private resolveManifestEventTarget(
    record: BoundBehaviorScript,
    event: BehaviorEventHint,
  ): BehaviorEventTarget | undefined {
    const target = event.target ?? 'component';

    if (target === 'self' || target === 'component') return record.component;
    if (target === 'gameObject') return record.component.gameObject as BehaviorEventTarget | undefined;
    return this.eventTargets[target];
  }

  private retainInputSignalSubscription(action: string, phase: BehaviorInputPhase) {
    const key = createInputSignalKey(action, phase);
    const existing = this.inputSignalSubscriptions.get(key);
    if (existing) {
      existing.refs += 1;
      return;
    }

    const signalName = createInputSignalName(action, phase);
    const handle = getSignalBus().on(signalName, payload => {
      this.dispatchInputToRecords(this.selectInputRecords(action, phase), {
        action,
        phase,
        source: signalName,
        payload,
      });
    });
    this.inputSignalSubscriptions.set(key, { action, phase, handle, refs: 1 });
  }

  private releaseInputSignalSubscription(key: string) {
    const subscription = this.inputSignalSubscriptions.get(key);
    if (!subscription) return;

    subscription.refs -= 1;
    if (subscription.refs > 0) return;

    subscription.handle.dispose();
    this.inputSignalSubscriptions.delete(key);
  }

  private reloadRecord(record: BoundBehaviorScript, options: BehaviorScriptReloadOptions) {
    const keepState = options.keepState ?? record.component.hotReload?.keepState ?? true;
    const rollbackOnError = options.rollbackOnError !== false;
    const state = keepState ? this.run(record, 'serializeState', () => record.instance.serializeState?.()) : undefined;
    const previousFactory = record.factory;
    const previousSourceUri = record.sourceUri;
    const component = record.component;
    const diagnosticsBefore = this.diagnostics.length;

    this.detach(component, { keepDiagnostics: true });
    const instance = this.attach(component, { restoredState: state });
    const reloadDiagnostics = this.diagnostics.slice(diagnosticsBefore);
    const failed = !instance || reloadDiagnostics.some(diagnostic => isAttachPhase(diagnostic.phase));

    if (!failed || !rollbackOnError) return;

    this.suppressRegistryChange = true;
    try {
      this.registry.registerScript(component.scriptId, previousFactory, previousSourceUri);
    } finally {
      this.suppressRegistryChange = false;
    }

    this.detach(component, { keepDiagnostics: true });
    this.attach(component, { restoredState: state, keepDiagnostics: true });
  }

  private run<T>(component: BehaviorScript, phase: BehaviorScriptPhase, fn: () => T): T | undefined;
  private run<T>(record: BoundBehaviorScript, phase: BehaviorScriptPhase, fn: () => T): T | undefined;
  private run<T>(target: BehaviorScript | BoundBehaviorScript, phase: BehaviorScriptPhase, fn: () => T): T | undefined {
    if (!(target instanceof BehaviorScript) && this.shouldSkipActivePhase(target, phase)) return;

    try {
      const result = fn();
      this.trackAsyncResult(target, phase, result);
      return result;
    } catch (error) {
      const component = target instanceof BehaviorScript ? target : target.component;
      this.report(component, phase, error);
      if (this.failFast) throw error;
      return;
    }
  }

  private trackAsyncResult<T>(target: BehaviorScript | BoundBehaviorScript, phase: BehaviorScriptPhase, result: T) {
    if (!isThenable(result)) return;

    const component = target instanceof BehaviorScript ? target : target.component;
    let task: Promise<void>;
    task = Promise.resolve(result)
      .then(() => undefined)
      .catch(error => {
        this.report(component, phase, error);
      })
      .finally(() => {
        this.asyncTasks.delete(task);
      });
    this.asyncTasks.add(task);
  }

  private report(component: BehaviorScript, phase: BehaviorScriptPhase, error: any) {
    const registrySourceUri = component.scriptId ? this.registry.getSourceUri?.(component.scriptId) : undefined;
    const diagnostic: BehaviorScriptDiagnostic = {
      ...createBehaviorScriptDiagnostic({
        scriptId: component.scriptId || 'unknown',
        phase,
        message: error?.message ?? String(error),
        stack: error?.stack,
        timestamp: Date.now(),
        gameObjectName: component.gameObject?.name,
        registrySourceUri,
        componentSource: component.source,
        error,
      }),
      id: this.nextDiagnosticId(component.scriptId || 'unknown', phase),
    };

    component.pushDiagnostic(diagnostic);
    this.pushDiagnostic(diagnostic);
    getSignalBus().emit('behavior:diagnostic', diagnostic);
    // eslint-disable-next-line no-console
    console.error(`[plugin-behavior-script] ${diagnostic.scriptId}.${phase} failed`, error);
  }

  private pushDiagnostic(diagnostic: BehaviorScriptDiagnostic) {
    this.diagnostics = [...this.diagnostics, diagnostic];
    this.onDiagnostic?.(diagnostic);
  }

  private nextDiagnosticId(scriptId: string, phase: BehaviorScriptPhase): string {
    diagnosticCounter += 1;
    return `${scriptId}:${phase}:${diagnosticCounter}`;
  }

  private detachMissingScript(scriptId: string, message: string) {
    const matches = this.getOrderedRecords().filter(record => record.scriptId === scriptId);
    for (const record of matches) {
      const component = record.component;
      this.detach(component, { keepDiagnostics: true });
      this.report(component, 'factory', new Error(message));
    }
  }
}

function hasFunction(target: any, name: string): boolean {
  return typeof target?.[name] === 'function';
}

function isThenable(value: any): value is PromiseLike<any> {
  return Boolean(value && typeof value.then === 'function');
}

function createInputSignalKey(action: string, phase: BehaviorInputPhase): string {
  return `${action}:${phase}`;
}

function createInputSignalName(action: string, phase: BehaviorInputPhase): string {
  return `input:${action}:${phase}`;
}

function isAttachPhase(phase: BehaviorScriptPhase): boolean {
  return (
    phase === 'factory' || phase === 'setup' || phase === 'restoreState' || phase === 'enterTree' || phase === 'ready'
  );
}

function compareBoundBehaviorScript(a: BoundBehaviorScript, b: BoundBehaviorScript): number {
  const priority = normalizePriority(a.component.priority) - normalizePriority(b.component.priority);
  return priority || a.order - b.order;
}

function compareBehaviorScriptComponent(a: BehaviorScript, b: BehaviorScript): number {
  const priority = normalizePriority(a.priority) - normalizePriority(b.priority);
  if (priority) return priority;
  return a.scriptId.localeCompare(b.scriptId);
}

function normalizePriority(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeGroup(group: string): string {
  return typeof group === 'string' ? group.trim() : '';
}

function normalizeGroups(groups: string[] | undefined): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const group of groups ?? []) {
    const normalized = normalizeGroup(group);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function normalizeNodes(nodes: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [name, path] of Object.entries(nodes ?? {})) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedPath = normalizeNodePath(path);
    if (!normalizedName || !normalizedPath) continue;
    result[normalizedName] = normalizedPath;
  }

  return result;
}

function normalizeNodePath(path: string): string {
  return typeof path === 'string' ? path.trim() : '';
}

function normalizeResources(resources: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [name, resourceName] of Object.entries(resources ?? {})) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedResource = normalizeResourceName(resourceName);
    if (!normalizedName || !normalizedResource) continue;
    result[normalizedName] = normalizedResource;
  }

  return result;
}

function normalizeResourceName(resourceName: string): string {
  return typeof resourceName === 'string' ? resourceName.trim() : '';
}

function getRegisteredResource(resourceName: string): any | undefined {
  if (!resourceName) return;
  return (evaResource as any).resourcesMap?.[resourceName];
}

function hasGroup(component: BehaviorScript, group: string): boolean {
  const normalized = normalizeGroup(group);
  return Boolean(normalized && component.groups?.includes(normalized));
}

function resolveGameObjectPath(self: GameObject, path: string): GameObject | undefined {
  const absolute = path.startsWith('/');
  const segments = path.split('/').filter(Boolean);
  let current: GameObject | undefined = absolute ? self.scene : self;

  if (!current) return;
  if (absolute && segments[0] === current.name) {
    segments.shift();
  }

  for (const segment of segments) {
    if (segment === '.' || segment === 'self') continue;
    if (segment === '..') {
      current = current.parent;
    } else {
      current = findChildByName(current, segment);
    }
    if (!current) return;
  }

  return current;
}

function findChildByName(gameObject: GameObject, name: string): GameObject | undefined {
  return gameObject.children?.find(child => child.name === name && !child.destroyed);
}

function resolveSnapshotSource(
  component: BehaviorScript,
  record: BoundBehaviorScript | undefined,
  registry: BehaviorScriptRegistryLike,
) {
  if (component.source?.uri || component.source?.exportName || component.source?.content) {
    return component.source;
  }

  const sourceUri = record?.sourceUri ?? registry.getSourceUri?.(component.scriptId);
  return sourceUri ? { uri: sourceUri } : undefined;
}

function createCleanupHandle(disposer: BehaviorCleanupDisposer): BehaviorCleanupHandle {
  let disposed = false;

  return {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (typeof disposer === 'function') {
        disposer();
        return;
      }
      const target = disposer as any;
      if (hasFunction(target, 'dispose')) {
        target.dispose();
      } else if (hasFunction(target, 'destroy')) {
        target.destroy();
      }
    },
  };
}
