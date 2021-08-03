import Component, { UpdateParams as _UpdateParams } from './core/Component';
import {
  ObserverType,
  PureObserverInfo as _PureObserverInfo,
} from './core/observer';
import GameObject from './core/GameObject';
import System from './core/System';
import Transform, { TransformParams as _TransformParams } from './core/Transform';
import Game, { LOAD_SCENE_MODE } from './game/Game';
import Scene from './game/Scene';
import { IDEProp } from './decorators/ide';
import { componentObserver } from './decorators/system';
import { resource, LOAD_EVENT, RESOURCE_TYPE, STRATEGY } from './loader/Resource';

/** Decorators util */
const decorators = {
  IDEProp,
  componentObserver,
};

// for typescript
export type { PluginStruct } from './game/Game';
export type { TransformParams } from './core/Transform';
export type { ObserverEvent as ComponentChanged } from './core/ComponentObserver';
export type { PureObserverInfo } from './core/observer';
export type { UpdateParams, ComponentParams } from './core/Component';
export type { ObserverInfo } from './decorators/system';
export type { ResourceBase } from './loader/Resource';

export {
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
  STRATEGY
};
