import { PerspectiveMesh, MeshSystem } from '../lib';
import { resource } from '@eva/eva.js';

// 全局 pixi.js mock(jest.config moduleNameMapper)没有 PerspectiveMesh,
// 这里局部覆盖一下,把 PIXI.PerspectiveMesh stub 出来,记录 setCorners 调用
// 与 destroy 状态,方便单元断言。
jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  class PerspectiveMeshPixi {
    texture: any;
    verticesX: number;
    verticesY: number;
    destroyed = false;
    corners: number[] | null = null;
    setCornersCalls: number[][] = [];
    parent: any = null;
    constructor(opts: any = {}) {
      this.texture = opts.texture ?? null;
      this.verticesX = opts.verticesX;
      this.verticesY = opts.verticesY;
    }
    setCorners(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
    ) {
      this.corners = [x0, y0, x1, y1, x2, y2, x3, y3];
      this.setCornersCalls.push([x0, y0, x1, y1, x2, y2, x3, y3]);
    }
    destroy() {
      this.destroyed = true;
    }
  }
  return {
    ...pixi,
    PerspectiveMesh: PerspectiveMeshPixi,
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
      child.parent = c;
      return child;
    }),
    removeChild: jest.fn((child: any) => {
      c.children = c.children.filter((x) => x !== child);
      child.parent = null;
      return child;
    }),
  };
  return c;
}

function makeMeshSystem(container: FakeContainer, id = 1) {
  const sys = new MeshSystem();
  // 短路 init:直接挂上 containerManager,不跑真正的 RendererSystem。
  (sys as any).containerManager = {
    getContainer: (gid: number) => (gid === id ? container : null),
  };
  return sys;
}

function dispatchChange(
  sys: MeshSystem,
  type: 'ADD' | 'CHANGE' | 'REMOVE',
  component: PerspectiveMesh,
  options: { id?: number; name?: string } = {},
) {
  const { id = 1, name = 'mesh' } = options;
  return (sys as any).componentChanged({
    componentName: 'PerspectiveMesh',
    type,
    component,
    gameObject: { id, name },
  });
}

// stub resource.getResource → { data: { image: <Texture> } }
function stubResource(image: any) {
  return jest.spyOn(resource, 'getResource').mockResolvedValue({ data: { image } } as any);
}

// flush microtasks 让 system.componentChanged 内部 await 完成
const flush = () => new Promise((r) => setImmediate(r));

