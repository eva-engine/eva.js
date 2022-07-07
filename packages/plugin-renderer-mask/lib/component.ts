import { Component } from '@eva/eva.js';

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

interface MaskStyle {
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  // 暂时不支持paths
  paths: number[];
}

export default class Mask extends Component<MaskParams> {
  static componentName: string = 'Mask';
  _lastType: MaskParams['type'];

  mask_type: string;
  type: MaskParams['type'];

  style?: MaskParams['style'] = {};

  resource?: string = '';
  // 暂时不支持sprite
  spriteName?: string = '';

  init(obj?: MaskParams) {
    Object.assign(this, obj);
  }
}
