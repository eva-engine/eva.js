import { Field } from '@eva/inspector-decorator';
import { Component } from '@eva/eva.js';

export interface ImgParams {
  resource: string;
}

class Resource {
  static getProperties() {
    return 'resource';
  }
}

export default class Img extends Component<ImgParams> {
  static componentName: string = 'Img';
  @Field(() => Resource) resource: string = '';
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
  }
}
