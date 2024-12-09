import {
  TextStyle,
  TextStyleAlign,
  TextStyleFontStyle,
  TextStyleFontVariant,
  TextStyleFontWeight,
  TextStyleTextBaseline,
  TextStyleWhiteSpace,
} from 'pixi.js';
import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

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
    trim?: boolean;
    whiteSpace?: TextStyleWhiteSpace;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    leading?: number;
  };
}

export default class Text extends Component<TextParams> {
  static componentName: string = 'Text';
  @type('string') text: string = '';
  // @decorators.IDEProp 复杂编辑后续添加
  style: TextParams['style'] = {};
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
