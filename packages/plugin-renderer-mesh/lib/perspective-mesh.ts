import { Component } from '@eva/eva.js';

export interface PerspectiveMeshParams {
  resource: string;
  verticesX?: number;
  verticesY?: number;
}

interface Corners {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

export default class PerspectiveMesh extends Component<PerspectiveMeshParams> {
  static componentName: string = 'PerspectiveMesh';
  resource: string;
  verticesX = 10;
  verticesY = 10;

  corners: Corners;
  _forceUpdate = 0;

  init(obj?: PerspectiveMeshParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
    if (obj && obj.verticesX) {
      this.verticesX = obj.verticesX;
    }
    if (obj && obj.verticesY) {
      this.verticesY = obj.verticesY;
    }
  }

  setCorners(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    const corners: Partial<Corners> = this.corners || {};
    corners.x0 = x0;
    corners.y0 = y0;
    corners.x1 = x1;
    corners.y1 = y1;
    corners.x2 = x2;
    corners.y2 = y2;
    corners.x3 = x3;
    corners.y3 = y3;
    this.corners = corners as Corners;
    this._forceUpdate += 1;
  }
}
