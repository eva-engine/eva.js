import type { BehaviorInputEvent, BehaviorScriptFactory, BehaviorScriptPhase, BehaviorScriptSource } from './types';

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
  description?: string;
  category?: string;
  version?: string;
  source?: BehaviorScriptSource;
  props?: BehaviorPropertyHint[];
  inputs?: BehaviorInputHint[];
  signals?: BehaviorSignalHint[];
  events?: BehaviorEventHint[];
  groups?: BehaviorGroupHint[];
  nodes?: BehaviorNodeHint[];
  resources?: BehaviorResourceHint[];
  lifecycle?: BehaviorLifecycleHint[];
  tags?: string[];
}

export interface BehaviorScriptDefinition<Props extends Record<string, any> = Record<string, any>, State = any> {
  manifest: BehaviorScriptManifest;
  factory: BehaviorScriptFactory<Props, State>;
}

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
  const manifest = normalizeBehaviorScriptManifest(definition.manifest);
  const issues = validateBehaviorScriptManifest(manifest);
  if (issues.length) {
    throw new Error(`Invalid BehaviorScript manifest: ${issues.map(issue => issue.message).join('; ')}`);
  }

  const factory = definition.factory as BehaviorScriptFactory<Props, State>;
  factory.manifest = manifest;
  return factory;
}

export function normalizeBehaviorScriptManifest(manifest: BehaviorScriptManifest): BehaviorScriptManifest {
  return {
    ...manifest,
    props: normalizeUniqueByName(manifest.props ?? [], 'props'),
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
