import { Component } from '@eva/eva.js';
import Matter from './matter';
export enum PhysicsType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  POLYGON = 'polygon',
}
export interface PhysicsParams {
  type?: PhysicsType;
  bodyOptions?: {
    isStatic?: boolean;
    restitution?: number;
    density?: number;
    [propName: string]: any;
  };
  position?: {
    x?: number;
    y?: number;
  };
  sides?: number;
  radius?: number;
  stopRotation?: boolean;
}

/**
 * 物理组件
 *
 * Physics 组件为游戏对象提供 Matter.js 物理引擎支持。
 * 可以创建不同类型的刚体（矩形、圆形、多边形），
 * 并自动同步物理引擎的位置和旋转到游戏对象的 Transform。
 *
 * @example
 * ```typescript
 * const ball = new GameObject('ball');
 * ball.addComponent(new Physics({
 *   type: PhysicsType.CIRCLE,
 *   radius: 25,
 *   bodyOptions: {
 *     restitution: 0.8, // 弹性
 *     density: 0.01 // 密度
 *   }
 * }));
 * ```
 */
export class Physics extends Component<PhysicsParams> {
  /** 组件名称 */
  static componentName: string = 'Physics';

  /** 物理体参数配置 */
  public bodyParams: PhysicsParams;

  /** Matter.js 物理体实例 */
  public body: Matter.Body;

  /** Matter.js 物理引擎实例 */
  private PhysicsEngine: Matter.Engine;

  /**
   * 初始化物理组件
   * @param params - 物理体参数
   */
  init(params: PhysicsParams) {
    this.bodyParams = params;
  }

  /**
   * 每帧更新物理状态
   *
   * 将物理引擎计算的位置和旋转同步到游戏对象的 Transform 组件。
   */
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

  /**
   * 组件销毁时调用
   *
   * 从物理世界中移除物理体。
   */
  onDestroy() {
    Matter.World.remove(this.PhysicsEngine.world, this.body, true);
  }
}
