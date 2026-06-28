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

/**
 * Flat-shape init params produced by SceneManager when DSL uses the new
 * `type: <scriptId>, props: userProps, $bs?: {...}` first-class shape.
 *
 * User props live at the top level (so observer.deep watches user data as-is);
 * the runtime wrapper fields ride along as non-enumerable `__bsScriptId` /
 * `__bsWrapper`. This avoids name collisions between user props and engine
 * housekeeping keys (a script declaring `enabled: number` would conflict with
 * the legacy `params.enabled` boolean).
 */
export type BehaviorScriptInitFlat<Props extends Record<string, any> = Record<string, any>> =
  Partial<Props> & {
    __bsScriptId: string;
    __bsWrapper?: {
      source?: BehaviorScriptSource;
      hotReload?: BehaviorScriptHotReloadOptions;
      enabled?: boolean;
      priority?: number;
      pauseMode?: BehaviorScriptPauseMode;
      groups?: string[];
      nodes?: Record<string, string>;
      resources?: Record<string, string>;
      executeInEditMode?: boolean;
    };
  };

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

  init(params?: BehaviorScriptParams<Props> | BehaviorScriptInitFlat<Props>) {
    if (!params) return;

    // Detect call shape:
    //   - Flat (new): SceneManager.addComponent built `{...userProps, __bsScriptId, __bsWrapper?}`
    //     because the DSL component had `type: <scriptId>, props: userProps`.
    //   - Legacy: `{scriptId: "...", props: {...}, source, hotReload, ...}`,
    //     either from old DSL (type:"BehaviorScript", props.scriptId, props.props)
    //     or from programmatic entity.addComponent(BehaviorScript, params).
    const flatScriptId =
      typeof (params as BehaviorScriptInitFlat<Props>).__bsScriptId === 'string'
        ? (params as BehaviorScriptInitFlat<Props>).__bsScriptId
        : undefined;

    if (flatScriptId) {
      const flat = params as BehaviorScriptInitFlat<Props>;
      const wrapper = flat.__bsWrapper ?? {};
      // Strip out the non-enumerable runtime markers so user-facing props stay
      // clean (in practice they're already non-enumerable but be defensive).
      const userProps: Record<string, any> = {};
      for (const key of Object.keys(flat)) {
        if (key === '__bsScriptId' || key === '__bsWrapper') continue;
        userProps[key] = (flat as any)[key];
      }
      this.scriptId = flatScriptId;
      this.props = userProps as Props;
      this.source = wrapper.source ?? {};
      this.hotReload = { enabled: true, keepState: true, ...(wrapper.hotReload ?? {}) };
      this.enabled = wrapper.enabled !== false;
      this.priority = normalizePriority(wrapper.priority);
      this.groups = normalizeGroups(wrapper.groups);
      this.nodes = normalizeNodes(wrapper.nodes);
      this.resources = normalizeResources(wrapper.resources);
      this.executeInEditMode = Boolean(wrapper.executeInEditMode);
      this.pauseMode = wrapper.pauseMode ?? 'inherit';
      return;
    }

    const legacy = params as BehaviorScriptParams<Props>;
    this.scriptId = legacy.scriptId;
    this.props = (legacy.props ?? {}) as Props;
    this.source = legacy.source ?? {};
    this.hotReload = { enabled: true, keepState: true, ...(legacy.hotReload ?? {}) };
    this.enabled = legacy.enabled !== false;
    this.priority = normalizePriority(legacy.priority);
    this.groups = normalizeGroups(legacy.groups);
    this.nodes = normalizeNodes(legacy.nodes);
    this.resources = normalizeResources(legacy.resources);
    this.executeInEditMode = Boolean(legacy.executeInEditMode);
    this.pauseMode = legacy.pauseMode ?? 'inherit';
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
