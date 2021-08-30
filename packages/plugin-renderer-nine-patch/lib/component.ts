import { Component } from '@eva/eva.js';
import { type, step } from '@eva/inspector-decorator';
import { NinePatch as NinePatchSprite } from "@eva/renderer-adapter";

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
  ninePatch: NinePatchSprite;
  @type('string') resource: string = '';
  @type('string') spriteName: string = '';

  @type('number') @step(1) leftWidth: number = 0;
  @type('number') @step(1) topHeight: number = 0;
  @type('number') @step(1) rightWidth: number = 0;
  @type('number') @step(1) bottomHeight: number = 0;
  init(obj?: NinePatchParams) {
    this.resource = obj.resource;
    this.spriteName = obj.spriteName;
    this.leftWidth = obj.leftWidth;
    this.topHeight = obj.topHeight;
    this.rightWidth = obj.rightWidth;
    this.bottomHeight = obj.bottomHeight;
  }
}
