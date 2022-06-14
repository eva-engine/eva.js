/* eslint-disable @typescript-eslint/no-unused-vars */

import { GameObject, Game, PureObserverInfo, ComponentChanged, System, UpdateParams } from '@eva/eva.js';
import ContainerManager from './manager/ContainerManager';
import RendererManager from './manager/RendererManager';

export default class Renderer<T extends {} = {}> extends System<T> {
  /**
   * Renderer name
   */
  name: string;

  /**
   * currentGame
   */
  game: Game;

  /**
   * observer component props info
   */
  static observerInfo: PureObserverInfo;

  /**
   * observer component props info
   */
  observerInfo: PureObserverInfo;

  /**
   * containerManager
   */
  containerManager: ContainerManager;
  rendererManager: RendererManager;

  constructor(params?: T) {
    super(params);
    // @ts-ignore
    this.observerInfo = this.constructor.observerInfo;
  }

  // init(arg?: any): void;

  /**
   * 当监听的属性变化时候调用
   *
   * called while the observed component props change.
   */
  componentChanged(_changed: ComponentChanged) { }

  /**
   * 每帧调用
   *
   * called by every loop
   * @param _gameObject gameObject
   */
  rendererUpdate(_gameObject: GameObject) { }

  // @ts-ignore
  update(e?: UpdateParams) {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      this.componentChanged(changed);
    }
  }

  protected asyncIdMap: Record<number, number> = {}

  protected increaseAsyncId(id: number) {
    this.asyncIdMap[id] = (this.asyncIdMap[id] || 0) + 1;
    return this.asyncIdMap[id];
  }

  protected validateAsyncId(id: number, asyncId: number) {
    return this.asyncIdMap[id] === asyncId;
  }
}
