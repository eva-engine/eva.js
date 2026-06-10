import { OBSERVER_TYPE } from '@eva/eva.js';
import type { UpdateParams } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import { BehaviorScript } from './BehaviorScript';
import { BehaviorScriptSystem } from './BehaviorScriptSystem';
import type { BehaviorScriptManifest } from './manifest';
import type {
  BehaviorScriptCatalog,
  BehaviorEventTarget,
  BehaviorFixedFrame,
  BehaviorInputEvent,
  BehaviorScriptDiagnostic,
  BehaviorScriptFactory,
  BehaviorScriptPauseMode,
  BehaviorScriptRuntimeSnapshot,
  BehaviorScriptParams,
  BehaviorScriptSource,
  BehaviorScriptSystemParams,
} from './types';

export type BehaviorScriptValidationEventTarget = 'self' | 'component' | 'gameObject' | string;

export type BehaviorScriptValidationStep =
  | { type: 'update'; frame?: Partial<UpdateParams> }
  | { type: 'lateUpdate'; frame?: Partial<UpdateParams> }
  | { type: 'fixedUpdate'; frame?: Partial<BehaviorFixedFrame> }
  | { type: 'input'; event: BehaviorInputEvent }
  | { type: 'event'; name: string; payload?: any; target?: BehaviorScriptValidationEventTarget }
  | { type: 'signal'; name: string; payload?: any }
  | { type: 'enabled'; enabled: boolean }
  | { type: 'props'; props: Record<string, any> }
  | { type: 'groupCall'; group: string; method: string; args?: any[] }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'hotReload'; factory: BehaviorScriptFactory; keepState?: boolean };

export interface BehaviorScriptValidationContext {
  system: BehaviorScriptSystem;
  component: BehaviorScript;
  eventTargets: Record<string, BehaviorEventTarget>;
  diagnostics: BehaviorScriptDiagnostic[];
  emittedSignals: Array<{ name: string; payload?: any }>;
}

export interface BehaviorScriptValidationAssertion {
  name: string;
  check(context: BehaviorScriptValidationContext): void | boolean | string | Promise<void | boolean | string>;
}

export interface BehaviorScriptValidationPlan<Props extends Record<string, any> = Record<string, any>> {
  scriptId: string;
  factory: BehaviorScriptFactory<Props>;
  props?: Props;
  source?: BehaviorScriptSource;
  enabled?: boolean;
  priority?: number;
  groups?: string[];
  nodes?: Record<string, string>;
  resources?: Record<string, string>;
  executeInEditMode?: boolean;
  pauseMode?: BehaviorScriptPauseMode;
  gameObjectName?: string;
  systemParams?: Omit<BehaviorScriptSystemParams, 'scripts' | 'onDiagnostic'>;
  extraScripts?: Record<string, BehaviorScriptFactory>;
  autoPlan?: boolean | BehaviorScriptValidationAutoPlanOptions;
  steps?: BehaviorScriptValidationStep[];
  assertions?: BehaviorScriptValidationAssertion[];
  expectedSignals?: string[];
  failOnDiagnostics?: boolean;
  resetSignalBus?: boolean;
  asyncFlushIterations?: number;
}

export interface BehaviorScriptValidationError {
  step?: string;
  message: string;
  stack?: string;
}

export interface BehaviorScriptValidationMissingNode {
  scriptId: string;
  name: string;
  path: string;
  gameObjectName?: string;
  required?: boolean;
  multiple?: boolean;
}

export interface BehaviorScriptValidationMissingResource {
  scriptId: string;
  name: string;
  resource: string;
  gameObjectName?: string;
  type?: string;
  required?: boolean;
  preload?: boolean;
}

export interface BehaviorScriptValidationResult {
  ok: boolean;
  diagnostics: BehaviorScriptDiagnostic[];
  errors: BehaviorScriptValidationError[];
  emittedSignals: Array<{ name: string; payload?: any }>;
  missingSignals: string[];
  missingNodes: BehaviorScriptValidationMissingNode[];
  missingResources: BehaviorScriptValidationMissingResource[];
  runtimeSnapshot?: BehaviorScriptRuntimeSnapshot;
}

