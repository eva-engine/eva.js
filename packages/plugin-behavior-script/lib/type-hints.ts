import type {
  BehaviorEventHint,
  BehaviorGroupHint,
  BehaviorInputHint,
  BehaviorNodeHint,
  BehaviorPropertyHint,
  BehaviorResourceHint,
  BehaviorScriptManifest,
  BehaviorSignalHint,
  BehaviorValueType,
} from './manifest';

export type BehaviorScriptTypeHintKind =
  | 'prop'
  | 'input'
  | 'signal'
  | 'event'
  | 'group'
  | 'node'
  | 'resource'
  | 'lifecycle';

export interface BehaviorScriptCompletionEntry {
  kind: BehaviorScriptTypeHintKind;
  name: string;
  label: string;
  insertText: string;
  detail?: string;
  documentation?: string;
  path?: string;
}

export interface BehaviorScriptTypeHintOptions {
  propsTypeName?: string;
  scriptTypeName?: string;
  includeLifecycle?: boolean;
}

export interface BehaviorScriptTypeHints {
  scriptId: string;
  displayName?: string;
  propsTypeName: string;
  scriptTypeName: string;
  declarations: string;
  completions: BehaviorScriptCompletionEntry[];
}

const DEFAULT_LIFECYCLE_SNIPPETS: BehaviorScriptCompletionEntry[] = [
  {
    kind: 'lifecycle',
    name: 'setup',
    label: 'setup(ctx)',
    insertText: 'setup(ctx) {\n  $0\n}',
    detail: 'Initialize script subscriptions and local state.',
  },
  {
    kind: 'lifecycle',
    name: 'ready',
    label: 'ready()',
    insertText: 'ready() {\n  $0\n}',
    detail: 'Runs after setup/enterTree.',
  },
  {
    kind: 'lifecycle',
    name: 'process',
    label: 'process(frame)',
    insertText: 'process(frame) {\n  $0\n}',
    detail: 'Frame update, equivalent to Godot _process.',
  },
  {
    kind: 'lifecycle',
    name: 'input',
    label: 'input(event)',
    insertText: 'input(event) {\n  $0\n}',
    detail: 'Handles manifest-declared input actions.',
  },
  {
    kind: 'lifecycle',
    name: 'onSignal',
    label: 'onSignal(name, payload)',
    insertText: 'onSignal(name, payload) {\n  $0\n}',
    detail: 'Handles manifest-declared listen/both signals.',
  },
  {
    kind: 'lifecycle',
    name: 'onEvent',
    label: 'onEvent(name, payload, target)',
    insertText: 'onEvent(name, payload, target) {\n  $0\n}',
    detail: 'Handles manifest-declared listen/both events.',
  },
  {
    kind: 'lifecycle',
    name: 'enable',
    label: 'enable()',
    insertText: 'enable() {\n  $0\n}',
    detail: 'Runs when the behavior becomes enabled.',
  },
  {
    kind: 'lifecycle',
    name: 'disable',
    label: 'disable()',
    insertText: 'disable() {\n  $0\n}',
    detail: 'Runs when the behavior becomes disabled.',
  },
  {
    kind: 'lifecycle',
    name: 'enabledChanged',
    label: 'enabledChanged(enabled, previousEnabled)',
    insertText: 'enabledChanged(enabled, previousEnabled) {\n  $0\n}',
    detail: 'Runs after BehaviorScript.enabled changes.',
  },
  {
    kind: 'lifecycle',
    name: 'pause',
    label: 'pause()',
    insertText: 'pause() {\n  $0\n}',
    detail: 'Runs when the behavior system enters paused state.',
  },
  {
    kind: 'lifecycle',
    name: 'resume',
    label: 'resume()',
    insertText: 'resume() {\n  $0\n}',
    detail: 'Runs when the behavior system leaves paused state.',
  },
];

