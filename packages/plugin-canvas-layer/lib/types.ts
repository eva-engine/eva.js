export interface CanvasLayerParams {
  /** 层级名称(语义,例如 "background" | "world" | "ui-hud" | "ui-modal") */
  name: string;
  /** 层级整数,值大渲染在前(类似 PixiJS sortableChildren + zIndex) */
  zIndex: number;
  /** screen-space:不随 camera/world 平移缩放,固定屏幕坐标 */
  screenSpace?: boolean;
}