export interface BehaviorScriptValidationAutoPlanOptions {
  frames?: boolean;
  inputs?: boolean;
  events?: boolean;
  signals?: boolean;
  expectedSignals?: boolean;
}

export interface BehaviorScriptDerivedValidationPlan {
  steps: BehaviorScriptValidationStep[];
  expectedSignals: string[];
}

export interface BehaviorScriptValidationReport {
  ok: boolean;
  status: 'passed' | 'failed';
  scriptId: string;
  source?: BehaviorScriptSource;
  manifest?: BehaviorScriptManifest;
  catalog?: BehaviorScriptCatalog;
  steps: string[];
  message: string;
  suggestions: string[];
  summary: {
    diagnostics: number;
    errors: number;
    emittedSignals: number;
    missingSignals: number;
    missingNodes: number;
    missingResources: number;
    failedAssertions: number;
  };
  failures: {
    diagnostics: BehaviorScriptDiagnostic[];
    errors: BehaviorScriptValidationError[];
    missingSignals: string[];
    missingNodes: BehaviorScriptValidationMissingNode[];
    missingResources: BehaviorScriptValidationMissingResource[];
  };
  emittedSignals: Array<{ name: string; payload?: any }>;
  runtimeSnapshot?: BehaviorScriptRuntimeSnapshot;
}

const DEFAULT_UPDATE_FRAME: UpdateParams = {
  deltaTime: 16,
  frameCount: 1,
  time: 16,
  currentTime: 16,
  fps: 60,
};

const DEFAULT_FIXED_FRAME: BehaviorFixedFrame = {
  deltaTime: 16,
  fixedDeltaTime: 16,
  step: 1,
  time: 16,
};

const DEFAULT_INPUT_PHASES: Array<NonNullable<BehaviorInputEvent['phase']>> = ['press', 'release', 'hold'];

export function validateBehaviorScript<Props extends Record<string, any> = Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
): BehaviorScriptValidationResult {
  const diagnostics: BehaviorScriptDiagnostic[] = [];
  const errors: BehaviorScriptValidationError[] = [];
  const emittedSignals: Array<{ name: string; payload?: any }> = [];
  const resolved = resolveValidationPlan(plan);
  const expectedSignals = resolved.expectedSignals;
  const bus = getSignalBus();

  if (plan.resetSignalBus !== false) {
    bus.clear();
  }

  const signalHandles = expectedSignals.map(name =>
    bus.on(name, payload => {
      emittedSignals.push({ name, payload });
    }),
  );
  let runtimeSnapshot: BehaviorScriptRuntimeSnapshot | undefined;

  const eventTargets = createValidationEventTargets(plan.factory.manifest, plan.systemParams?.eventTargets);
  const system = new BehaviorScriptSystem({
    ...(plan.systemParams ?? {}),
    eventTargets,
    scripts: {
      ...(plan.extraScripts ?? {}),
      [plan.scriptId]: plan.factory,
    },
    onDiagnostic: diagnostic => diagnostics.push(diagnostic),
  });
  system.init(system.__systemDefaultParams);

  const component = new BehaviorScript({
    scriptId: plan.scriptId,
    props: plan.props,
    source: plan.source ?? plan.factory.manifest?.source,
    enabled: plan.enabled,
    priority: plan.priority,
    groups: plan.groups,
    nodes: plan.nodes,
    resources: plan.resources,
    executeInEditMode: plan.executeInEditMode,
    pauseMode: plan.pauseMode,
  } as BehaviorScriptParams<Props>);
  component.gameObject = createValidationEventTarget(plan.gameObjectName ?? plan.scriptId) as any;
  component.init(component.__componentDefaultParams);

  const context: BehaviorScriptValidationContext = {
    system,
    component,
    eventTargets,
    diagnostics,
    emittedSignals,
  };

  try {
    system.attach(component);

    for (const step of resolved.steps) {
      runStep(step, context, errors);
    }

    for (const assertion of plan.assertions ?? []) {
      runAssertion(assertion, context, errors);
    }
  } catch (error) {
    errors.push(toValidationError(error, 'validation'));
  } finally {
    runtimeSnapshot = system.getRuntimeSnapshot();
    system.detach(component);
    for (const handle of signalHandles) handle.dispose();
  }

  return createBehaviorScriptValidationResult({
    diagnostics,
    errors,
    emittedSignals,
    expectedSignals,
    runtimeSnapshot,
    failOnDiagnostics: plan.failOnDiagnostics,
  });
}

