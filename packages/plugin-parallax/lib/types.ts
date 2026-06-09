export interface ParallaxParams {
  /** 视差系数 (0~1+);0 = 完全静止,1 = 与世界同步,1.5 = 比世界还快 */
  speedX?: number;
  speedY?: number;
  /** 平铺宽/高;到达后回卷;0 = 不平铺 */
  tileWidth?: number;
  tileHeight?: number;
  /** 跟随的相机参考实体名;若不传,从 worldRoot transform 读取 */
  cameraEntity?: string;
}
