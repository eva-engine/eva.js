import { Component } from '@eva/eva.js';

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

export default class Sprite extends Component<SpriteParams> {
  static componentName: string = 'Sprite';

  resource: string = '';
  spriteName: string = '';

  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
