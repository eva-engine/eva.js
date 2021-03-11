import {Component} from '@eva/eva.js';

export enum HIT_AREA_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Polygon = 'Polygon',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
}

interface HitArea {
  type: HIT_AREA_TYPE;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
}

export interface EventParams {
  hitArea: HitArea;
}
export default class Event extends Component {
  static componentName = 'Event';
  hitArea: HitArea = undefined;
  init(params?: EventParams) {
    params && Object.assign(this, params);
  }
}
