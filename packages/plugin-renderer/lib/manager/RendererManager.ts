import isEqual from 'lodash-es/isEqual';
import { GameObject, Game, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import Renderer from '../Renderer';
import RendererSystem from '../System';

/**
 * 渲染管理器类
 *
 * RendererManager 负责管理和协调所有渲染器。
 * 它将组件变化事件分发给相应的渲染器，
 * 并在每帧调用渲染器的更新方法。
 *
 * @example
 * ```typescript
 * const rendererManager = new RendererManager({
 *   game,
 *   rendererSystem
 * });
 *
 * rendererManager.register(
 *   new SpriteRenderer(),
 *   new TextRenderer()
 * );
 * ```
 */
class RendererManager {
  /** 游戏实例引用 */
  game: Game;

  /** 渲染系统引用 */
  rendererSystem: RendererSystem;

  /**
   * 构造渲染管理器
   * @param game - 游戏实例
   * @param rendererSystem - 渲染系统实例
   */
  constructor({ game, rendererSystem }) {
    this.game = game;
    this.rendererSystem = rendererSystem;
  }

  /** 注册的渲染器列表 */
  renderers: Renderer[] = [];

  /**
   * 注册渲染器
   *
   * 将渲染器添加到管理器，并为其设置必要的引用。
   *
   * @param renderers - 要注册的渲染器列表
   */
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
          if ([OBSERVER_TYPE.ADD, OBSERVER_TYPE.REMOVE].indexOf(changed.type) > -1) {
            try {
              renderer.componentChanged && renderer.componentChanged(changed);
            } catch (e) {
              console.error(`gameObject: ${changed.gameObject.name}, ${changed.componentName} is error.`, changed, e);
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
                `gameObject: ${changed.gameObject && changed.gameObject.name}, ${
                  changed.componentName
                } is componentChanged error.`,
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
            console.info(`gameObject: ${gameObject.name}, ${component.name} is update error`, e);
          }
        }
      }
    }
  }
}
export default RendererManager;
