import { BitmapText as PIXIBitmapText } from 'pixi.js';
import type { TextStyleOptions } from 'pixi.js';

export default class BitmapText extends PIXIBitmapText {
  constructor(text: string, style?: TextStyleOptions) {
    const processedStyle = { ...style };

    // @ts-ignore
    if (processedStyle.strokeThickness) {
      const color = processedStyle.stroke;
      // @ts-ignore
      processedStyle.stroke = {
        color,
        // @ts-ignore
        width: processedStyle.strokeThickness,
      };
      delete processedStyle['strokeThickness'];
    }

    if (Array.isArray(processedStyle.fill)) {
      console.warn('Eva.js Deprecation Warning: fill array is not supported in Eva.js v2.');
      processedStyle.fill = processedStyle.fill[0];
    }

    super({
      text,
      style: processedStyle,
    });
  }
}
