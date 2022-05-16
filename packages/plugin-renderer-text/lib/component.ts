import { TextStyle } from 'pixi.js';
import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

class Color {
  static getProperties() {
    return 'color';
  }
}

class Style {
  @Field({
    type: 'selector',
    isArray: false,
    options: ['center', 'left', 'right'],
    default: 'left',
  })
  align?: string;
  @Field()
  breakWords?: boolean;
  @Field()
  dropShadow?: boolean;
  @Field({ default: 1 })
  dropShadowAlpha?: number;
  @Field({ default: Math.PI / 6 })
  dropShadowAngle?: number;
  @Field({ default: 0 })
  dropShadowBlur?: number;
  @Field(() => Color, { default: '#000000' })
  dropShadowColor?: string | number;
  @Field({ default: 5 })
  dropShadowDistance?: number;

  @Field(() => [Color], { default: ['#000000'] })
  fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;

  @Field({
    type: 'selector',
    options: { vertical: 1, horizontal: 0 },
    default: 1,
    filter: val => Number(val),
    isArray: false,
  })
  fillGradientType?: number;

  @Field(() => Number, { step: 0.1, min: 0, max: 1 })
  fillGradientStops?: number[];
  @Field(() => String, { default: 'Arial' })
  fontFamily?: string | string[];

  @Field(() => Number, { min: 5, default: 26 })
  fontSize?: number | string;

  @Field({ type: 'selector', options: ['normal', 'italic', 'oblique'], default: 'normal' })
  fontStyle?: string;
  @Field({ type: 'selector', options: ['normal', 'small-caps'], default: 'normal' })
  fontVariant?: string;

  @Field({
    type: 'selector',
    options: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    default: 'normal',
  })
  fontWeight?: string;

  @Field({ default: 0 })
  letterSpacing?: number;
  @Field({ default: 0 })
  lineHeight?: number;
  @Field({ type: 'selector', options: ['miter', 'round', 'bevel'], default: 'miter' })
  lineJoin?: string;

  @Field({ default: 10 })
  miterLimit?: number;

  @Field({ default: 0 })
  padding?: number;

  @Field(() => Color, { default: '#000000' })
  stroke?: string | number;

  @Field({ default: 0, min: 0 })
  strokeThickness?: number;

  @Field({ default: 'alphabetic' })
  textBaseline?: string;

  @Field()
  trim?: boolean;

  @Field({ default: 'pre', type: 'selector', options: ['normal', 'pre', 'pre-line'] })
  whiteSpace?: string;

  @Field()
  wordWrap?: boolean;

  @Field({ default: 100 })
  wordWrapWidth?: number;
  @Field()
  leading?: number;
}

export interface TextParams {
  text: string;
  style?: Style;
}

export default class Text extends Component<TextParams> {
  static componentName: string = 'Text';
  @Field({
    type: 'textarea',
    filter: (text: string): string => {
      if (typeof text !== 'string') {
        return '';
      }
      if (text.length > 100) {
        return text.slice(0, 100);
      }
      return text;
    },
  })
  text: string = '';
  // @decorators.IDEProp 复杂编辑后续添加
  @Field()
  style: Style = {};
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
