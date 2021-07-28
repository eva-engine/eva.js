import { type } from '@eva/inspector-decorator';
import {Component} from '@eva/eva.js';

export interface ImgParams {
  resource: string;
}

export default class Img extends Component {
  static componentName: string = 'Img';
  @type('string') resource: string = '';
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
  }
}
