import {Component, decorators} from '@eva/eva.js';
export interface RenderParams {
  alpha?: number;
  zIndex?: number;
  visible?: boolean;
  sortableChildren?: boolean;
}
export default class Render extends Component {
  static componentName: string = 'Render';
  sortDirty: boolean = false;
  @decorators.IDEProp visible: boolean = true;
  @decorators.IDEProp alpha: number = 1;
  @decorators.IDEProp zIndex: number = 0;
  @decorators.IDEProp sortableChildren: boolean = false;
  init(obj?: RenderParams) {
    obj && Object.assign(this, obj);
  }
}
