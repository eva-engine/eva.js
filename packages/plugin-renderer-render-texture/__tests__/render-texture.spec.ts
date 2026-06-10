import { RenderTexture, RenderTextureSystem } from '../lib';

jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  class FakeContainer {
    children: any[] = [];
    addChild(c: any) {
      this.children.push(c);
      return c;
    }
    addChildAt(c: any, _i: number) {
      this.children.push(c);
      return c;
    }
    removeChild(c: any) {
      this.children = this.children.filter(x => x !== c);
    }
    destroy() {}
  }
  class FakeGraphics extends FakeContainer {
    rect() {
      return this;
    }
    fill() {
      return this;
    }
  }
  class FakeSprite extends FakeContainer {
    width = 1;
    height = 1;
    alpha = 1;
    tint = 0xffffff;
    rotation = 0;
    anchor = { set: jest.fn() };
    scale = { set: jest.fn() };
    x = 0;
    y = 0;
    constructor(public texture?: any) {
      super();
    }
  }
  class FakeText extends FakeContainer {
    x = 0;
    y = 0;
    constructor(public opts?: any) {
      super();
    }
  }
  class FakeRT {
    width = 0;
    height = 0;
    constructor(opts: any) {
      this.width = opts.width;
      this.height = opts.height;
    }
    static create(opts: any) {
      return new FakeRT(opts);
    }
    destroy() {}
    resize(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
  }
  return {
    ...pixi,
    RenderTexture: FakeRT,
    Sprite: FakeSprite,
    Texture: pixi.Texture,
    Container: FakeContainer,
    Graphics: FakeGraphics,
    Text: FakeText,
  };
});

describe('RenderTexture Plugin - 渲染纹理', () => {
  describe('Component', () => {
    it('应该使用默认值实例化', () => {
      const c = new RenderTexture();
      expect(c.name).toBe('RenderTexture');
      expect(c.width).toBe(256);
      expect(c.height).toBe(256);
      expect(c.ops).toEqual([]);
      expect(c.append).toBe(true);
    });

    it('应该接收 init 参数', () => {
      const c = new RenderTexture();
      c.init({
        width: 400,
        height: 300,
        ops: [{ type: 'fill', color: 0xff0000 }],
        saveAs: 'rt-canvas',
        backgroundColor: 0x000000,
      });
      expect(c.width).toBe(400);
      expect(c.height).toBe(300);
      expect(c.ops).toHaveLength(1);
      expect(c.saveAs).toBe('rt-canvas');
    });

    it('addOp 应该追加 op 并 bump dirty', () => {
      const c = new RenderTexture();
      c.init({ width: 100, height: 100 });
      const before = c.dirty;
      c.addOp({ type: 'fill', color: 0x00ff00 });
      expect(c.ops).toHaveLength(1);
      expect(c.dirty).toBe(before + 1);
    });

    it('clearOps 应该重置 ops 为单条 clear', () => {
      const c = new RenderTexture();
      c.init({ width: 100, height: 100, ops: [{ type: 'fill', color: 0xff0000 }] });
      c.clearOps();
      expect(c.ops).toHaveLength(1);
      expect(c.ops[0].type).toBe('clear');
    });
  });

  describe('System', () => {
    it('systemName 应该等于 RenderTexture', () => {
      expect(RenderTextureSystem.systemName).toBe('RenderTexture');
    });

    it('应该可以实例化 System', () => {
      const sys = new RenderTextureSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('RenderTexture');
    });
  });
});
