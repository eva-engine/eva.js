import Component from './core/Component';
import { ObserverType } from './core/observer';
import GameObject from './core/GameObject';
import System from './core/System';
import Transform from './core/Transform';
import Game, { LOAD_SCENE_MODE } from './game/Game';
import Scene from './game/Scene';
import { IDEProp } from './decorators/ide';
import { componentObserver } from './decorators/system';
import {
  ExecuteInEditMode,
  Field,
  getPropertiesOf,
  inspectorField,
  shouldExecuteInEditMode,
  step,
  type,
} from './decorators/inspector';
import type { ClassType } from './decorators/inspector';
import { resource, LOAD_EVENT, RESOURCE_TYPE } from './loader/Resource';

interface DecoratorsUtil {
  IDEProp: typeof IDEProp;
  componentObserver: typeof componentObserver;
  ExecuteInEditMode: typeof ExecuteInEditMode;
  Field: typeof Field;
  getPropertiesOf: typeof getPropertiesOf;
  inspectorField: typeof inspectorField;
  shouldExecuteInEditMode: (target: ClassType<any>) => boolean;
  step: typeof step;
  type: typeof type;
}

/** Decorators util */
const decorators: DecoratorsUtil = {
  IDEProp,
  componentObserver,
  ExecuteInEditMode,
  Field,
  getPropertiesOf,
  inspectorField,
  shouldExecuteInEditMode,
  step,
  type,
};

// for typescript
export type { PluginStruct } from './game/Game';
export type { TransformParams } from './core/Transform';
export type { ObserverEvent as ComponentChanged } from './core/ComponentObserver';
export type { PureObserverInfo } from './core/observer';
export type { UpdateParams, ComponentParams } from './core/Component';
export type { ObserverInfo } from './decorators/system';
export type { FieldMetadata, FieldOptions, ClassType } from './decorators/inspector';
export type { ResourceBase } from './loader/Resource';
export type { SystemConstructor } from './core/System';
export type {
  PerfFrame,
  PerfBudget,
  PerfProbeOptions,
  PerfProbesHandle,
  PerfViolation,
} from './game/perf-probes';
export { installPerfProbes } from './game/perf-probes';

const version = '__VERSION__';
console.log(`Eva.js version: ${version}`);

const RESOURCE_TYPE_STRATEGY = {};

export {
  version,
  Game,
  Scene,
  GameObject,
  Component,
  System,
  Transform,
  resource,
  decorators,
  LOAD_EVENT,
  RESOURCE_TYPE,
  ObserverType as OBSERVER_TYPE,
  LOAD_SCENE_MODE,
  IDEProp,
  componentObserver,
  ExecuteInEditMode,
  Field,
  getPropertiesOf,
  inspectorField,
  shouldExecuteInEditMode,
  step,
  type,
  RESOURCE_TYPE_STRATEGY,
};