export function runBehaviorScriptValidation<Props extends Record<string, any> = Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
): BehaviorScriptValidationReport {
  const resolved = resolveValidationPlan(plan);
  const result = validateBehaviorScript(plan);
  return createBehaviorScriptValidationReport(plan, resolved, result);
}

export async function validateBehaviorScriptAsync<Props extends Record<string, any> = Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
): Promise<BehaviorScriptValidationResult> {
  const diagnostics: BehaviorScriptDiagnostic[] = [];
  const errors: BehaviorScriptValidationError[] = [];
  const emittedSignals: Array<{ name: string; payload?: any }> = [];
  const resolved = resolveValidationPlan(plan);
  const expectedSignals = resolved.expectedSignals;
  const bus = getSignalBus();

  if (plan.resetSignalBus !== false) {
    bus.clear();
  }

  const signalHandles = expectedSignals.map(name =>
    bus.on(name, payload => {
      emittedSignals.push({ name, payload });
    }),
  );
  let runtimeSnapshot: BehaviorScriptRuntimeSnapshot | undefined;

  const eventTargets = createValidationEventTargets(plan.factory.manifest, plan.systemParams?.eventTargets);
  const system = new BehaviorScriptSystem({
    ...(plan.systemParams ?? {}),
    eventTargets,
    scripts: {
      ...(plan.extraScripts ?? {}),
      [plan.scriptId]: plan.factory,
    },
    onDiagnostic: diagnostic => diagnostics.push(diagnostic),
  });
  system.init(system.__systemDefaultParams);

  const component = new BehaviorScript({
    scriptId: plan.scriptId,
    props: plan.props,
    source: plan.source ?? plan.factory.manifest?.source,
    enabled: plan.enabled,
    priority: plan.priority,
    groups: plan.groups,
    nodes: plan.nodes,
    resources: plan.resources,
    executeInEditMode: plan.executeInEditMode,
    pauseMode: plan.pauseMode,
  } as BehaviorScriptParams<Props>);
  component.gameObject = createValidationEventTarget(plan.gameObjectName ?? plan.scriptId) as any;
  component.init(component.__componentDefaultParams);

  const context: BehaviorScriptValidationContext = {
    system,
    component,
    eventTargets,
    diagnostics,
    emittedSignals,
  };

  try {
    system.attach(component);
    await flushValidationAsyncTasks(context, errors, 'attach', plan.asyncFlushIterations);

    for (const step of resolved.steps) {
      runStep(step, context, errors);
      await flushValidationAsyncTasks(context, errors, stepToName(step), plan.asyncFlushIterations);
    }

    for (const assertion of plan.assertions ?? []) {
      await runAssertionAsync(assertion, context, errors);
      await flushValidationAsyncTasks(context, errors, assertion.name, plan.asyncFlushIterations);
    }
  } catch (error) {
    errors.push(toValidationError(error, 'validation'));
  } finally {
    await flushValidationAsyncTasks(context, errors, 'validation', plan.asyncFlushIterations);
    runtimeSnapshot = system.getRuntimeSnapshot();
    system.detach(component);
    for (const handle of signalHandles) handle.dispose();
  }

  return createBehaviorScriptValidationResult({
    diagnostics,
    errors,
    emittedSignals,
    expectedSignals,
    runtimeSnapshot,
    failOnDiagnostics: plan.failOnDiagnostics,
  });
}

export async function runBehaviorScriptValidationAsync<Props extends Record<string, any> = Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
): Promise<BehaviorScriptValidationReport> {
  const resolved = resolveValidationPlan(plan);
  const result = await validateBehaviorScriptAsync(plan);
  return createBehaviorScriptValidationReport(plan, resolved, result);
}

