import { System } from '@eva/eva.js';
import type { GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { detectComponentType, generateDescription, extractRenderInfo, extractVisibility, isInteractive } from './utils';

interface AISystemParams {
  /** 是否显示红色调试边框（DOM 数据仍然存在） */
  debug?: boolean;
  /** 完全关闭 DOM 渲染，不创建任何覆盖层元素 */
  enabled?: boolean;
  zIndex?: number;
}

export default class AISystem extends System<AISystemParams> {
  static systemName = 'AISystem';

  private debug: boolean = false;
  private enabled: boolean = true;
  private zIndex: number = 10001;
  private div: HTMLDivElement | null = null;
  private cache: Map<number, HTMLElement> = new Map();
  private rendererSystem: RendererSystem | null = null;
  private _ratioX: number = 1;
  private _ratioY: number = 1;

  init(params: AISystemParams = {}) {
    this.debug = params.debug || false;
    this.enabled = params.enabled !== false;
    this.zIndex = params.zIndex || this.zIndex;
  }

  start() {
    this.rendererSystem = this.game.getSystem(RendererSystem);
    if (this.enabled) {
      this.createOverlay();
    }
  }

  private createOverlay() {
    const canvas = this.game.canvas;
    if (!canvas || !this.rendererSystem) return;

    const div = document.createElement('div');
    div.setAttribute('data-ai-overlay', 'true');
    div.style.position = 'absolute';
    div.style.pointerEvents = 'none';
    div.style.zIndex = `${this.zIndex}`;
    div.style.overflow = 'hidden';

    // Set canvas global meta info
    const params = this.rendererSystem.params;
    div.setAttribute('data-canvas-width', String(params.width || 750));
    div.setAttribute('data-canvas-height', String(params.height || 750));
    if (params.backgroundColor != null) {
      div.setAttribute('data-background-color', String(params.backgroundColor));
    }
    if (params.backgroundAlpha != null && params.backgroundAlpha !== 1) {
      div.setAttribute('data-background-alpha', String(params.backgroundAlpha));
    }

    this.div = div;
    this.syncOverlayPosition();

    if (canvas.parentNode) {
      canvas.parentNode.insertBefore(div, canvas.nextSibling);
    }
  }

  private syncOverlayPosition() {
    const canvas = this.game.canvas;
    if (!canvas || !this.div) return;

    const { width, height, left, top } = canvas.getBoundingClientRect();
    const { pageXOffset, pageYOffset } = window;

    this.div.style.width = `${width}px`;
    this.div.style.height = `${height}px`;
    this.div.style.left = `${left + pageXOffset}px`;
    this.div.style.top = `${top + pageYOffset}px`;
  }

  private updateRatio() {
    const canvas = this.game.canvas;
    if (!canvas || !this.rendererSystem) return;

    const { width, height } = canvas.getBoundingClientRect();
    const params = this.rendererSystem.params;
    const renderWidth = params.width || 750;
    const renderHeight = params.height || 750;

    this._ratioX = width / renderWidth;
    this._ratioY = height / renderHeight;
  }

  lateUpdate() {
    if (!this.enabled || !this.div || !this.rendererSystem) return;

    this.updateRatio();
    this.syncOverlayPosition();

    const activeIds = new Set<number>();

    for (const gameObject of this.game.gameObjects) {
      activeIds.add(gameObject.id);
      this.syncElement(gameObject);
    }

    // Remove DOM elements for destroyed gameObjects
    for (const [id, element] of this.cache) {
      if (!activeIds.has(id)) {
        element.parentNode?.removeChild(element);
        this.cache.delete(id);
      }
    }
  }

  private syncElement(gameObject: GameObject) {
    if (!this.div || !this.rendererSystem) return;

    const render = gameObject.getComponent('Render') as any;
    if (render && render.visible === false) {
      const existing = this.cache.get(gameObject.id);
      if (existing) {
        existing.parentNode?.removeChild(existing);
        this.cache.delete(gameObject.id);
      }
      return;
    }

    const container = this.rendererSystem.containerManager?.getContainer(gameObject.id);
    if (!container) return;

    const bounds = container.getBounds();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;

    const params = this.rendererSystem.params;
    const renderWidth = params.width || 750;
    const renderHeight = params.height || 750;

    // Clamp bounds to render area
    const clampedX = Math.max(0, bounds.x);
    const clampedY = Math.max(0, bounds.y);
    const clampedRight = Math.min(renderWidth, bounds.x + bounds.width);
    const clampedBottom = Math.min(renderHeight, bounds.y + bounds.height);
    const clampedWidth = clampedRight - clampedX;
    const clampedHeight = clampedBottom - clampedY;

    if (clampedWidth <= 0 || clampedHeight <= 0) return;

    const x = clampedX * this._ratioX;
    const y = clampedY * this._ratioY;
    const width = clampedWidth * this._ratioX;
    const height = clampedHeight * this._ratioY;

    let element = this.cache.get(gameObject.id);
    if (!element) {
      element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.pointerEvents = 'none';
      this.div.appendChild(element);
      this.cache.set(gameObject.id, element);
    }

    // Update position and size
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    // Debug mode styling
    if (this.debug) {
      element.style.outline = '1px solid rgba(255, 0, 0, 0.5)';
      element.style.background = 'rgba(255, 0, 0, 0.1)';
    }

    // Set data attributes
    const type = detectComponentType(gameObject);
    const name = gameObject.name || `GameObject_${gameObject.id}`;
    const description = generateDescription(gameObject, type);

    element.setAttribute('data-name', name);
    element.setAttribute('data-type', type);
    element.setAttribute('data-bounds', `${Math.round(clampedX)},${Math.round(clampedY)},${Math.round(clampedWidth)},${Math.round(clampedHeight)}`);
    element.setAttribute('aria-label', description);
    element.setAttribute('role', 'img');

    // Set hierarchy attributes
    const parent = gameObject.transform?.parent?.gameObject;
    if (parent && parent.name) {
      element.setAttribute('data-parent', parent.name);
    }
    const children = gameObject.transform?.children;
    if (children && children.length > 0) {
      const childNames = children
        .map(child => child.gameObject?.name || `GameObject_${child.gameObject?.id}`)
        .join(',');
      element.setAttribute('data-children', childNames);
    }

    // Set render info (text content, resource, colors, etc.)
    const renderInfo = extractRenderInfo(gameObject, container);
    for (const [key, value] of Object.entries(renderInfo)) {
      if (value) {
        element.setAttribute(`data-${key}`, value);
      }
    }

    // Set visibility state
    const visibility = extractVisibility(gameObject);
    for (const [key, value] of Object.entries(visibility)) {
      element.setAttribute(`data-${key}`, value);
    }

    // Set interactive flag
    if (isInteractive(gameObject)) {
      element.setAttribute('data-interactive', 'true');
    }
  }

  onDestroy() {
    if (this.div && this.div.parentNode) {
      this.div.parentNode.removeChild(this.div);
    }
    this.cache.clear();
    this.div = null;
    this.rendererSystem = null;
  }
}
