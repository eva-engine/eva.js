import {
  Component,
  ComponentChanged,
  decorators,
  GameObject,
  OBSERVER_TYPE,
  RESOURCE_TYPE,
  resource } from '@eva/eva.js';
import { ContainerManager,
  Renderer,
  RendererManager,
  RendererSystem } from '@eva/plugin-renderer';
import { Text } from '@eva/plugin-renderer-text';
import { Shape,
  ShapeType,
} from '@eva/plugin-ui';
import { Assets, Cache, Graphics as PixiGraphics, Sprite as PixiSprite, Text as PixiText, Texture } from 'pixi.js';

export const pixiStoryColors = {
  color: '#e91e63',
  hoverColor: '#ff729a',
  pressedColor: '#b42e5b',
  disabledColor: '#6e6e6e',
  textColor: '#FFFFFF',
  pannelColor: '#222425',
  pannelBorderColor: '#3e3f40',
};

export const pixiDefaultTextStyle = {
  fill: 0xffffff,
  fontSize: 40,
  fontWeight: 'bold',
  dropShadow: {
    color: 0x000000,
    alpha: 0.5,
    distance: 0,
    blur: 3,
    angle: 0,
  },
};

const PIXI_STORY_ASSETS = [
  'arrow_down.png',
  'avatar-01.png',
  'avatar-02.png',
  'avatar-03.png',
  'avatar-04.png',
  'avatar-05.png',
  'avatar_mask.png',
  'button.png',
  'button_black.png',
  'button_blue.png',
  'button_disabled.png',
  'button_gray.png',
  'button_green.png',
  'button_hover.png',
  'button_pressed.png',
  'button_white.png',
  'input.png',
  'radio.png',
  'radio_checked.png',
  'select.png',
  'select_open.png',
  'slider_bg.png',
  'slider_progress.png',
];

export function registerPixiStoryAssets(): void {
  resource.addResource(PIXI_STORY_ASSETS.map((asset) => ({
    name: asset,
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: `/pixi-ui-stories/${asset}`,
      },
    },
    preload: true,
  })));
}

export async function preloadPixiStoryAssets(assets: string[] = PIXI_STORY_ASSETS): Promise<void> {
  await Promise.all(assets.map(async (asset) => {
    const url = toStoryAssetUrl(asset);
    try { Assets.add({ alias: asset, src: url }); } catch (_) {}
    try { Assets.add({ alias: url, src: url }); } catch (_) {}
    let loaded: unknown;
    try {
      loaded = await Assets.load(asset);
    } catch (_) {
      loaded = await Assets.load(url);
    }
    if (loaded) {
      try {
        Cache.set([asset, url], loaded);
      } catch (_) {
        try { Cache.remove(asset); } catch (_) {}
        try { Cache.remove(url); } catch (_) {}
        Cache.set([asset, url], loaded);
      }
    }
  }));
}

export function makeStoryLabel(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 640, height: 30 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 18, fill: '#f8fafc', fontWeight: '700' } as any,
  }));
  return go;
}

export function makeStoryHint(name: string, x: number, y: number, text: string): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width: 640, height: 22 } });
  go.addComponent(new Text({
    text,
    style: { fontSize: 13, fill: '#94a3b8' } as any,
  }));
  return go;
}

export function makeRoundedRect(
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
): GameObject {
  const go = new GameObject(name, { position: { x, y }, size: { width, height } });
  go.addComponent(new Shape({
    shapes: [{
      type: ShapeType.ROUNDED_RECT,
      style: { x: 0, y: 0, width, height, radius, fill } as any,
    }],
  }));
  return go;
}

export interface StorySpriteParams {
  texture: string;
  anchor?: { x: number; y: number };
}

export class StorySprite extends Component<StorySpriteParams> {
  static componentName = 'StorySprite';
  readonly name = 'StorySprite';
  texture = '';
  anchor = { x: 0.5, y: 0.5 };

  init(params?: StorySpriteParams): void {
    if (!params) return;
    if (params.texture) this.texture = params.texture;
    if (params.anchor) this.anchor = { ...this.anchor, ...params.anchor };
  }
}

@decorators.componentObserver({
  StorySprite: ['texture', { prop: 'anchor', deep: true }],
})
export class StorySpriteSystem extends Renderer {
  static systemName = 'StorySpriteSystem';
  name = 'StorySpriteSystem';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  private sprites: Record<number, PixiSprite> = {};

