import type { BehaviorPropertyHint, BehaviorScriptManifest } from './manifest';
import type { BehaviorScriptParams, BehaviorScriptRegistryLike, BehaviorScriptSource } from './types';

export interface BehaviorScriptDslComponent<Props extends Record<string, any> = Record<string, any>> {
  type: 'BehaviorScript';
  props: BehaviorScriptParams<Props>;
}

export interface BehaviorScriptBindingOptions<Props extends Record<string, any> = Record<string, any>> {
  scriptId: string;
  props?: Props;
  source?: BehaviorScriptSource;
  hotReload?: BehaviorScriptParams['hotReload'];
  enabled?: boolean;
  priority?: number;
  groups?: string[];
  nodes?: Record<string, string>;
  resources?: Record<string, string>;
  executeInEditMode?: boolean;
  pauseMode?: BehaviorScriptParams['pauseMode'];
  manifest?: BehaviorScriptManifest;
  registry?: BehaviorScriptRegistryLike;
}

export interface BehaviorScriptBindingIssue {
  path: string;
  message: string;
}

export interface BehaviorScriptBindingValidationOptions {
  manifest?: BehaviorScriptManifest;
  registry?: BehaviorScriptRegistryLike;
  allowUnknownScript?: boolean;
}

export function createBehaviorScriptBinding<Props extends Record<string, any> = Record<string, any>>(
  options: BehaviorScriptBindingOptions<Props>,
): BehaviorScriptDslComponent {
  const manifest = options.manifest ?? options.registry?.getManifest(options.scriptId);
  return {
    type: 'BehaviorScript',
    props: {
      scriptId: options.scriptId,
      props: resolveBehaviorScriptProps(manifest, options.props ?? {}),
      source: options.source ?? manifest?.source,
      hotReload: options.hotReload,
      enabled: options.enabled,
      priority: options.priority,
      ...(options.groups ? { groups: normalizeGroups(options.groups) } : {}),
      ...(options.nodes ? { nodes: normalizeNodes(options.nodes) } : {}),
      ...(options.resources ? { resources: normalizeResources(options.resources) } : {}),
      executeInEditMode: options.executeInEditMode,
      pauseMode: options.pauseMode,
    },
  };
}

export function resolveBehaviorScriptProps(
  manifest: BehaviorScriptManifest | undefined,
  props: Record<string, any>,
): Record<string, any> {
  const resolved = { ...props };
  for (const hint of manifest?.props ?? []) {
    if (!(hint.name in resolved) && hint.default !== undefined) {
      resolved[hint.name] = hint.default;
    }
  }
  return resolved;
}

export function validateBehaviorScriptBinding(
  component: BehaviorScriptDslComponent | BehaviorScriptParams,
  options: BehaviorScriptBindingValidationOptions = {},
): BehaviorScriptBindingIssue[] {
  const params = isDslComponent(component) ? component.props : component;
  const issues: BehaviorScriptBindingIssue[] = [];

  if (!params.scriptId?.trim()) {
    issues.push({ path: 'props.scriptId', message: 'BehaviorScript.scriptId is required' });
    return issues;
  }

  const manifest = options.manifest ?? options.registry?.getManifest(params.scriptId);
  if (!manifest && options.registry && !options.allowUnknownScript) {
    issues.push({ path: 'props.scriptId', message: `Unknown behavior script: ${params.scriptId}` });
    return issues;
  }

  const props = params.props ?? {};
  for (const hint of manifest?.props ?? []) {
    validateProp(hint, props, issues);
  }

  if (params.groups !== undefined) {
    validateGroups(params.groups, issues);
  }

  if (params.nodes !== undefined) {
    validateNodes(params.nodes, issues);
  }

  if (params.resources !== undefined) {
    validateResources(params.resources, issues);
  }

  return issues;
}

