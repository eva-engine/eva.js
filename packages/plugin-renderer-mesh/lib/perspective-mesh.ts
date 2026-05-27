import { Component, Field, step, type } from '@eva/eva.js';

export interface PerspectiveMeshParams {
  resource: string;
  verticesX?: number;
  verticesY?: number;
  corners?: Corners;
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

class CornersMetadata {
  @type('number') @step(1) x0: number;
  @type('number') @step(1) y0: number;
  @type('number') @step(1) x1: number;
  @type('number') @step(1) y1: number;
  @type('number') @step(1) x2: number;
  @type('number') @step(1) y2: number;
  @type('number') @step(1) x3: number;
  @type('number') @step(1) y3: number;
}

/**
 * 透视网格组件
 *
 * PerspectiveMesh 组件用于创建具有透视变形效果的图片。
 * 通过将图片分割成网格并调整四个角的位置，可以实现 3D 透视、梯形变换等效果，
 * 适用于翻书效果、卡片翻转、3D 地面贴图等场景。
 *
 * 工作原理：
 * - 将图片分割成 M×N 的网格
 * - 通过调整四个角的位置实现透视变换
 * - 网格越密集，变形效果越平滑
 *
 * @example
 * ```typescript
 * // 创建透视变形的图片
 * const card = new GameObject('card');
 * const mesh = new PerspectiveMesh({
 *   resource: 'cardImage',
 *   verticesX: 10, // 横向网格数
 *   verticesY: 10  // 纵向网格数
 * });
 * card.addComponent(mesh);
 *
 * // 设置四个角的位置实现透视效果
 * // 参数：左上(x0,y0), 右上(x1,y1), 右下(x2,y2), 左下(x3,y3)
 * mesh.setCorners(
 *   50, 0,    // 左上角
 *   350, 0,   // 右上角
 *   400, 300, // 右下角
 *   0, 300    // 左下角
 * );
 *
 * // 创建翻书效果
 * let angle = 0;
 * setInterval(() => {
 *   angle += 0.1;
 *   const offset = Math.sin(angle) * 50;
 *   mesh.setCorners(
 *     offset, 0,
 *     400 - offset, 0,
 *     400, 300,
 *     0, 300
 *   );
 * }, 16);
 * ```
 */
export default class PerspectiveMesh extends Component<PerspectiveMeshParams> {
  /** 组件名称 */
  static componentName: string = 'PerspectiveMesh';

  /** 纹理资源名称 */
  @type('string')
  resource: string;

  /** 横向顶点数量（网格密度） */
  @type('number') @step(1)
  verticesX = 10;

  /** 纵向顶点数量（网格密度） */
  @type('number') @step(1)
  verticesY = 10;

  /** 四个角的坐标位置 */
  @Field(() => CornersMetadata)
  corners: Corners;

  /** 强制更新标志 */
  _forceUpdate = 0;

  /**
   * 初始化组件
   * @param obj - 初始化参数
   * @param obj.resource - 纹理资源名称
   * @param obj.verticesX - 横向网格密度
   * @param obj.verticesY - 纵向网格密度
   */
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
    if (obj && obj.corners) {
      this.corners = obj.corners;
    }
  }

  /**
   * 设置四个角的位置
   *
   * 通过改变四个角的坐标来实现透视变换效果。
   *
   * @param x0 - 左上角 X 坐标
   * @param y0 - 左上角 Y 坐标
   * @param x1 - 右上角 X 坐标
   * @param y1 - 右上角 Y 坐标
   * @param x2 - 右下角 X 坐标
   * @param y2 - 右下角 Y 坐标
   * @param x3 - 左下角 X 坐标
   * @param y3 - 左下角 Y 坐标
   */
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
