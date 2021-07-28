import {Component} from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

export default class Sprite extends Component {
  static componentName: string = 'Sprite';
  @type('string') resource: string = '';
  @type('string') spriteName: string = '';
  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
