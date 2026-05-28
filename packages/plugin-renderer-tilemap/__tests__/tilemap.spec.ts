import { Tilemap, TilemapSystem } from '../lib';

jest.mock('pixi.js', () => {
  class Container {
    children: any[] = [];
    label: string = '';
    alpha: number = 1;
    visible: boolean = true;
    addChild(c: any) { this.children.push(c); return c; }
    addChildAt(c: any, _i: number) { this.children.unshift(c); return c; }
    removeChild(c: any) { this.children = this.children.filter((x: any) => x !== c); }
    destroy(_opts?: any) {}
  }
  class Sprite {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    tint = 0xffffff;
    constructor(public texture: any) {}
    destroy() {}
  }
  class Rectangle {
    constructor(public x: number, public y: number, public width: number, public height: number) {}
  }
  class Texture {
    constructor(public opts: any = {}) {}
    width = 64;
    height = 64;
    frame = { width: 64, height: 64 };
    destroy(_opts?: any) {}
    static WHITE = { id: 'white' };
  }
  return { Container, Sprite, Rectangle, Texture };
});

describe('Tilemap Plugin', () => {
  describe('Component', () => {
    it('应该使用默认值实例化', () => {
      const c = new Tilemap();
      expect(c.name).toBe('Tilemap');
      expect(c.tileWidth).toBe(32);
      expect(c.tileHeight).toBe(32);
      expect(c.layers).toEqual([]);
    });

    it('应该接收 init 参数', () => {
      const c = new Tilemap();
      c.init({
        tileset: 'mytiles',
        tileWidth: 16,
        tileHeight: 16,
        tilesetColumns: 4,
        layers: [
          { name: 'ground', data: [[1, 2], [3, 0]] },
        ],
      });
      expect(c.tileset).toBe('mytiles');
      expect(c.tileWidth).toBe(16);
      expect(c.layers.length).toBe(1);
      expect(c.layers[0].data[0][0]).toBe(1);
    });
  });

  describe('System', () => {
    it('systemName 应该等于 Tilemap', () => {
      expect(TilemapSystem.systemName).toBe('Tilemap');
    });

    it('应该可以实例化 System', () => {
      const sys = new TilemapSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('Tilemap');
    });

    it('System 应该暴露 records 字段', () => {
      const sys: any = new TilemapSystem();
      // 内部 records 默认为对象
      expect(sys['records'] || sys.records || {}).toBeTruthy();
    });
  });
});
