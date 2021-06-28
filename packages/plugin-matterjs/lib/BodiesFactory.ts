import Matter from './matter';
import { PhysicsType } from './Physics';
import { GameObject } from '@eva/eva.js';
declare interface BodyOptions {
  chamfer?: number; // 斜切角
  angle?: number; // 旋转角
  isStatic?: boolean;
  density?: number; // 密度;
  restitution?: number; // 回弹系数
  velocity?: number; // 速率
  speed?: number; // 速度
  motion?: number; // 势能
  mass?: number;
}

export interface RectangleParams {
  x: number;
  y: number;
  width: number;
  height: number;
  options: BodyOptions;
}

export interface Verctor {
  x: number;
  y: number;
}
export default class BodiesFactory {
  private Bodies: any;
  constructor() {
    this.Bodies = Matter.Bodies;
  }
  public create(component) {
    let body = null;
    const { gameObject, bodyParams } = component;
    const coordinate = this.getCoordinate(gameObject);
    const x = bodyParams.position ? bodyParams.position.x : coordinate.x;
    const y = bodyParams.position ? bodyParams.position.y : coordinate.y;
    switch (bodyParams.type) {
      case PhysicsType.RECTANGLE: {
        const width = gameObject.transform.size.width * gameObject.transform.scale.x;
        const height = gameObject.transform.size.height * gameObject.transform.scale.y;
        body = this.Bodies.rectangle(x, y, width, height, bodyParams.bodyOptions);
        break;
      }
      case PhysicsType.CIRCLE: {
        body = this.Bodies.circle(x, y, bodyParams.radius, bodyParams.bodyOptions);
      }
      case PhysicsType.POLYGON: {
        body = this.Bodies.polygon(x, y, bodyParams.sides, bodyParams.radius, bodyParams.bodyOptions);
      }
    }
    return body;
  }

  private getCoordinate(gameObject: GameObject): Verctor {
    const x = gameObject.transform.position.x + gameObject.transform.anchor.x * gameObject.parent.transform.size.width;
    const y = gameObject.transform.position.y + gameObject.transform.anchor.y * gameObject.parent.transform.size.height;
    return {
      x,
      y,
    };
  }
}
