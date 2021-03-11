import {
  System,
  decorators,
  ComponentChanged,
  Transform,
  GameObject,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import EE from 'eventemitter3';
import A11y from './A11y';
import {setStyle, setTransform} from './utils';
import {
  POSITION,
  ZINDEX,
  PointerEvents,
  MaskBackground,
  EventPosition,
  A11yMaskStyle,
  A11yActivate,
} from './constant';
import {RendererSystem} from '@eva/plugin-renderer';

interface SystemParam {
  debug?: boolean;
  activate?: A11yActivate;
  delay?: number;
  checkA11yOpen?: () => Promise<boolean>;
}

const notAttr = [
  'hint',
  'event',
  'delay',
  'attr',
  'role',
  'props',
  'state',
  'a11yId',
  'name',
];

const getEventFunc = function (event, gameObject, e) {
  ['touchstart', 'touchend', 'tap'].forEach(name => {
    event.emit(name, {
      stopPropagation: () => e.stopPropagation(),
      data: {
        position: this.eventPosition,
      },
      gameObject,
    });
  });
};

@decorators.componentObserver({
  A11y: [],
  Transform: ['inScene'],
  Event: [],
})
export default class A11ySystem extends System {
  static systemName = 'A11ySystem';

  /**
   * 无障碍覆盖层
   */
  div: HTMLDivElement;
  /**
   * 是否开启调试
   */
  debug: boolean;
  /**
   * 横向的比例
   */
  _ratioX: number;
  /**
   * 纵向的比例
   */
  _ratioY: number;
  /**
   * 事件坐标
   */
  eventPosition: EventPosition;
  /**
   * 是否开启无障碍能力
   */
  activate: boolean;
  /**
   * dom 延迟放置
   */
  delay: number;
  cache: Map<String, HTMLElement> = new Map();
  eventCache: Map<String, Function> = new Map();
  /**
   *
   * @param opt
   */

  /**
   * 无障碍插件初始化函数
   * @param opt 无障碍插件选项
   * @param opt.activate 是否开启无障碍能力，默认为自动根据系统读屏能力进行开启 AUTO | ENABLE | DISABLE
   * @example
   * // 开启调试，无障碍区域会显示红色透明背景
   * new A11ySystem({debug: true})
   * // 禁用无障碍
   * new A11ySystem({activate: A11yActivate.DISABLE})
   */
  constructor(opt?: SystemParam) {
    super(opt);
  }

  get ratioX() {
    if (this._ratioX) {
      return this._ratioX;
    } else {
      const success = this.setRatio();
      if (success) {
        return this._ratioX;
      } else {
        return 0;
      }
    }
  }
  get ratioY() {
    if (this._ratioY) {
      return this._ratioY;
    } else {
      const success = this.setRatio();
      if (success) {
        return this._ratioY;
      } else {
        return 0;
      }
    }
  }

  async init(opt: SystemParam = {}) {
    const {
      activate = A11yActivate.CHECK,
      delay = 100,
      checkA11yOpen = () => Promise.resolve(false),
    } = opt;
    this.delay = delay;
    switch (activate) {
      case A11yActivate.CHECK:
        this.activate = await checkA11yOpen();
        break;
      case A11yActivate.DISABLE:
        this.activate = false;
        break;
      case A11yActivate.ENABLE:
        this.activate = true;
        break;
    }
    this.debug = opt.debug || false;
    if (this.debug) {
      this.activate = true;
    }

    if (!this.activate) return;
    // 渲染出父容器
    const div = document.createElement('div');
    this.div = div;
    // 如果存在父容器，则渲染这个 div，子元素则会相对这个 div 进行定位，否则直接相对于 body 进行定位
    if (this.game.canvas.parentNode) {
      this.game.canvas.parentNode.appendChild(this.div);
    }
  }
  setRatio() {
    const {width, height} = this.getCanvasBoundingClientRect();
    const {renderWidth, renderHeight} = this.getRenderRect();
    this._ratioX = width / renderWidth;
    this._ratioY = height / renderHeight;
    if (width || height) {
      this.initDiv();
      return true;
    } else {
      return false;
    }
  }
  getRenderRect() {
    // @ts-ignore
    const {params} =
      this.game.getSystem(RendererSystem) || ({width: 300, height: 300} as any);
    const {height: renderHeight, width: renderWidth} = params;
    return {renderWidth, renderHeight};
  }
  getCanvasBoundingClientRect() {
    // 渲染画布相对于视口的实际宽高以及位置，实际的像素
    const {width, height, left, top} = this.game.canvas.getBoundingClientRect();
    return {width, height, left, top};
  }
  initDiv() {
    const {pageXOffset, pageYOffset} = window;

    const {width, height, left, top} = this.getCanvasBoundingClientRect();
    // 父容器位置
    const style: A11yMaskStyle = {
      width,
      height,
      left: `${left + pageXOffset}px`,
      top: `${top + pageYOffset}px`,
      position: POSITION,
      zIndex: ZINDEX,
      pointerEvents: PointerEvents.NONE,
      background: MaskBackground.NONE,
    };
    setStyle(this.div, style);
    // 给父容器设置捕获事件，用于监听事件坐标
    this.div.addEventListener(
      'click',
      e => {
        const currentTarget = e.currentTarget as HTMLDivElement;
        const {left, top} = currentTarget.getBoundingClientRect();
        const x = (e.pageX - left) / this.ratioX;
        const y = (e.pageY - top) / this.ratioY;
        this.eventPosition = {x, y};
      },
      true,
    );
  }

  /**
   * 监听插件更新
   */
  async update() {
    const changes = this.componentObserver.clear();
    if (!this.activate) {
      return;
    }
    for (const changed of changes) {
      switch (changed.type) {
        case OBSERVER_TYPE.ADD:
          changed.componentName === 'Event' &&
            this.addEvent(changed.gameObject);
          changed.componentName === 'A11y' && this.add(changed);
          break;
        case OBSERVER_TYPE.CHANGE:
          changed.componentName === 'Transform' &&
            this.transformChange(changed);
          break;
        case OBSERVER_TYPE.REMOVE:
          changed.componentName === 'Event' && this.removeEvent(changed);
          changed.componentName === 'A11y' && this.remove(changed);
      }
    }
  }

  remove(changed: ComponentChanged) {
    const component = changed.component as A11y;
    if (!component) return;
    const {a11yId} = component;
    const element = this.div.querySelector(`#${a11yId}`);
    element && this.div.removeChild(element);
    this.cache.delete(a11yId);
  }

  /**
   * 监听组件被添加至游戏对象
   * @param changed 改变的组件
   */
  add(changed: ComponentChanged) {
    if (!this.activate) return;
    const component = changed.component as A11y;
    const {gameObject} = changed;
    const {delay, a11yId: id} = component;
    let {event} = component;
    if (!gameObject) return;
    const {transform} = gameObject;
    if (!transform) return;
    const element = document.createElement('div');
    this.cache.set(id, element);
    if (!event) {
      event = gameObject.getComponent('Event');
    }
    setTimeout(() => {
      this.setPosition(element, transform);
      this.setA11yAttr(element, component);
      if (event) {
        this.addEvent(gameObject);
      }
      if (gameObject.scene) {
        this.div.appendChild(element);
      }
    }, delay || this.delay);
  }

  // 监听 scene 改变
  transformChange(changed: ComponentChanged) {
    const component = changed.component as Transform;
    const {gameObject} = changed;
    const a11yComponent = gameObject.getComponent(A11y) as A11y;
    if (!a11yComponent) return;
    const {a11yId} = a11yComponent;
    if (!component.inScene) {
      // 监听 scene 删除游戏对象
      const dom = this.div.querySelector(`#${a11yId}`);
      dom && this.div.removeChild(dom);
      // this.cache.delete(a11yId)
    } else {
      // 监听 scene add
      // this.div.appendChild(this.cache)
      if (this.cache.has(a11yId)) {
        const addDom = this.cache.get(a11yId);
        addDom && this.div.appendChild(addDom);
      }
    }
  }

  /**
   * 为无障碍组件设置监听事件
   * @param element DOM 元素
   * @param event 事件组件对象
   * @param gameObject 游戏对象
   */
  setEvent(element: HTMLElement, event: EE, gameObject: GameObject, id) {
    if (!event) {
      return;
    }
    const func = getEventFunc.bind(this, event, gameObject);
    this.eventCache.set(id, func);
    element.addEventListener('click', func);
  }

  addEvent(gameObject: GameObject) {
    const a11y = gameObject.getComponent(A11y) as A11y;
    if (!a11y) return;
    const event = gameObject.getComponent('Event');
    if (!event) return;
    const element = this.cache.get(a11y.a11yId);
    element && this.setEvent(element, event, gameObject, a11y.a11yId);
  }

  removeEvent(changed: ComponentChanged) {
    const {gameObject} = changed;
    const a11y = gameObject.getComponent(A11y) as A11y;
    if (!a11y) return;
    const event = changed.component;
    if (!event) return;
    const {a11yId} = a11y;
    const func = this.eventCache.get(a11yId) as any;
    const element = this.cache.get(a11yId);
    element && element.removeEventListener('click', func);
  }

  /**
   * 设置无障碍属性标签
   * @param element DOM 元素
   * @param hint 无障碍朗读文字
   * @param interactive 是否可交互
   */
  setA11yAttr(element: HTMLElement, component: A11y) {
    const {hint, props = {}, state = {}, role, a11yId: id} = component;
    const realRole = role || 'text';
    element.setAttribute('role', realRole);
    element.setAttribute('aria-label', hint);
    element.id = id;

    // 这里兼容
    const ariaProps = Object.keys(props);
    for (const key of ariaProps) {
      element.setAttribute(key, props[key]);
    }
    const ariaState = Object.keys(state);
    for (const key of ariaState) {
      element.setAttribute(key, state[key]);
    }

    for (let key of Object.keys(component)) {
      if (
        typeof component[key] === 'string' &&
        notAttr.indexOf(key) === -1 &&
        key.indexOf('_') !== 1
      ) {
        element.setAttribute(key, component[key]);
      }
    }
  }

  /**
   * 将无障碍元素设置到对应的位置
   * @param element DOM 元素
   * @param transform 位置属性
   */
  setPosition(element: HTMLElement, transform: Transform) {
    // 相对画布定位
    // const { x: anchorX, y: anchorY } = transform.anchor
    // 游戏对象的宽高
    const {width, height} = transform.size;
    // position
    // const { x: positionX, y: positionY } = transform.position
    // 设置无障碍 DOM 的样式，龙骨动画默认 2px
    const style: A11yMaskStyle = {
      width: width === 0 ? 1 : width * this.ratioX,
      height: height === 0 ? 1 : height * this.ratioY,
      position: POSITION,
      zIndex: ZINDEX,
      pointerEvents: PointerEvents.AUTO,
      background: this.debug ? MaskBackground.DEBUG : MaskBackground.NONE,
    };
    const transformProps = {
      ...transform,
    };
    setStyle(element, style);
    // 调整 DOM 的位置
    setTransform(element, transformProps, this.ratioX, this.ratioY);
  }
  onDestroy() {
    this.div.parentElement.removeChild(this.div);
    this.cache = null;
    this.eventCache = null;
  }
}
