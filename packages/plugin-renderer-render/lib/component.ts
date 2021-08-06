import {Component} from '@eva/eva.js';
import {type, step} from '@eva/inspector-decorator';
export interface RenderParams {
  alpha?: number;
  zIndex?: number;
  visible?: boolean;
  sortableChildren?: boolean;
}
export default class Render extends Component<RenderParams> {
  static componentName: string = 'Render';
  sortDirty: boolean = false;
  @type('boolean') visible: boolean = true;
  @type('number') @step(0.1) alpha: number = 1;
  @type('number') @step(1) zIndex: number = 0;
  @type('boolean') sortableChildren: boolean = false;
  init(obj?: RenderParams) {
    obj && Object.assign(this, obj);
  }
}
