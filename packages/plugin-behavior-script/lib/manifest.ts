import type { BehaviorInputEvent, BehaviorScriptFactory, BehaviorScriptPhase, BehaviorScriptSource } from './types';
import {
  assertScriptIdValid,
  normalizePropsArrayToSchema,
  type BehaviorPropsSchema,
} from './props-schema';

export type BehaviorValueType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'object'
  | 'array'
  | 'vec2'
  | 'color'
  | 'asset'
  | 'enum';

export interface BehaviorEnumOption {
  label?: string;
  value: string | number | boolean;
}

export interface BehaviorPropertyHint {
  name: string;
  type: BehaviorValueType;
  label?: string;
  description?: string;
  default?: any;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  enum?: BehaviorEnumOption[];
  group?: string;
}

export interface BehaviorSignalHint {
  name: string;
  direction: 'emit' | 'listen' | 'both';
  description?: string;
  payload?: Record<string, BehaviorValueType | BehaviorPropertyHint>;
}

export interface BehaviorEventHint {
  name: string;
  target?: 'self' | 'gameObject' | 'component' | 'dom' | string;
  direction: 'emit' | 'listen' | 'both';
  description?: string;
  payload?: Record<string, BehaviorValueType | BehaviorPropertyHint>;
}

export interface BehaviorInputHint {
  action: string;
  phases?: Array<NonNullable<BehaviorInputEvent['phase']>>;
  description?: string;
}

export interface BehaviorGroupHint {
  name: string;
  description?: string;
}

export interface BehaviorNodeHint {
  name: string;
  path?: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
}

export interface BehaviorResourceHint {
  name: string;
  resource?: string;
  type?: string;
  description?: string;
  required?: boolean;
  preload?: boolean;
}

export interface BehaviorLifecycleHint {
  phase: BehaviorScriptPhase;
  description?: string;
  required?: boolean;
}

export interface BehaviorScriptManifest {
  scriptId: string;
  displayName?: string;
  description?: string | Record<string, string>;
  category?: string;
  version?: string;
  source?: BehaviorScriptSource;
  /**
   * Legacy prop hint array form. Authors should migrate to `propsSchema`;
   * for back-compat we still accept this and synthesize `propsSchema` from it
   * via `normalizePropsArrayToSchema`.
   */
  props?: BehaviorPropertyHint[];
  /**
   * Canonical prop metadata — JSON-Schema-flavoured. Drives the
   * MetadataDrivenInspector and is forwarded to the Editor catalog.
   */
  propsSchema?: BehaviorPropsSchema;
  inputs?: BehaviorInputHint[];
  signals?: BehaviorSignalHint[];
  events?: BehaviorEventHint[];
  groups?: BehaviorGroupHint[];
  nodes?: BehaviorNodeHint[];
  resources?: BehaviorResourceHint[];
  lifecycle?: BehaviorLifecycleHint[];
  tags?: string[];
  singleton?: boolean;
  addable?: boolean;
  requires?: ReadonlyArray<{ componentName: string; severity?: 'error' | 'warning' }>;
}

/**
 * Legacy call shape: `defineBehaviorScript({ manifest, factory })`.
 */
export interface BehaviorScriptLegacyDefinition<
  Props extends Record<string, any> = Record<string, any>,
  State = any,
> {
  manifest: BehaviorScriptManifest;
  factory: BehaviorScriptFactory<Props, State>;
}

/**
 * New canonical call shape: `defineBehaviorScript({ id, propsSchema, factory })`.
 * `id` becomes both the scriptId AND the DSL `component.type` (when used as a
 * first-class citizen, see ADR-0020). `propsSchema` is the JSON-Schema-flavoured
 * metadata format consumed by the MetadataDrivenInspector.
 */
export interface BehaviorScriptFlatDefinition<
  Props extends Record<string, any> = Record<string, any>,
  State = any,
> {
  id: string;
  displayName?: string;
  description?: string | Record<string, string>;
  category?: string;
  tags?: string[];
  version?: string;
  source?: BehaviorScriptSource;
  propsSchema?: BehaviorPropsSchema;
  inputs?: BehaviorInputHint[];
  signals?: BehaviorSignalHint[];
  events?: BehaviorEventHint[];
  groups?: BehaviorGroupHint[];
  nodes?: BehaviorNodeHint[];
  resources?: BehaviorResourceHint[];
  lifecycle?: BehaviorLifecycleHint[];
  singleton?: boolean;
  addable?: boolean;
  requires?: ReadonlyArray<{ componentName: string; severity?: 'error' | 'warning' }>;
  factory: BehaviorScriptFactory<Props, State>;
}

