import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface HTMLTextStyleOptions {
  fontFamily?: string | string[];
  fontSize?: number | string;
  fill?: string | number;
  align?: 'left' | 'center' | 'right' | 'justify';
  breakWords?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  stroke?: string | number;
  strokeThickness?: number;
  dropShadow?: boolean;
  dropShadowAlpha?: number;
  dropShadowAngle?: number;
  dropShadowBlur?: number;
  dropShadowColor?: string | number;
  dropShadowDistance?: number;
  trim?: boolean;
  fontWeight?: string;
  fontStyle?: string;
  fontVariant?: string;
  textBaseline?: string;
  whiteSpace?: string;
}

export interface HTMLTextParams {
  text: string;
  style?: HTMLTextStyleOptions & {
    cssOverrides?: string[];
    wordWrap?: boolean;
    wordWrapWidth?: number;
    tagStyles?: Record<string, HTMLTextStyleOptions>;
  };
  textureStyle?: {
    scaleMode?: 'linear' | 'nearest';
    resolution?: number;
  };
}

export default class HTMLText extends Component<HTMLTextParams> {
  static componentName: string = 'HTMLText';
  @type('string') text: string = '';
  style: HTMLTextParams['style'] = {};
  textureStyle: HTMLTextParams['textureStyle'] = {};

  init(obj?: HTMLTextParams) {
    this.style = {
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      ...obj?.style
    };

    this.textureStyle = {
      scaleMode: 'linear',
      resolution: window.devicePixelRatio || 1,
      ...obj?.textureStyle
    };

    if (obj) {
      this.text = obj.text;
    }
  }
}
