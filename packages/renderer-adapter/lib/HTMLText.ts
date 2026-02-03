import { HTMLText as PIXIHTMLText } from 'pixi.js';
import type { HTMLTextOptions, HTMLTextStyle } from 'pixi.js';

export default class HTMLText extends PIXIHTMLText {
  constructor(options?: string | HTMLTextOptions) {
    // 兼容字符串和对象两种参数形式
    if (typeof options === 'string') {
      super({ text: options });
    } else {
      super(options || {});
    }
  }
}