  init(): void {
    const renderSystem = this.game?.getSystem?.(RendererSystem) as RendererSystem | undefined;
    if (!renderSystem?.rendererManager) return;
    this.renderSystem = renderSystem;
    this.renderSystem.rendererManager.register(this);
  }

  componentChanged(changed: ComponentChanged): void {
    const id = changed.gameObject.id;
    const component = changed.component as StorySprite;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const sprite = new PixiSprite(Texture.from(toStoryAssetUrl(component.texture)));
      sprite.anchor.set(component.anchor.x, component.anchor.y);
      this.sprites[id] = sprite;
      this.containerManager?.getContainer(id)?.addChildAt(sprite, 0);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const sprite = this.sprites[id];
      if (!sprite) return;
      sprite.texture = Texture.from(toStoryAssetUrl(component.texture));
      sprite.anchor.set(component.anchor.x, component.anchor.y);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const sprite = this.sprites[id];
      if (!sprite) return;
      this.containerManager?.getContainer(id)?.removeChild(sprite);
      sprite.destroy({ children: true });
      delete this.sprites[id];
    }
  }
}

export interface StoryTextParams {
  text: string | number;
  style?: Record<string, unknown>;
  anchor?: { x: number; y: number };
}

export class StoryText extends Component<StoryTextParams> {
  static componentName = 'StoryText';
  readonly name = 'StoryText';
  text: string | number = '';
  style: Record<string, unknown> = {};
  anchor = { x: 0, y: 0 };

  init(params?: StoryTextParams): void {
    if (!params) return;
    if (params.text !== undefined) this.text = params.text;
    if (params.style) this.style = { ...params.style };
    if (params.anchor) this.anchor = { ...this.anchor, ...params.anchor };
  }
}

@decorators.componentObserver({
  StoryText: ['text', { prop: 'style', deep: true }],
})
export class StoryTextSystem extends Renderer {
  static systemName = 'StoryTextSystem';
  name = 'StoryTextSystem';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  private textsById: Record<number, PixiText> = {};

  init(): void {
    const renderSystem = this.game?.getSystem?.(RendererSystem) as RendererSystem | undefined;
    if (!renderSystem?.rendererManager) return;
    this.renderSystem = renderSystem;
    this.renderSystem.rendererManager.register(this);
  }

  componentChanged(changed: ComponentChanged): void {
    const id = changed.gameObject.id;
    const component = changed.component as StoryText;

    if (changed.type === OBSERVER_TYPE.ADD) {
      const text = new PixiText({ text: String(component.text), style: component.style as any });
      text.anchor.set(component.anchor.x, component.anchor.y);
      this.textsById[id] = text;
      this.containerManager?.getContainer(id)?.addChildAt(text, 0);
      updateStoryTextSize(changed.gameObject, text);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const text = this.textsById[id];
      if (!text) return;
      text.text = String(component.text);
      text.style = component.style as any;
      text.anchor.set(component.anchor.x, component.anchor.y);
      updateStoryTextSize(changed.gameObject, text);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const text = this.textsById[id];
      if (!text) return;
      this.containerManager?.getContainer(id)?.removeChild(text);
      text.destroy();
      delete this.textsById[id];
    }
  }
}

function updateStoryTextSize(go: GameObject, text: PixiText): void {
  const size = text.getSize();
  go.transform.size.width = size.width;
  go.transform.size.height = size.height;
}

export function makeImageView(name: string, texture: string): { root: GameObject; sprite: StorySprite } {
  const root = new GameObject(name, { position: { x: 0, y: 0 } });
  const sprite = root.addComponent(new StorySprite({ texture, anchor: { x: 0.5, y: 0.5 } }));
  return { root, sprite };
}

export interface StoryRoundRectParams {
  width: number;
  height: number;
  radius?: number;
  fill?: string | number;
  stroke?: string | number;
  lineWidth?: number;
  x?: number;
  y?: number;
}

export class StoryRoundRect extends Component<StoryRoundRectParams> {
  static componentName = 'StoryRoundRect';
  readonly name = 'StoryRoundRect';
  width = 0;
  height = 0;
  radius = 0;
  fill: string | number | undefined = undefined;
  stroke: string | number | undefined = undefined;
  lineWidth = 1;
  x = 0;
  y = 0;

