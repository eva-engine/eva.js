import { Renderer, RendererSystem, RendererManager, ContainerManager } from '@eva/plugin-renderer';
import { decorators, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import { Circle, Ellipse, Polygon, RoundedRectangle, Rectangle } from 'pixi.js';
import EventComponent from './component';

const hitAreaFunc = {
  Circle,
  Ellipse,
  Polygon,
  Rect: Rectangle,
  RoundedRect: RoundedRectangle,
};

const propertyForHitArea = {
  Circle: ['x', 'y', 'radius'],
  Ellipse: ['x', 'y', 'width', 'height'],
  Rect: ['x', 'y', 'width', 'height'],
  RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
  Polygon: ['paths'],
};

export interface EventSystemParams {
  moveWhenInside?: boolean;
}

@decorators.componentObserver({
  Event: [{ prop: ['hitArea'], deep: true }],
})
export default class Event extends Renderer<EventSystemParams> {
  static systemName = 'EventSystem';
  name: string = 'EventSystem';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init(params?: EventSystemParams | { getSystem?: (...args: any[]) => unknown }) {
    const compatibleParams = params as { getSystem?: (...args: any[]) => unknown } | undefined;
    const game = this.game || (typeof compatibleParams?.getSystem === 'function' ? compatibleParams : undefined);
    const renderSystem = game?.getSystem?.(RendererSystem) as RendererSystem | undefined;
    if (!renderSystem?.rendererManager) return;

    this.renderSystem = renderSystem;
    this.renderSystem.rendererManager.register(this);
  }
  update(frame?: unknown) {
    super.update(frame as any);
  }
  componentChanged(changed: ComponentChanged) {
    switch (changed.type) {
      case OBSERVER_TYPE.ADD:
        this.add(changed);
        break;
      case OBSERVER_TYPE.REMOVE:
        this.remove(changed);
        break;
      case OBSERVER_TYPE.CHANGE:
        this.change(changed);
        break;
    }
  }
  add(changed: ComponentChanged) {
    const container = this.containerManager?.getContainer(changed.gameObject.id);
    if (!container) return;
    container.interactive = true;
    container.interactiveChildren = true;
    const component = changed.component as EventComponent;

    if (component.hitArea) {
      this.addHitArea(changed, container, component.hitArea);
    }

    container.on('pointertap', e => {
      const eventParam = this.createEventParam(container, component, e);
      component.emit('tap', eventParam);
      component.emit('click', eventParam);
    });
    container.on('pointerdown', e => {
      const eventParam = this.createEventParam(container, component, e);
      component.emit('touchstart', eventParam);
      component.emit('mousedown', eventParam);
    });
    container.on('pointermove', e => {
      const eventParam = this.createEventParam(container, component, e);
      component.emit('touchmove', eventParam);
      component.emit('mousemove', eventParam);
    });

    container.on('pointerup', e => {
      const eventParam = this.createEventParam(container, component, e);
      component.emit('touchend', eventParam);
      component.emit('mouseup', eventParam);
    });
    container.on('pointerupoutside', e => {
      component.emit('touchendoutside', this.createEventParam(container, component, e));
    });
    container.on('pointercancel', e => {
      component.emit('touchcancel', this.createEventParam(container, component, e));
    });
  }
  private createEventParam(container, component: EventComponent, e) {
    return {
      stopPropagation: () => e.stopPropagation(),
      data: {
        // @ts-ignore
        pointerId: e.data.pointerId,
        position: {
          x: e.data.global.x,
          y: e.data.global.y,
        },
        localPosition: container.worldTransform.applyInverse(e.data.global),
      },
      gameObject: component.gameObject,
    };
  }
  remove(changed: ComponentChanged) {
    const container = this.containerManager?.getContainer(changed.gameObject.id);
    if (!container) return;
    container.interactive = false;
    container.off('pointertap');
    container.off('pointerdown');
    container.off('pointermove');
    container.off('pointerup');
    container.off('pointerupoutside');
    container.off('pointercancel');
    changed.component.removeAllListeners();
  }
  change(changed: ComponentChanged) {
    const container = this.containerManager?.getContainer(changed.gameObject.id);
    if (!container) return;
    container.interactive = true;
    const component = changed.component as EventComponent;

    if (component.hitArea) {
      this.addHitArea(changed, container, component.hitArea);
    } else {
      component.hitArea = null;
    }
  }
  addHitArea(changed: ComponentChanged, container, hitArea) {
    const { type, style } = hitArea;
    if (!hitAreaFunc[type]) {
      console.error(`${changed.gameObject.name}'s hitArea type is not defined`);
      return;
    }
    const params = [];
    for (const key of propertyForHitArea[type]) {
      params.push(style[key]);
    }
    const hitAreaShape = new hitAreaFunc[type](...params);
    container.hitArea = hitAreaShape;
  }
}
