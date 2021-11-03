import { Component } from '@eva/eva.js';
import Matter from './matter';
export enum PhysicsType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  POLYGON = 'polygon',
}
export interface PhysicsParams {
  type?: PhysicsType
  bodyOptions?: {
    isStatic?: boolean,
    restitution?: number,
    density?: number,
    [propName: string]: any,
  },
  position?: {
    x?: number
    y?: number
  }
  sides?: number
  radius?: number
  stopRotation?: boolean
}

export class Physics extends Component<PhysicsParams> {
  static componentName: string = 'Physics';
  public bodyParams: PhysicsParams;
  public body: Matter.Body;
  private PhysicsEngine: Matter.Engine;

  init(params: PhysicsParams) {
    this.bodyParams = params;
  }

  update() {
    if (this.body && this.gameObject) {
      this.gameObject.transform.anchor.x = 0;
      this.gameObject.transform.anchor.y = 0;
      this.gameObject.transform.position.x = this.body.position.x;
      this.gameObject.transform.position.y = this.body.position.y;
      if (!this.bodyParams.stopRotation) {
        this.gameObject.transform.rotation = this.body.angle;
      }
    }
  }
  onDestroy() {
    Matter.World.remove(this.PhysicsEngine.world, this.body, true);
  }
}
