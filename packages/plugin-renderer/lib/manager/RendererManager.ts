import isEqual from 'lodash-es/isEqual';
import { GameObject, Game, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import Renderer from '../Renderer';
import RendererSystem from '../System';

class RendererManager {
  game: Game;
  rendererSystem: RendererSystem;
  constructor({ game, rendererSystem }) {
    this.game = game;
    this.rendererSystem = rendererSystem;
  }
  renderers: Renderer[] = [];
  register(...renderers: Renderer[]) {
    for (const renderer of renderers) {
      renderer.game = this.game;
      renderer.rendererManager = this.rendererSystem.rendererManager;
      renderer.containerManager = this.rendererSystem.containerManager;
      this.renderers.push(renderer);
    }
  }
  componentChanged(changes: ComponentChanged[]) {
    for (const changed of changes) {
      for (const renderer of this.renderers) {
        const props = renderer.observerInfo[changed.componentName];
        if (props) {
          if (
            [OBSERVER_TYPE.ADD, OBSERVER_TYPE.REMOVE].indexOf(changed.type) > -1
          ) {
            try {
              renderer.componentChanged && renderer.componentChanged(changed);
            } catch (e) {
              console.error(
                `gameObject: ${changed.gameObject.name}, ${changed.componentName} is error.`,
                changed,
                e,
              );
            }
            continue;
          }

          const index = props.findIndex(prop => {
            return isEqual(prop, changed.prop);
          });

          if (index > -1) {
            try {
              renderer.componentChanged && renderer.componentChanged(changed);
            } catch (e) {
              console.error(
                `gameObject: ${changed.gameObject && changed.gameObject.name
                }, ${changed.componentName} is componentChanged error.`,
                changed,
                e,
              );
            }
          }
        }
      }
    }
  }
  update(gameObject: GameObject) {
    for (const component of gameObject.components) {
      for (const renderer of this.renderers) {
        const cache = [];
        const props = renderer.observerInfo[component.name];
        if (props && cache.indexOf(gameObject) === -1) {
          cache.push(gameObject);
          try {
            renderer.rendererUpdate && renderer.rendererUpdate(gameObject);
          } catch (e) {
            console.info(
              `gameObject: ${gameObject.name}, ${component.name} is update error`,
              e,
            );
          }
        }
      }
    }
  }
}
export default RendererManager;
