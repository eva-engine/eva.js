import {
  decorators,
  resource,
  ComponentChanged,
  OBSERVER_TYPE,
} from '@eva/eva.js';
import {
  Renderer,
  RendererManager,
  ContainerManager,
  RendererSystem,
} from '@eva/plugin-renderer';
import {Sprite as SpriteEngine, Graphics} from '@eva/renderer-adapter';
import MaskComponent from './component';

const resourceKeySplit = '_s|r|c_'; // Notice: This key be created by sprite system.

const propertyForGraphics = {
  Circle: ['x', 'y', 'radius'],
  Ellipse: ['x', 'y', 'width', 'height'],
  Rect: ['x', 'y', 'width', 'height'],
  RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
  Polygon: ['paths'],
};
const functionForGraphics = {
  Circle: 'drawCircle',
  Ellipse: 'drawEllipse',
  Rect: 'drawRect',
  RoundedRect: 'drawRoundedRect',
  Polygon: 'drawPolygon',
};

enum MASK_TYPE {
  Circle = 'Circle',
  Ellipse = 'Ellipse',
  Rect = 'Rect',
  RoundedRect = 'RoundedRect',
  Polygon = 'Polygon',
  Img = 'Img',
  Sprite = 'Sprite',
}

@decorators.componentObserver({
  Mask: ['type', {prop: ['style'], deep: true}, 'resource', 'spriteName'],
})
export default class Mask extends Renderer {
  static systemName = 'Mask';
  name: string = 'Mask';
  changedCache: {[propName: number]: boolean} = {};
  maskSpriteCache: {[propName: number]: SpriteEngine} = {};
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
  }
  rendererUpdate() {
    this.changedCache = {};
  }
  componentChanged(changed: ComponentChanged) {
    if (changed.component.name !== 'Mask') return;
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
    const component = changed.component as MaskComponent;
    if (!(component.type in MASK_TYPE)) {
      throw new Error('no have Mask type: ' + component.type);
    }

    if (!component.style) {
      throw new Error('no have Mask style: ' + component.type);
    }

    let mask;
    switch (component.type) {
      case MASK_TYPE.Circle:
        mask = this.createGraphics(component);
        break;
      case MASK_TYPE.Ellipse:
        mask = this.createGraphics(component);
        break;
      case MASK_TYPE.Rect:
        mask = this.createGraphics(component);
        break;
      case MASK_TYPE.RoundedRect:
        mask = this.createGraphics(component);
        break;
      case MASK_TYPE.Polygon:
        mask = this.createGraphics(component);
        break;
      case MASK_TYPE.Img:
        mask = this.createSprite(component);
        break;
      case MASK_TYPE.Sprite:
        mask = this.createSprite(component);
        break;
    }
    if (!mask) {
      throw new Error(
        'no have mask instance, check your mask params: ' + component.type,
      );
    }
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.mask = mask;
    this.containerManager.getContainer(changed.gameObject.id).addChild(mask);
  }
  remove(changed: ComponentChanged) {
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.mask = null;
  }
  change(changed: ComponentChanged) {
    if (this.changedCache[changed.gameObject.id]) return;
    const component = changed.component as MaskComponent;
    if (changed.prop.prop[0] === 'type') {
      this.changedCache[changed.gameObject.id] = true;
      if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(component.type) > -1) {
        this.remove(changed);
        this.add(changed);
      } else {
        this.redrawGraphics(changed);
      }
    } else if (changed.prop.prop[0] === 'style') {
      if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(component.type) > -1) {
        this.changeSpriteStyle(component);
      } else {
        this.redrawGraphics(changed);
      }
    } else if (changed.prop.prop[0] === 'resource') {
      this.changedCache[changed.gameObject.id] = true;
      this.changeSprite(component);
    } else if (changed.prop.prop[0] === 'spriteName') {
      this.changedCache[changed.gameObject.id] = true;
      this.changeSprite(component);
    }
  }
  createGraphics(component: MaskComponent) {
    const graphics = new Graphics();
    this.draw(graphics, component);
    return graphics;
  }
  redrawGraphics(changed) {
    const container = this.containerManager.getContainer(changed.gameObject.id);
    const graphics = container.mask as Graphics;
    graphics.clear();
    this.draw(graphics, changed.component);
  }
  draw(graphics, component) {
    const params = [];
    for (const key of propertyForGraphics[component.type]) {
      params.push(component.style[key]);
    }
    graphics.beginFill(0x000000, 1);
    graphics[functionForGraphics[component.type]](...params);

    graphics.endFill();
  }
  createSprite(component: MaskComponent) {
    const sprite = new SpriteEngine(null);
    this.maskSpriteCache[component.gameObject.id] = sprite;
    this.setSprite(component, sprite);
    return sprite.sprite;
  }
  changeSpriteStyle(component: MaskComponent) {
    const sprite = this.maskSpriteCache[
      component.gameObject.id
    ] as SpriteEngine;
    sprite.sprite.width = component.style.width;
    sprite.sprite.height = component.style.height;
    sprite.sprite.position.x = component.style.x;
    sprite.sprite.position.y = component.style.y;
  }
  changeSprite(component: MaskComponent) {
    const sprite = this.maskSpriteCache[
      component.gameObject.id
    ] as SpriteEngine;
    this.setSprite(component, sprite);
  }
  async setSprite(component: MaskComponent, sprite) {
    let res;
    try {
      res = await resource.getResource(component.resource);
    } catch (e) {
      throw new Error('mask resource load error');
    }
    if (component.type === MASK_TYPE.Sprite) {
      const img = component.resource + resourceKeySplit + component.spriteName;
      const texture = res.instance[img];
      sprite.image = texture;
    } else {
      sprite.image = res.data.image;
    }
    sprite.sprite.width = component.style.width;
    sprite.sprite.height = component.style.height;
    sprite.sprite.position.x = component.style.x;
    sprite.sprite.position.y = component.style.y;
  }
}