function createBehaviorScriptValidationReport<Props extends Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
  resolved: BehaviorScriptDerivedValidationPlan,
  result: BehaviorScriptValidationResult,
): BehaviorScriptValidationReport {
  const manifest = plan.factory.manifest;
  const source = plan.source ?? manifest?.source;
  const steps = resolved.steps.map(stepToName);
  const summary = {
    diagnostics: result.diagnostics.length,
    errors: result.errors.length,
    emittedSignals: result.emittedSignals.length,
    missingSignals: result.missingSignals.length,
    missingNodes: result.missingNodes.length,
    missingResources: result.missingResources.length,
    failedAssertions: result.errors.filter(error => error.step && !isValidationStepName(error.step)).length,
  };
  const suggestions = createValidationSuggestions(result);

  return {
    ok: result.ok,
    status: result.ok ? 'passed' : 'failed',
    scriptId: plan.scriptId,
    source,
    manifest,
    catalog: plan.systemParams?.registry?.getCatalog?.(),
    steps,
    message: createValidationMessage(plan.scriptId, result.ok, summary, steps),
    suggestions,
    summary,
    failures: {
      diagnostics: result.diagnostics,
      errors: result.errors,
      missingSignals: result.missingSignals,
      missingNodes: result.missingNodes,
      missingResources: result.missingResources,
    },
    emittedSignals: result.emittedSignals,
    runtimeSnapshot: result.runtimeSnapshot,
  };
}

export function deriveBehaviorScriptValidationPlan(
  manifest: BehaviorScriptManifest | undefined,
  options: BehaviorScriptValidationAutoPlanOptions = {},
): BehaviorScriptDerivedValidationPlan {
  const enabled = {
    frames: options.frames !== false,
    inputs: options.inputs !== false,
    events: options.events !== false,
    signals: options.signals !== false,
    expectedSignals: options.expectedSignals !== false,
  };
  const steps: BehaviorScriptValidationStep[] = [];
  const expectedSignals: string[] = [];

  if (enabled.frames) {
    steps.push(...defaultValidationSteps());
  }

  if (manifest && enabled.inputs) {
    for (const input of manifest.inputs ?? []) {
      if (!input.action) continue;
      const phases = input.phases?.length ? input.phases : DEFAULT_INPUT_PHASES;
      for (const phase of phases) {
        steps.push({
          type: 'input',
          event: {
            action: input.action,
            phase,
            source: 'manifest',
            payload: { action: input.action, phase },
          },
        });
      }
    }
  }

  if (manifest && enabled.events) {
    for (const event of manifest.events ?? []) {
      if (!event.name || (event.direction !== 'listen' && event.direction !== 'both')) continue;
      steps.push({
        type: 'event',
        name: event.name,
        target: event.target ?? 'component',
        payload: createPayloadFromSchema(event.payload),
      });
    }
  }

  if (manifest && enabled.signals) {
    for (const signal of manifest.signals ?? []) {
      if (!signal.name) continue;
      if (enabled.expectedSignals && (signal.direction === 'emit' || signal.direction === 'both')) {
        expectedSignals.push(signal.name);
      }
      if (signal.direction === 'listen' || signal.direction === 'both') {
        steps.push({
          type: 'signal',
          name: signal.name,
          payload: createPayloadFromSchema(signal.payload),
        });
      }
    }
  }

  return {
    steps: dedupeValidationSteps(steps),
    expectedSignals: [...new Set(expectedSignals)],
  };
}

function createValidationMessage(
  scriptId: string,
  ok: boolean,
  summary: BehaviorScriptValidationReport['summary'],
  steps: string[],
): string {
  if (ok) {
    return `BehaviorScript "${scriptId}" passed ${steps.length} validation step(s) with ${summary.emittedSignals} emitted signal(s).`;
  }

  const failures = [
    summary.diagnostics ? `${summary.diagnostics} diagnostic(s)` : undefined,
    summary.errors ? `${summary.errors} error(s)` : undefined,
    summary.missingSignals ? `${summary.missingSignals} missing signal(s)` : undefined,
    summary.missingNodes ? `${summary.missingNodes} missing required node(s)` : undefined,
    summary.missingResources ? `${summary.missingResources} missing required resource(s)` : undefined,
  ].filter(Boolean);
  return `BehaviorScript "${scriptId}" failed validation: ${failures.join(', ')}.`;
}

