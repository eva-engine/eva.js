import { TextStyle } from 'pixi.js';
import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

class Style {
  @Field({
    type: 'select',
    options: [
      { key: 'center', value: 'center' },
      { key: 'left', value: 'left' },
      { key: 'right', value: 'right' },
    ],
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
  @Field({ type: 'color', default: '#000000' })
  dropShadowColor?: string | number;
  @Field({ default: 5 })
  dropShadowDistance?: number;

  @Field({ type: 'color', default: ['#000000'], isArray: true })
  fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;

  @Field({
    type: 'select',
    options: [
      { key: 1, value: 'vertical' },
      { key: 0, value: 'horizontal' },
    ],
    default: 1,
  })
  fillGradientType?: number;

  @Field(() => Number, { step: 0.1, min: 0, max: 1 })
  fillGradientStops?: number[];
  @Field(() => String, { default: 'Arial' })
  fontFamily?: string | string[];

  @Field(() => Number, { min: 5, default: 26 })
  fontSize?: number | string;

  @Field({
    type: 'select',
    options: [
      { key: 'normal', value: 'normal' },
      { key: 'italic', value: 'italic' },
      { key: 'oblique', value: 'oblique' },
    ],
    default: 'normal',
  })
  fontStyle?: string;

  @Field({
    type: 'select',
    options: [
      { key: 'normal', value: 'normal' },
      { key: 'small-caps', value: 'small-caps' },
    ],
    default: 'normal',
  })
  fontVariant?: string;

  @Field({
    type: 'select',
    options: [
      { key: 'normal', value: 'normal' },
      { key: 'bold', value: 'bold' },
      { key: 'bolder', value: 'bolder' },
      { key: 'lighter', value: 'lighter' },
      { key: '100', value: '100' },
      { key: '200', value: '200' },
      { key: '300', value: '300' },
      { key: '400', value: '400' },
      { key: '500', value: '500' },
      { key: '600', value: '600' },
      { key: '700', value: '700' },
      { key: '800', value: '800' },
      { key: '900', value: '900' },
    ],
    default: 'normal',
  })
  fontWeight?: string;

  @Field({ default: 0 })
  letterSpacing?: number;
  @Field({ default: 0 })
  lineHeight?: number;
  @Field({
    type: 'select',
    options: [
      { key: 'miter', value: 'miter' },
      { key: 'round', value: 'round' },
      { key: 'bevel', value: 'bevel' },
    ],
    default: 'miter',
  })
  lineJoin?: string;

  @Field({ default: 10 })
  miterLimit?: number;

  @Field({ default: 0 })
  padding?: number;

  @Field({ type: 'color', default: '#000000' })
  stroke?: string | number;

  @Field({ default: 0, min: 0 })
  strokeThickness?: number;

  @Field({ default: 'alphabetic' })
  textBaseline?: string;

  @Field()
  trim?: boolean;

  @Field({
    default: 'pre',
    type: 'select',
    options: [
      { key: 'normal', value: 'normal' },
      { key: 'pre', value: 'pre' },
      { key: 'pre-line', value: 'pre-line' },
    ],
  })
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
  @Field()
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
