/**
 * BehaviorPropsSchema — a JSON-Schema Draft-7 subset extended with `x-eva-*`
 * vendor keywords for domain-specific Editor controls (asset / entity / signal /
 * store-path / node-ref / color / vec2 / advanced / visibility / constraint).
 *
 * Goals:
 *   - Drive the new MetadataDrivenInspector without inventing yet another DSL.
 *   - Stay strictly JSON-Schema-compatible at root (ajv/monaco still consume it),
 *     so the `x-eva-*` extensions are ignored gracefully.
 *   - Coexist with the legacy `BehaviorPropertyHint[]` array form via
 *     `normalizePropsArrayToSchema()` adapter.
 */

export interface BehaviorPropsSchema {
  readonly type: 'object';
  title?: string;
  description?: string | Record<string, string>;
  properties: Record<string, BehaviorPropSchema>;
  required?: string[];
  additionalProperties?: boolean;
  $defs?: Record<string, BehaviorPropSchema>;
  groups?: ReadonlyArray<{ id: string; label?: string; collapsed?: boolean }>;
}

export type BehaviorPropSchema =
  | NumberSchema
  | IntegerSchema
  | StringSchema
  | BooleanSchema
  | EnumSchema
  | ObjectSchema
  | ArraySchema
  | AssetRefSchema
  | EntityRefSchema
  | SignalRefSchema
  | StorePathSchema
  | NodeRefSchema
  | Vec2Schema
  | ColorSchema
  | UnionSchema
  | RefSchema;

interface BaseSchema {
  title?: string;
  description?: string | Record<string, string>;
  group?: string;
  /** Per-prop required hint. Root `BehaviorPropsSchema.required: string[]`
   *  is the canonical place to declare required props (Draft-7 standard);
   *  this is a convenience for hand-authored manifests. Object/Vec2 schemas
   *  reuse `required: string[]` for nested-field required lists, so callers
   *  must NOT set this field on those types. */
  requiredHint?: boolean;
  order?: number;
  examples?: unknown[];
  readOnly?: boolean;
  deprecated?: boolean | { reason?: string; replacement?: string };
  'x-eva-advanced'?: boolean;
  'x-eva-visible-when'?: Record<
    string,
    { equals?: unknown; notEquals?: unknown; in?: unknown[] }
  >;
  'x-eva-constraint'?: {
    expr: string;
    message: string;
    severity?: 'warning' | 'error';
  };
}

export interface NumberSchema extends BaseSchema {
  type: 'number';
  default?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  'x-eva-unit'?: string;
  'x-eva-precision'?: number;
}

export interface IntegerSchema extends BaseSchema {
  type: 'integer';
  default?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  'x-eva-unit'?: string;
}

export interface StringSchema extends BaseSchema {
  type: 'string';
  default?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'uri' | 'email' | 'uuid' | 'date-time';
  'x-eva-multiline'?: boolean;
}

export interface BooleanSchema extends BaseSchema {
  type: 'boolean';
  default?: boolean;
}

export interface EnumSchema extends BaseSchema {
  type: 'string' | 'number';
  enum: ReadonlyArray<string | number>;
  default?: string | number;
  'x-eva-enum-labels'?: Record<string, string>;
}

export interface ObjectSchema extends BaseSchema {
  type: 'object';
  properties: Record<string, BehaviorPropSchema>;
  required?: string[];
  additionalProperties?: boolean;
  default?: Record<string, unknown>;
}

export interface ArraySchema extends BaseSchema {
  type: 'array';
  items: BehaviorPropSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  default?: unknown[];
}

export interface AssetRefSchema extends BaseSchema {
  type: 'string';
  'x-eva-asset': {
    assetType:
      | 'image'
      | 'audio'
      | 'spine'
      | 'spine36'
      | 'lottie'
      | 'sprite'
      | 'font'
      | 'json'
      | 'any';
  };
  default?: string;
}

export interface EntityRefSchema extends BaseSchema {
  type: 'string';
  'x-eva-entity-ref': {
    requireComponents?: ReadonlyArray<string>;
    sceneScoped?: boolean;
    resolveBy?: 'name' | 'path' | 'ref';
  };
  default?: string;
}

export interface SignalRefSchema extends BaseSchema {
  type: 'string';
  'x-eva-signal-ref': {
    direction: 'emit' | 'listen' | 'both';
    namespace?: string;
  };
  default?: string;
}