function createValidationSuggestions(result: BehaviorScriptValidationResult): string[] {
  const suggestions: string[] = [];

  if (result.diagnostics.length) {
    const first = result.diagnostics[0];
    suggestions.push(
      `Fix runtime diagnostic in ${first.scriptId}.${first.phase}: ${
        first.message
      }${formatDiagnosticSourceForSuggestion(first.source)}.`,
    );
  }

  if (result.errors.length) {
    const first = result.errors[0];
    suggestions.push(`Fix validation step "${first.step ?? 'validation'}": ${first.message}.`);
  }

  if (result.missingSignals.length) {
    suggestions.push(`Emit missing expected signal(s): ${result.missingSignals.join(', ')}.`);
  }

  if (result.missingNodes.length) {
    const formatted = result.missingNodes.map(node => `${node.name} -> ${node.path}`).join(', ');
    suggestions.push(`Resolve missing required node reference(s): ${formatted}.`);
  }

  if (result.missingResources.length) {
    const formatted = result.missingResources.map(resource => `${resource.name} -> ${resource.resource}`).join(', ');
    suggestions.push(`Register missing required resource reference(s): ${formatted}.`);
  }

  return suggestions;
}

function createBehaviorScriptValidationResult(options: {
  diagnostics: BehaviorScriptDiagnostic[];
  errors: BehaviorScriptValidationError[];
  emittedSignals: Array<{ name: string; payload?: any }>;
  expectedSignals: string[];
  runtimeSnapshot?: BehaviorScriptRuntimeSnapshot;
  failOnDiagnostics?: boolean;
}): BehaviorScriptValidationResult {
  const missingSignals = options.expectedSignals.filter(
    name => !options.emittedSignals.some(signal => signal.name === name),
  );
  const missingNodes = collectMissingRequiredNodes(options.runtimeSnapshot);
  const missingResources = collectMissingRequiredResources(options.runtimeSnapshot);
  const failOnDiagnostics = options.failOnDiagnostics !== false;
  const hasBlockingDiagnostic =
    failOnDiagnostics && options.diagnostics.some(diagnostic => diagnostic.severity === 'error');
  const ok =
    options.errors.length === 0 &&
    missingSignals.length === 0 &&
    missingNodes.length === 0 &&
    missingResources.length === 0 &&
    !hasBlockingDiagnostic;

  return {
    ok,
    diagnostics: options.diagnostics,
    errors: options.errors,
    emittedSignals: options.emittedSignals,
    missingSignals,
    missingNodes,
    missingResources,
    runtimeSnapshot: options.runtimeSnapshot,
  };
}

function collectMissingRequiredNodes(
  runtimeSnapshot: BehaviorScriptRuntimeSnapshot | undefined,
): BehaviorScriptValidationMissingNode[] {
  const missing: BehaviorScriptValidationMissingNode[] = [];

  for (const script of runtimeSnapshot?.scripts ?? []) {
    for (const node of script.nodes ?? []) {
      if (!node.required || node.resolved) continue;
      missing.push({
        scriptId: script.scriptId,
        name: node.name,
        path: node.path,
        gameObjectName: script.gameObjectName,
        required: node.required,
        multiple: node.multiple,
      });
    }
  }

  return missing;
}

function collectMissingRequiredResources(
  runtimeSnapshot: BehaviorScriptRuntimeSnapshot | undefined,
): BehaviorScriptValidationMissingResource[] {
  const missing: BehaviorScriptValidationMissingResource[] = [];

  for (const script of runtimeSnapshot?.scripts ?? []) {
    for (const resource of script.resources ?? []) {
      if (!resource.required || resource.available) continue;
      missing.push({
        scriptId: script.scriptId,
        name: resource.name,
        resource: resource.resource,
        gameObjectName: script.gameObjectName,
        type: resource.type,
        required: resource.required,
        preload: resource.preload,
      });
    }
  }

  return missing;
}

