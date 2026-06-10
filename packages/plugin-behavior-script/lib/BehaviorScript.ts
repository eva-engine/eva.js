import { Component, decorators } from '@eva/eva.js';
import type {
  BehaviorScriptDiagnostic,
  BehaviorScriptHotReloadOptions,
  BehaviorScriptPauseMode,
  BehaviorScriptParams,
  BehaviorScriptRuntimeBinding,
  BehaviorScriptSource,
  EvaBehaviorScript,
} from './types';
import { createBehaviorScriptInspectorMetadata } from './inspector';
import type { BehaviorScriptInspectorFieldMetadata } from './inspector';

@decorators.componentObserver({})
export class BehaviorScript<Props extends Record<string, any> = Record<string, any>> extends Component<
  BehaviorScriptParams<Props>
> {
  static componentName = 'BehaviorScript';

  static getInspectorMetadata(): BehaviorScriptInspectorFieldMetadata {
    return createBehaviorScriptInspectorMetadata();
  }

  scriptId = '';
  props = {} as Props;
  source: BehaviorScriptSource = {};
  hotReload: BehaviorScriptHotReloadOptions = { enabled: true, keepState: true };
  enabled = true;
  priority = 0;
  groups: string[] = [];
  nodes: Record<string, string> = {};
  resources: Record<string, string> = {};
  executeInEditMode = false;
  pauseMode: BehaviorScriptPauseMode = 'inherit';
  diagnostics: BehaviorScriptDiagnostic[] = [];

  private binding?: BehaviorScriptRuntimeBinding;

  init(params?: BehaviorScriptParams<Props>) {
    if (!params) return;
    this.scriptId = params.scriptId;
    this.props = (params.props ?? {}) as Props;
    this.source = params.source ?? {};
    this.hotReload = { enabled: true, keepState: true, ...(params.hotReload ?? {}) };
    this.enabled = params.enabled !== false;
    this.priority = normalizePriority(params.priority);
    this.groups = normalizeGroups(params.groups);
    this.nodes = normalizeNodes(params.nodes);
    this.resources = normalizeResources(params.resources);
    this.executeInEditMode = Boolean(params.executeInEditMode);
    this.pauseMode = params.pauseMode ?? 'inherit';
  }

  get script(): EvaBehaviorScript | undefined {
    return this.binding?.instance;
  }

  __bindRuntime(binding: BehaviorScriptRuntimeBinding) {
    this.binding = binding;
  }

  __clearRuntimeBinding() {
    this.binding = undefined;
  }

  pushDiagnostic(diagnostic: BehaviorScriptDiagnostic) {
    this.diagnostics = [...this.diagnostics, diagnostic];
  }

  clearDiagnostics() {
    this.diagnostics = [];
  }

  onDestroy() {
    const binding = this.binding;
    this.binding = undefined;
    binding?.dispose();
  }
}

function normalizePriority(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeGroups(groups: string[] | undefined): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const group of groups ?? []) {
    const normalized = typeof group === 'string' ? group.trim() : '';
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
    const normalizedPath = typeof path === 'string' ? path.trim() : '';
    if (!normalizedName || !normalizedPath) continue;
    result[normalizedName] = normalizedPath;
  }

  return result;
}

function normalizeResources(resources: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [name, resource] of Object.entries(resources ?? {})) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedResource = typeof resource === 'string' ? resource.trim() : '';
    if (!normalizedName || !normalizedResource) continue;
    result[normalizedName] = normalizedResource;
  }

  return result;
}
