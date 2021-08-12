import { GameObject, decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';

import RenderComponent from './component';

@decorators.componentObserver({
  Render: ['zIndex'],
})
export default class Render extends Renderer {
  static systemName: string = 'Render';
  name: string = 'Render';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate(gameObject: GameObject) {
    const component = gameObject.getComponent('Render') as RenderComponent;
    const container = this.containerManager.getContainer(gameObject.id);
    container.alpha = component.alpha;
    container.visible = component.visible;
    if (component.sortDirty && component.sortableChildren) {
      const gameObjects = gameObject.transform.children.map(({ gameObject }) => gameObject);
      const children = gameObjects
        .sort((a, b) => {
          const aRender = a.getComponent('Render') as RenderComponent;
          const bRender = b.getComponent('Render') as RenderComponent;
          if (!aRender) {
            return -1;
          }
          if (!bRender) {
            return 1;
          }
          return aRender.zIndex - bRender.zIndex;
        })
        .map(gameObject => {
          return this.containerManager.getContainer(gameObject.id);
        });
      const oldChildren = this.containerManager.getContainer(component.gameObject.id).children;
      const elements = oldChildren.filter(c => children.indexOf(c as any) === -1);
      oldChildren.length = 0;
      oldChildren.push(...elements, ...children);
      component.sortDirty = false;
    }
  }
  componentChanged(changed: ComponentChanged) {
    if (changed.type === OBSERVER_TYPE.ADD || changed.type === OBSERVER_TYPE.REMOVE) {
      this.add(changed);
    }
    if (changed.type === OBSERVER_TYPE.CHANGE) {
      this.change(changed);
    }
    if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.remove(changed);
    }
  }
  add(changed: ComponentChanged) {
    if (changed.component.name === 'Render') {
      this.setDirty(changed);
    }
  }
  change(changed: ComponentChanged) {
    if (changed.component.name === 'Render' && changed.prop.prop[0] === 'zIndex') {
      this.setDirty(changed);
    }
  }
  remove(changed: ComponentChanged) {
    if (changed.component.name === 'Render') {
      const container = this.containerManager.getContainer(changed.gameObject.id);
      container.alpha = 1;
    }
  }
  setDirty(changed: ComponentChanged) {
    const parentRender =
      changed.gameObject.parent && (changed.gameObject.parent.getComponent('Render') as RenderComponent);
    if (parentRender) {
      parentRender.sortDirty = true;
    }
  }
}
