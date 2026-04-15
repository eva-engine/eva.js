import { Text as PIXIText, FillGradient, Color, TextStyle } from 'pixi.js';
import type { TextStyleOptions } from 'pixi.js';

export default class Text extends PIXIText {
  constructor(text: string, style?: TextStyleOptions) {
    // @ts-ignore
    if (style.strokeThickness) {
      const color = style.stroke;
      // @ts-ignore
      style.stroke = {
        color,
        // @ts-ignore
        width: style.strokeThickness,
      };
      delete style['strokeThickness'];
    }

    // dropShadow* -> dropShadow: { color, distance, angle, alpha, blur }
    // @ts-ignore
    if (style.dropShadow) {
      const dropShadowConfig: Record<string, any> = {};
      // @ts-ignore
      if (style.dropShadowColor != null) dropShadowConfig.color = style.dropShadowColor;
      // @ts-ignore
      if (style.dropShadowDistance != null) dropShadowConfig.distance = style.dropShadowDistance;
      // @ts-ignore
      if (style.dropShadowAngle != null) dropShadowConfig.angle = style.dropShadowAngle;
      // @ts-ignore
      if (style.dropShadowAlpha != null) dropShadowConfig.alpha = style.dropShadowAlpha;
      // @ts-ignore
      if (style.dropShadowBlur != null) dropShadowConfig.blur = style.dropShadowBlur;
      // @ts-ignore
      style.dropShadow = dropShadowConfig;
      delete style['dropShadowColor'];
      delete style['dropShadowDistance'];
      delete style['dropShadowAngle'];
      delete style['dropShadowAlpha'];
      delete style['dropShadowBlur'];
    }

    if (Array.isArray(style.fill)) {
      console.warn('Eva.js Deprecation Warning:  fill array is not supported in Eva.js v2.');
      style.fill = style.fill[0];
    }

    // @ts-ignore
    if (Array.isArray(style.fillGradientStops)) {
      let fontSize;
      if (style.fontSize == null) {
        style.fontSize = TextStyle.defaultTextStyle.fontSize;
      } else if (typeof style.fontSize === 'string') {
        fontSize = parseInt(style.fontSize, 10);
      } else {
        fontSize = style.fontSize;
      }
      const gradientFill = new FillGradient(0, 0, 0, fontSize * 1.7);
      // @ts-ignore
      const fills = style.fillGradientStops.map(color => Color.shared.setValue(color).toNumber());
      fills.forEach((number, index) => {
        const ratio = index / (fills.length - 1);
        gradientFill.addColorStop(ratio, number);
      });
      style.fill = {
        fill: gradientFill,
      };
      delete style['fillGradientStops'];
    }

    super({
      text,
      style,
    });
  }
}
