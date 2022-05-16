import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';
export interface RenderParams {
  alpha?: number;
  zIndex?: number;
  visible?: boolean;
  sortableChildren?: boolean;
}
export default class Render extends Component<RenderParams> {
  static componentName: string = 'Render';
  sortDirty: boolean = false;
  @Field() visible: boolean = true;
  @Field({ step: 0.1 }) alpha: number = 1;
  @Field({ step: 1 }) zIndex: number = 0;
  @Field() sortableChildren: boolean = false;
  init(obj?: RenderParams) {
    obj && Object.assign(this, obj);
  }
}
