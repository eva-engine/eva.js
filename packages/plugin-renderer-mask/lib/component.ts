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

class MaskStyle {
  @Field({ step: 1 })
  x: number;

  @Field({ step: 1 })
  y: number;

  @Field({ step: 0.1, if: (mask: Mask) => mask.type === MASK_TYPE.Circle || mask.type === MASK_TYPE.RoundedRect })
  radius: number;

  @Field({ step: 1, if: (mask: Mask) => mask.type !== MASK_TYPE.Circle })
  width: number;

  @Field({ step: 1, if: (mask: Mask) => mask.type !== MASK_TYPE.Circle })
  height: number;

  // 暂时不支持paths
  paths: number[];
}

export default class Mask extends Component<MaskParams> {
  static componentName: string = 'Mask';
  _lastType: MaskParams['type'];

  @Field({
    type: 'selector',
    options: {
      [MASK_TYPE.Circle]: MASK_TYPE.Circle,
      [MASK_TYPE.Ellipse]: MASK_TYPE.Ellipse,
      [MASK_TYPE.Img]: MASK_TYPE.Img,
      // [ MASK_TYPE.Polygon]: MASK_TYPE.Polygon,
      [MASK_TYPE.Rect]: MASK_TYPE.Rect,
      [MASK_TYPE.RoundedRect]: MASK_TYPE.RoundedRect,
      // [ MASK_TYPE.Sprite]: MASK_TYPE.Sprite,
    },
    alias: 'type',
    default: MASK_TYPE.Circle,
  })
  mask_type: string;
  type: MaskParams['type'];

  @Field(() => MaskStyle)
  style?: MaskParams['style'] = {};

  @Field({
    type: 'resource',
    if: (mask: any) => mask.type === MASK_TYPE.Img || MASK_TYPE.Sprite,
  })
  resource?: string = '';
  // 暂时不支持sprite
  spriteName?: string = '';

  init(obj?: MaskParams) {
    Object.assign(this, obj);
  }
}
