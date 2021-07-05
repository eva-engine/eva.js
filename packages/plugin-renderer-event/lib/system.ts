import {Renderer, RendererSystem, RendererManager, ContainerManager} from '@eva/plugin-renderer';
import {decorators, ComponentChanged, OBSERVER_TYPE} from '@eva/eva.js';
import {Circle, Ellipse, Polygon, RoundedRectangle, Rectangle} from 'pixi.js';
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

@decorators.componentObserver({
  Event: [{prop: ['hitArea'], deep: true}],
})
export default class Event extends Renderer {
  static systemName = 'Event';
  name: string = 'Event';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init({moveWhenInside = false} = {moveWhenInside: false}) {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    this.renderSystem.application.renderer.plugins.interaction.moveWhenInside = moveWhenInside;
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
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.interactive = true;
    container.interactiveChildren = true;
    const component = changed.component as EventComponent;

    if (component.hitArea) {
      this.addHitArea(changed, container, component.hitArea);
    }

    container.on('pointertap', e => {
      component.emit('tap', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
    container.on('pointerdown', e => {
      component.emit('touchstart', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
    container.on('pointermove', e => {
      component.emit('touchmove', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
    container.on('pointerup', e => {
      component.emit('touchend', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
    container.on('pointerupoutside', e => {
      component.emit('touchendoutside', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
    container.on('pointercancel', e => {
      component.emit('touchcancel', {
        stopPropagation: () => e.stopPropagation(),
        data: {
          // @ts-ignore
          pointerId: e.data.pointerId,
          position: {
            x: e.data.global.x,
            y: e.data.global.y,
          },
        },
        gameObject: component.gameObject,
      });
    });
  }
  remove(changed: ComponentChanged) {
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.interactive = false;
    container.off('tap');
    container.off('pointerdown');
    container.off('pointermove');
    container.off('pointerup');
    container.off('pointerupoutside');
    container.off('pointercancel');
    changed.component.removeAllListeners();
  }
  change(changed: ComponentChanged) {
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.interactive = true;
    const component = changed.component as EventComponent;

    if (component.hitArea) {
      this.addHitArea(changed, container, component.hitArea);
    } else {
      component.hitArea = null;
    }
  }
  addHitArea(changed: ComponentChanged, container, hitArea) {
    const {type, style} = hitArea;
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
