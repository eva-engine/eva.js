import type { BehaviorPropertyHint, BehaviorScriptManifest, BehaviorValueType } from './manifest';

function resolveDescription(value: string | Record<string, string> | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  return value.en ?? value.default ?? Object.values(value)[0];
}

export interface BehaviorScriptInspectorFieldMetadata {
  name: string;
  type: string;
  label?: string;
  group?: string;
  children?: BehaviorScriptInspectorFieldMetadata[];
  isArray: boolean;
  isFolder?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<string | number | boolean>;
  assetType?: string;
  readonly?: boolean;
  description?: string;
  inspector?: string;
  default?: any;
}

export interface BehaviorScriptInspectorOptions {
  readonlyScriptId?: boolean;
  includeSource?: boolean;
  includeHotReload?: boolean;
}

export function createBehaviorScriptInspectorMetadata(
  manifest?: BehaviorScriptManifest,
  options: BehaviorScriptInspectorOptions = {},
): BehaviorScriptInspectorFieldMetadata {
  const includeSource = options.includeSource !== false;
  const includeHotReload = options.includeHotReload !== false;
  const children: BehaviorScriptInspectorFieldMetadata[] = [
    {
      name: 'scriptId',
      type: 'string',
      inspector: 'string',
      label: 'Script ID',
      group: 'Behavior',
      isArray: false,
      readonly: options.readonlyScriptId ?? Boolean(manifest?.scriptId),
      default: manifest?.scriptId,
      description: resolveDescription(manifest?.description) ?? 'Stable behavior script id stored in DSL.',
    },
    createPropsMetadata(manifest),
  ];

  if (includeSource) {
    children.push({
      name: 'source',
      type: 'object',
      label: 'Source',
      group: 'Source',
      isArray: false,
      isFolder: true,
      description: 'Optional source location for diagnostics and hot reload.',
      children: [
        createField('uri', 'string', { label: 'URI', group: 'Source', default: manifest?.source?.uri }),
        createField('exportName', 'string', {
          label: 'Export Name',
          group: 'Source',
          default: manifest?.source?.exportName,
        }),
        createField('line', 'number', { label: 'Line', group: 'Source', min: 1, default: manifest?.source?.line }),
        createField('column', 'number', {
          label: 'Column',
          group: 'Source',
          min: 1,
          default: manifest?.source?.column,
        }),
      ],
    });
  }

  if (includeHotReload) {
    children.push({
      name: 'hotReload',
      type: 'object',
      label: 'Hot Reload',
      group: 'Hot Reload',
      isArray: false,
      isFolder: true,
      description: 'Runtime script replacement behavior.',
      children: [
        createField('enabled', 'boolean', { label: 'Enabled', group: 'Hot Reload', default: true }),
        createField('keepState', 'boolean', { label: 'Keep State', group: 'Hot Reload', default: true }),
      ],
    });
  }

  children.push(
    createField('enabled', 'boolean', {
      label: 'Enabled',
      group: 'Runtime',
      default: true,
      description: 'Enable active frame, input, signal, event, and timer callbacks for this behavior.',
    }),
    createField('priority', 'number', {
      label: 'Priority',
      group: 'Runtime',
      default: 0,
      step: 1,
      description: 'Lower values run earlier when multiple behavior scripts receive the same active phase.',
    }),
    createField('groups', 'string[]', {
      label: 'Groups',
      group: 'Runtime',
      default: manifest?.groups?.map(group => group.name) ?? [],
      description: 'Godot-style script groups for group dispatch and callGroup.',
    }),
    createField('nodes', 'json', {
      label: 'Node References',
      group: 'Runtime',
      default: createDefaultNodeReferences(manifest),
      description: 'Named NodePath-style references for BehaviorScript ctx.getNode().',
    }),
    createField('resources', 'json', {
      label: 'Resource References',
      group: 'Runtime',
      default: createDefaultResourceReferences(manifest),
      description: 'Named Eva resource keys for BehaviorScript ctx.loadResource().',
    }),
    createField('pauseMode', 'enum', {
      label: 'Pause Mode',
      group: 'Runtime',
      default: 'inherit',
      options: ['inherit', 'stop', 'process'],
      description: 'Controls whether frame, input, signal, event, and timer callbacks run while the system is paused.',
      inspector: 'enum',
    }),
    createField('executeInEditMode', 'boolean', {
      label: 'Execute In Edit Mode',
      group: 'Editor',
      default: false,
      description: 'Allow this behavior to run while the Editor is not in play mode.',
    }),
  );

  return {
    name: 'BehaviorScript',
    type: 'object',
    label: manifest?.displayName ?? 'Behavior Script',
    group: 'Logic',
    isArray: false,
    isFolder: true,
    description: resolveDescription(manifest?.description) ?? 'First-class gameplay behavior script binding.',
    children,
  };
}

function createPropsMetadata(manifest?: BehaviorScriptManifest): BehaviorScriptInspectorFieldMetadata {
  const propFields = (manifest?.props ?? []).map(createPropMetadata);

  if (!propFields.length) {
    return {
      name: 'props',
      type: 'json',
      inspector: 'json',
      label: 'Props',
      group: 'Script Props',
      isArray: false,
      default: {},
      description: 'Script-specific props. Register a manifest to expose typed controls.',
    };
  }

  return {
    name: 'props',
    type: 'object',
    label: 'Props',
    group: 'Script Props',
    isArray: false,
    isFolder: true,
    description: 'Manifest-backed script props.',
    children: propFields,
  };
}

function createPropMetadata(hint: BehaviorPropertyHint): BehaviorScriptInspectorFieldMetadata {
  return createField(hint.name, behaviorValueTypeToInspectorType(hint.type), {
    label: hint.label,
    group: hint.group ?? 'Script Props',
    default: hint.default,
    min: hint.min,
    max: hint.max,
    step: hint.step,
    options: hint.enum?.map(option => option.value),
    assetType: hint.type === 'asset' ? 'any' : undefined,
    description: hint.description,
    inspector: hint.type === 'enum' ? 'enum' : hint.type === 'asset' ? 'asset' : undefined,
  });
}

function createDefaultNodeReferences(manifest?: BehaviorScriptManifest): Record<string, string> {
  const refs: Record<string, string> = {};

  for (const node of manifest?.nodes ?? []) {
    refs[node.name] = node.path ?? node.name;
  }

  return refs;
}

function createDefaultResourceReferences(manifest?: BehaviorScriptManifest): Record<string, string> {
  const refs: Record<string, string> = {};

  for (const resource of manifest?.resources ?? []) {
    refs[resource.name] = resource.resource ?? resource.name;
  }

  return refs;
}

function createField(
  name: string,
  type: string,
  options: Omit<Partial<BehaviorScriptInspectorFieldMetadata>, 'name' | 'type' | 'isArray'> = {},
): BehaviorScriptInspectorFieldMetadata {
  return {
    name,
    type,
    inspector: options.inspector ?? type,
    isArray: type.endsWith('[]'),
    ...options,
  };
}

export function behaviorValueTypeToInspectorType(type: BehaviorValueType): string {
  switch (type) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'color':
    case 'asset':
    case 'enum':
      return type;
    case 'array':
      return 'json';
    case 'object':
    case 'vec2':
      return 'json';
  }
}
