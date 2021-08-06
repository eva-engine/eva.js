const POSITION = 'absolute';
const ZINDEX = 3;

enum A11yActivate {
  ENABLE = 0,
  DISABLE = 1,
  CHECK = 2,
}

/**
 * 无障碍 DOM 的指针事件
 */
enum PointerEvents {
  NONE = 'none', // 元素不会成为鼠标事件的target，会被穿透
  AUTO = 'auto', // 默认值正常
}

/**
 * 无障碍 DOM 层的样式
 */
enum MaskBackground {
  DEBUG = 'rgba(255,0,0,0.5)',
  NONE = 'transparent',
}

/**
 * 无障碍 DOM 的类型
 */
enum ElementType {
  BUTTON = 'button',
  DIV = 'div',
}

/**
 * 无障碍遮罩层样式
 */
export interface A11yMaskStyle {
  width: number;
  height: number;
  background: string;
  position: string;
  left?: string;
  top?: string;
  zIndex: number;
  pointerEvents: PointerEvents;
}

/**
 * 点击事件位置
 */
export interface EventPosition {
  x: number;
  y: number;
}

export {
  POSITION,
  ZINDEX,
  A11yActivate,
  PointerEvents,
  MaskBackground,
  ElementType,
};
