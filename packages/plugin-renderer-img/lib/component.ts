import { Component, decorators, Game, GameObject } from '@eva/eva.js';

export interface ImgParams {
  resource: string;
}

export default class Img extends Component<ImgParams> {
  static componentName: string = 'Img';
  @decorators.IDEProp resource: string = '';
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
  }
}
