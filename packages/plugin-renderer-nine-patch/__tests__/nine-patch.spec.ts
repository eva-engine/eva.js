/**
 * @eva/plugin-renderer-nine-patch 单元测试
 *
 * 覆盖范围:
 * - NinePatch 组件 init 字段解析
 * - NinePatchSystem componentChanged ADD / CHANGE / REMOVE 三分支
 * - rendererUpdate 把 transform.size 写入 NineSliceSprite
 * - 资源加载失败 / 异步竞态防护
 * - resource 切换走 REMOVE+ADD 重建
 *
 * 渲染层底层 (PixiJS NineSliceSprite) 由 jest 全局 mock
 * (`packages/eva.js/__tests__/__mocks__/pixi.js.ts`) stub,
 * 这里不再重复 mock pixi.js;但额外 mock 了 resource.getResource
 * 用 spy 控制返回值。
 */

import { resource, OBSERVER_TYPE, RESOURCE_TYPE } from '@eva/eva.js';
import { NinePatch, NinePatchSystem } from '../lib';

// 显式 mock @eva/renderer-adapter 的 NinePatch,这样我们能记录构造器参数,
// 并避免真的去构造 PixiJS NineSliceSprite (虽然它已经被 jest 全局 stub)。
jest.mock('@eva/renderer-adapter', () => {
  const actual = jest.requireActual('@eva/renderer-adapter');
  class FakeNinePatchSprite {
    width = 0;
    height = 0;
    img: any;
    leftWidth: number;
    topHeight: number;
    rightWidth: number;
    bottomHeight: number;
    parent: any = null;
    destroy = jest.fn();
    constructor(img: any, leftWidth: number, topHeight: number, rightWidth: number, bottomHeight: number) {
      this.img = img;
      this.leftWidth = leftWidth;
      this.topHeight = topHeight;
      this.rightWidth = rightWidth;
      this.bottomHeight = bottomHeight;
    }
  }
  return {
    ...actual,
    NinePatch: FakeNinePatchSprite,
  };
});

// ----- 工具:构造一个能让 NinePatchSystem 工作的 fake gameObject + container -----

interface FakeContainer {
  children: any[];
  addChildAt: jest.Mock;
  removeChild: jest.Mock;
}

function makeContainer(): FakeContainer {
  const children: any[] = [];
  return {
    children,
    addChildAt: jest.fn((child: any, _idx: number) => {
      children.push(child);
      return child;
    }),
    removeChild: jest.fn((child: any) => {
      const i = children.indexOf(child);
      if (i >= 0) children.splice(i, 1);
      return child;
    }),
  };
}

function makeGameObject(id: number, name: string, size = { width: 200, height: 80 }) {
  return {
    id,
    name,
    transform: {
      size,
    },
  } as any;
}

// 给 system 注入 containerManager mock
function attachContainerManager(system: NinePatchSystem, containerOf: (id: number) => FakeContainer) {
  (system as any).containerManager = {
    getContainer: jest.fn((id: number) => containerOf(id)),
  };
}

/**
 * NinePatchSystem.componentChanged 是 async 但内部对 this.add() 是 fire-and-forget
 * (不 await),所以调用方 `await componentChanged(...)` 仍会立刻返回,
 * 真正的 sprite 创建发生在 add() 的 microtask 里。这里用一个 helper 把
 * resource.getResource 的 mock promise + add() 后续同步代码一并 flush 完。
 */
