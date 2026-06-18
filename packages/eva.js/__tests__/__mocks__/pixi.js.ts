// 单元测试 stub:eva.js 核心和插件单测不需要真实的 PixiJS;
// 真正渲染相关测试应当在 jsdom + 真实 pixi 的集成层做。
// 这里只导出最小可形态成 import,避免 monorepo 根 node_modules/pixi.js (ESM-only v8)
// 在 ts-jest 解析 require 时报 SyntaxError。

export const Assets = {
  load: jest.fn().mockResolvedValue({}),
  add: jest.fn(),
  loader: { parsers: [] },
  cache: { get: jest.fn(), set: jest.fn(), has: () => false },
  unload: jest.fn().mockResolvedValue(undefined),
};

export enum LoadParserName {
  Texture = 'loadTextures',
  Json = 'loadJson',
  TextureAtlas = 'loadTextureAtlas',
}

// 渲染对象基类 stub
export class Container {
  position = {
    x: 0,
    y: 0,
    set: function (x: number, y: number) {
      (this as any).x = x;
      (this as any).y = y;
    },
  };
  scale = {
    x: 1,
    y: 1,
    set: function (x: number, y: number) {
      (this as any).x = x;
      (this as any).y = y;
    },
  };
  pivot = {
    x: 0,
    y: 0,
    set: function (x: number, y: number) {
      (this as any).x = x;
      (this as any).y = y;
    },
  };
  rotation = 0;
  alpha = 1;
  visible = true;
  zIndex = 0;
  width = 0;
  height = 0;
  children: any[] = [];
  parent: any = null;
  addChild(c: any) {
    this.children.push(c);
    c.parent = this;
    return c;
  }
  removeChild(c: any) {
    const i = this.children.indexOf(c);
    if (i >= 0) this.children.splice(i, 1);
    c.parent = null;
    return c;
  }
  destroy() {}
  updateTransform() {}
  toGlobal(p: any) {
    return p;
  }
  toLocal(p: any) {
    return p;
  }
}
export class Texture {
  static EMPTY = new Texture();
  static WHITE = new Texture();
  static from() {
    return new Texture();
  }
  destroy() {}
}
export class Sprite extends Container {
  texture: Texture;
  constructor(texture = Texture.EMPTY) {
    super();
    this.texture = texture;
  }
  static from() {
    return new Sprite(Texture.from());
  }
}
export class Text extends Container {
  text = '';
  style = {};
  constructor(options?: string | { text?: string; style?: any }) {
    super();
    if (typeof options === 'string') {
      this.text = options;
    } else {
      this.text = options?.text ?? '';
      this.style = options?.style ?? {};
    }
  }
}
export class BitmapText extends Text {
  constructor(options?: string | { text?: string; style?: any }) {
    super(options);
  }
}
export const BitmapFontManager = {
  install: jest.fn(),
};
export class HTMLText extends Text {}
export class TilingSprite extends Sprite {}
export class NineSliceSprite extends Sprite {}
export class AnimatedSprite extends Sprite {
  animationSpeed = 1;
  currentFrame = 0;
  playing = false;
  textures: any[];
  constructor(frames: any[] = []) {
    super();
    this.textures = frames;
  }
  play() {
    this.playing = true;
  }
  stop() {
    this.playing = false;
  }
  gotoAndPlay(frameNumber: number) {
    this.currentFrame = frameNumber;
    this.play();
  }
  gotoAndStop(frameNumber: number) {
    this.currentFrame = frameNumber;
    this.stop();
  }
}
export class Graphics extends Container {
  rect() {
    return this;
  }
  circle() {
    return this;
  }
  poly() {
    return this;
  }
  moveTo() {
    return this;
  }
  lineTo() {
    return this;
  }
  fill() {
    return this;
  }
  stroke() {
    return this;
  }
  clear() {
    return this;
  }
}
export class FillGradient {
  stops: Array<{ ratio: number; color: number }> = [];
  constructor(public x0 = 0, public y0 = 0, public x1 = 0, public y1 = 0) {}
  addColorStop(ratio: number, color: number) {
    this.stops.push({ ratio, color });
  }
}
export class Color {
  static shared = new Color();
  value: any = 0;
  setValue(value: any) {
    this.value = value;
    return this;
  }
  toNumber() {
    return typeof this.value === 'number' ? this.value : 0;
  }
}
export class TextStyle {
  static defaultTextStyle = { fontSize: 26 };
}
export class Application {
  stage = new Container();
  renderer: any = { resize: jest.fn(), destroy: jest.fn() };
  init = jest.fn().mockResolvedValue(undefined);
  destroy = jest.fn();
}
export const settings = {};
export const Point = class {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
};
export const Rectangle = class {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
};
export const Circle = class {
  x = 0;
  y = 0;
  radius = 0;
};
export const Polygon = class {
  points: number[] = [];
};

// default export 兜底
export default {
  Assets,
  LoadParserName,
  Container,
  Sprite,
  Text,
  BitmapText,
  BitmapFontManager,
  HTMLText,
  TilingSprite,
  NineSliceSprite,
  AnimatedSprite,
  Graphics,
  Texture,
  FillGradient,
  Color,
  TextStyle,
  Application,
  Point,
  Rectangle,
  Circle,
  Polygon,
};
