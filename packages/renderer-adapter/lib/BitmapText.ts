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

    // dropShadow* -> dropShadow: { color, distance, angle, alpha, blur }
    // @ts-ignore
    if (processedStyle.dropShadow) {
      const dropShadowConfig: Record<string, any> = {};
      // @ts-ignore
      if (processedStyle.dropShadowColor != null) dropShadowConfig.color = processedStyle.dropShadowColor;
      // @ts-ignore
      if (processedStyle.dropShadowDistance != null) dropShadowConfig.distance = processedStyle.dropShadowDistance;
      // @ts-ignore
      if (processedStyle.dropShadowAngle != null) dropShadowConfig.angle = processedStyle.dropShadowAngle;
      // @ts-ignore
      if (processedStyle.dropShadowAlpha != null) dropShadowConfig.alpha = processedStyle.dropShadowAlpha;
      // @ts-ignore
      if (processedStyle.dropShadowBlur != null) dropShadowConfig.blur = processedStyle.dropShadowBlur;
      // @ts-ignore
      processedStyle.dropShadow = dropShadowConfig;
      delete processedStyle['dropShadowColor'];
      delete processedStyle['dropShadowDistance'];
      delete processedStyle['dropShadowAngle'];
      delete processedStyle['dropShadowAlpha'];
      delete processedStyle['dropShadowBlur'];
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
