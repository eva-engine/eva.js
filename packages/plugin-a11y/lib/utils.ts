import { A11yMaskStyle } from './constant';

/**
 * 生成唯一的标识符
 * @param len 长度
 * @param radix 基
 */
function uuid(len: number) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [];
  let radix = chars.length;
  for (let i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  return uuid.join('');
}

/**
 * 设置 dom 样式
 * @param div 需要设置样式的dom元素
 * @param style 样式属性
 */
const setStyle = (element: HTMLElement, style: A11yMaskStyle) => {
  const { width, height, position, left = 0, top = 0, zIndex, pointerEvents, background } = style;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.position = position;
  element.style.left = `${left}`;
  element.style.top = `${top}`;
  element.style.zIndex = `${zIndex}`;
  element.style.pointerEvents = pointerEvents;
  element.style.background = background;
  element.style.border = 'none';
  element.style.overflow = 'hidden';
};

const setTransform = (element: HTMLElement, transform, ratioX, ratioY) => {
  const { worldTransform } = transform;
  const { a, b, c, d, tx, ty } = worldTransform;
  const matrix = `matrix(${a}, ${b}, ${c}, ${d}, ${tx * ratioX}, ${ty * ratioY})`;
  element.style.transform = `${matrix}`;
  element.style.webkitTransform = `${matrix}`;
  element.style.transformOrigin = 'left top';
  element.style.webkitTransformOrigin = 'left top';
};

export { setStyle, setTransform, uuid };
