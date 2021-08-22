import { Component } from '@eva/eva.js';
import Matter from './matter';
export enum PhysicsType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  POLYGON = 'polygon',
}

export class Physics extends Component<PhysicsType> {
  static componentName: string = 'Physics';
  public bodyParams: any;
  public body: any;
  private PhysicsEngine: any;
  constructor(params: any) {
    super(params);
  }

  init(params: any) {
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