function formatDiagnosticSourceForSuggestion(source: BehaviorScriptDiagnostic['source']): string {
  if (!source?.uri) return '';

  const location =
    source.line && source.column
      ? `${source.uri}:${source.line}:${source.column}`
      : source.line
      ? `${source.uri}:${source.line}`
      : source.uri;
  return ` (${location})`;
}

function defaultValidationSteps(): BehaviorScriptValidationStep[] {
  return [
    { type: 'update', frame: DEFAULT_UPDATE_FRAME },
    { type: 'lateUpdate', frame: DEFAULT_UPDATE_FRAME },
    { type: 'fixedUpdate', frame: DEFAULT_FIXED_FRAME },
  ];
}

function resolveValidationPlan<Props extends Record<string, any>>(
  plan: BehaviorScriptValidationPlan<Props>,
): BehaviorScriptDerivedValidationPlan {
  const autoPlan = resolveAutoPlanOptions(plan.autoPlan);
  const derived = autoPlan ? deriveBehaviorScriptValidationPlan(plan.factory.manifest, autoPlan) : undefined;

  return {
    steps: plan.steps ?? derived?.steps ?? defaultValidationSteps(),
    expectedSignals: plan.expectedSignals ?? derived?.expectedSignals ?? [],
  };
}

function resolveAutoPlanOptions(
  autoPlan: BehaviorScriptValidationPlan['autoPlan'],
): BehaviorScriptValidationAutoPlanOptions | undefined {
  if (!autoPlan) return;
  return autoPlan === true ? {} : autoPlan;
}

function stepToName(step: BehaviorScriptValidationStep): string {
  switch (step.type) {
    case 'input':
      return step.event.action ? `input:${step.event.action}:${step.event.phase ?? 'custom'}` : 'input';
    case 'event':
      return `event:${step.name}`;
    case 'signal':
      return `signal:${step.name}`;
    case 'props':
      return 'props';
    case 'enabled':
      return `enabled:${step.enabled}`;
    case 'hotReload':
      return 'hotReload';
    case 'groupCall':
      return `groupCall:${step.group}.${step.method}`;
    default:
      return step.type;
  }
}

function isValidationStepName(step: string): boolean {
  return [
    'update',
    'lateUpdate',
    'fixedUpdate',
    'input',
    'event',
    'signal',
    'enabled',
    'props',
    'groupCall',
    'pause',
    'resume',
    'hotReload',
    'validation',
  ].some(name => step === name || step.startsWith(`${name}:`));
}

function runStep(
  step: BehaviorScriptValidationStep,
  context: BehaviorScriptValidationContext,
  errors: BehaviorScriptValidationError[],
) {
  try {
    switch (step.type) {
      case 'update':
        context.system.update({ ...DEFAULT_UPDATE_FRAME, ...(step.frame ?? {}) });
        break;
      case 'lateUpdate':
        context.system.lateUpdate({ ...DEFAULT_UPDATE_FRAME, ...(step.frame ?? {}) });
        break;
      case 'fixedUpdate':
        context.system.fixedUpdate({ ...DEFAULT_FIXED_FRAME, ...(step.frame ?? {}) });
        break;
      case 'input':
        context.system.dispatchInput(step.event, context.component);
        break;
      case 'event':
        context.system.emitEvent(resolveEventTarget(step.target, context), step.name, step.payload);
        break;
      case 'signal':
        context.system.emitSignal(step.name, step.payload);
        break;
      case 'enabled':
        context.system.setEnabled(context.component, step.enabled);
        break;
      case 'props':
        context.component.props = step.props;
        context.system.componentChanged({
          component: context.component,
          componentName: 'BehaviorScript',
          prop: { prop: ['props'], deep: true },
          type: OBSERVER_TYPE.CHANGE,
        });
        break;
      case 'groupCall':
        context.system.callGroup(step.group, step.method, ...(step.args ?? []));
        break;
      case 'pause':
        context.system.onPause();
        break;
      case 'resume':
        context.system.onResume();
        break;
      case 'hotReload':
        context.system.reloadScript(context.component.scriptId, step.factory, { keepState: step.keepState });
        break;
    }
  } catch (error) {
    errors.push(toValidationError(error, step.type));
  }
}

