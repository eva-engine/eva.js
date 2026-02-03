import { decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';

import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Text as TextEngine, HTMLText as HTMLTextEngine } from '@eva/renderer-adapter';

import TextComponent from './component';
import HTMLTextComponent from './htmlText.component';

@decorators.componentObserver({
  Text: ['text', { prop: ['style'], deep: true }],
  HTMLText: ['text', { prop: ['style'], deep: true }, { prop: ['textureStyle'], deep: true }],
})
export default class Text extends Renderer {
  static systemName = 'Text';
  name: string = 'Text';
  texts: {
    [propName: number]: { text: TextEngine | HTMLTextEngine; component: TextComponent | HTMLTextComponent };
  } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  async componentChanged(changed: ComponentChanged) {
    const isText = changed.componentName === 'Text';
    const isHTMLText = changed.componentName === 'HTMLText';

    if (!isText && !isHTMLText) return;

    if (changed.type === OBSERVER_TYPE.ADD) {
      if (isText) {
        await this.addTextComponent(changed);
      } else {
        await this.addHTMLTextComponent(changed);
      }
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.containerManager.getContainer(changed.gameObject.id).removeChild(this.texts[changed.gameObject.id].text);
      this.texts[changed.gameObject.id].text.destroy({ children: true });
      delete this.texts[changed.gameObject.id];
    } else {
      this.change(changed);
      this.setSize(changed);

      // 如果样式改变且涉及字体，也需要等待字体资源加载
      const component = changed.component as TextComponent | HTMLTextComponent;
      if (changed.prop.prop[0] === 'style' && component.style && component.style.fontFamily) {
        const { text } = this.texts[changed.gameObject.id];
        await this.waitForFontResource(text, changed, component.style.fontFamily);
      }
    }
  }

  private async addTextComponent(changed: ComponentChanged) {
    const component = changed.component as TextComponent;

    // 创建文本样式副本，先不设置 fontFamily
    const styleWithoutFont = { ...component.style };
    const fontFamily = styleWithoutFont.fontFamily;
    delete styleWithoutFont.fontFamily;

    const text = new TextEngine(component.text, styleWithoutFont);
    this.containerManager.getContainer(changed.gameObject.id).addChildAt(text, 0);
    this.texts[changed.gameObject.id] = {
      text,
      component,
    };
    this.setSize(changed);

    // 如果指定了字体资源，等待资源加载完成后设置 fontFamily
    if (fontFamily) {
      await this.waitForFontResource(text, changed, fontFamily);
    }
  }

  private async addHTMLTextComponent(changed: ComponentChanged) {
    const component = changed.component as HTMLTextComponent;

    // 创建样式副本，先不设置 fontFamily
    const styleWithoutFont = { ...component.style };
    const fontFamily = styleWithoutFont.fontFamily;
    delete styleWithoutFont.fontFamily;

    const htmlText = new HTMLTextEngine({
      text: component.text,
      style: styleWithoutFont,
      ...(component.textureStyle && { textureStyle: component.textureStyle })
    } as any);

    this.containerManager.getContainer(changed.gameObject.id).addChildAt(htmlText, 0);
    this.texts[changed.gameObject.id] = {
      text: htmlText,
      component,
    };
    this.setSize(changed);

    // 如果指定了字体资源，等待资源加载完成后设置 fontFamily
    if (fontFamily) {
      await this.waitForFontResource(htmlText, changed, fontFamily);
    }
  }

  /**
   * 等待字体资源加载完成并更新文本
   */
  private async waitForFontResource(
    text: TextEngine | HTMLTextEngine,
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
    const isHTMLText = changed.componentName === 'HTMLText';

    if (changed.prop.prop[0] === 'text') {
      text.text = component.text;
    } else if (changed.prop.prop[0] === 'style') {
      Object.assign(text.style, component.style);
    } else if (changed.prop.prop[0] === 'textureStyle' && isHTMLText) {
      // HTMLText 纹理样式变化需要重新创建
      const htmlComponent = component as HTMLTextComponent;
      const container = this.containerManager.getContainer(changed.gameObject.id);
      const index = container.getChildIndex(text);
      container.removeChild(text);
      text.destroy({ children: true });

      const newText = new HTMLTextEngine({
        text: htmlComponent.text,
        style: htmlComponent.style,
        textureStyle: htmlComponent.textureStyle
      } as any);
      container.addChildAt(newText, index);
      this.texts[changed.gameObject.id].text = newText;
    }
  }

  setSize(changed: ComponentChanged) {
    const { transform } = changed.gameObject;
    if (!transform) return;
    transform.size.width = this.texts[changed.gameObject.id].text.width;
    transform.size.height = this.texts[changed.gameObject.id].text.height;
  }
}