/**
 * Union — `defineBehaviorScript` accepts either form. Detection at runtime:
 * `'manifest' in def` ⇒ legacy; `'id' in def` ⇒ flat.
 */
export type BehaviorScriptDefinition<
  Props extends Record<string, any> = Record<string, any>,
  State = any,
> = BehaviorScriptLegacyDefinition<Props, State> | BehaviorScriptFlatDefinition<Props, State>;

export interface BehaviorManifestIssue {
  path: string;
  message: string;
}

export const DEFAULT_BEHAVIOR_LIFECYCLE_HINTS: BehaviorLifecycleHint[] = [
  { phase: 'setup', description: 'Create subscriptions and read initial props.' },
  { phase: 'enterTree', description: 'Runs after the script is attached to a game object.' },
  { phase: 'ready', description: 'Runs after setup/enterTree, before frame processing.' },
  { phase: 'process', description: 'Frame update, equivalent to Godot _process.' },
  { phase: 'lateProcess', description: 'Runs after process in the same frame.' },
  { phase: 'physicsProcess', description: 'Fixed-step update, equivalent to Godot _physics_process.' },
  { phase: 'input', description: 'First-pass input handling.' },
  { phase: 'unhandledInput', description: 'Input fallback when no script handled the event.' },
  { phase: 'pause', description: 'Game pause hook.' },
  { phase: 'resume', description: 'Game resume hook.' },
  { phase: 'exitTree', description: 'Runs before script teardown.' },
  { phase: 'destroy', description: 'Final cleanup hook.' },
];

export function defineBehaviorScript<Props extends Record<string, any> = Record<string, any>, State = any>(
  definition: BehaviorScriptDefinition<Props, State>,
): BehaviorScriptFactory<Props, State> {
  const rawManifest: BehaviorScriptManifest = isFlatDefinition(definition)
    ? {
        scriptId: definition.id,
        displayName: definition.displayName,
        description: definition.description,
        category: definition.category,
        tags: definition.tags,
        version: definition.version,
        source: definition.source,
        propsSchema: definition.propsSchema,
        inputs: definition.inputs,
        signals: definition.signals,
        events: definition.events,
        groups: definition.groups,
        nodes: definition.nodes,
        resources: definition.resources,
        lifecycle: definition.lifecycle,
        singleton: definition.singleton,
        addable: definition.addable,
        requires: definition.requires,
      }
    : { ...definition.manifest };

  // Enforce scriptId shape + reserved-builtin blacklist BEFORE normalization.
  // When scriptId is missing/empty we let the legacy validator flow raise its
  // own "Invalid BehaviorScript manifest: scriptId is required" message
  // (preserves the back-compat assertion contract used by 78+ existing specs).
  if (typeof rawManifest.scriptId === 'string' && rawManifest.scriptId.trim().length > 0) {
    assertScriptIdValid(rawManifest.scriptId);
  }

  const manifest = normalizeBehaviorScriptManifest(rawManifest);
  const issues = validateBehaviorScriptManifest(manifest);
  if (issues.length) {
    throw new Error(`Invalid BehaviorScript manifest: ${issues.map(issue => issue.message).join('; ')}`);
  }

  const factory = definition.factory as BehaviorScriptFactory<Props, State>;
  factory.manifest = manifest;
  return factory;
}

function isFlatDefinition<P extends Record<string, any>, S>(
  def: BehaviorScriptDefinition<P, S>,
): def is BehaviorScriptFlatDefinition<P, S> {
  return typeof (def as BehaviorScriptFlatDefinition<P, S>).id === 'string';
}

