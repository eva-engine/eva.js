import { TilingSprite, TilingSpriteSystem } from '../lib';
import { resource } from '@eva/eva.js';

// 全局 pixi.js mock(jest.config moduleNameMapper)已经把 PIXI.TilingSprite stub 成
// extends Sprite extends Container,有 width/height/destroy/parent/children 等基础属性。
// 这里再补一层局部覆盖,把 TilingSprite 暴露 tilePosition / tileScale 字段,方便断言
// system.setProp 是否真的赋值进 PIXI 对象。
jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  class TilingSpritePixi extends pixi.Sprite {
    tilePosition: any = { x: 0, y: 0 };
    tileScale: any = { x: 1, y: 1 };
    width: number = 0;
    height: number = 0;
    destroyed = false;
    constructor(texture?: any) {
      super(texture);
    }
    destroy(_opts?: any) {
      this.destroyed = true;
    }
  }
  return {
    ...pixi,
    TilingSprite: TilingSpritePixi,
  };
});

// ---- 帮手:伪造 ContainerManager / GameObject / ComponentChanged ----

type FakeContainer = {
  children: any[];
  addChildAt: jest.Mock;
  removeChild: jest.Mock;
};

function makeContainer(): FakeContainer {
  const c: FakeContainer = {
    children: [],
    addChildAt: jest.fn((child: any, _idx: number) => {
      c.children.unshift(child);
      return child;
    }),
    removeChild: jest.fn((child: any) => {
      c.children = c.children.filter((x) => x !== child);
      return child;
    }),
  };
  return c;
}

function makeTilingSpriteSystem(container: FakeContainer, id = 1) {
  const sys = new TilingSpriteSystem();
  // 短路 init:直接挂 containerManager,不跑真正的 RendererSystem。
  (sys as any).containerManager = {
    getContainer: (gid: number) => (gid === id ? container : null),
  };
  return sys;
}

function dispatchChange(
  sys: TilingSpriteSystem,
  type: 'ADD' | 'CHANGE' | 'REMOVE',
  component: TilingSprite,
  options: { id?: number; name?: string; prop?: string[] } = {},
) {
  const { id = 1, name = 'tile', prop = ['resource'] } = options;
  return (sys as any).componentChanged({
    componentName: 'TilingSprite',
    type,
    component,
    gameObject: { id, name },
    prop: { prop, deep: false },
  });
}

// 一份资源 stub:resource.getResource 返回 { data: { image: <Texture> } }
function stubResource(image: any) {
  return jest
    .spyOn(resource, 'getResource')
    .mockResolvedValue({ data: { image } } as any);
}

// 全局 flushPromises:让 system.componentChanged 内部的 await 完成
const flush = () => new Promise((r) => setImmediate(r));

