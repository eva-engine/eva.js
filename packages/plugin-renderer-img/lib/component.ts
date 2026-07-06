import { type } from '@eva/inspector-decorator';
import { Component } from '@eva/eva.js';

export interface ImgParams {
  resource: string;
  anchor?: { x?: number; y?: number };
  width?: number;
  height?: number;
}

/**
 * 图片组件
 *
 * Img 组件用于渲染单张图片。
 * 它是最基础的图像渲染组件，适用于背景、UI 元素、静态贴图等场景。
 *
 * @example
 * ```typescript
 * // 渲染一张背景图
 * const background = new GameObject('background');
 * background.addComponent(new Img({
 *   resource: 'bgImage' // 资源名称
 * }));
 * ```
 */
export default class Img extends Component<ImgParams> {
  /** 组件名称 */
  static componentName: string = 'Img';

  /** 图片资源名称 */
  @type('string') resource: string = '';

  /** 图片锚点 */
  anchor: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * 显式渲染宽度。
   *
   * 必须显式赋 `= undefined`:在 `target: es6` +
   * `useDefineForClassFields: false`(TS 默认)下,无初始值的 optional 字段
   * 不会被 emit 到构造函数,`'width' in imgInstance` 因此返回 false;
   * ImgSystem 通过 `@componentObserver` 依赖 `Object.defineProperty` swap
   * 已存在的 own property,遇到不存在的属性会 `console.error`
   * "prop width not in component: Img, Can not observer" 并静默跳过。
   * 显式 `= undefined` 让 TS emit `this.width = void 0;`,创建 own property,
   * 语义仍是"未指定 → 由 ImgSystem 走 transform.size / 纹理自然尺寸兜底"。
   */
  @type('number') width?: number = undefined;

  /** 显式渲染高度。见 `width` 注释,同样理由需要显式 `= undefined`。 */
  @type('number') height?: number = undefined;

  constructor(params?: ImgParams) {
    super(params);
    this.init(params);
  }

  /**
   * 初始化组件
   * @param obj - 初始化参数
   *
   * 配置项包括 resource、anchor、width 和 height。
   */
  init(obj?: ImgParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
    }
    if (obj && obj.anchor) {
      this.anchor = {
        x: obj.anchor.x ?? this.anchor.x,
        y: obj.anchor.y ?? this.anchor.y,
      };
    }
    if (obj && typeof obj.width === 'number') {
      this.width = obj.width;
    }
    if (obj && typeof obj.height === 'number') {
      this.height = obj.height;
    }
  }

  /**
   * 切换当前图片资源。
   *
   * ImgSystem 会监听 resource 变化并刷新渲染纹理。
   *
   * @param resource - 图片资源名称
   */
  load(resource?: string) {
    if (resource) {
      this.resource = resource;
    }
    return this;
  }

  /** 设置图片锚点。 */
  setAnchor(x: number, y: number = x) {
    this.anchor.x = x;
    this.anchor.y = y;
    return this;
  }

  /** 设置显式渲染尺寸。 */
  setSize(width?: number, height?: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  /** 释放组件持有的可编辑状态。渲染资源由 ImgSystem 统一管理。 */
  destroy() {
    return this;
  }
}
