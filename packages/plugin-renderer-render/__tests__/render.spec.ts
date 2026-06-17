/**
 * @eva/plugin-renderer-render unit tests
 *
 * 验证 Render 组件 + RenderSystem(继承 Renderer)的最小集成:
 *   - Render 组件 init 解析 alpha/visible/zIndex/sortableChildren/resolution
 *   - RenderSystem 在 ADD/CHANGE/REMOVE 三类 ComponentChanged 下,
 *     通过 ContainerManager.getContainer(go.id) 同步 alpha/visible/zIndex
 *   - resolution 字段会通过 requestAnimationFrame 应用到容器子对象
 *   - REMOVE 路径会把 container.alpha 复位到 1
 *
 * 这里不引导真实 RendererSystem 异步 init(避开 Pixi Application/Ticker),
 * 而是构造一个最小集成:RendererSystem 容器 + 真实 ContainerManager +
 * 真实 RendererManager,只 mock canvas;RenderSystem 走真实 register/observer。
 */

import { GameObject, OBSERVER_TYPE, ComponentChanged } from '@eva/eva.js';
import { Container } from 'pixi.js';
import { ContainerManager, RendererManager, RendererSystem } from '@eva/plugin-renderer';
import { Render, RenderSystem } from '../lib';

// 用真实的 pixi.js 单测 stub(已通过 jest.config moduleNameMapper 接管),
// 它给 Container 提供 alpha/visible/zIndex 字段,可以做断言。