  init(params?: StoryRoundRectParams): void {
    if (!params) return;
    if (params.width !== undefined) this.width = params.width;
    if (params.height !== undefined) this.height = params.height;
    if (params.radius !== undefined) this.radius = params.radius;
    if (params.fill !== undefined) this.fill = params.fill;
    if (params.stroke !== undefined) this.stroke = params.stroke;
    if (params.lineWidth !== undefined) this.lineWidth = params.lineWidth;
    if (params.x !== undefined) this.x = params.x;
    if (params.y !== undefined) this.y = params.y;
  }
}

@decorators.componentObserver({
  StoryRoundRect: ['width', 'height', 'radius', 'fill', 'stroke', 'lineWidth', 'x', 'y'],
})
export class StoryRoundRectSystem extends Renderer {
  static systemName = 'StoryRoundRectSystem';
  name = 'StoryRoundRectSystem';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  private graphicsById: Record<number, PixiGraphics> = {};

  init(): void {
    const renderSystem = this.game?.getSystem?.(RendererSystem) as RendererSystem | undefined;
    if (!renderSystem?.rendererManager) return;
    this.renderSystem = renderSystem;
    this.renderSystem.rendererManager.register(this);
  }

  componentChanged(changed: ComponentChanged): void {
    const id = changed.gameObject.id;
    const component = changed.component as StoryRoundRect;
    if (changed.type === OBSERVER_TYPE.ADD) {
      const graphics = new PixiGraphics();
      this.graphicsById[id] = graphics;
      redrawStoryRoundRect(graphics, component);
      this.containerManager?.getContainer(id)?.addChildAt(graphics, 0);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const graphics = this.graphicsById[id];
      if (graphics) redrawStoryRoundRect(graphics, component);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const graphics = this.graphicsById[id];
      if (!graphics) return;
      this.containerManager?.getContainer(id)?.removeChild(graphics);
      graphics.destroy();
      delete this.graphicsById[id];
    }
  }
}

function redrawStoryRoundRect(graphics: PixiGraphics, rect: StoryRoundRect): void {
  graphics.clear();
  graphics.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
  if (rect.fill !== undefined) graphics.fill(rect.fill as any);
  if (rect.stroke !== undefined) {
    graphics.stroke({ color: rect.stroke as any, width: rect.lineWidth });
  }
}

export function toStoryAssetUrl(asset: string): string {
  return asset.startsWith('/') ? asset : `/pixi-ui-stories/${asset}`;
}

export function centerTextOnce(label: GameObject, offsetX = 0, offsetY = 0): void {
  const tick = () => {
    const { width, height } = label.transform.size;
    if (width > 1 || height > 1) {
      label.transform.position.x = -width / 2 + offsetX;
      label.transform.position.y = -height / 2 + offsetY;
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function centerTextEveryFrame(label: GameObject, getOffset: () => { x: number; y: number }): void {
  const tick = () => {
    const { width, height } = label.transform.size;
    if (width > 1 || height > 1) {
      const offset = getOffset();
      label.transform.position.x = -width / 2 + offset.x;
      label.transform.position.y = -height / 2 + offset.y;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export type PixiButtonStoryState = 'default' | 'hover' | 'pressed' | 'disabled';

export function makeButtonGraphicsShapes(
  width: number,
  height: number,
  radius: number,
  state: PixiButtonStoryState,
) {
  const fill = state === 'disabled'
    ? pixiStoryColors.disabledColor
    : state === 'hover'
      ? pixiStoryColors.hoverColor
      : state === 'pressed'
        ? pixiStoryColors.pressedColor
        : pixiStoryColors.color;
  const pressed = state === 'pressed';
  const offset = pressed ? 2 : 0;
  const innerX = pressed ? 9 : 12;
  const innerY = pressed ? 8 : 12;

  return [
    {
      type: ShapeType.ROUNDED_RECT,
      style: {
        x: -width / 2 + offset,
        y: -height / 2 + offset,
        width,
        height,
        radius,
        fill,
      },
    },
    {
      type: ShapeType.ROUNDED_RECT,
      style: {
        x: -width / 2 + innerX + offset,
        y: -height / 2 + innerY + offset,
        width: width - 4,
        height: height - 4,
        radius,
        stroke: fill,
        lineWidth: 3,
      },
    },
  ];
}

export function getStoryViewportSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect.width || window.innerWidth || 800)),
    height: Math.max(1, Math.round(rect.height || window.innerHeight || 600)),
  };
}
