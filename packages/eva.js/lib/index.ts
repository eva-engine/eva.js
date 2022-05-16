import 'reflect-metadata';
import Component from './core/Component';
import { ObserverType } from './core/observer';
import GameObject from './core/GameObject';
import System from './core/System';
import Transform from './core/Transform';
import Game, { LOAD_SCENE_MODE } from './game/Game';
import Scene from './game/Scene';
import { componentObserver } from './decorators/system';
import { resource, LOAD_EVENT, RESOURCE_TYPE, RESOURCE_TYPE_STRATEGY, resourceLoader } from './loader/Resource';

/** Decorators util */
const decorators = {
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
export type { SystemConstructor } from './core/System';

const version = '__VERSION__';
console.log(`Eva.js version: ${version}`);

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
  componentObserver,
  RESOURCE_TYPE_STRATEGY,
  resourceLoader,
};
