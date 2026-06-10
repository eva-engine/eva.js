import { createBehaviorScriptBinding, validateBehaviorScriptBinding } from './binding';
import type { BehaviorScriptBindingIssue, BehaviorScriptDslComponent } from './binding';
import { BehaviorScriptRegistry } from './registry';
import { createBehaviorScriptTypeHints } from './type-hints';
import type { BehaviorScriptTypeHints } from './type-hints';
import { runBehaviorScriptValidation } from './validation';
import type { BehaviorScriptValidationPlan, BehaviorScriptValidationReport } from './validation';
import type {
  BehaviorScriptCatalog,
  BehaviorScriptFactory,
  BehaviorScriptModule,
  BehaviorScriptParams,
  BehaviorScriptRegistryLike,
  BehaviorScriptSource,
} from './types';

export interface BehaviorScriptWorkflowOptions<Props extends Record<string, any> = Record<string, any>> {
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
  registry?: BehaviorScriptRegistryLike;
  scriptModules?: BehaviorScriptModule[];
  factory?: BehaviorScriptFactory<Props>;
  validate?: Omit<BehaviorScriptValidationPlan<Props>, 'scriptId' | 'factory' | 'props' | 'source'>;
}

export interface BehaviorScriptWorkflowResult {
  registry: BehaviorScriptRegistryLike;
  binding: BehaviorScriptDslComponent;
  bindingIssues: BehaviorScriptBindingIssue[];
  catalog?: BehaviorScriptCatalog;
  typeHints?: BehaviorScriptTypeHints;
  validationReport?: BehaviorScriptValidationReport;
}

export function createBehaviorScriptWorkflow<Props extends Record<string, any> = Record<string, any>>(
  options: BehaviorScriptWorkflowOptions<Props>,
): BehaviorScriptWorkflowResult {
  const registry = options.registry ?? new BehaviorScriptRegistry();

  if (options.scriptModules?.length) {
    if (!registry.registerModules) {
      throw new Error('BehaviorScript registry does not support module registration');
    }
    registry.registerModules(options.scriptModules);
  }

  if (options.factory) {
    registry.registerScript(options.scriptId, options.factory, options.source?.uri);
  }

  const manifest = registry.getManifest(options.scriptId);
  const binding = createBehaviorScriptBinding({
    scriptId: options.scriptId,
    props: options.props,
    source: options.source,
    hotReload: options.hotReload,
    enabled: options.enabled,
    priority: options.priority,
    groups: options.groups,
    nodes: options.nodes,
    resources: options.resources,
    executeInEditMode: options.executeInEditMode,
    pauseMode: options.pauseMode,
    registry,
    manifest,
  });
  const bindingIssues = validateBehaviorScriptBinding(binding, { registry, manifest });
  const factory = registry.getFactory(options.scriptId);
  const validationReport =
    factory && options.validate
      ? runBehaviorScriptValidation({
          ...options.validate,
          scriptId: options.scriptId,
          factory,
          props: binding.props.props as Props,
          source: binding.props.source,
          enabled: binding.props.enabled ?? options.validate.enabled,
          priority: binding.props.priority ?? options.validate.priority,
          groups: binding.props.groups ?? options.validate.groups,
          nodes: binding.props.nodes ?? options.validate.nodes,
          resources: binding.props.resources ?? options.validate.resources,
          executeInEditMode: binding.props.executeInEditMode ?? options.validate.executeInEditMode,
          pauseMode: binding.props.pauseMode ?? options.validate.pauseMode,
          systemParams: {
            ...(options.validate.systemParams ?? {}),
            registry,
          },
        })
      : undefined;

  return {
    registry,
    binding,
    bindingIssues,
    catalog: registry.getCatalog?.(),
    typeHints: manifest ? createBehaviorScriptTypeHints(manifest) : undefined,
    validationReport,
  };
}
