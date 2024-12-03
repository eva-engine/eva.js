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
