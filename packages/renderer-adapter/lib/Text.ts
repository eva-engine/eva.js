import { Text as PIXIText, TextStyleOptions } from 'pixi.js';

export default class Text extends PIXIText {
  constructor(text: string, style?:TextStyleOptions) {
    super(text, style);
  }
}