export interface StorePathSchema extends BaseSchema {
  type: 'string';
  'x-eva-store-path': {
    valueType?: 'number' | 'string' | 'boolean' | 'object' | 'array';
    pathPrefix?: string;
  };
  default?: string;
}

export interface NodeRefSchema extends BaseSchema {
  type: 'string';
  'x-eva-node-ref': {
    scope?: 'children' | 'descendants';
    pathHint?: string;
  };
  default?: string;
}

export interface Vec2Schema extends BaseSchema {
  type: 'object';
  'x-eva-vec2': true;
  properties: { x: NumberSchema; y: NumberSchema };
  required?: ['x', 'y'];
  default?: { x: number; y: number };
}

export interface ColorSchema extends BaseSchema {
  type: 'string';
  'x-eva-color': { format?: 'hex' | 'rgba'; allowAlpha?: boolean };
  default?: string;
}

export interface UnionSchema extends BaseSchema {
  oneOf: BehaviorPropSchema[];
}

export interface RefSchema {
  $ref: string;
}

/**
 * Adapter from the legacy `BehaviorPropertyHint[]` array shape used today by
 * 17 production scripts to the new `BehaviorPropsSchema`. Lossless for the
 * fields the legacy form actually carried; lossy for the JSON-Schema-only
 * keywords (multipleOf / pattern / nested object / array) which the legacy
 * form never expressed.
 *
 * Inputs not matching the legacy shape are returned `undefined`, signalling
 * "no schema available — Inspector should fall back to opaque JSON editor".
 */
export function normalizePropsArrayToSchema(
  legacyProps: ReadonlyArray<LegacyPropertyHint> | undefined,
): BehaviorPropsSchema | undefined {
  if (!Array.isArray(legacyProps) || legacyProps.length === 0) return undefined;
  const properties: Record<string, BehaviorPropSchema> = {};
  const required: string[] = [];
  const groupSet = new Set<string>();

  for (const hint of legacyProps) {
    if (!hint?.name || typeof hint.name !== 'string') continue;
    const propSchema = legacyPropertyToSchema(hint);
    if (!propSchema) continue;
    properties[hint.name] = propSchema;
    if (hint.required) {
      required.push(hint.name);
      // Also stamp the per-prop hint so the Inspector can render the "required"
      // marker without reading the root.required[] list.
      if (!(propSchema as any).$ref) (propSchema as any).requiredHint = true;
    }
    if (hint.group) groupSet.add(hint.group);
  }

  if (Object.keys(properties).length === 0) return undefined;

  const schema: BehaviorPropsSchema = {
    type: 'object',
    properties,
  };
  if (required.length) schema.required = required;
  if (groupSet.size) {
    schema.groups = Array.from(groupSet).map(id => ({ id }));
  }
  return schema;
}

interface LegacyPropertyHint {
  name: string;
  type:
    | 'number'
    | 'string'
    | 'boolean'
    | 'object'
    | 'array'
    | 'vec2'
    | 'color'
    | 'asset'
    | 'enum';
  label?: string;
  description?: string;
  default?: unknown;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  enum?: Array<{ label?: string; value: string | number | boolean }>;
  group?: string;
}

