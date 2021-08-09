import { decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';

import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Text as TextEngine } from '@eva/renderer-adapter';

import TextComponent from './component';
@decorators.componentObserver({
  Text: ['text', { prop: ['style'], deep: true }],
})
export default class Text extends Renderer {
  static systemName = 'Text';
  name: string = 'Text';
  texts: {
    [propName: number]: { text: TextEngine; component: TextComponent };
  } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'Text') return;
    if (changed.type === OBSERVER_TYPE.ADD) {
      const component = changed.component as TextComponent;
      const text = new TextEngine(component.text, component.style);
      this.containerManager.getContainer(changed.gameObject.id).addChildAt(text, 0);
      this.texts[changed.gameObject.id] = {
        text,
        component: changed.component as TextComponent,
      };
      this.setSize(changed);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.containerManager.getContainer(changed.gameObject.id).removeChild(this.texts[changed.gameObject.id].text);
      this.texts[changed.gameObject.id].text.destroy({ children: true });
      delete this.texts[changed.gameObject.id];
    } else {
      this.change(changed);
      this.setSize(changed);
    }
  }
  change(changed: ComponentChanged) {
    const { text, component } = this.texts[changed.gameObject.id];
    if (changed.prop.prop[0] === 'text') {
      text.text = component.text;
    } else if (changed.prop.prop[0] === 'style') {
      Object.assign(text.style, (changed.component as TextComponent).style);
    }
  }
  setSize(changed: ComponentChanged) {
    const { transform } = changed.gameObject;
    if (!transform) return;
    transform.size.width = this.texts[changed.gameObject.id].text.width;
    transform.size.height = this.texts[changed.gameObject.id].text.height;
  }
}
