/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GameObject,
  Game,
  PureObserverInfo,
  ComponentChanged,
  System,
} from '@eva/eva.js';
import ContainerManager from './manager/ContainerManager';
import RendererManager from './manager/RendererManager';

export default class Renderer extends System {
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

  constructor(params?: any) {
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

  update() {
    const changes = this.componentObserver.clear();
    for (const changed of changes) {
      this.componentChanged(changed);
    }
  }
}
