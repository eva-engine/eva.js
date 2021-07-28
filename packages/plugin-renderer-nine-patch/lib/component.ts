import {Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface NinePatchParams {
  resource: string;
  spriteName?: string;
  leftWidth?: number;
  topHeight?: number;
  rightWidth?: number;
  bottomHeight?: number;
}

export default class NinePatch extends Component {
  static componentName: string = 'NinePatch';
  ninePatch: any;
  @type('string') resource: string = '';
  @type('string') spriteName: string = '';

  @type('number') leftWidth: number = 0;
  @type('number') topHeight: number = 0;
  @type('number') rightWidth: number = 0;
  @type('number') bottomHeight: number = 0;
  init(obj?: NinePatchParams) {
    this.resource = obj.resource;
    this.spriteName = obj.spriteName;
    this.leftWidth = obj.leftWidth;
    this.topHeight = obj.topHeight;
    this.rightWidth = obj.rightWidth;
    this.bottomHeight = obj.bottomHeight;
  }
}
