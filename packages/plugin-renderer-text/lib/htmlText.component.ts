import { Component, Field, type } from '@eva/eva.js';

export interface HTMLTextStyleOptions {
  fontFamily?: string | string[];
  fontSize?: number | string;
  fill?: string | number;
  align?: 'left' | 'center' | 'right' | 'justify';
  breakWords?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  stroke?: string | number;
  strokeThickness?: number;
  dropShadow?: boolean;
  dropShadowAlpha?: number;
  dropShadowAngle?: number;
  dropShadowBlur?: number;
  dropShadowColor?: string | number;
  dropShadowDistance?: number;
  trim?: boolean;
  fontWeight?: string;
  fontStyle?: string;
  fontVariant?: string;
  textBaseline?: string;
  whiteSpace?: string;
}

export interface HTMLTextParams {
  text: string;
  style?: HTMLTextStyleOptions & {
    cssOverrides?: string[];
    wordWrap?: boolean;
    wordWrapWidth?: number;
    tagStyles?: Record<string, HTMLTextStyleOptions>;
  };
  textureStyle?: {
    scaleMode?: 'linear' | 'nearest';
    resolution?: number;
  };
}

class HTMLTextTextureStyleMetadata {
  @type('string') scaleMode?: 'linear' | 'nearest';
  @type('number') resolution?: number;
}

class HTMLTextStyleMetadata {
  @type('string') fontFamily?: string | string[];
  @type('number') fontSize?: number | string;
  @type('string') fontWeight?: string;
  @type('string') fontStyle?: string;
  @type('string') fontVariant?: string;
  @type('string') align?: 'left' | 'center' | 'right' | 'justify';
  @type('string') textBaseline?: string;
  @Field({ type: 'color' }) fill?: string | number;
  @Field({ type: 'color' }) stroke?: string | number;
  @type('number') strokeThickness?: number;
  @type('number') lineHeight?: number;
  @type('number') letterSpacing?: number;
  @type('number') padding?: number;
  @type('boolean') wordWrap?: boolean;
  @type('number') wordWrapWidth?: number;
  @type('boolean') breakWords?: boolean;
  @type('string') whiteSpace?: string;
  @type('boolean') dropShadow?: boolean;
  @Field({ type: 'color' }) dropShadowColor?: string | number;
  @type('number') dropShadowAlpha?: number;
  @type('number') dropShadowAngle?: number;
  @type('number') dropShadowBlur?: number;
  @type('number') dropShadowDistance?: number;
  @type('object') cssOverrides?: string[];
  @type('object') tagStyles?: Record<string, HTMLTextStyleOptions>;
  @type('boolean') trim?: boolean;
}

/**
 * HTML 富文本组件
 *
 * HTMLText 组件支持渲染带有 HTML 标签的富文本内容。
 * 可以在文本中使用 HTML 标签（如 `<b>`, `<i>`, `<span>` 等）来实现丰富的文本样式，
 * 适用于聊天对话、新闻内容、富文本显示等需要多样式文本的场景。
 *
 * 支持的 HTML 标签：
 * - `<b>` - 粗体
 * - `<i>` - 斜体
 * - `<span style="color:#ff0000">` - 自定义样式
 * - `<br>` - 换行
 * 以及更多标准 HTML 文本标签
 *
 * @example
 * ```typescript
 * // 基础富文本
 * const label = new GameObject('label');
 * label.addComponent(new HTMLText({
 *   text: '这是<b>粗体</b>和<i>斜体</i>文本',
 *   style: {
 *     fontSize: 24,
 *     fill: '#000000',
 *     fontFamily: 'Arial'
 *   }
 * }));
 *
 * // 带颜色的富文本
 * label.addComponent(new HTMLText({
 *   text: '欢迎 <span style="color:#ff0000">玩家123</span> 加入游戏！',
 *   style: {
 *     fontSize: 20,
 *     wordWrap: true,
 *     wordWrapWidth: 300
 *   }
 * }));
 *
 * // 自定义标签样式
 * label.addComponent(new HTMLText({
 *   text: '获得 <gold>100</gold> 金币',
 *   style: {
 *     fontSize: 18,
 *     tagStyles: {
 *       gold: {
 *         fill: '#ffd700',
 *         fontWeight: 'bold'
 *       }
 *     }
 *   }
 * }));
 *
 * // 高分辨率渲染（推荐使用 Render 组件的 resolution 属性）
 * label.addComponent(new HTMLText({
 *   text: '高清文本',
 *   textureStyle: {
 *     scaleMode: 'linear'
 *   }
 * }));
 * label.addComponent(new Render({ resolution: 2 }));
 * ```
 */
export default class HTMLText extends Component<HTMLTextParams> {
  /** 组件名称 */
  static componentName: string = 'HTMLText';

  /** 富文本内容（支持 HTML 标签） */
  @type('string') text: string = '';

  /** 文本样式配置 */
  @Field(() => HTMLTextStyleMetadata)
  style: HTMLTextParams['style'] = {};

  /** 纹理渲染配置 */
  @Field(() => HTMLTextTextureStyleMetadata)
  textureStyle: HTMLTextParams['textureStyle'] = {};

  /**
   * 初始化组件
   * @param obj - 初始化参数
   */
  init(obj?: HTMLTextParams) {
    this.style = {
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      ...obj?.style,
    };

    this.textureStyle = {
      scaleMode: 'linear',
      resolution: window.devicePixelRatio || 1,
      ...obj?.textureStyle,
    };

    if (obj) {
      this.text = obj.text;
    }
  }
}
