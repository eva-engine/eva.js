import { TextStyle } from 'pixi.js';
import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

class Color {
  static getProperties() {
    return 'color';
  }
}

class Style {
  @Field()
  align?: string;
  @Field()
  breakWords?: boolean;
  @Field()
  dropShadow?: boolean;
  @Field()
  dropShadowAlpha?: number;
  @Field()
  dropShadowAngle?: number;
  @Field()
  dropShadowBlur?: number;
  @Field(() => Color)
  dropShadowColor?: string | number;
  @Field()
  dropShadowDistance?: number;
  @Field(() => Color)
  fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
  @Field()
  fillGradientType?: number;
  @Field(() => Number)
  fillGradientStops?: number[];
  @Field(() => String)
  fontFamily?: string | string[];
  @Field(() => Number)
  fontSize?: number | string;
  @Field()
  fontStyle?: string;
  @Field()
  fontVariant?: string;
  @Field()
  fontWeight?: string;
  @Field()
  letterSpacing?: number;
  @Field()
  lineHeight?: number;
  @Field()
  lineJoin?: string;
  @Field()
  miterLimit?: number;
  @Field()
  padding?: number;
  stroke?: string | number;
  @Field()
  strokeThickness?: number;
  @Field()
  textBaseline?: string;
  @Field()
  trim?: boolean;
  @Field()
  whiteSpace?: string;
  @Field()
  wordWrap?: boolean;
  @Field()
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
  @Field() text: string = '';
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
