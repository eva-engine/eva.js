import {Component, decorators} from '@eva/eva.js';

export interface ImgParams {
  resource: string;
}

export default class Img extends Component {
  static componentName: string = 'Img';
  @decorators.IDEProp resource: string = '';
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
  }
}
