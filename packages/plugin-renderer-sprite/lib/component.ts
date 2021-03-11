import {Component, decorators} from '@eva/eva.js';

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

export default class Sprite extends Component {
  static componentName: string = 'Sprite';
  @decorators.IDEProp resource: string = '';
  @decorators.IDEProp spriteName: string = '';
  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
