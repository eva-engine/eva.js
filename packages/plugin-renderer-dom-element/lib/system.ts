import {
  GameObject,
  decorators,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import { RendererManager, ContainerManager, RendererSystem, Renderer } from '@eva/plugin-renderer';
import DOMElementComponent from './component';

interface DOMRecord {
  /** 实际渲染到 dom-layer 的 HTMLElement(可能是用户传入 html 解析出的根)。 */
  el: HTMLElement;
  /** 上一帧 transform 字符串(用于跳过同值写入)。 */
  lastTransform: string;
}

/**
 * DOMElementSystem — 把 DOMElement 组件管理的 HTMLElement
 * 浮在 PixiJS Canvas 同位置的 dom-layer 上,并在每帧 rendererUpdate
 * 把 GameObject 的 Transform 同步成 CSS transform。
 *
 * 关键实现:
 * 1. init 时找到 RendererSystem 的 canvas 和它的 parent;
 *    若 parent 没有 `.eva-dom-layer` 子节点就创建一个 absolute 全覆盖的 div。
 * 2. componentChanged ADD: 解析/创建元素,放进 dom-layer;
 *    pointer-events 默认 auto,这样 input/button 等才能交互。
 * 3. rendererUpdate: 读 transform.position/scale/rotation,
 *    写 element.style.transform = "translate(x, y) rotate(rad) scale(sx, sy)" + anchor 调整。
 * 4. REMOVE: 从 dom-layer 移除元素并 destroy。
 */
@decorators.componentObserver({
  DOMElement: [
    { prop: ['html'], deep: false },
    { prop: ['element'], deep: false },
    { prop: ['cssText'], deep: false },
    { prop: ['className'], deep: false },
  ],
})
export default class DOMElementSystem extends Renderer {
  static systemName = 'DOMElement';
  name: string = 'DOMElement';
  private records: { [propName: number]: DOMRecord } = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  /** Canvas 父容器内的 DOM 层(absolute 覆盖)。 */
  private domLayer: HTMLDivElement | null = null;
  private domLayerInitialized: boolean = false;
  private syncRafId: number = 0;

  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }

  /**
   * 在 canvas 父容器内寻找/创建 .eva-dom-layer。
   * 必须延迟到首次有元素时再做,因为 RendererSystem 是异步 init 的,
   * 直接在 system.init 里读 application.canvas 可能拿不到。
   */
  private ensureDomLayer(): HTMLDivElement | null {
    if (this.domLayer) {
      // layer 已存在但 sync 循环未启动(例如热更新或之前已经创建)— 兜底再启
      this.startLayerSyncLoop();
      return this.domLayer;
    }
    const canvas: HTMLCanvasElement | undefined = this.renderSystem?.application?.canvas as any;
    if (!canvas) return null;
    const parent = canvas.parentElement;
    if (!parent) return null;
    // 如果 parent 是 inline/static 定位,改成 relative,让 absolute 子层定位生效。
    const cs = (typeof window !== 'undefined') ? window.getComputedStyle(parent) : null;
    if (cs && cs.position === 'static') {
      parent.style.position = 'relative';
    }
    let layer = parent.querySelector('.eva-dom-layer') as HTMLDivElement | null;
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'eva-dom-layer';
      const style = layer.style;
      style.position = 'absolute';
      // canvas 在 flex/center 之类的父容器里 offsetLeft/Top 不为 0,
      // 用它对齐而不是 (0, 0),否则 dom-layer 会跑到父容器左上角。
      style.left = `${canvas.offsetLeft}px`;
      style.top = `${canvas.offsetTop}px`;
      style.width = canvas.style.width || `${canvas.width}px`;
      style.height = canvas.style.height || `${canvas.height}px`;
      style.pointerEvents = 'none';
      style.overflow = 'hidden';
      // 默认放在 canvas 之上
      style.zIndex = '1';
      parent.appendChild(layer);
    }
    this.domLayer = layer;
    this.domLayerInitialized = true;
    // canvas mount 后才会拿到 offsetLeft/Top,layer 创建时机往往早于布局完成。
    // 用 rAF 自循环每帧矫正 layer 位置,直到 system 销毁。
    this.startLayerSyncLoop();
    return layer;
  }

  private startLayerSyncLoop() {
    if (this.syncRafId || typeof requestAnimationFrame === 'undefined') return;
    const loop = () => {
      if (!this.domLayer) { this.syncRafId = 0; return; }
      this.syncLayerToCanvas();
      this.syncRafId = requestAnimationFrame(loop);
    };
    this.syncRafId = requestAnimationFrame(loop);
  }

  /**
   * 每帧同步 layer 与 canvas 的位置(canvas 在 flex/center 父容器中
   * mount 后才会拿到 offsetLeft/Top,layer 创建时机早于布局完成,
   * 所以必须每帧重对齐,否则 DOM 元素会偏到父容器左上角)。
   */
  private syncLayerToCanvas() {
    if (!this.domLayer) return;
    const canvas: HTMLCanvasElement | undefined = this.renderSystem?.application?.canvas as any;
    if (!canvas) return;
    const left = `${canvas.offsetLeft}px`;
    const top = `${canvas.offsetTop}px`;
    if (this.domLayer.style.left !== left) this.domLayer.style.left = left;
    if (this.domLayer.style.top !== top) this.domLayer.style.top = top;
    const w = canvas.style.width || `${canvas.width}px`;
    const h = canvas.style.height || `${canvas.height}px`;
    if (this.domLayer.style.width !== w) this.domLayer.style.width = w;
    if (this.domLayer.style.height !== h) this.domLayer.style.height = h;
  }

  rendererUpdate(gameObject: GameObject) {
    const record = this.records[gameObject.id];
    if (!record) return;
    this.syncLayerToCanvas();
    const transform: any = gameObject.transform;
    const pos = transform?.position || { x: 0, y: 0 };
    const scale = transform?.scale || { x: 1, y: 1 };
    const rot: number = transform?.rotation || 0;
    // anchor 用 component 上的 anchorX/anchorY(若存在),否则回退到 transform.origin
    const comp = gameObject.getComponent('DOMElement' as any) as any as DOMElementComponent | null;
    const ax = comp?.anchorX ?? transform?.origin?.x ?? 0.5;
    const ay = comp?.anchorY ?? transform?.origin?.y ?? 0.5;
    const w = comp?.width ?? transform?.size?.width ?? record.el.offsetWidth ?? 0;
    const h = comp?.height ?? transform?.size?.height ?? record.el.offsetHeight ?? 0;
    // CSS 是 left/top + transform。先用 absolute + 0,0 origin,再 translate 到 (x - w*ax, y - h*ay)。
    // scale + rotate 围绕 anchor 应用。
    const tx = pos.x - w * ax * (scale.x ?? 1);
    const ty = pos.y - h * ay * (scale.y ?? 1);
    const transformStr =
      `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) ` +
      `rotate(${rot}rad) ` +
      `scale(${scale.x ?? 1}, ${scale.y ?? 1})`;
    if (transformStr !== record.lastTransform) {
      record.el.style.transform = transformStr;
      record.el.style.transformOrigin = '0 0';
      record.lastTransform = transformStr;
    }
  }

  async componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'DOMElement') return;
    const component = changed.component as DOMElementComponent;
    const gameObjectId = changed.gameObject.id;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const layer = this.ensureDomLayer();
      if (!layer) return;
      const el = this.createElement(component);
      layer.appendChild(el);
      this.records[gameObjectId] = { el, lastTransform: '' };
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      // 任何属性变化时整体重建(简化实现)
      const layer = this.ensureDomLayer();
      if (!layer) return;
      try {
        layer.removeChild(record.el);
      } catch {
        /* ignore */
      }
      const el = this.createElement(component);
      layer.appendChild(el);
      record.el = el;
      record.lastTransform = '';
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const record = this.records[gameObjectId];
      if (!record) return;
      const layer = this.domLayer;
      if (layer) {
        try {
          layer.removeChild(record.el);
        } catch {
          /* ignore */
        }
      }
      delete this.records[gameObjectId];
    }
  }

  /**
   * 按组件参数创建并配置 HTMLElement。
   *
   * - html 优先(取首个根节点);否则 element(默认 div);
   * - cssText、style、attrs 依次叠加;
   * - 默认 position:absolute / left:0 / top:0;
   * - pointerEvents 默认 'auto'(让 input/button 可交互),
   *   层(.eva-dom-layer)上 pointer-events:none 阻止全局拦截。
   */
  private createElement(component: DOMElementComponent): HTMLElement {
    let el: HTMLElement;
    if (component.html && component.html.trim().length > 0) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = component.html.trim();
      const first = wrapper.firstElementChild as HTMLElement | null;
      el = first || document.createElement(component.element || 'div');
    } else {
      el = document.createElement(component.element || 'div');
    }

    // 默认布局:absolute / 0,0 / 由 CSS transform 摆放
    el.style.position = 'absolute';
    el.style.left = '0';
    el.style.top = '0';
    el.style.margin = '0';
    el.style.pointerEvents = component.pointerEvents || 'auto';

    if (component.className) {
      el.className = component.className;
    }
    if (component.cssText) {
      // cssText 设置后,前面默认值会被覆盖,需要把 absolute 等再补回去
      el.style.cssText = component.cssText;
      if (!el.style.position) el.style.position = 'absolute';
      if (!el.style.left) el.style.left = '0';
      if (!el.style.top) el.style.top = '0';
      if (!el.style.pointerEvents) el.style.pointerEvents = component.pointerEvents || 'auto';
    }
    if (component.style) {
      for (const k in component.style) {
        try { (el.style as any)[k] = component.style[k]; } catch { /* ignore */ }
      }
    }
    if (component.attrs) {
      for (const k in component.attrs) {
        try { el.setAttribute(k, component.attrs[k]); } catch { /* ignore */ }
      }
    }
    if (component.width != null) el.style.width = `${component.width}px`;
    if (component.height != null) el.style.height = `${component.height}px`;
    if (component.blendMode) {
      el.style.mixBlendMode = component.blendMode;
    }
    return el;
  }

  destroy(): void {
    if (this.syncRafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.syncRafId);
      this.syncRafId = 0;
    }
    for (const key in this.records) {
      const id = parseInt(key);
      const record = this.records[id];
      const layer = this.domLayer;
      if (layer) {
        try { layer.removeChild(record.el); } catch { /* ignore */ }
      }
      delete this.records[id];
    }
    if (this.domLayer && this.domLayer.parentElement && this.domLayerInitialized) {
      // 不主动移除 layer 节点,允许复用;只清空内部
      while (this.domLayer.firstChild) this.domLayer.removeChild(this.domLayer.firstChild);
    }
  }
}