function validateGroups(groups: string[], issues: BehaviorScriptBindingIssue[]) {
  if (!Array.isArray(groups)) {
    issues.push({ path: 'props.groups', message: 'BehaviorScript.groups must be an array of strings' });
    return;
  }

  groups.forEach((group, index) => {
    if (typeof group !== 'string' || !group.trim()) {
      issues.push({ path: `props.groups.${index}`, message: 'BehaviorScript group must be a non-empty string' });
    }
  });
}

function validateNodes(nodes: Record<string, string>, issues: BehaviorScriptBindingIssue[]) {
  if (!nodes || typeof nodes !== 'object' || Array.isArray(nodes)) {
    issues.push({ path: 'props.nodes', message: 'BehaviorScript.nodes must be an object of node reference paths' });
    return;
  }

  for (const [name, path] of Object.entries(nodes)) {
    if (!name.trim()) {
      issues.push({ path: 'props.nodes', message: 'BehaviorScript node reference name must be non-empty' });
    }
    if (typeof path !== 'string' || !path.trim()) {
      issues.push({
        path: `props.nodes.${name}`,
        message: 'BehaviorScript node reference path must be a non-empty string',
      });
    }
  }
}

function validateResources(resources: Record<string, string>, issues: BehaviorScriptBindingIssue[]) {
  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) {
    issues.push({
      path: 'props.resources',
      message: 'BehaviorScript.resources must be an object of resource reference names',
    });
    return;
  }

  for (const [name, resourceName] of Object.entries(resources)) {
    if (!name.trim()) {
      issues.push({ path: 'props.resources', message: 'BehaviorScript resource reference name must be non-empty' });
    }
    if (typeof resourceName !== 'string' || !resourceName.trim()) {
      issues.push({
        path: `props.resources.${name}`,
        message: 'BehaviorScript resource reference must be a non-empty string',
      });
    }
  }
}

function validateProp(hint: BehaviorPropertyHint, props: Record<string, any>, issues: BehaviorScriptBindingIssue[]) {
  const value = props[hint.name];
  const path = `props.props.${hint.name}`;

  if (value === undefined || value === null) {
    if (hint.required && hint.default === undefined) {
      issues.push({ path, message: `BehaviorScript prop "${hint.name}" is required` });
    }
    return;
  }

  if (!matchesType(hint, value)) {
    issues.push({ path, message: `BehaviorScript prop "${hint.name}" must be ${hint.type}` });
    return;
  }

  if (hint.type === 'enum' && hint.enum && !hint.enum.some(option => option.value === value)) {
    issues.push({
      path,
      message: `BehaviorScript prop "${hint.name}" must be one of ${hint.enum.map(option => option.value).join(', ')}`,
    });
    return;
  }

  if (typeof value === 'number') {
    if (hint.min !== undefined && value < hint.min) {
      issues.push({ path, message: `BehaviorScript prop "${hint.name}" must be >= ${hint.min}` });
    }
    if (hint.max !== undefined && value > hint.max) {
      issues.push({ path, message: `BehaviorScript prop "${hint.name}" must be <= ${hint.max}` });
    }
  }
}

function matchesType(hint: BehaviorPropertyHint, value: any): boolean {
  switch (hint.type) {
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'string':
    case 'asset':
    case 'color':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
    case 'vec2':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'enum':
      return ['string', 'number', 'boolean'].includes(typeof value);
  }
}

function isDslComponent(value: BehaviorScriptDslComponent | BehaviorScriptParams): value is BehaviorScriptDslComponent {
  return (value as BehaviorScriptDslComponent).type === 'BehaviorScript';
}

function normalizeGroups(groups: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const normalized = typeof group === 'string' ? group.trim() : '';
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function normalizeNodes(nodes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [name, path] of Object.entries(nodes)) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedPath = typeof path === 'string' ? path.trim() : '';
    if (!normalizedName || !normalizedPath) continue;
    result[normalizedName] = normalizedPath;
  }

  return result;
}

function normalizeResources(resources: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [name, resourceName] of Object.entries(resources)) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedResource = typeof resourceName === 'string' ? resourceName.trim() : '';
    if (!normalizedName || !normalizedResource) continue;
    result[normalizedName] = normalizedResource;
  }

  return result;
}