export function createBehaviorScriptTypeHints(
  manifest: BehaviorScriptManifest,
  options: BehaviorScriptTypeHintOptions = {},
): BehaviorScriptTypeHints {
  const baseName = toPascalCase(manifest.displayName ?? manifest.scriptId);
  const propsTypeName = options.propsTypeName ?? `${baseName}Props`;
  const scriptTypeName = options.scriptTypeName ?? `${baseName}Script`;

  return {
    scriptId: manifest.scriptId,
    displayName: manifest.displayName,
    propsTypeName,
    scriptTypeName,
    declarations: createTypeDeclarations(manifest, propsTypeName, scriptTypeName),
    completions: createCompletionEntries(manifest, options),
  };
}

export function behaviorValueTypeToTypescript(hint: BehaviorValueType | BehaviorPropertyHint): string {
  const type = typeof hint === 'string' ? hint : hint.type;

  if (type === 'enum' && typeof hint !== 'string' && hint.enum?.length) {
    return hint.enum.map(option => literalType(option.value)).join(' | ');
  }

  switch (type) {
    case 'number':
      return 'number';
    case 'string':
    case 'color':
    case 'asset':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'any[]';
    case 'vec2':
      return '[number, number]';
    case 'object':
      return 'Record<string, any>';
    case 'enum':
      return 'string | number | boolean';
    default:
      return 'any';
  }
}

