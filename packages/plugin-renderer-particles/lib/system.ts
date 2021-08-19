import {
  decorators,
  OBSERVER_TYPE,
  ComponentChanged,
  resource,
  RESOURCE_TYPE
} from '@eva/eva.js';

import {
  ContainerManager,
  Renderer,
  RendererSystem,
  RendererManager
} from '@eva/plugin-renderer';
import { Texture } from 'pixi.js';
import ParticleComponent from './component';


resource.registerInstance(RESOURCE_TYPE.PARTICLES, ({ data }) => {
  try {
    const textures = []
    for (const key in data) {
      if (key.indexOf('img_') === 0) {
        textures.push(Texture.from(data[key]))
      }
    }
    console.log(data, textures)
    return textures
  } catch (e) { console.log(e) }
})

@decorators.componentObserver({
  ParticleComponent: ['_resource'],
})
class ParticleSystem extends Renderer {
  static readonly systemName: string = 'ParticleSystem';
  containerManager: ContainerManager;
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName === 'ParticleComponent') {
      const component: ParticleComponent = changed.component as ParticleComponent;
      if (changed.type === OBSERVER_TYPE.ADD) {
        const container = this.containerManager
          .getContainer(changed.gameObject.id);
        component.setStage(container);
      } else if (changed.type === OBSERVER_TYPE.CHANGE) {
        component.change && component.change()
      } else if (changed.type === OBSERVER_TYPE.REMOVE) {
        component.destroy && component.destroy();
      }
    }
  }

}
export default ParticleSystem;