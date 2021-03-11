import EE from 'eventemitter3';
import { LOAD_EVENT } from '..';
import Resource, { ResourceStruct } from './Resource';

export interface EventParam {
  name: string;
  resource: ResourceStruct;
  success: boolean;
  errMsg?: string;
}

export default class Progress extends EE {
  public progress: number = 0;
  public resourceTotal: number = 0;
  public resourceLoadedCount: number = 0;
  resource: Resource;
  constructor({ resource, resourceTotal }) {
    super();
    this.resource = resource;
    this.resourceTotal = resourceTotal;
    if (resourceTotal === 0) {
      this.resource.emit(LOAD_EVENT.COMPLETE, this);
    }
  }

  onStart() {
    this.resource.emit(LOAD_EVENT.START, this);
  }

  onProgress(param: EventParam) {
    this.resourceLoadedCount++;
    this.progress =
      Math.floor((this.resourceLoadedCount / this.resourceTotal) * 100) / 100;
    if (param.success) {
      this.resource.emit(LOAD_EVENT.LOADED, this, param);
    } else {
      this.resource.emit(LOAD_EVENT.ERROR, this, param);
    }
    this.resource.emit(LOAD_EVENT.PROGRESS, this, param);
    if (this.resourceLoadedCount === this.resourceTotal) {
      this.resource.emit(LOAD_EVENT.COMPLETE, this);
    }
  }
}
