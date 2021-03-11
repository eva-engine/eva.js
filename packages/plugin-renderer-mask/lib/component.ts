import {Component, decorators} from '@eva/eva.js';

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

export default class Mask extends Component {
  static componentName: string = 'Mask';
  @decorators.IDEProp type: MaskParams['type'];
  @decorators.IDEProp style?: MaskParams['style'] = {};
  @decorators.IDEProp resource?: string = '';
  @decorators.IDEProp spriteName?: string = '';

  init(obj?: MaskParams) {
    Object.assign(this, obj);
  }
}