async function flushAdd() {
  // 多放几次 microtask 让 add() 内部 await 链全部跑完
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

/** 触发 componentChanged 并等到内部 add() / remove() async 链跑完 */
async function dispatch(
  sys: NinePatchSystem,
  type: any,
  component: NinePatch,
  gameObject: any,
) {
  await sys.componentChanged({ type, component, componentName: 'NinePatch', gameObject } as any);
  await flushAdd();
}

describe('@eva/plugin-renderer-nine-patch', () => {
  let getResourceSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // 默认所有 resource.getResource 走 image 通路并返回一张 fake texture data
    getResourceSpy = jest.spyOn(resource, 'getResource').mockResolvedValue({
      type: RESOURCE_TYPE.IMAGE,
      data: { image: { __fakeTexture: true } },
      instance: undefined,
    } as any);
  });

  afterEach(() => {
    getResourceSpy.mockRestore();
  });

  // -------- NinePatch 组件 --------

  describe('NinePatch 组件', () => {
    it('应有正确的 componentName', () => {
      expect((NinePatch as any).componentName).toBe('NinePatch');
    });

    it('init 应解析所有 9 切片字段', () => {
      const np = new NinePatch();
      np.init({
        resource: 'btnBg',
        spriteName: 'normal.png',
        leftWidth: 12,
        topHeight: 14,
        rightWidth: 16,
        bottomHeight: 18,
      });
      expect(np.resource).toBe('btnBg');
      expect(np.spriteName).toBe('normal.png');
      expect(np.leftWidth).toBe(12);
      expect(np.topHeight).toBe(14);
      expect(np.rightWidth).toBe(16);
      expect(np.bottomHeight).toBe(18);
    });

    it('init 不传参数时不抛错且字段保持默认 0/空字符串', () => {
      const np = new NinePatch();
      expect(() => np.init()).not.toThrow();
      expect(np.resource).toBe('');
      expect(np.spriteName).toBe('');
      expect(np.leftWidth).toBe(0);
      expect(np.topHeight).toBe(0);
      expect(np.rightWidth).toBe(0);
      expect(np.bottomHeight).toBe(0);
    });
  });

  // -------- NinePatchSystem 基本属性 --------

  describe('NinePatchSystem 元信息', () => {
    it('应有正确的 systemName 和 name', () => {
      const sys = new NinePatchSystem();
      expect((NinePatchSystem as any).systemName).toBe('NinePatch');
      expect(sys.name).toBe('NinePatch');
    });

    it('ninePatch 字典初始为空', () => {
      const sys = new NinePatchSystem();
      expect(sys.ninePatch).toEqual({});
    });
  });

  // -------- componentChanged ADD --------

  describe('componentChanged ADD', () => {
    it('ADD 分支:成功加载 image 资源后创建 NineSliceSprite 并 addChildAt(0)', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'btnBg',
        leftWidth: 10,
        topHeight: 12,
        rightWidth: 10,
        bottomHeight: 12,
      });
      const gameObject = makeGameObject(1, 'btn');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);

      const np = sys.ninePatch[1];
      expect(np).toBeDefined();
      // 切片参数要透传给底层 sprite
      expect((np as any).leftWidth).toBe(10);
      expect((np as any).topHeight).toBe(12);
      expect((np as any).rightWidth).toBe(10);
      expect((np as any).bottomHeight).toBe(12);

      // 写回组件实例
      expect(component.ninePatch).toBe(np);
      // 挂载到该 gameObject 的 container 0 号位置
      expect(container.addChildAt).toHaveBeenCalledTimes(1);
      expect(container.addChildAt).toHaveBeenCalledWith(np, 0);
      expect(container.children[0]).toBe(np);
    });

    it('ADD 分支:resource 加载失败 (data 为空) 不创建 sprite,console.error 提示', async () => {
      getResourceSpy.mockResolvedValueOnce({
        type: RESOURCE_TYPE.IMAGE,
        data: undefined,
        instance: undefined,
      } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'missing',
        leftWidth: 1,
        topHeight: 1,
        rightWidth: 1,
        bottomHeight: 1,
      });
      const gameObject = makeGameObject(2, 'panel');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);

      expect(sys.ninePatch[2]).toBeUndefined();
      expect(container.addChildAt).not.toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining("panel's NinePatch resource load error"),
      );
      errSpy.mockRestore();
    });

    it('ADD 分支:SPRITE 资源没有 instance 时打 error 不创建', async () => {
      getResourceSpy.mockResolvedValueOnce({
        type: RESOURCE_TYPE.SPRITE,
        data: { image: { __fakeTexture: true } },
        instance: undefined,
      } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'atlas',
        spriteName: 'icon.png',
        leftWidth: 4,
        topHeight: 4,
        rightWidth: 4,
        bottomHeight: 4,
      });
      const gameObject = makeGameObject(3, 'atlasPanel');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);

      expect(sys.ninePatch[3]).toBeUndefined();
      expect(container.addChildAt).not.toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('ADD 分支:SPRITE 资源 + spriteName 时从 instance 中按拼接 key 取 frame texture', async () => {
      const fakeFrameTexture = { __frameTexture: 'normal.png' };
      const resourceKeySplit = '_s|r|c_';
      getResourceSpy.mockResolvedValueOnce({
        type: RESOURCE_TYPE.SPRITE,
        data: { image: { __fakeTexture: true } },
        instance: {
          [`atlas${resourceKeySplit}normal.png`]: fakeFrameTexture,
        },
      } as any);
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'atlas',
        spriteName: 'normal.png',
        leftWidth: 5,
        topHeight: 5,
        rightWidth: 5,
        bottomHeight: 5,
      });
      const gameObject = makeGameObject(4, 'atlasOK');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);

      const np = sys.ninePatch[4];
      expect(np).toBeDefined();
      // 我们 mock 的 NinePatchSprite 把 img 直接保存,这里能验证用了 frame texture
      expect((np as any).img).toBe(fakeFrameTexture);
    });
  });

  // -------- rendererUpdate --------

  describe('rendererUpdate', () => {
    it('应当把 transform.size 写到对应实体的 nine-patch 实例 width/height', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'btnBg',
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,
      });
      const gameObject = makeGameObject(7, 'btn', { width: 100, height: 40 });

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);

      // 模拟 transform 在画布交互中变更尺寸
      gameObject.transform.size = { width: 320, height: 96 };
      sys.rendererUpdate(gameObject);

      const np = sys.ninePatch[7];
      expect(np.width).toBe(320);
      expect(np.height).toBe(96);
    });

    it('rendererUpdate 对没有对应实例的 gameObject 静默忽略', () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      // 没有先调用过 ADD,直接 rendererUpdate 不应抛
      expect(() =>
        sys.rendererUpdate(makeGameObject(99, 'ghost', { width: 1, height: 1 })),
      ).not.toThrow();
    });
  });

  // -------- componentChanged REMOVE --------

  describe('componentChanged REMOVE', () => {
    it('REMOVE 分支:从 container 移除并 destroy 实例,清空字典', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'btnBg',
        leftWidth: 8,
        topHeight: 8,
        rightWidth: 8,
        bottomHeight: 8,
      });
      const gameObject = makeGameObject(11, 'card');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);
      const np = sys.ninePatch[11];
      expect(np).toBeDefined();

      sys.componentChanged({
        type: OBSERVER_TYPE.REMOVE,
        component,
        componentName: 'NinePatch',
        gameObject,
      } as any);

      expect(container.removeChild).toHaveBeenCalledWith(np);
      expect((np as any).destroy).toHaveBeenCalledWith({ children: true });
      expect(sys.ninePatch[11]).toBeUndefined();
    });

    it('REMOVE 分支:实例不存在时不抛错', () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      expect(() =>
        sys.componentChanged({
          type: OBSERVER_TYPE.REMOVE,
          component: new NinePatch(),
          componentName: 'NinePatch',
          gameObject: makeGameObject(404, 'missing'),
        } as any),
      ).not.toThrow();
    });
  });

  // -------- componentChanged CHANGE (= REMOVE + ADD) --------

  describe('componentChanged CHANGE', () => {
    it('CHANGE 分支:旧 sprite 被销毁,新 sprite 用新切片重新创建', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'btnBg',
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,
      });
      const gameObject = makeGameObject(21, 'btn');

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);
      const oldSprite = sys.ninePatch[21];
      expect(oldSprite).toBeDefined();

      // 修改切片宽度,触发 CHANGE
      component.leftWidth = 30;
      component.rightWidth = 30;

      await dispatch(sys, OBSERVER_TYPE.CHANGE, component, gameObject);

      const newSprite = sys.ninePatch[21];
      // 必须是不同的实例 (被重建)
      expect(newSprite).not.toBe(oldSprite);
      // 旧的应当已经 destroy
      expect((oldSprite as any).destroy).toHaveBeenCalled();
      // 新的切片宽度生效
      expect((newSprite as any).leftWidth).toBe(30);
      expect((newSprite as any).rightWidth).toBe(30);
    });

    it('CHANGE 分支:更换 resource 也走 REMOVE+ADD 通路', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'oldBg',
        leftWidth: 5,
        topHeight: 5,
        rightWidth: 5,
        bottomHeight: 5,
      });
      const gameObject = makeGameObject(31, 'panel');

      // 第一次 ADD 用 oldBg
      const firstImage = { __img: 'old' };
      getResourceSpy.mockResolvedValueOnce({
        type: RESOURCE_TYPE.IMAGE,
        data: { image: firstImage },
        instance: undefined,
      } as any);

      await dispatch(sys, OBSERVER_TYPE.ADD, component, gameObject);
      expect((sys.ninePatch[31] as any).img).toBe(firstImage);

      // CHANGE 切换 resource
      component.resource = 'newBg';
      const secondImage = { __img: 'new' };
      getResourceSpy.mockResolvedValueOnce({
        type: RESOURCE_TYPE.IMAGE,
        data: { image: secondImage },
        instance: undefined,
      } as any);

      await dispatch(sys, OBSERVER_TYPE.CHANGE, component, gameObject);

      // 新 sprite 用了新 image
      expect((sys.ninePatch[31] as any).img).toBe(secondImage);
      // resource 也应当被 getResource 用 newBg 调到
      expect(getResourceSpy).toHaveBeenLastCalledWith('newBg');
    });
  });

  // -------- 异步竞态防护 --------

  describe('异步竞态', () => {
    it('快速 ADD->REMOVE->ADD:旧的 ADD 异步回来时 asyncId 不匹配,不会写入字典', async () => {
      const sys = new NinePatchSystem();
      const container = makeContainer();
      attachContainerManager(sys, () => container);

      const component = new NinePatch();
      component.init({
        resource: 'flicker',
        leftWidth: 4,
        topHeight: 4,
        rightWidth: 4,
        bottomHeight: 4,
      });
      const gameObject = makeGameObject(51, 'flicker');

      // 让第一次 getResource 永远不 resolve,直到我们手动放行
      let releaseFirst!: (v: any) => void;
      getResourceSpy.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            releaseFirst = resolve;
          }),
      );

      const addPromise = sys.componentChanged({
        type: OBSERVER_TYPE.ADD,
        component,
        componentName: 'NinePatch',
        gameObject,
      } as any);

      // 在第一次 resource 未回来前,触发 REMOVE 把 asyncId 推进
      sys.componentChanged({
        type: OBSERVER_TYPE.REMOVE,
        component,
        componentName: 'NinePatch',
        gameObject,
      } as any);

      // 现在让第一次 ADD 的 resource 回来,但它的 asyncId 已经过期
      releaseFirst({
        type: RESOURCE_TYPE.IMAGE,
        data: { image: { __img: 'stale' } },
        instance: undefined,
      });
      await addPromise;

      // 旧 ADD 不能复活已经 REMOVE 掉的 sprite
      expect(sys.ninePatch[51]).toBeUndefined();
    });
  });
});
