import {Component, decorators} from '@eva/eva.js';

export interface NinePatchParams {
  resource: string;
  spriteName?: string;
  leftWidth?: number;
  topHeight?: number;
  rightWidth?: number;
  bottomHeight?: number;
}

export default class NinePatch extends Component<NinePatchParams> {
  static componentName: string = 'NinePatch';
  ninePatch: any;
  @decorators.IDEProp resource: string = '';
  @decorators.IDEProp spriteName: string = '';

  @decorators.IDEProp leftWidth: number = 0;
  @decorators.IDEProp topHeight: number = 0;
  @decorators.IDEProp rightWidth: number = 0;
  @decorators.IDEProp bottomHeight: number = 0;
  init(obj?: NinePatchParams) {
    this.resource = obj.resource;
    this.spriteName = obj.spriteName;
    this.leftWidth = obj.leftWidth;
    this.topHeight = obj.topHeight;
    this.rightWidth = obj.rightWidth;
    this.bottomHeight = obj.bottomHeight;
  }
}
