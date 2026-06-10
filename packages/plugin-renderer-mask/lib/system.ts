import { decorators, resource, ComponentChanged, OBSERVER_TYPE } from '@eva/eva.js';
import { Renderer, RendererManager, ContainerManager, RendererSystem } from '@eva/plugin-renderer';
import { Sprite as SpriteEngine, Graphics } from '@eva/renderer-adapter';
import type { Sprite as PIXISprite } from 'pixi.js';
import MaskComponent, { MASK_TYPE, MaskTypeValue } from './component';

const resourceKeySplit = '_s|r|c_'; // Notice: This key be created by sprite system.

const propertyForGraphics = {
  Circle: ['x', 'y', 'radius'],
  Ellipse: ['x', 'y', 'width', 'height'],
  Rect: ['x', 'y', 'width', 'height'],
  RoundedRect: ['x', 'y', 'width', 'height', 'radius'],
  Polygon: ['paths'],
};
const functionForGraphics = {
  Circle: 'circle',
  Ellipse: 'ellipse',
  Rect: 'rect',
  RoundedRect: 'roundRect',
  Polygon: 'poly',
};

const maskTypeAliases: Record<string, MASK_TYPE> = {
  circle: MASK_TYPE.Circle,
  ellipse: MASK_TYPE.Ellipse,
  rect: MASK_TYPE.Rect,
  roundedrect: MASK_TYPE.RoundedRect,
  roundedRect: MASK_TYPE.RoundedRect,
  polygon: MASK_TYPE.Polygon,
  img: MASK_TYPE.Img,
  image: MASK_TYPE.Img,
  sprite: MASK_TYPE.Sprite,
};

function normalizeMaskType(type: MaskTypeValue): MASK_TYPE | undefined {
  if (!type) return undefined;
  if (Object.values(MASK_TYPE).includes(type as MASK_TYPE)) return type as MASK_TYPE;
  return maskTypeAliases[String(type)] || maskTypeAliases[String(type).toLowerCase()];
}

@decorators.componentObserver({
  Mask: [
    'type',
    { prop: ['style'], deep: true },
    'x',
    'y',
    'radius',
    'width',
    'height',
    'paths',
    'resource',
    'spriteName',
    'enabled',
  ],
})
export default class Mask extends Renderer {
  static systemName = 'MaskSystem';
  name: string = 'MaskSystem';
  changedCache: { [propName: number]: boolean } = {};
  maskSpriteCache: { [propName: number]: SpriteEngine } = {};
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
    if (component.enabled === false) return;
    const maskType = normalizeMaskType(component.type);
    if (!maskType) {
      throw new Error('no have Mask type: ' + component.type);
    }

    if (!component.style) {
      throw new Error('no have Mask style: ' + component.type);
    }

    let mask;
    switch (maskType) {
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
      throw new Error('no have mask instance, check your mask params: ' + component.type);
    }
    const container = this.containerManager.getContainer(changed.gameObject.id);
    container.mask = mask;
    container.addChild(mask);
  }
  remove(changed: ComponentChanged) {
    const container = this.containerManager.getContainer(changed.gameObject.id);
    if (!container?.mask) return;
    container.removeChild(container.mask as any);
    (container.mask as any).destroy({ children: true });
    container.mask = null;
    delete this.maskSpriteCache[changed.gameObject.id];
  }
  change(changed: ComponentChanged) {
    if (this.changedCache[changed.gameObject.id]) return;
    const component = changed.component as MaskComponent;
    if (changed.prop.prop[0] === 'enabled') {
      this.changedCache[changed.gameObject.id] = true;
      if (component.enabled === false) {
        this.remove(changed);
      } else {
        this.add(changed);
      }
      return;
    }
    if (changed.prop.prop[0] === 'type') {
      this.changedCache[changed.gameObject.id] = true;
      const maskType = normalizeMaskType(component.type);
      const lastType = normalizeMaskType(component._lastType);
      if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(maskType) > -1 || lastType !== maskType) {
        this.remove(changed);
        this.add(changed);
        component._lastType = component.type;
      } else {
        this.redrawGraphics(changed);
      }
    } else if (['style', 'x', 'y', 'radius', 'width', 'height', 'paths'].indexOf(changed.prop.prop[0]) > -1) {
      this.syncComponentStyle(component);
      const maskType = normalizeMaskType(component.type);
      if ([MASK_TYPE.Sprite, MASK_TYPE.Img].indexOf(maskType) > -1) {
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
    const maskType = normalizeMaskType(component.type);
    const style = this.syncComponentStyle(component);
    const params = [];
    for (const key of propertyForGraphics[maskType]) {
      params.push(style[key]);
    }
    // @ts-ignore
    graphics[functionForGraphics[maskType]](...params);
    graphics.fill(0x000000);
  }
  createSprite(component: MaskComponent): PIXISprite {
    const sprite = new SpriteEngine(null);
    this.maskSpriteCache[component.gameObject.id] = sprite;
    this.setSprite(component, sprite);
    return sprite.sprite;
  }
  changeSpriteStyle(component: MaskComponent) {
    const sprite = this.maskSpriteCache[component.gameObject.id] as SpriteEngine;
    sprite.sprite.width = component.style.width;
    sprite.sprite.height = component.style.height;
    sprite.sprite.position.x = component.style.x;
    sprite.sprite.position.y = component.style.y;
  }
  changeSprite(component: MaskComponent) {
    const sprite = this.maskSpriteCache[component.gameObject.id] as SpriteEngine;
    this.setSprite(component, sprite);
  }
  async setSprite(component: MaskComponent, sprite) {
    const maskType = normalizeMaskType(component.type);
    let res;
    try {
      const asyncId = this.increaseAsyncId(component.gameObject.id);
      res = await resource.getResource(component.resource);
      if (!this.validateAsyncId(component.gameObject.id, asyncId)) return;
    } catch (e) {
      throw new Error('mask resource load error');
    }
    if (maskType === MASK_TYPE.Sprite) {
      const img = component.resource + resourceKeySplit + component.spriteName;
      const texture = res?.instance?.[img];
      if (texture) {
        sprite.image = texture;
      }
    } else {
      if (res?.data?.image) {
        sprite.image = res.data.image;
      }
    }
    sprite.sprite.width = component.style.width;
    sprite.sprite.height = component.style.height;
    sprite.sprite.position.x = component.style.x;
    sprite.sprite.position.y = component.style.y;
  }
  private syncComponentStyle(component: MaskComponent) {
    component.style = {
      ...component.style,
      x: component.x ?? component.style?.x ?? 0,
      y: component.y ?? component.style?.y ?? 0,
      radius: component.radius ?? component.style?.radius,
      width: component.width ?? component.style?.width,
      height: component.height ?? component.style?.height,
      paths: component.paths ?? component.style?.paths,
    };
    return component.style;
  }
}