describe('Render Plugin - 渲染属性控制', () => {
  let renderSystem: RenderSystem;
  let containerManager: ContainerManager;
  let rendererManager: RendererManager;

  /**
   * 构造一个最小 RendererSystem-like:真实 ContainerManager + RendererManager,
   * 只 mock canvas / application / game。这样 RenderSystem.init 拿到的
   * renderSystem.rendererManager 是真的,register 之后 RenderSystem 会被
   * 注入 game/rendererManager/containerManager 三件套。
   */
  function buildRendererHost() {
    const mockCanvas = document.createElement('canvas');
    const mockGame: any = {
      canvas: mockCanvas,
      scene: { gameObjects: [] },
      gameObjects: [],
    };

    containerManager = new ContainerManager();
    // 临时占位,RendererManager 内部持有 rendererSystem 引用,稍后再回填
    const host: any = { containerManager, rendererManager: null, game: mockGame };
    rendererManager = new RendererManager({ game: mockGame, rendererSystem: host });
    host.rendererManager = rendererManager;

    // RenderSystem.init 内部 game.getSystem(RendererSystem) -> 返回 host
    mockGame.getSystem = (ctor: any) => {
      if (ctor && (ctor.systemName === 'Renderer' || ctor === RendererSystem)) {
        return host;
      }
      return null;
    };

    return { mockGame, host };
  }

  /**
   * 构造一个 GameObject,并往 ContainerManager 注册一个 pixi.js Container,
   * 模拟 Transform.componentChanged(ADD) 后的 container 注册结果。
   */
  function makeGameObject(name: string): { go: GameObject; container: Container } {
    const go = new GameObject(name);
    const container = new Container();
    containerManager.addContainer({ name: go.id, container, gameObject: go });
    return { go, container };
  }

  /**
   * 构造一个 ComponentChanged 事件,直接喂给 RenderSystem。
   * 真实链路里这是 RendererManager.componentChanged 派发过来的。
   */
  function makeChange(
    type: typeof OBSERVER_TYPE[keyof typeof OBSERVER_TYPE],
    go: GameObject,
    component: Render,
    propPath?: string[],
  ): ComponentChanged {
    return {
      type,
      component,
      componentName: 'Render',
      gameObject: go,
      prop: propPath ? { prop: propPath, deep: false } : undefined,
    } as ComponentChanged;
  }

  beforeEach(() => {
    const { mockGame } = buildRendererHost();
    renderSystem = new RenderSystem();
    // System.init 期望 game 已经存在
    renderSystem.game = mockGame;
    renderSystem.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (renderSystem && (renderSystem as any).destroy) {
      try {
        (renderSystem as any).destroy();
      } catch {
        // ignore
      }
    }
  });

  describe('Render 组件参数解析', () => {
    it('应该用所有字段默认值实例化', () => {
      const render = new Render();
      // Component.init 通常由 GameObject.addComponent 调用,这里手工触发
      render.init();
      expect(render.name).toBe('Render');
      expect(render.alpha).toBe(1);
      expect(render.visible).toBe(true);
      expect(render.zIndex).toBe(0);
      expect(render.sortableChildren).toBe(false);
      expect(render.resolution).toBe(1);
    });

    it('init(params) 应该完整解析 alpha/visible/zIndex/sortableChildren/resolution', () => {
      const render = new Render({
        alpha: 0.42,
        visible: false,
        zIndex: 7,
        sortableChildren: true,
        resolution: 2,
      });
      render.init({
        alpha: 0.42,
        visible: false,
        zIndex: 7,
        sortableChildren: true,
        resolution: 2,
      });
      expect(render.alpha).toBe(0.42);
      expect(render.visible).toBe(false);
      expect(render.zIndex).toBe(7);
      expect(render.sortableChildren).toBe(true);
      expect(render.resolution).toBe(2);
    });
  });

  describe('RenderSystem 注册与 observerInfo', () => {
    it('应该携带正确的 systemName / observerInfo', () => {
      // RenderSystem class systemName 是 'Render'
      expect((RenderSystem as any).systemName).toBe('Render');
      // 通过 @decorators.componentObserver 注入的 observerInfo
      const observed = (renderSystem as any).observerInfo;
      expect(observed).toBeDefined();
      expect(observed.Render).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ prop: ['zIndex'] }),
          expect.objectContaining({ prop: ['resolution'] }),
        ]),
      );
    });

    it('init 后应该被 register 进 RendererManager,并被注入 containerManager', () => {
      expect(rendererManager.renderers).toContain(renderSystem);
      expect((renderSystem as any).containerManager).toBe(containerManager);
      expect((renderSystem as any).rendererManager).toBe(rendererManager);
    });
  });

  describe('rendererUpdate 把 Render 字段同步到 PIXI.Container', () => {
    it('alpha=0.5 / visible=false / zIndex=10 经过 rendererUpdate 后会落到 container', () => {
      const { go, container } = makeGameObject('alpha-go');
      const render = new Render({
        alpha: 0.5,
        visible: false,
        zIndex: 10,
      });
      render.init({ alpha: 0.5, visible: false, zIndex: 10 });
      go.addComponent(render);

      (renderSystem as any).rendererUpdate(go);

      expect(container.alpha).toBe(0.5);
      expect(container.visible).toBe(false);
      expect(container.zIndex).toBe(10);
    });

    it('修改 render.alpha 后,再次 rendererUpdate 把新值推给 container', () => {
      const { go, container } = makeGameObject('alpha-mut');
      const render = new Render();
      render.init();
      go.addComponent(render);

      (renderSystem as any).rendererUpdate(go);
      expect(container.alpha).toBe(1);

      render.alpha = 0.25;
      (renderSystem as any).rendererUpdate(go);
      expect(container.alpha).toBe(0.25);
    });

    it('visible 切换:true → false → true 都能落到 container', () => {
      const { go, container } = makeGameObject('vis');
      const render = new Render();
      render.init();
      go.addComponent(render);

      (renderSystem as any).rendererUpdate(go);
      expect(container.visible).toBe(true);

      render.visible = false;
      (renderSystem as any).rendererUpdate(go);
      expect(container.visible).toBe(false);

      render.visible = true;
      (renderSystem as any).rendererUpdate(go);
      expect(container.visible).toBe(true);
    });

    it('zIndex 变化经 rendererUpdate 落到 container.zIndex', () => {
      const { go, container } = makeGameObject('zidx');
      const render = new Render({ zIndex: 0 });
      render.init({ zIndex: 0 });
      go.addComponent(render);

      (renderSystem as any).rendererUpdate(go);
      expect(container.zIndex).toBe(0);

      render.zIndex = 99;
      (renderSystem as any).rendererUpdate(go);
      expect(container.zIndex).toBe(99);
    });
  });

  describe('componentChanged ADD 路径', () => {
    it('ADD 事件:有父 Render 时应该把父级 sortDirty 标记为 true', () => {
      const parent = new GameObject('parent');
      const parentRender = new Render();
      parentRender.init();
      parent.addComponent(parentRender);

      const child = new GameObject('child');
      const childRender = new Render({ zIndex: 5 });
      childRender.init({ zIndex: 5 });
      child.addComponent(childRender);

      // 建立父子关系(走 GameObject.addChild,内部会设置 transform.parent)
      parent.addChild(child);
      expect(child.parent).toBe(parent);

      // 注册容器(模拟 Transform 阶段)
      containerManager.addContainer({ name: parent.id, container: new Container(), gameObject: parent });
      containerManager.addContainer({ name: child.id, container: new Container(), gameObject: child });

      expect(parentRender.sortDirty).toBe(false);
      (renderSystem as any).componentChanged(makeChange(OBSERVER_TYPE.ADD, child, childRender));
      expect(parentRender.sortDirty).toBe(true);
    });

    it('ADD 事件:resolution>0 时会调度到 requestAnimationFrame 给子对象赋 resolution', () => {
      const { go, container } = makeGameObject('reso');
      const child1: any = { resolution: 1 };
      const child2: any = { resolution: 1 };
      container.children.push(child1, child2);

      const render = new Render({ resolution: 2 });
      render.init({ resolution: 2 });
      go.addComponent(render);

      const rafSpy = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback): number => {
          cb(performance.now());
          return 0;
        });

      (renderSystem as any).componentChanged(makeChange(OBSERVER_TYPE.ADD, go, render));

      expect(rafSpy).toHaveBeenCalled();
      expect(child1.resolution).toBe(2);
      expect(child2.resolution).toBe(2);

      rafSpy.mockRestore();
    });
  });

  describe('componentChanged CHANGE 路径', () => {
    it('CHANGE zIndex:有父 Render 时应该把父级 sortDirty 标记为 true', () => {
      const parent = new GameObject('parent2');
      const parentRender = new Render();
      parentRender.init();
      parent.addComponent(parentRender);

      const child = new GameObject('child2');
      const childRender = new Render();
      childRender.init();
      child.addComponent(childRender);
      parent.addChild(child);

      containerManager.addContainer({ name: parent.id, container: new Container(), gameObject: parent });
      containerManager.addContainer({ name: child.id, container: new Container(), gameObject: child });

      parentRender.sortDirty = false;
      childRender.zIndex = 12;
      (renderSystem as any).componentChanged(
        makeChange(OBSERVER_TYPE.CHANGE, child, childRender, ['zIndex']),
      );
      expect(parentRender.sortDirty).toBe(true);
    });

    it('CHANGE resolution:重新调度 requestAnimationFrame 把新 resolution 推给 children', () => {
      const { go, container } = makeGameObject('reso-change');
      const child: any = { resolution: 1 };
      container.children.push(child);

      const render = new Render({ resolution: 1 });
      render.init({ resolution: 1 });
      go.addComponent(render);

      const rafSpy = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback): number => {
          cb(performance.now());
          return 0;
        });

      render.resolution = 3;
      (renderSystem as any).componentChanged(
        makeChange(OBSERVER_TYPE.CHANGE, go, render, ['resolution']),
      );

      expect(rafSpy).toHaveBeenCalled();
      expect(child.resolution).toBe(3);

      rafSpy.mockRestore();
    });
  });

  describe('componentChanged REMOVE 路径', () => {
    it('REMOVE 事件应该把 container.alpha 复位到 1', () => {
      const { go, container } = makeGameObject('rm');
      const render = new Render({ alpha: 0.3 });
      render.init({ alpha: 0.3 });
      go.addComponent(render);

      (renderSystem as any).rendererUpdate(go);
      expect(container.alpha).toBe(0.3);

      (renderSystem as any).componentChanged(makeChange(OBSERVER_TYPE.REMOVE, go, render));
      expect(container.alpha).toBe(1);
    });
  });

  describe('sortableChildren 字段语义', () => {
    it('Render 组件保留 sortableChildren 配置(由上层渲染逻辑读取,不由 RenderSystem.rendererUpdate 推到 container)', () => {
      const render = new Render({ sortableChildren: true });
      render.init({ sortableChildren: true });
      expect(render.sortableChildren).toBe(true);

      // 显式断言:Render system 当前实现不会同步 sortableChildren 到 container
      const { go, container } = makeGameObject('sortable');
      go.addComponent(render);
      const before = (container as any).sortableChildren;
      (renderSystem as any).rendererUpdate(go);
      // container.sortableChildren 行为不由 RenderSystem.rendererUpdate 决定,
      // 保留与执行前一致(在 stub Container 上未声明则维持 undefined)。
      expect((container as any).sortableChildren).toBe(before);
    });
  });
});