export function normalizeBehaviorScriptManifest(manifest: BehaviorScriptManifest): BehaviorScriptManifest {
  const normalizedProps = normalizeUniqueByName(manifest.props ?? [], 'props');
  // If the author only supplied legacy `props[]`, synthesize a JSON-Schema
  // `propsSchema` from it so downstream consumers (Inspector, validators,
  // catalog exporter) can rely on a single canonical metadata shape.
  const propsSchema =
    manifest.propsSchema ?? normalizePropsArrayToSchema(normalizedProps as any);
  return {
    ...manifest,
    props: normalizedProps,
    propsSchema,
    inputs: normalizeUniqueByName(manifest.inputs ?? [], 'inputs'),
    signals: normalizeUniqueByName(manifest.signals ?? [], 'signals'),
    events: normalizeUniqueEvents(manifest.events ?? []),
    groups: normalizeUniqueByName(manifest.groups ?? [], 'groups'),
    nodes: normalizeUniqueByName(manifest.nodes ?? [], 'nodes'),
    resources: normalizeUniqueByName(manifest.resources ?? [], 'resources'),
    lifecycle:
      manifest.lifecycle && manifest.lifecycle.length
        ? normalizeUniqueByPhase(manifest.lifecycle)
        : DEFAULT_BEHAVIOR_LIFECYCLE_HINTS,
    tags: [...new Set(manifest.tags ?? [])],
  };
}

export function validateBehaviorScriptManifest(manifest: BehaviorScriptManifest): BehaviorManifestIssue[] {
  const issues: BehaviorManifestIssue[] = [];

  if (!manifest.scriptId?.trim()) {
    issues.push({ path: 'scriptId', message: 'scriptId is required' });
  }

  for (const [index, prop] of (manifest.props ?? []).entries()) {
    if (!prop.name?.trim()) {
      issues.push({ path: `props.${index}.name`, message: 'property name is required' });
    }
    if (!prop.type) {
      issues.push({ path: `props.${index}.type`, message: `property "${prop.name}" type is required` });
    }
    if (prop.type === 'enum' && (!prop.enum || !prop.enum.length)) {
      issues.push({ path: `props.${index}.enum`, message: `enum property "${prop.name}" needs options` });
    }
  }

  for (const [index, input] of (manifest.inputs ?? []).entries()) {
    if (!input.action?.trim()) {
      issues.push({ path: `inputs.${index}.action`, message: 'input action is required' });
    }
  }

  for (const [index, signal] of (manifest.signals ?? []).entries()) {
    if (!signal.name?.trim()) {
      issues.push({ path: `signals.${index}.name`, message: 'signal name is required' });
    }
    if (!signal.direction) {
      issues.push({ path: `signals.${index}.direction`, message: `signal "${signal.name}" direction is required` });
    }
  }

  for (const [index, event] of (manifest.events ?? []).entries()) {
    if (!event.name?.trim()) {
      issues.push({ path: `events.${index}.name`, message: 'event name is required' });
    }
    if (!event.direction) {
      issues.push({ path: `events.${index}.direction`, message: `event "${event.name}" direction is required` });
    }
  }

  for (const [index, group] of (manifest.groups ?? []).entries()) {
    if (!group.name?.trim()) {
      issues.push({ path: `groups.${index}.name`, message: 'group name is required' });
    }
  }

  for (const [index, node] of (manifest.nodes ?? []).entries()) {
    if (!node.name?.trim()) {
      issues.push({ path: `nodes.${index}.name`, message: 'node reference name is required' });
    }
  }

  for (const [index, resource] of (manifest.resources ?? []).entries()) {
    if (!resource.name?.trim()) {
      issues.push({ path: `resources.${index}.name`, message: 'resource reference name is required' });
    }
  }

  return issues;
}

export function getBehaviorScriptManifest(factory?: BehaviorScriptFactory): BehaviorScriptManifest | undefined {
  return factory?.manifest;
}

function normalizeUniqueByName<T extends { name?: string; action?: string }>(items: T[], path: string): T[] {
  const seen = new Set<string>();
  const normalized: T[] = [];

  for (const item of items) {
    const key = item.name ?? item.action;
    if (!key) {
      normalized.push(item);
      continue;
    }
    if (seen.has(`${path}:${key}`)) continue;
    seen.add(`${path}:${key}`);
    normalized.push(item);
  }

  return normalized;
}

function normalizeUniqueByPhase(items: BehaviorLifecycleHint[]): BehaviorLifecycleHint[] {
  const seen = new Set<BehaviorScriptPhase>();
  const normalized: BehaviorLifecycleHint[] = [];

  for (const item of items) {
    if (seen.has(item.phase)) continue;
    seen.add(item.phase);
    normalized.push(item);
  }

  return normalized;
}

function normalizeUniqueEvents(items: BehaviorEventHint[]): BehaviorEventHint[] {
  const seen = new Set<string>();
  const normalized: BehaviorEventHint[] = [];

  for (const item of items) {
    if (!item.name) {
      normalized.push(item);
      continue;
    }

    const key = `${item.target ?? 'component'}:${item.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(item);
  }

  return normalized;
}
