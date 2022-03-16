import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

export enum MASK_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
  Polygon = 'Polygon',
  Img = 'Img',
  Sprite = 'Sprite',
}

export interface MaskParams {
  type: MASK_TYPE;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
  resource?: string;
  spriteName?: string;
}

export default class Mask extends Component<MaskParams> {
  static componentName: string = 'Mask';
  // @decorators.IDEProp 复杂编辑后续添加
  type: MaskParams['type'];
  // @decorators.IDEProp 复杂编辑后续添加
  style?: MaskParams['style'] = {};
  @Field() resource?: string = '';
  @Field() spriteName?: string = '';

  init(obj?: MaskParams) {
    Object.assign(this, obj);
  }
}