describe('Mesh Plugin - 透视网格渲染', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PerspectiveMesh 组件', () => {
    it('应该有正确的 componentName', () => {
      expect(PerspectiveMesh.componentName).toBe('PerspectiveMesh');
      const c = new PerspectiveMesh();
      expect(c.name).toBe('PerspectiveMesh');
    });

    it('未传参时使用默认值:verticesX=10, verticesY=10', () => {
      const c = new PerspectiveMesh();
      expect(c.verticesX).toBe(10);
      expect(c.verticesY).toBe(10);
      expect(c.resource).toBeUndefined();
      expect(c.corners).toBeUndefined();
    });

    it('init 应该解析 resource / verticesX / verticesY / corners', () => {
      const c = new PerspectiveMesh();
      c.init({
        resource: 'card',
        verticesX: 20,
        verticesY: 15,
        corners: { x0: 1, y0: 2, x1: 3, y1: 4, x2: 5, y2: 6, x3: 7, y3: 8 },
      });
      expect(c.resource).toBe('card');
      expect(c.verticesX).toBe(20);
      expect(c.verticesY).toBe(15);
      expect(c.corners).toEqual({ x0: 1, y0: 2, x1: 3, y1: 4, x2: 5, y2: 6, x3: 7, y3: 8 });
    });

    it('init 没传参时不应该改写默认字段', () => {
      const c = new PerspectiveMesh();
      c.init();
      expect(c.verticesX).toBe(10);
      expect(c.verticesY).toBe(10);
      expect(c.resource).toBeUndefined();
      expect(c.corners).toBeUndefined();
    });

    it('setCorners 应该把 8 个角点写入 corners,并自增 _forceUpdate 触发 observer', () => {
      const c = new PerspectiveMesh();
      c.init({ resource: 'card' });
      const before = c._forceUpdate;
      c.setCorners(1, 2, 3, 4, 5, 6, 7, 8);
      expect(c.corners).toEqual({ x0: 1, y0: 2, x1: 3, y1: 4, x2: 5, y2: 6, x3: 7, y3: 8 });
      expect(c._forceUpdate).toBe(before + 1);
    });

    it('多次 setCorners 应该持续累加 _forceUpdate', () => {
      const c = new PerspectiveMesh();
      c.setCorners(0, 0, 100, 0, 100, 100, 0, 100);
      c.setCorners(10, 10, 90, 10, 90, 90, 10, 90);
      c.setCorners(20, 20, 80, 20, 80, 80, 20, 80);
      expect(c._forceUpdate).toBe(3);
      expect(c.corners).toEqual({
        x0: 20, y0: 20, x1: 80, y1: 20, x2: 80, y2: 80, x3: 20, y3: 80,
      });
    });
  });

  describe('MeshSystem 实例化', () => {
    it('systemName 与 name 应该等于 MeshSystem', () => {
      expect(MeshSystem.systemName).toBe('MeshSystem');
      const sys = new MeshSystem();
      expect(sys.name).toBe('MeshSystem');
    });

    it('meshes 默认应该是空记录', () => {
      const sys = new MeshSystem();
      expect((sys as any).meshes).toEqual({});
    });
  });

  describe('MeshSystem ADD / CHANGE / REMOVE 流转', () => {
    it('ADD:应该创建 PIXI.PerspectiveMesh 并挂到 container,异步把 texture 写回 mesh', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const fakeImage = { __id: 'tex-1', width: 400, height: 300 };
      stubResource(fakeImage);

      const comp = new PerspectiveMesh();
      comp.init({
        resource: 'card',
        verticesX: 8,
        verticesY: 6,
        corners: { x0: 0, y0: 0, x1: 100, y1: 0, x2: 100, y2: 100, x3: 0, y3: 100 },
      });

      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const mesh = (sys as any).meshes[1];
      expect(mesh).toBeDefined();
      expect(mesh.verticesX).toBe(8);
      expect(mesh.verticesY).toBe(6);
      // texture 在异步加载完成后被覆盖
      expect(mesh.texture).toBe(fakeImage);
      expect(container.addChildAt).toHaveBeenCalledTimes(1);
      expect(container.addChildAt).toHaveBeenCalledWith(mesh, 0);
      // 显式 corners 应该被原样调用进 setCorners
      expect(mesh.setCornersCalls.length).toBe(1);
      expect(mesh.setCornersCalls[0]).toEqual([0, 0, 100, 0, 100, 100, 0, 100]);
    });

    it('ADD:component.corners 不存在时,应该用 texture 尺寸 fallback (0,0, w,0, w,h, 0,h)', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const fakeImage = { __id: 'tex-1', width: 400, height: 300 };
      stubResource(fakeImage);

      const comp = new PerspectiveMesh();
      comp.init({ resource: 'card' });
      // 显式不设 corners
      expect(comp.corners).toBeUndefined();

      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const mesh = (sys as any).meshes[1];
      expect(mesh.setCornersCalls.length).toBe(1);
      expect(mesh.setCornersCalls[0]).toEqual([0, 0, 400, 0, 400, 300, 0, 300]);
    });

    it('ADD:resource 加载 data 为空时应该 console.error 并跳过 texture/corners 赋值', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      jest.spyOn(resource, 'getResource').mockResolvedValue({ data: null } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const comp = new PerspectiveMesh();
      comp.init({ resource: 'missing' });

      await dispatchChange(sys, 'ADD', comp);
      await flush();

      expect(errSpy).toHaveBeenCalled();
      const mesh = (sys as any).meshes[1];
      // mesh 实例本身仍然挂在 meshes 上(只是没有有效 texture)
      expect(mesh).toBeDefined();
      // setCorners 不应被调用(早 return)
      expect(mesh.setCornersCalls.length).toBe(0);
    });

    it('CHANGE(_forceUpdate):应该重新 getResource 并更新顶点 corners,但不创建新的 mesh 实例', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const firstImage = { __id: 'tex-1', width: 200, height: 100 };
      const secondImage = { __id: 'tex-2', width: 300, height: 150 };
      const getResourceSpy = jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: { image: secondImage } } as any);

      const comp = new PerspectiveMesh();
      comp.init({
        resource: 'card',
        corners: { x0: 0, y0: 0, x1: 100, y1: 0, x2: 100, y2: 100, x3: 0, y3: 100 },
      });

      await dispatchChange(sys, 'ADD', comp);
      await flush();
      const meshAfterAdd = (sys as any).meshes[1];
      expect(meshAfterAdd.texture).toBe(firstImage);
      expect(meshAfterAdd.setCornersCalls.length).toBe(1);

      // 改 corners 后 dispatch CHANGE
      comp.setCorners(10, 10, 90, 10, 90, 90, 10, 90);
      await dispatchChange(sys, 'CHANGE', comp);
      await flush();

      const meshAfterChange = (sys as any).meshes[1];
      // 同一个实例
      expect(meshAfterChange).toBe(meshAfterAdd);
      // texture 被刷新成第二次的
      expect(meshAfterChange.texture).toBe(secondImage);
      // setCorners 应该被再次调用一次
      expect(meshAfterChange.setCornersCalls.length).toBe(2);
      expect(meshAfterChange.setCornersCalls[1]).toEqual([10, 10, 90, 10, 90, 90, 10, 90]);
      expect(getResourceSpy).toHaveBeenCalledTimes(2);
      // CHANGE 不应再次 addChildAt
      expect(container.addChildAt).toHaveBeenCalledTimes(1);
    });

    it('CHANGE:component.corners 不存在时不应调用 setCorners,但仍然刷新 texture', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const firstImage = { __id: 'tex-1', width: 200, height: 100 };
      const secondImage = { __id: 'tex-2', width: 300, height: 150 };
      jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: { image: secondImage } } as any);

      const comp = new PerspectiveMesh();
      comp.init({ resource: 'card' }); // 没有 corners
      await dispatchChange(sys, 'ADD', comp);
      await flush();
      const mesh = (sys as any).meshes[1];
      // ADD fallback 调过一次
      expect(mesh.setCornersCalls.length).toBe(1);

      // 触发 CHANGE,但 comp.corners 仍是 undefined
      await dispatchChange(sys, 'CHANGE', comp);
      await flush();

      // texture 应该刷成第二张
      expect(mesh.texture).toBe(secondImage);
      // CHANGE 分支没有 corners-fallback,setCorners 不应再被调用
      expect(mesh.setCornersCalls.length).toBe(1);
    });

    it('CHANGE(resource):应该重新 getResource 并把新 texture 写到同一个 mesh', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const firstImage = { __id: 'tex-1', width: 200, height: 100 };
      const secondImage = { __id: 'tex-2', width: 400, height: 200 };
      const getResourceSpy = jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: { image: secondImage } } as any);

      const comp = new PerspectiveMesh();
      comp.init({
        resource: 'cardA',
        corners: { x0: 0, y0: 0, x1: 100, y1: 0, x2: 100, y2: 100, x3: 0, y3: 100 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();
      const mesh = (sys as any).meshes[1];
      expect(mesh.texture).toBe(firstImage);

      // 切换 resource
      comp.resource = 'cardB';
      await dispatchChange(sys, 'CHANGE', comp);
      await flush();

      expect(getResourceSpy).toHaveBeenCalledTimes(2);
      expect(getResourceSpy).toHaveBeenLastCalledWith('cardB');
      expect(mesh.texture).toBe(secondImage);
    });

    it('CHANGE:resource 加载失败应该 console.error 并保留旧 texture', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      const firstImage = { __id: 'tex-1', width: 200, height: 100 };
      jest
        .spyOn(resource, 'getResource')
        .mockResolvedValueOnce({ data: { image: firstImage } } as any)
        .mockResolvedValueOnce({ data: null } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const comp = new PerspectiveMesh();
      comp.init({
        resource: 'cardA',
        corners: { x0: 0, y0: 0, x1: 100, y1: 0, x2: 100, y2: 100, x3: 0, y3: 100 },
      });
      await dispatchChange(sys, 'ADD', comp);
      await flush();
      const mesh = (sys as any).meshes[1];
      expect(mesh.texture).toBe(firstImage);

      comp.resource = 'broken';
      await dispatchChange(sys, 'CHANGE', comp);
      await flush();

      expect(errSpy).toHaveBeenCalled();
      // 旧 texture 没有被覆盖
      expect(mesh.texture).toBe(firstImage);
    });

    it('REMOVE:应该 removeChild、destroy PIXI 对象、清掉 meshes 索引', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      stubResource({ __id: 'tex-1', width: 100, height: 100 });

      const comp = new PerspectiveMesh();
      comp.init({ resource: 'card' });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const mesh = (sys as any).meshes[1];
      expect(mesh).toBeDefined();

      await dispatchChange(sys, 'REMOVE', comp);
      await flush();

      expect(container.removeChild).toHaveBeenCalledWith(mesh);
      expect(mesh.destroyed).toBe(true);
      expect((sys as any).meshes[1]).toBeUndefined();
    });

    it('async 资源加载在 REMOVE 之后才回来,asyncId 应该拦截 corners 与 texture 写入', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      // 用永远不会立刻 resolve 的 deferred,模拟 ADD 过程中还没拿到 image 就 REMOVE
      let resolveLoad!: (v: any) => void;
      jest.spyOn(resource, 'getResource').mockImplementation(
        () =>
          new Promise((r) => {
            resolveLoad = r;
          }) as any,
      );

      const comp = new PerspectiveMesh();
      comp.init({
        resource: 'slow',
        corners: { x0: 0, y0: 0, x1: 100, y1: 0, x2: 100, y2: 100, x3: 0, y3: 100 },
      });

      // 触发 ADD,但不 await:加载还没回
      const addP = (sys as any).componentChanged({
        componentName: 'PerspectiveMesh',
        type: 'ADD',
        component: comp,
        gameObject: { id: 1, name: 'mesh' },
      });
      // mesh 已经被创建并挂到 meshes[1],但 texture / setCorners 还没赋值
      const meshDuringLoad = (sys as any).meshes[1];
      expect(meshDuringLoad).toBeDefined();
      expect(meshDuringLoad.setCornersCalls.length).toBe(0);

      // REMOVE 会把 asyncId 自增,使后续 ADD 加载结果失效
      await dispatchChange(sys, 'REMOVE', comp);
      expect((sys as any).meshes[1]).toBeUndefined();

      // 现在让 ADD 的 getResource 返回
      const fakeImage = { __id: 'late', width: 200, height: 200 };
      resolveLoad({ data: { image: fakeImage } });
      await addP;
      await flush();

      // meshes[1] 不应被重新创建
      expect((sys as any).meshes[1]).toBeUndefined();
      // 之前那个 mesh 实例不应再被赋值新的 corners(asyncId 拦截)
      expect(meshDuringLoad.setCornersCalls.length).toBe(0);
    });

    it('非 PerspectiveMesh 组件变更应该被 system 忽略', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      stubResource({ __id: 'tex-1', width: 100, height: 100 });

      await (sys as any).componentChanged({
        componentName: 'NotMesh',
        type: 'ADD',
        component: new PerspectiveMesh(),
        gameObject: { id: 1, name: 'mesh' },
      });
      await flush();

      expect((sys as any).meshes[1]).toBeUndefined();
      expect(container.addChildAt).not.toHaveBeenCalled();
    });
  });

  describe('System destroy', () => {
    it('destroy 应该 removeChild + destroy 所有 mesh,并清空 meshes 表', async () => {
      const container = makeContainer();
      const sys = makeMeshSystem(container);
      stubResource({ __id: 'tex-1', width: 100, height: 100 });

      const comp = new PerspectiveMesh();
      comp.init({ resource: 'card' });
      await dispatchChange(sys, 'ADD', comp);
      await flush();

      const mesh = (sys as any).meshes[1];
      expect(mesh).toBeDefined();

      sys.destroy();

      expect(container.removeChild).toHaveBeenCalledWith(mesh);
      expect(mesh.destroyed).toBe(true);
      expect((sys as any).meshes[1]).toBeUndefined();
    });
  });
});
