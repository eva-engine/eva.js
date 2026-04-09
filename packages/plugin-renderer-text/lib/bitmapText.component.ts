import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface BitmapTextStyleOptions {
  fontFamily?: string | string[];
  fontSize?: number | string;
  fill?: string | number;
  align?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  padding?: number;
  stroke?: string | number;
  strokeThickness?: number;
  fontWeight?: string;
  fontStyle?: string;
}

export interface BitmapTextParams {
  text: string;
  style?: BitmapTextStyleOptions;
}

/**
 * 位图文本组件
 *
 * BitmapText 组件使用位图字体渲染文本，性能优于 Canvas 文本渲染。
 * 适用于频繁更新的文本场景，如计分板、倒计时等。
 *
 * 支持两种字体模式：
 * - 动态生成：指定 TextStyle，PixiJS 自动生成 bitmap font
 * - 预加载字体：通过 BitmapFont.install() 预安装或从 .fnt 文件加载
 *
 * @example
 * ```typescript
 * const score = new GameObject('score');
 * score.addComponent(new BitmapText({
 *   text: 'Score: 0',
 *   style: {
 *     fontSize: 32,
 *     fill: '#ffffff',
 *     fontFamily: 'Arial'
 *   }
 * }));
 * ```
 */
export default class BitmapText extends Component<BitmapTextParams> {
  static componentName: string = 'BitmapText';

  @type('string') text: string = '';

  style: BitmapTextStyleOptions = {};

  init(obj?: BitmapTextParams) {
    this.style = {
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      ...obj?.style,
    };

    if (obj) {
      this.text = obj.text;
    }
  }
}
