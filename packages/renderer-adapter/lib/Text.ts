import { Text as PIXIText } from 'pixi.js';

export default class Text extends PIXIText {
  text: string;
  style: any;
  width: number;
  height: number;
  constructor(text, style) {
    super(text, style);
  }
}
