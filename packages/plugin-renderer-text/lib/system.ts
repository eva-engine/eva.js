import { decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';

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

      // 创建文本样式副本，先不设置 fontFamily
      const styleWithoutFont = { ...component.style };
      const fontFamily = styleWithoutFont.fontFamily;
      delete styleWithoutFont.fontFamily;

      const text = new TextEngine(component.text, styleWithoutFont);
      this.containerManager.getContainer(changed.gameObject.id).addChildAt(text, 0);
      this.texts[changed.gameObject.id] = {
        text,
        component: changed.component as TextComponent,
      };
      this.setSize(changed);

      // 如果指定了字体资源，等待资源加载完成后设置 fontFamily
      if (fontFamily) {
        await this.waitForFontResource(text, changed, fontFamily);
      }
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.containerManager.getContainer(changed.gameObject.id).removeChild(this.texts[changed.gameObject.id].text);
      this.texts[changed.gameObject.id].text.destroy({ children: true });
      delete this.texts[changed.gameObject.id];
    } else {
      this.change(changed);
      this.setSize(changed);

      // 如果样式改变且涉及字体，也需要等待字体资源加载
      const component = changed.component as TextComponent;
      if (changed.prop.prop[0] === 'style' && component.style && component.style.fontFamily) {
        const { text } = this.texts[changed.gameObject.id];
        await this.waitForFontResource(text, changed, component.style.fontFamily);
      }
    }
  }

  /**
   * 等待字体资源加载完成并更新文本
   */
  private async waitForFontResource(
    text: TextEngine,
    changed: ComponentChanged,
    fontFamily: string | string[]
  ) {
    if (!fontFamily) {
      return;
    }

    try {
      const fontName = Array.isArray(fontFamily) ? fontFamily[0] : fontFamily;

      // 通过 resource 系统获取字体资源
      const asyncId = this.increaseAsyncId(changed.gameObject.id);
      await resource.getResource(fontName);

      // 验证异步操作是否仍然有效（防止组件已被移除）
      if (!this.validateAsyncId(changed.gameObject.id, asyncId)) return;

      // 如果字体资源加载成功，设置 fontFamily 并强制更新文本
        // 设置 fontFamily
      text.style.fontFamily = fontFamily;
      // 更新尺寸
      this.setSize(changed);
    } catch (error) {
      console.warn(`字体资源 ${fontFamily} 加载失败:`, error);
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