function legacyPropertyToSchema(hint: LegacyPropertyHint): BehaviorPropSchema | undefined {
  const base: BaseSchema = {};
  if (hint.label) base.title = hint.label;
  if (hint.description) base.description = hint.description;
  if (hint.group) base.group = hint.group;

  switch (hint.type) {
    case 'number': {
      const schema: NumberSchema = { ...base, type: 'number' };
      if (typeof hint.default === 'number') schema.default = hint.default;
      if (typeof hint.min === 'number') schema.minimum = hint.min;
      if (typeof hint.max === 'number') schema.maximum = hint.max;
      if (typeof hint.step === 'number') schema.multipleOf = hint.step;
      return schema;
    }
    case 'string': {
      const schema: StringSchema = { ...base, type: 'string' };
      if (typeof hint.default === 'string') schema.default = hint.default;
      return schema;
    }
    case 'boolean': {
      const schema: BooleanSchema = { ...base, type: 'boolean' };
      if (typeof hint.default === 'boolean') schema.default = hint.default;
      return schema;
    }
    case 'enum': {
      if (!hint.enum?.length) return undefined;
      const values = hint.enum.map(opt => opt.value);
      const numericOnly = values.every(v => typeof v === 'number');
      const labels: Record<string, string> = {};
      for (const opt of hint.enum) {
        if (opt.label) labels[String(opt.value)] = opt.label;
      }
      const schema: EnumSchema = {
        ...base,
        type: numericOnly ? 'number' : 'string',
        enum: values as ReadonlyArray<string | number>,
      };
      if (hint.default !== undefined) schema.default = hint.default as string | number;
      if (Object.keys(labels).length) schema['x-eva-enum-labels'] = labels;
      return schema;
    }
    case 'asset': {
      const schema: AssetRefSchema = {
        ...base,
        type: 'string',
        'x-eva-asset': { assetType: 'any' },
      };
      if (typeof hint.default === 'string') schema.default = hint.default;
      return schema;
    }
    case 'color': {
      const schema: ColorSchema = {
        ...base,
        type: 'string',
        'x-eva-color': { format: 'hex', allowAlpha: true },
      };
      if (typeof hint.default === 'string') schema.default = hint.default;
      return schema;
    }
    case 'vec2': {
      const schema: Vec2Schema = {
        ...base,
        type: 'object',
        'x-eva-vec2': true,
        properties: { x: { type: 'number' }, y: { type: 'number' } },
      };
      if (hint.default && typeof hint.default === 'object') {
        schema.default = hint.default as { x: number; y: number };
      }
      return schema;
    }
    case 'object': {
      const schema: ObjectSchema = { ...base, type: 'object', properties: {} };
      if (hint.default && typeof hint.default === 'object' && !Array.isArray(hint.default)) {
        schema.default = hint.default as Record<string, unknown>;
      }
      return schema;
    }
    case 'array': {
      const schema: ArraySchema = {
        ...base,
        type: 'array',
        items: { type: 'string' },
      };
      if (Array.isArray(hint.default)) schema.default = hint.default;
      return schema;
    }
    default:
      return undefined;
  }
}

/**
 * Reserved built-in component names. A scriptId must never collide with any
 * native Eva.js componentName — if it did, the runtime registry would silently
 * shadow the native class.
 *
 * Kept in sync with the in-tree native Components shipped by @eva packages.
 */
export const RESERVED_BUILTIN_COMPONENT_NAMES: ReadonlySet<string> = new Set([
  'Transform',
  'Img',
  'Text',
  'Render',
  'Sprite',
  'SpriteAnimation',
  'Lottie',
  'UI',
  'Transition',
  'Sound',
  'Event',
  'Layout',
  'Mask',
  'Mesh',
  'NinePatch',
  'TilingSprite',
  'Graphics',
  'Spine',
  'Spine36',
  'DragonBones',
  'A11y',
  'Evax',
  'MatterJS',
  'Stats',
  'BehaviorScript',
]);

const SCRIPT_ID_REGEX = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export class BehaviorScriptIdError extends Error {
  readonly code: 'BS_ID_SHAPE' | 'BS_ID_COLLIDES_BUILTIN';
  constructor(code: 'BS_ID_SHAPE' | 'BS_ID_COLLIDES_BUILTIN', message: string) {
    super(message);
    this.code = code;
    this.name = 'BehaviorScriptIdError';
  }
}

export function assertScriptIdValid(scriptId: string): void {
  if (typeof scriptId !== 'string' || !scriptId) {
    throw new BehaviorScriptIdError('BS_ID_SHAPE', `scriptId must be a non-empty string`);
  }
  if (scriptId.length < 2 || scriptId.length > 64) {
    throw new BehaviorScriptIdError(
      'BS_ID_SHAPE',
      `scriptId ${JSON.stringify(scriptId)} length must be between 2 and 64`,
    );
  }
  if (!SCRIPT_ID_REGEX.test(scriptId)) {
    throw new BehaviorScriptIdError(
      'BS_ID_SHAPE',
      `scriptId ${JSON.stringify(scriptId)} fails identifier rules ${SCRIPT_ID_REGEX}`,
    );
  }
  if (RESERVED_BUILTIN_COMPONENT_NAMES.has(scriptId)) {
    throw new BehaviorScriptIdError(
      'BS_ID_COLLIDES_BUILTIN',
      `scriptId ${JSON.stringify(scriptId)} collides with a reserved built-in Eva.js component`,
    );
  }
}

export function isScriptIdShapeValid(scriptId: unknown): boolean {
  return (
    typeof scriptId === 'string' &&
    scriptId.length >= 2 &&
    scriptId.length <= 64 &&
    SCRIPT_ID_REGEX.test(scriptId) &&
    !RESERVED_BUILTIN_COMPONENT_NAMES.has(scriptId)
  );
}
