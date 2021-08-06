import {
  Renderer,
  RendererSystem,
  RendererManager,
  ContainerManager,
} from '@eva/plugin-renderer';
import { decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import GraphicsComponent from './component';

@decorators.componentObserver({
  Graphics: ['graphics'],
})
export default class Graphics extends Renderer {
  static systemName = 'Graphics';

  name = 'Graphics';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.type === OBSERVER_TYPE.ADD) {
      this.containerManager
        .getContainer(changed.gameObject.id)
        .addChildAt((changed.component as GraphicsComponent).graphics, 0);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.containerManager
        .getContainer(changed.gameObject.id)
        .removeChild((changed.component as GraphicsComponent).graphics);
      (changed.component as GraphicsComponent).graphics.destroy({ children: true })
    }
  }
}
