import {TextStyle} from 'pixi.js';
import {Component, decorators} from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface TextParams {
  text: string;
  style: {
    align?: string;
    breakWords?: boolean;
    dropShadow?: boolean;
    dropShadowAlpha?: number;
    dropShadowAngle?: number;
    dropShadowBlur?: number;
    dropShadowColor?: string | number;
    dropShadowDistance?: number;
    fill?:
      | string
      | string[]
      | number
      | number[]
      | CanvasGradient
      | CanvasPattern;
    fillGradientType?: number;
    fillGradientStops?: number[];
    fontFamily?: string | string[];
    fontSize?: number | string;
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: string;
    letterSpacing?: number;
    lineHeight?: number;
    lineJoin?: string;
    miterLimit?: number;
    padding?: number;
    stroke?: string | number;
    strokeThickness?: number;
    textBaseline?: string;
    trim?: boolean;
    whiteSpace?: string;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    leading?: number;
  };
}

export default class Text extends Component {
  static componentName: string = 'Text';
  @type('string') text: string = '';
  @decorators.IDEProp style: TextParams['style'] = {};
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
    this.style = newStyle;
    if (obj) {
      this.text = obj.text;
      Object.assign(this.style, obj.style);
    }
  }
}
