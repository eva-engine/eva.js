import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

export default class Sprite extends Component<SpriteParams> {
  static componentName: string = 'Sprite';
  @Field() resource: string = '';
  @Field() spriteName: string = '';
  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
