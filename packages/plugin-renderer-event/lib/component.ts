import { Component, Field, step, type } from '@eva/eva.js';
import type { GameObject } from '@eva/eva.js';

export enum HIT_AREA_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Polygon = 'Polygon',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
}

interface HitArea {
  type: HIT_AREA_TYPE;
  style?: {
    x?: number;
    y?: number;
    radius?: number;
    width?: number;
    height?: number;
    paths?: number[];
  };
}

class HitAreaStyleMetadata {
  @type('number') @step(1) x?: number;
  @type('number') @step(1) y?: number;
  @type('number') @step(1) radius?: number;
  @type('number') @step(1) width?: number;
  @type('number') @step(1) height?: number;
  @type('number') paths?: number[];
}

class HitAreaMetadata {
  @type('string') type: HIT_AREA_TYPE;
  @Field(() => HitAreaStyleMetadata) style?: HitArea['style'];
}

export interface EventParams {
  interactive?: boolean;
  cursor?: string;
  stopPropagation?: boolean;
  hitArea?: HitArea;
  on?: Record<string, (...args: any[]) => void>;
}

type TouchEventName = 'touchstart' | 'touchmove' | 'touchend' | 'tap' | 'touchendoutside' | 'touchcancel';
type EventParam = {
  stopPropagation: () => void;
  data: {
    pointerId: number;
    position: {
      x: number;
      y: number;
    };
    /**
     * The position related to event target gameobject
     */
    localPosition: {
      x: number;
      y: number;
    };
  };
  gameObject: GameObject;
};

interface ConfiguredEventHandler {
  eventName: string;
  handler: (...args: any[]) => void;
}

/**
 * 事件组件
 *
 * Event 组件为游戏对象添加交互能力，使其能够响应触摸和鼠标事件。
 * 可以自定义交互热区的形状（矩形、圆形、多边形等），
 * 适用于按钮、拖拽对象、可点击元素等交互场景。
 *
 * 支持的事件类型：
 * - touchstart - 触摸/点击开始
 * - touchmove - 触摸/鼠标移动
 * - touchend - 触摸/点击结束
 * - tap - 点击/轻触
 * - touchendoutside - 在对象外部结束触摸
 * - touchcancel - 触摸取消
 *
 * @example
 * ```typescript
 * // 基础用法 - 使用默认热区（Transform 尺寸）
 * const button = new GameObject('button');
 * const event = new Event();
 * button.addComponent(event);
 *
 * event.on('tap', (e) => {
 *   console.log('按钮被点击', e.data.position);
 * });
 *
 * // 自定义矩形热区
 * button.addComponent(new Event({
 *   hitArea: {
 *     type: HIT_AREA_TYPE.Rect,
 *     style: { x: 0, y: 0, width: 100, height: 50 }
 *   }
 * }));
 *
 * // 圆形热区
 * button.addComponent(new Event({
 *   hitArea: {
 *     type: HIT_AREA_TYPE.Circle,
 *     style: { x: 50, y: 50, radius: 40 }
 *   }
 * }));
 *
 * // 多边形热区
 * button.addComponent(new Event({
 *   hitArea: {
 *     type: HIT_AREA_TYPE.Polygon,
 *     style: { paths: [0,0, 100,0, 50,100] }
 *   }
 * }));
 *
 * // 事件处理
 * event.on('touchstart', (e) => {
 *   console.log('触摸开始', e.data.localPosition);
 *   e.stopPropagation(); // 阻止事件冒泡
 * });
 * ```
 */
export default class Event extends Component<EventParams> {
  /** 组件名称 */
  static componentName = 'Event';

  /** 交互热区配置 */
  @Field(() => HitAreaMetadata)
  hitArea: HitArea = undefined;

  interactive?: boolean;
  cursor?: string;
  stopPropagation?: boolean;
  private configuredEventHandlers: ConfiguredEventHandler[] = [];

  constructor(params?: EventParams) {
    super(params);
    this.init(params);
  }

  /**
   * 初始化组件
   * @param params - 初始化参数
   */
  init(params?: EventParams) {
    this.removeConfiguredEventHandlers();
    if (!params) return;

    const { on, ...options } = params;
    Object.assign(this, options);
    if (on) {
      for (const eventName of Object.keys(on)) {
        const handler = on[eventName];
        if (typeof handler !== 'function') continue;
        super.on(eventName, handler);
        this.configuredEventHandlers.push({ eventName, handler });
      }
    }
  }

  emit(eventName: TouchEventName, ...args: [EventParam]): boolean;
  emit<T extends string>(eventName: Exclude<T, TouchEventName>, ...args: any[]): boolean;
  emit(en: string, ...args: any[]) {
    return super.emit(en, ...args);
  }

  once(eventName: TouchEventName, fn: (arg: EventParam) => void, context?: any): this;
  once<T extends string>(eventName: Exclude<T, TouchEventName>, fn: (...args: any[]) => void, context?: any): this;
  once(en: string, fn: (...args: any[]) => void, context?: any) {
    return super.once(en, fn, context);
  }

  on(eventName: TouchEventName, fn: (arg: EventParam) => void, context?: any): this;
  on<T extends string>(eventName: Exclude<T, TouchEventName>, fn: (...args: any[]) => void, context?: any): this;
  on(en: string, fn: (...args: any[]) => void, context?: any) {
    return super.on(en, fn, context);
  }

  destroy() {
    this.removeAllListeners();
    this.configuredEventHandlers = [];
    return this;
  }

  onDestroy() {
    this.destroy();
  }

  private removeConfiguredEventHandlers() {
    for (const { eventName, handler } of this.configuredEventHandlers) {
      super.off(eventName, handler);
    }
    this.configuredEventHandlers = [];
  }
}