function createTypeDeclarations(
  manifest: BehaviorScriptManifest,
  propsTypeName: string,
  scriptTypeName: string,
): string {
  const lines: string[] = [
    "import type { EvaBehaviorScript } from '@eva/plugin-behavior-script';",
    '',
    `export interface ${propsTypeName} {`,
  ];

  for (const prop of manifest.props ?? []) {
    if (prop.description) lines.push(`  /** ${escapeComment(prop.description)} */`);
    lines.push(`  ${quotePropertyName(prop.name)}${prop.required ? '' : '?'}: ${behaviorValueTypeToTypescript(prop)};`);
  }

  if (!manifest.props?.length) {
    lines.push('  [key: string]: any;');
  }

  lines.push('}', '');
  lines.push(`export type ${scriptTypeName} = EvaBehaviorScript<${propsTypeName}>;`);
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}InputAction`,
      (manifest.inputs ?? []).map(input => input.action),
    ),
  );
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}SignalName`,
      (manifest.signals ?? []).map(signal => signal.name),
    ),
  );
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}EventName`,
      (manifest.events ?? []).map(event => event.name),
    ),
  );
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}GroupName`,
      (manifest.groups ?? []).map(group => group.name),
    ),
  );
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}NodeName`,
      (manifest.nodes ?? []).map(node => node.name),
    ),
  );
  lines.push(
    createUnionDeclaration(
      `${scriptTypeName}ResourceName`,
      (manifest.resources ?? []).map(resource => resource.name),
    ),
  );

  return lines.filter(line => line !== undefined).join('\n');
}

function createCompletionEntries(
  manifest: BehaviorScriptManifest,
  options: BehaviorScriptTypeHintOptions,
): BehaviorScriptCompletionEntry[] {
  const completions: BehaviorScriptCompletionEntry[] = [];

  for (const prop of manifest.props ?? []) {
    completions.push(createPropCompletion(prop));
  }
  for (const input of manifest.inputs ?? []) {
    completions.push(...createInputCompletions(input));
  }
  for (const signal of manifest.signals ?? []) {
    completions.push(createSignalCompletion(signal));
  }
  for (const event of manifest.events ?? []) {
    completions.push(createEventCompletion(event));
  }
  for (const group of manifest.groups ?? []) {
    completions.push(createGroupCompletion(group));
  }
  for (const node of manifest.nodes ?? []) {
    completions.push(createNodeCompletion(node));
  }
  for (const resource of manifest.resources ?? []) {
    completions.push(createResourceCompletion(resource));
  }
  if (options.includeLifecycle !== false) {
    completions.push(...DEFAULT_LIFECYCLE_SNIPPETS);
  }

  return completions;
}

function createPropCompletion(prop: BehaviorPropertyHint): BehaviorScriptCompletionEntry {
  return {
    kind: 'prop',
    name: prop.name,
    label: `ctx.props.${prop.name}`,
    insertText: `ctx.props.${prop.name}`,
    detail: behaviorValueTypeToTypescript(prop),
    documentation: prop.description,
    path: `props.${prop.name}`,
  };
}

function createInputCompletions(input: BehaviorInputHint): BehaviorScriptCompletionEntry[] {
  const phases = input.phases?.length ? input.phases : ['press', 'release', 'hold'];
  return phases.map(phase => ({
    kind: 'input',
    name: `${input.action}:${phase}`,
    label: `input:${input.action}:${phase}`,
    insertText: `event.action === '${escapeString(input.action)}' && event.phase === '${phase}'`,
    detail: 'BehaviorScript input action',
    documentation: input.description,
    path: `inputs.${input.action}.${phase}`,
  }));
}

function createSignalCompletion(signal: BehaviorSignalHint): BehaviorScriptCompletionEntry {
  const listens = signal.direction === 'listen' || signal.direction === 'both';
  return {
    kind: 'signal',
    name: signal.name,
    label: signal.name,
    insertText: listens
      ? `onSignal('${escapeString(signal.name)}', payload)`
      : `ctx.emitSignal('${escapeString(signal.name)}', payload)`,
    detail: `signal:${signal.direction}`,
    documentation: signal.description,
    path: `signals.${signal.name}`,
  };
}

function createEventCompletion(event: BehaviorEventHint): BehaviorScriptCompletionEntry {
  const listens = event.direction === 'listen' || event.direction === 'both';
  return {
    kind: 'event',
    name: event.name,
    label: `${event.target ?? 'component'}:${event.name}`,
    insertText: listens
      ? `onEvent('${escapeString(event.name)}', payload, target)`
      : `ctx.emitEvent(ctx.component, '${escapeString(event.name)}', payload)`,
    detail: `event:${event.direction}`,
    documentation: event.description,
    path: `events.${event.target ?? 'component'}.${event.name}`,
  };
}

function createGroupCompletion(group: BehaviorGroupHint): BehaviorScriptCompletionEntry {
  return {
    kind: 'group',
    name: group.name,
    label: `group:${group.name}`,
    insertText: `ctx.callGroup('${escapeString(group.name)}', '$0')`,
    detail: 'BehaviorScript group',
    documentation: group.description,
    path: `groups.${group.name}`,
  };
}

function createNodeCompletion(node: BehaviorNodeHint): BehaviorScriptCompletionEntry {
  return {
    kind: 'node',
    name: node.name,
    label: `node:${node.name}`,
    insertText: node.required
      ? `ctx.getRequiredNode('${escapeString(node.name)}')`
      : `ctx.getNode('${escapeString(node.name)}')`,
    detail: node.path ? `NodePath:${node.path}` : 'BehaviorScript node reference',
    documentation: node.description,
    path: `nodes.${node.name}`,
  };
}

function createResourceCompletion(resource: BehaviorResourceHint): BehaviorScriptCompletionEntry {
  return {
    kind: 'resource',
    name: resource.name,
    label: `resource:${resource.name}`,
    insertText: resource.required
      ? `ctx.loadRequiredResource('${escapeString(resource.name)}')`
      : `ctx.loadResource('${escapeString(resource.name)}')`,
    detail: resource.resource ? `Resource:${resource.resource}` : 'BehaviorScript resource reference',
    documentation: resource.description,
    path: `resources.${resource.name}`,
  };
}

function createUnionDeclaration(name: string, values: Array<string | undefined>): string {
  const unique = Array.from(new Set(values.filter(Boolean))) as string[];
  const union = unique.length ? unique.map(value => literalType(value)).join(' | ') : 'never';
  return `export type ${name} = ${union};`;
}

function literalType(value: string | number | boolean): string {
  return typeof value === 'string' ? `'${escapeString(value)}'` : String(value);
}

function quotePropertyName(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : literalType(name);
}

function toPascalCase(value: string): string {
  const normalized = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
  return normalized || 'BehaviorScript';
}

function escapeString(value: string): string {
  return value.split('\\').join('\\\\').split("'").join("\\'");
}

function escapeComment(value: string): string {
  return value.split('*/').join('*\\/');
}
