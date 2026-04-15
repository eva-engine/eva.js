import { decorators, ComponentChanged, OBSERVER_TYPE, resource } from '@eva/eva.js';

import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import { Text as TextEngine, HTMLText as HTMLTextEngine, BitmapText as BitmapTextEngine } from '@eva/renderer-adapter';
import { FillGradient, Color, TextStyle } from 'pixi.js';

import BitmapTextComponent from './bitmapText.component';
import TextComponent from './component';
import HTMLTextComponent from './htmlText.component';

@decorators.componentObserver({
  Text: ['text', { prop: ['style'], deep: true }],
  HTMLText: ['text', { prop: ['style'], deep: true }, { prop: ['textureStyle'], deep: true }],
  BitmapText: ['text', { prop: ['style'], deep: true }],
})
export default class Text extends Renderer {
  static systemName = 'Text';
  name: string = 'Text';
  texts: {
    [propName: number]: { text: TextEngine | HTMLTextEngine | BitmapTextEngine; component: TextComponent | HTMLTextComponent | BitmapTextComponent };
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
    const isBitmapText = changed.componentName === 'BitmapText';

    if (!isText && !isHTMLText && !isBitmapText) return;

    if (changed.type === OBSERVER_TYPE.ADD) {
      if (isText) {
        await this.addTextComponent(changed);
      } else if (isHTMLText) {
        await this.addHTMLTextComponent(changed);
      } else {
        await this.addBitmapTextComponent(changed);
      }
      this.setSize(changed);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.containerManager.getContainer(changed.gameObject.id).removeChild(this.texts[changed.gameObject.id].text);
      this.texts[changed.gameObject.id].text.destroy({ children: true });
      delete this.texts[changed.gameObject.id];
    } else {
      this.change(changed);

      // 如果样式改变且涉及字体，也需要等待字体资源加载
      const component = changed.component as TextComponent | HTMLTextComponent | BitmapTextComponent;
      if (changed.prop.prop[0] === 'style' && component.style && component.style.fontFamily) {
        const { text } = this.texts[changed.gameObject.id];
        await this.waitForFontResource(text, changed, component.style.fontFamily);
      }
      this.setSize(changed);
    }
  }

  private async addTextComponent(changed: ComponentChanged) {
    const component = changed.component as TextComponent;

    // 创建文本样式副本，先不设置 fontFamily
    const styleWithoutFont = { ...component.style };
    const fontFamily = styleWithoutFont.fontFamily;
    delete styleWithoutFont.fontFamily;
    const initialText = fontFamily ? '' : component.text;

    const text = new TextEngine(initialText, styleWithoutFont);

    this.containerManager.getContainer(changed.gameObject.id).addChildAt(text, 0);
    this.texts[changed.gameObject.id] = {
      text,
      component,
    };

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
    const initialText = fontFamily ? '' : component.text;

    const htmlText = new HTMLTextEngine({
      text: initialText,
      style: styleWithoutFont,
      ...(component.textureStyle && { textureStyle: component.textureStyle })
    } as any);

    this.containerManager.getContainer(changed.gameObject.id).addChildAt(htmlText, 0);
    this.texts[changed.gameObject.id] = {
      text: htmlText,
      component,
    };
    // 如果指定了字体资源，等待资源加载完成后设置 fontFamily
    if (fontFamily) {
      await this.waitForFontResource(htmlText, changed, fontFamily);
    }
  }

  private async addBitmapTextComponent(changed: ComponentChanged) {
    const component = changed.component as BitmapTextComponent;

    // 创建样式副本，先不设置 fontFamily
    const styleWithoutFont = { ...component.style };
    const fontFamily = styleWithoutFont.fontFamily;
    delete styleWithoutFont.fontFamily;
    const initialText = fontFamily ? '' : component.text;

    const bitmapText = new BitmapTextEngine(initialText, styleWithoutFont);

    this.containerManager.getContainer(changed.gameObject.id).addChildAt(bitmapText, 0);
    this.texts[changed.gameObject.id] = {
      text: bitmapText,
      component,
    };

    // 如果指定了字体资源，等待资源加载完成后设置 fontFamily
    if (fontFamily) {
      await this.waitForFontResource(bitmapText, changed, fontFamily);
    }
  }