describe('TilingSprite Plugin - 平铺精灵渲染', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('TilingSprite 组件', () => {
    it('应该有正确的 componentName', () => {
      expect(TilingSprite.componentName).toBe('TilingSprite');
      const c = new TilingSprite();
      expect(c.name).toBe('TilingSprite');
    });

    it('未传参时使用默认值:resource 为空字符串、tileScale=(1,1)、tilePosition=(0,0)', () => {
      const c = new TilingSprite();
      expect(c.resource).toBe('');
      expect(c.tileScale).toEqual({ x: 1, y: 1 });
      expect(c.tilePosition).toEqual({ x: 0, y: 0 });
    });

    it('init 应该把所有字段写入组件', () => {
      const c = new TilingSprite();
      c.init({
        resource: 'bgTile',
        tileScale: { x: 2, y: 3 },
        tilePosition: { x: 100, y: 50 },
      });
      expect(c.resource).toBe('bgTile');
      expect(c.tileScale).toEqual({ x: 2, y: 3 });
      expect(c.tilePosition).toEqual({ x: 100, y: 50 });
    });

    it('init 没传参时不应该修改默认字段', () => {
      const c = new TilingSprite();
      c.init();
      expect(c.resource).toBe('');
      expect(c.tileScale).toEqual({ x: 1, y: 1 });
      expect(c.tilePosition).toEqual({ x: 0, y: 0 });
    });
  });

  describe('TilingSpriteSystem 实例化', () => {
    it('name 应该等于 TilingSprite', () => {
      const sys = new TilingSpriteSystem();
      expect(sys.name).toBe('TilingSprite');
    });

    it('imgs 默认应该是空记录', () => {
      const sys = new TilingSpriteSystem();
      expect((sys as any).imgs).toEqual({});
    });
  });

  describe('TilingSpriteSystem ADD / CHANGE / REMOVE 流转', () => {
    it('ADD:应该创建 PIXI.TilingSprite 并挂到 container,setProp 同步 tilePosition/tileScale', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      const fakeImage = { __id: 'tex-1' };
      stubResource(fakeImage);

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 2, y: 3 },
        tilePosition: { x: 11, y: 22 },
      });

      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const sprite = (sys as any).imgs[1];
      expect(sprite).toBeDefined();
      expect(sprite.tilingSprite).toBeDefined();
      expect(sprite.tilingSprite.tilePosition).toEqual({ x: 11, y: 22 });
      expect(sprite.tilingSprite.tileScale).toEqual({ x: 2, y: 3 });
      expect(container.addChildAt).toHaveBeenCalledTimes(1);
      expect(container.addChildAt).toHaveBeenCalledWith(sprite.tilingSprite, 0);
      // 资源加载完成后,_image 应该被 setter 写入
      expect(sprite._image).toBe(fakeImage);
    });

    it('ADD:resource 加载结果为空时应该 console.error 并跳过 image 赋值', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      jest.spyOn(resource, 'getResource').mockResolvedValue({ data: null } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const comp = new TilingSprite();
      comp.init({
        resource: 'missing',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });

      await dispatchChange(sys, 'ADD', comp);
      await flush();

      expect(errSpy).toHaveBeenCalled();
      // 即便资源加载失败,sprite 实例本身仍然挂在 imgs 里(只是没有 image 数据)
      const sprite = (sys as any).imgs[1];
      expect(sprite).toBeDefined();
      expect(sprite._image).toBeNull();
    });

    it('CHANGE(tilePosition):不应触发资源重新加载,只重写 tilePosition/tileScale', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      const getResourceSpy = stubResource({ __id: 'tex-1' });

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();
      expect(getResourceSpy).toHaveBeenCalledTimes(1);

      // 模拟运行期改 tilePosition
      comp.tilePosition = { x: 99, y: 88 };
      await dispatchChange(sys, 'CHANGE', comp, { prop: ['tilePosition'] });
      await flush();

      const sprite = (sys as any).imgs[1];
      expect(sprite.tilingSprite.tilePosition).toEqual({ x: 99, y: 88 });
      // 不应再 getResource:仍然是 1 次
      expect(getResourceSpy).toHaveBeenCalledTimes(1);
    });

    it('CHANGE(tileScale):应该把新 tileScale 写到 PIXI 对象', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      stubResource({ __id: 'tex-1' });

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      comp.tileScale = { x: 4, y: 5 };
      await dispatchChange(sys, 'CHANGE', comp, { prop: ['tileScale'] });
      await flush();

      const sprite = (sys as any).imgs[1];
      expect(sprite.tilingSprite.tileScale).toEqual({ x: 4, y: 5 });
    });

    it('CHANGE(resource):应该重新 getResource 并更新 image', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      const firstImage = { __id: 'tex-1' };
      const secondImage = { __id: 'tex-2' };
      const getResourceSpy = jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: { image: secondImage } } as any);

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();
      expect((sys as any).imgs[1]._image).toBe(firstImage);

      comp.resource = 'newTile';
      await dispatchChange(sys, 'CHANGE', comp, { prop: ['resource'] });
      await flush();

      expect(getResourceSpy).toHaveBeenCalledTimes(2);
      expect((sys as any).imgs[1]._image).toBe(secondImage);
    });

    it('CHANGE(resource):data 为 null 时 console.error 并保留旧 image', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      const firstImage = { __id: 'tex-1' };
      jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: null } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      comp.resource = 'broken';
      await dispatchChange(sys, 'CHANGE', comp, { prop: ['resource'] });
      await flush();

      expect(errSpy).toHaveBeenCalled();
      // 旧 image 未被覆盖
      expect((sys as any).imgs[1]._image).toBe(firstImage);
    });

    it('REMOVE:应该 removeChild 并 destroy PIXI 对象,清掉 imgs 索引', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      stubResource({ __id: 'tex-1' });

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const sprite = (sys as any).imgs[1];
      const pixiObj = sprite.tilingSprite;

      await dispatchChange(sys, 'REMOVE', comp);
      await flush();

      expect(container.removeChild).toHaveBeenCalledWith(pixiObj);
      expect(pixiObj.destroyed).toBe(true);
      expect((sys as any).imgs[1]).toBeUndefined();
    });

    it('async 资源加载在组件已 REMOVE 后回来,应该被 asyncId 拦截不写入 image', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      // 用一个永远不会立刻 resolve 的 deferred,模拟 ADD 之后还没拿到 image 就 REMOVE
      let resolveLoad!: (v: any) => void;
      jest.spyOn(resource, 'getResource').mockImplementation(
        () =>
          new Promise((r) => {
            resolveLoad = r;
          }) as any,
      );

      const comp = new TilingSprite();
      comp.init({
        resource: 'slow',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });

      // 主动触发 ADD,但不 await:加载还没回来
      const addP = (sys as any).componentChanged({
        componentName: 'TilingSprite',
        type: 'ADD',
        component: comp,
        gameObject: { id: 1, name: 'tile' },
        prop: { prop: ['resource'], deep: false },
      });
      // 此时 sprite 已被创建并挂到 imgs[1],但 image 还没赋值
      expect((sys as any).imgs[1]).toBeDefined();

      // REMOVE:增加 asyncId,让稍后回来的 ADD 加载结果失效
      await dispatchChange(sys, 'REMOVE', comp);
      expect((sys as any).imgs[1]).toBeUndefined();

      // 现在让 ADD 的 getResource 返回
      const fakeImage = { __id: 'late' };
      resolveLoad({ data: { image: fakeImage } });
      await addP;
      await flush();

      // imgs[1] 仍然不存在(REMOVE 后没有重新创建);并且加载结果不应该污染状态
      expect((sys as any).imgs[1]).toBeUndefined();
    });
  });

  describe('rendererUpdate', () => {
    it('应该把 transform.size 同步到 PIXI.tilingSprite 的 width/height', async () => {
      const container = makeContainer();
      const sys = makeTilingSpriteSystem(container);
      stubResource({ __id: 'tex-1' });

      const comp = new TilingSprite();
      comp.init({
        resource: 'bgTile',
        tileScale: { x: 1, y: 1 },
        tilePosition: { x: 0, y: 0 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const fakeGO: any = {
        id: 1,
        transform: { size: { width: 320, height: 240 } },
      };
      sys.rendererUpdate(fakeGO);

      const sprite = (sys as any).imgs[1];
      expect(sprite.tilingSprite.width).toBe(320);
      expect(sprite.tilingSprite.height).toBe(240);
    });

    it('imgs 中没有对应实体时不应抛错', () => {
      const sys = new TilingSpriteSystem();
      const fakeGO: any = {
        id: 999,
        transform: { size: { width: 100, height: 100 } },
      };
      expect(() => sys.rendererUpdate(fakeGO)).not.toThrow();
    });
  });
});