function resolveEventTarget(
  target: BehaviorScriptValidationEventTarget | undefined,
  context: BehaviorScriptValidationContext,
): BehaviorEventTarget {
  if (!target || target === 'self' || target === 'component') return context.component;
  if (target === 'gameObject') return context.component.gameObject as BehaviorEventTarget;
  return context.eventTargets[target as string] ?? context.component;
}

function createValidationEventTargets(
  manifest: BehaviorScriptManifest | undefined,
  provided: Record<string, BehaviorEventTarget> | undefined,
): Record<string, BehaviorEventTarget> {
  const targets: Record<string, BehaviorEventTarget> = { ...(provided ?? {}) };

  for (const event of manifest?.events ?? []) {
    const target = event.target;
    if (!target || target === 'self' || target === 'component' || target === 'gameObject') continue;
    targets[target] = targets[target] ?? createValidationEventTarget(target);
  }

  return targets;
}

function createValidationEventTarget(name = 'target'): BehaviorEventTarget & { name: string; transform: any } {
  const listeners = new Map<string, Set<(payload: any) => void>>();

  return {
    name,
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
    },
    on(eventName: string, listener: (payload: any) => void) {
      const set = listeners.get(eventName) ?? new Set<(payload: any) => void>();
      set.add(listener);
      listeners.set(eventName, set);
    },
    off(eventName: string, listener: (payload: any) => void) {
      listeners.get(eventName)?.delete(listener);
    },
    emit(eventName: string, payload?: any) {
      for (const listener of Array.from(listeners.get(eventName) ?? [])) {
        listener(payload);
      }
    },
  };
}

function createPayloadFromSchema(payload?: Record<string, any>): Record<string, any> | undefined {
  if (!payload) return;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    const type = typeof value === 'string' ? value : value.type;
    result[key] = sampleValueForType(type);
  }
  return result;
}

function sampleValueForType(type: string): any {
  switch (type) {
    case 'number':
      return 1;
    case 'boolean':
      return true;
    case 'array':
    case 'vec2':
      return [0, 0];
    case 'object':
      return {};
    case 'color':
      return '#ffffff';
    case 'asset':
      return 'asset://validation';
    case 'enum':
    case 'string':
    default:
      return 'validation';
  }
}

function dedupeValidationSteps(steps: BehaviorScriptValidationStep[]): BehaviorScriptValidationStep[] {
  const seen = new Set<string>();
  const result: BehaviorScriptValidationStep[] = [];

  for (const step of steps) {
    const key = stepToName(step);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(step);
  }

  return result;
}

function runAssertion(
  assertion: BehaviorScriptValidationAssertion,
  context: BehaviorScriptValidationContext,
  errors: BehaviorScriptValidationError[],
) {
  try {
    const result = assertion.check(context);
    if (result === false) {
      errors.push({ step: assertion.name, message: `Assertion failed: ${assertion.name}` });
    } else if (typeof result === 'string') {
      errors.push({ step: assertion.name, message: result });
    }
  } catch (error) {
    errors.push(toValidationError(error, assertion.name));
  }
}

async function runAssertionAsync(
  assertion: BehaviorScriptValidationAssertion,
  context: BehaviorScriptValidationContext,
  errors: BehaviorScriptValidationError[],
) {
  try {
    const result = await assertion.check(context);
    if (result === false) {
      errors.push({ step: assertion.name, message: `Assertion failed: ${assertion.name}` });
    } else if (typeof result === 'string') {
      errors.push({ step: assertion.name, message: result });
    }
  } catch (error) {
    errors.push(toValidationError(error, assertion.name));
  }
}

async function flushValidationAsyncTasks(
  context: BehaviorScriptValidationContext,
  errors: BehaviorScriptValidationError[],
  step: string,
  maxIterations?: number,
) {
  try {
    await context.system.flushAsyncTasks(maxIterations);
  } catch (error) {
    errors.push(toValidationError(error, step));
  }
}

function toValidationError(error: any, step?: string): BehaviorScriptValidationError {
  return {
    step,
    message: error?.message ?? String(error),
    stack: error?.stack,
  };
}