  /**
   * 等待字体资源加载完成并更新文本
   */
  private async waitForFontResource(
    text: TextEngine | HTMLTextEngine | BitmapTextEngine,
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

      // 字体资源加载成功后，设置 fontFamily 并重新设置文本内容以触发重新渲染
      const component = this.texts[changed.gameObject.id].component;
      text.style.fontFamily = fontFamily;
      text.text = component.text;
      // 更新尺寸
    } catch (error) {
      console.warn(`字体资源 ${fontFamily} 加载失败:`, error);
    }
  }
  /**
   * 将 Eva.js 的样式格式转换为 PixiJS v8 格式
   */
  private processStyle(style: Record<string, any>): Record<string, any> {
    const processed = { ...style };

    // stroke + strokeThickness -> stroke: { color, width }
    if (processed.strokeThickness) {
      const color = processed.stroke;
      processed.stroke = {
        color,
        width: processed.strokeThickness,
      };
      delete processed.strokeThickness;
    }

    // dropShadow* -> dropShadow: { color, distance, angle, alpha, blur }
    if (processed.dropShadow) {
      const dropShadowConfig: Record<string, any> = {};
      if (processed.dropShadowColor != null) {
        dropShadowConfig.color = processed.dropShadowColor;
      }
      if (processed.dropShadowDistance != null) {
        dropShadowConfig.distance = processed.dropShadowDistance;
      }
      if (processed.dropShadowAngle != null) {
        dropShadowConfig.angle = processed.dropShadowAngle;
      }
      if (processed.dropShadowAlpha != null) {
        dropShadowConfig.alpha = processed.dropShadowAlpha;
      }
      if (processed.dropShadowBlur != null) {
        dropShadowConfig.blur = processed.dropShadowBlur;
      }
      processed.dropShadow = dropShadowConfig;
      delete processed.dropShadowColor;
      delete processed.dropShadowDistance;
      delete processed.dropShadowAngle;
      delete processed.dropShadowAlpha;
      delete processed.dropShadowBlur;
    }

    // fill 数组 -> 取第一个值 (deprecated)
    if (Array.isArray(processed.fill)) {
      processed.fill = processed.fill[0];
    }

    // fillGradientStops -> FillGradient 对象
    if (Array.isArray(processed.fillGradientStops)) {
      let fontSize: number;
      if (processed.fontSize == null) {
        fontSize = TextStyle.defaultTextStyle.fontSize as number;
      } else if (typeof processed.fontSize === 'string') {
        fontSize = parseInt(processed.fontSize, 10);
      } else {
        fontSize = processed.fontSize;
      }
      const gradientFill = new FillGradient(0, 0, 0, fontSize * 1.7);
      const fills = processed.fillGradientStops.map((color: any) => Color.shared.setValue(color).toNumber());
      fills.forEach((number: number, index: number) => {
        const ratio = index / (fills.length - 1);
        gradientFill.addColorStop(ratio, number);
      });
      processed.fill = { fill: gradientFill };
      delete processed.fillGradientStops;
    }

    return processed;
  }

  change(changed: ComponentChanged) {
    const { text, component } = this.texts[changed.gameObject.id];
    const isHTMLText = changed.componentName === 'HTMLText';

    if (changed.prop.prop[0] === 'text') {
      text.text = component.text;
    } else if (changed.prop.prop[0] === 'style') {
      const processedStyle = this.processStyle(component.style as any);
      Object.assign(text.style, processedStyle);
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
    const { text } = this.texts[changed.gameObject.id];
    const size = text.getSize()
    transform.size.width = size.width;
    transform.size.height = size.height;
  }
}
