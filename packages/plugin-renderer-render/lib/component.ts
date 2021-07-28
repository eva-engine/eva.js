import {Component} from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';
export interface RenderParams {
  alpha?: number;
  zIndex?: number;
  visible?: boolean;
  sortableChildren?: boolean;
}
export default class Render extends Component {
  static componentName: string = 'Render';
  sortDirty: boolean = false;
  @type('boolean') visible: boolean = true;
  @type('number') alpha: number = 1;
  @type('number') zIndex: number = 0;
  @type('boolean') sortableChildren: boolean = false;
  init(obj?: RenderParams) {
    obj && Object.assign(this, obj);
  }
}
