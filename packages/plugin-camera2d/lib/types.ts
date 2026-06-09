export interface Camera2DParams {
  /** 跟随的实体名称(在 scene.gameObjects 中查找) */
  followEntity?: string;
  /** 死区:目标偏离屏幕中心多少像素后才开始平移 */
  deadzone?: { x: number; y: number };
  /** 平移阻尼系数(0~1),0 = 立即跟,1 = 永远不跟 */
  damping?: number;
  /** 世界平移上下限,值用 transform 偏移表示 */
  limits?: { minX?: number; maxX?: number; minY?: number; maxY?: number };
  /** 屏幕中心点,默认 viewport 中心 */
  viewportCenter?: { x: number; y: number };
  /** 把哪个 transform 当作世界根 (实体名);若未指定,所有 screenSpace=false 的实体由 system 整体偏移 */
  worldRoot?: string;
}
