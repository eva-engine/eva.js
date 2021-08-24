import { Text as PIXIText } from 'pixi.js';
import type { TextStyleOptions } from "pixi.js";

export default class Text extends PIXIText {
  constructor(text: string, style?: TextStyleOptions) {
    super(text, style);
  }
}
