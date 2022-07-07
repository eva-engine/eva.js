import { Component, resource } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

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
