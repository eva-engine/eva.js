import {
  TextStyle,
  TextStyleAlign,
  TextStyleFontStyle,
  TextStyleFontVariant,
  TextStyleFontWeight,
  TextStyleTextBaseline,
  TextStyleWhiteSpace,
} from 'pixi.js';
import { Component, Field, type } from '@eva/eva.js';

export interface TextParams {
  text: string;
  style?: {
    align?: TextStyleAlign;
    breakWords?: boolean;
    dropShadow?: boolean;
    dropShadowAlpha?: number;
    dropShadowAngle?: number;
    dropShadowBlur?: number;
    dropShadowColor?: string | number;
    dropShadowDistance?: number;
    fill?: any;
    fillGradientType?: number;
    fillGradientStops?: number[];
    fontFamily?: string | string[];
    fontSize?: number | string;
    fontStyle?: TextStyleFontStyle;
    fontVariant?: TextStyleFontVariant;
    fontWeight?: TextStyleFontWeight;
    letterSpacing?: number;
    lineHeight?: number;
    lineJoin?: string;
    miterLimit?: number;
    padding?: number;
    stroke?: string | number;
    strokeThickness?: number;
    textBaseline?: TextStyleTextBaseline;
    verticalAlign?: 'top' | 'middle' | 'bottom' | string;
    trim?: boolean;
    whiteSpace?: TextStyleWhiteSpace;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    leading?: number;
  };
}

class TextStyleStrokeMetadata {
  @type('number') alpha: number;
  @Field({ type: 'color' }) color: string | number;
  @type('string') join: string;
  @type('number') miterLimit: number;
  @type('number') width: number;
}

class TextStyleDropShadowMetadata {
  @type('number') alpha: number;
  @type('number') angle: number;
  @type('number') blur: number;
  @Field({ type: 'color' }) color: string | number;
  @type('number') distance: number;
  @type('boolean') enabled: boolean;
}

class TextStyleMetadata {
  @type('string') align: TextStyleAlign;
  @type('boolean') breakWords: boolean;
  @Field(() => TextStyleDropShadowMetadata) dropShadow: boolean | TextStyleDropShadowMetadata;
  @type('number') dropShadowAlpha: number;
  @type('number') dropShadowAngle: number;
  @type('number') dropShadowBlur: number;
  @Field({ type: 'color' }) dropShadowColor: string | number;
  @type('number') dropShadowDistance: number;
  @Field({ type: 'color' }) fill: any;
  @type('number') fillGradientType: number;
  @type('number') fillGradientStops: number[];
  @type('string') fontFamily: string | string[];
  @type('number') fontSize: number | string;
  @type('string') fontStyle: TextStyleFontStyle;
  @type('string') fontVariant: TextStyleFontVariant;
  @type('string') fontWeight: TextStyleFontWeight;
  @type('number') leading: number;
  @type('number') letterSpacing: number;
  @type('number') lineHeight: number;
  @type('string') lineJoin: string;
  @type('number') miterLimit: number;
  @type('number') padding: number;
  @Field(() => TextStyleStrokeMetadata) stroke: string | number | TextStyleStrokeMetadata;
  @type('number') strokeThickness: number;
  @type('string') textBaseline: TextStyleTextBaseline;
  @type('string') verticalAlign: string;
  @type('boolean') trim: boolean;
  @type('string') whiteSpace: TextStyleWhiteSpace;
  @type('boolean') wordWrap: boolean;
  @type('number') wordWrapWidth: number;
}

/**
 * 文本组件（基于 PixiJS Text）
 *
 * Text 组件用于渲染文本内容，支持丰富的文本样式配置。
 * 它基于 PixiJS 的 Text 实现，支持字体、颜色、描边、阴影、对齐等多种样式。
 *
 * 主要特性：
 * - 支持多种字体和字号
 * - 支持文本颜色、渐变填充
 * - 支持描边和投影效果
 * - 支持文本对齐和换行
 *
 * @example
 * ```typescript
 * // 基础文本
 * const label = new GameObject('label');
 * label.addComponent(new Text({
 *   text: 'Hello EVA!',
 *   style: {
 *     fontSize: 32,
 *     fill: 0xffffff
 *   }
 * }));
 *
 * // 带样式的文本
 * label.addComponent(new Text({
 *   text: '得分: 9999',
 *   style: {
 *     fontFamily: 'Arial',
 *     fontSize: 48,
 *     fontWeight: 'bold',
 *     fill: ['#ff0000', '#ffff00'], // 渐变色
 *     stroke: '#000000',
 *     strokeThickness: 4,
 *     dropShadow: true,
 *     dropShadowDistance: 3
 *   }
 * }));
 * // 如需高清渲染，使用 Render 组件的 resolution 属性
 * label.addComponent(new Render({ resolution: 2 }));
 * ```
 */
export default class Text extends Component<TextParams> {
  /** 组件名称 */
  static componentName: string = 'Text';

  /** 文本内容 */
  @type('string') text: string = '';

  /** 文本样式配置 */
  @Field(() => TextStyleMetadata)
  style: TextParams['style'] = {};

  constructor(params?: TextParams) {
    super(params);
    this.init(params);
  }

  /**
   * 初始化组件
   * @param obj - 初始化参数
   */
  init(obj?: TextParams) {
    const style = new TextStyle({
      fontSize: 20,
    });
    const newStyle = {};
    for (const key in style) {
      if (key.indexOf('_') === 0) {
        newStyle[key.substring(1)] = style[key];
      }
    }
    delete newStyle['styleKey'];
    this.style = newStyle;
    if (obj) {
      this.text = obj.text;
      Object.assign(this.style, obj.style);
    }
  }
}
