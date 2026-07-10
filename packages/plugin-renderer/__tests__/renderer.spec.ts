import { Game, GameObject, type FrameParams, type UpdateParams } from '@eva/eva.js';
import { RendererSystem, RendererManager, ContainerManager, RENDERER_TYPE } from '../lib';
import { Application, Container, Ticker } from 'pixi.js';
import { requestAnimationFrameMock } from '../../eva.js/__tests__/__mocks__/requestAnimationFrame';

// Mock PixiJS
jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  const Application = jest.fn().mockImplementation(() => ({
    stage: {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      destroy: jest.fn(),
    },
    view: document.createElement('canvas'),
    canvas: document.createElement('canvas'),
    renderer: {
      resize: jest.fn(),
      render: jest.fn(),
      destroy: jest.fn(),
      width: 0,
      height: 0,
      resolution: 1,
      events: {},
      canvas: { style: {} },
    },
    ticker: {
      add: jest.fn(),
      remove: jest.fn(),
      stop: jest.fn(),
      update: jest.fn(),
      speed: 1,
    },
    init: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
  }));
  const Container = jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    addChildAt: jest.fn(),
    removeChild: jest.fn(),
    destroy: jest.fn(),
    getBounds: jest.fn(() => ({ x: 10, y: 20, width: 30, height: 40 })),
    updateTransform: jest.fn(),
    children: [],
    parent: null,
    position: { x: 0, y: 0, set: jest.fn() },
    scale: { x: 1, y: 1, set: jest.fn() },
    pivot: { x: 0, y: 0, set: jest.fn() },
    worldTransform: { tx: 0, ty: 0 },
  }));
  return {
    ...pixi,
    Application,
    Container,
    Ticker: {
      shared: {
        add: jest.fn(),
        remove: jest.fn(),
        stop: jest.fn(),
        update: jest.fn(),
        autoStart: false,
      },
    },
  };
});

describe('RendererSystem', () => {
  let rendererSystem: RendererSystem;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    document.body.appendChild(mockCanvas);
  });

  afterEach(() => {
    if (rendererSystem) {
      rendererSystem.destroy();
    }
    document.body.removeChild(mockCanvas);
    jest.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功创建 RendererSystem 实例', () => {
      rendererSystem = new RendererSystem({
        canvas: mockCanvas,
        width: 800,
        height: 600,
      });

      expect(rendererSystem).toBeDefined();
      expect(rendererSystem.name).toBe('Renderer');
    });

    it('应该使用默认参数创建实例', () => {
      rendererSystem = new RendererSystem({
        canvas: mockCanvas,
      });

      expect(rendererSystem).toBeDefined();
    });

    it('应该正确设置画布尺寸', async () => {
      const width = 1024;
      const height = 768;

      rendererSystem = new RendererSystem({
        canvas: mockCanvas,
        width,
        height,
      });

      await rendererSystem.init({
        scene: {
          gameObjects: [],
        },
      } as any);

      const app = (Application as unknown as jest.Mock).mock.results[0].value;
      expect(app.init).toHaveBeenCalledWith(
        expect.objectContaining({
          canvas: mockCanvas,
          width,
          height,
          sharedTicker: true,
          hello: true,
        }),
      );
    });
  });

  describe('RENDERER_TYPE', () => {
    it('应该定义所有渲染器类型', () => {
      expect(RENDERER_TYPE).toBeDefined();
      expect(RENDERER_TYPE.UNKNOWN).toBe(0);
      expect(RENDERER_TYPE.WEBGL).toBe(1);
      expect(RENDERER_TYPE.CANVAS).toBe(2);
    });
  });

  describe('系统生命周期', () => {
    beforeEach(() => {
      rendererSystem = new RendererSystem({
        canvas: mockCanvas,
        width: 800,
        height: 600,
      });
    });

    it('应该正确初始化', () => {
      const mockGame = {
        scene: {
          gameObjects: [],
        },
      };

      rendererSystem.init(mockGame as any);
      expect(rendererSystem).toBeDefined();
    });

    it('应该正确更新渲染', () => {
      expect(() => {
        rendererSystem.update();
      }).not.toThrow();
    });

    it('应该正确销毁系统', () => {
      const destroySpy = jest.spyOn(rendererSystem as any, 'destroy');
      rendererSystem.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('容器管理', () => {
    it('ContainerManager 应该正确管理容器', () => {
      const manager = new ContainerManager();
      expect(manager).toBeDefined();
    });
  });

  describe('渲染器管理', () => {
    it('RendererManager 应该正确管理渲染器', () => {
      const mockGame = { scene: { gameObjects: [] } };
      const mockRendererSystem = { rendererManager: null, containerManager: null };
      const manager = new RendererManager({ game: mockGame as any, rendererSystem: mockRendererSystem as any });
      expect(manager).toBeDefined();
    });
  });
});

describe('RendererManager', () => {
  let manager: RendererManager;

  beforeEach(() => {
    const mockGame = { scene: { gameObjects: [] } };
    const mockRendererSystem = { rendererManager: null, containerManager: null };
    manager = new RendererManager({ game: mockGame as any, rendererSystem: mockRendererSystem as any });
  });

  it('应该能够注册渲染器', () => {
    const mockRenderer = {
      game: null,
      rendererManager: null,
      containerManager: null,
      observerInfo: {},
    };
    expect(() => {
      manager.register(mockRenderer as any);
    }).not.toThrow();
  });

  it('应该能够获取已注册的渲染器', () => {
    const mockRenderer = {
      game: null,
      rendererManager: null,
      containerManager: null,
      observerInfo: {},
      name: 'custom',
    };
    manager.register(mockRenderer as any);

    const renderer = manager.renderers.find(r => r.name === 'custom');
    expect(renderer).toBeDefined();
  });
});

describe('ContainerManager', () => {
  let manager: ContainerManager;

  beforeEach(() => {
    manager = new ContainerManager();
  });

  it('应该正确创建容器管理器', () => {
    expect(manager).toBeDefined();
  });

  it('应该能够管理容器层级', () => {
    expect(() => {
      const container = new Container();
      const mockGameObject = { name: 'test', id: 1 };
      manager.addContainer({ name: 1, container: container as any, gameObject: mockGameObject as any });
    }).not.toThrow();
  });

  it('应该优先返回 Pixi getBounds 的真实渲染尺寸', () => {
    const container = new Container() as any;
    const mockGameObject = {
      name: 'actual-size',
      id: 2,
      destroyed: false,
      transform: {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        scale: { x: 1, y: 1 },
      },
    };
    manager.addContainer({ name: 2, container, gameObject: mockGameObject as any });

    const bounds = manager.getBounds(mockGameObject as any);

    expect(bounds).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      right: 40,
      bottom: 60,
      coordinateSpace: 'world',
      source: 'pixi',
    });
  });

  it('渲染对象未就绪时应该 fallback 到 Transform.size', () => {
    const container = {
      gName: '',
      getBounds: jest.fn(() => ({ x: 0, y: 0, width: 0, height: 0 })),
      destroy: jest.fn(),
      worldTransform: { tx: 12, ty: 34 },
    };
    const mockGameObject = {
      name: 'fallback-size',
      id: 3,
      destroyed: false,
      transform: {
        position: { x: 12, y: 34 },
        size: { width: 56, height: 78 },
        scale: { x: 1, y: 1 },
      },
    };
    manager.addContainer({ name: 3, container: container as any, gameObject: mockGameObject as any });

    const bounds = manager.getBounds(mockGameObject as any, { coordinateSpace: 'design' });

    expect(bounds).toEqual({
      x: 12,
      y: 34,
      width: 56,
      height: 78,
      right: 68,
      bottom: 112,
      coordinateSpace: 'design',
      source: 'transform',
    });
  });

  it('通过 point.set 单次写入 presented 标量且不重复触发属性 setter', () => {
    const makeTrackedPoint = () => {
      let currentX = 0;
      let currentY = 0;
      const directWrites = jest.fn();
      const point: any = {
        set: jest.fn((x: number, y: number) => {
          currentX = x;
          currentY = y;
        }),
      };
      Object.defineProperties(point, {
        x: {
          get: () => currentX,
          set: (value: number) => {
            directWrites('x', value);
            currentX = value;
          },
        },
        y: {
          get: () => currentY,
          set: (value: number) => {
            directWrites('y', value);
            currentY = value;
          },
        },
      });
      return { point, directWrites };
    };
    const position = makeTrackedPoint();
    const pivot = makeTrackedPoint();
    const scale = makeTrackedPoint();
    const skew = makeTrackedPoint();
    const container: any = {
      position: position.point,
      pivot: pivot.point,
      scale: scale.point,
      skew: skew.point,
      destroy: jest.fn(),
    };
    manager.addContainer({ name: 4, container, gameObject: { id: 4, name: 'tracked' } as any });

    manager.updatePresentedTransform({
      name: 4,
      transform: {
        position: { x: 10, y: 20 },
        rotation: 0.5,
        scale: { x: 2, y: 3 },
        skew: { x: 0.1, y: 0.2 },
        size: { width: 40, height: 60 },
        origin: { x: 0.5, y: 0.25 },
        anchor: { x: 0, y: 0 },
        parentId: null,
      },
    });

    for (const tracked of [position, pivot, scale, skew]) {
      expect(tracked.point.set).toHaveBeenCalledTimes(1);
      expect(tracked.directWrites).not.toHaveBeenCalled();
    }
  });
});

const logicalFrame = (frameCount: number): UpdateParams => ({
  deltaTime: 1000 / 60,
  frameCount,
  time: frameCount * (1000 / 60),
  currentTime: frameCount * (1000 / 60),
  fps: 60,
});

const physicalFrame = (overrides: Partial<FrameParams> = {}): FrameParams => ({
  rafTime: 100,
  rafDeltaTime: 1000 / 60,
  rafFps: 60,
  rafFrameCount: 1,
  updatesThisFrame: 1,
  interpolationAlpha: 0.5,
  simulationTime: 100,
  playbackRate: 1,
  ...overrides,
});

async function makePresentationRenderer(gameObjects: GameObject[]) {
  const renderer = new RendererSystem({ width: 800, height: 600 });
  await renderer.init({
    scene: { gameObjects },
    gameObjects,
    on: jest.fn(),
  } as any);
  for (const gameObject of gameObjects) {
    renderer.containerManager.addContainer({
      name: gameObject.id,
      container: new Container() as any,
      gameObject,
    });
  }
  return renderer;
}

describe('Renderer physical presentation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('real Game/Ticker dispatch presents once for 0/2/5 logical-update RAFs without direct ticker registration', async () => {
    requestAnimationFrameMock.reset();
    const game = new Game();
    const renderer = new RendererSystem({ width: 800, height: 600 });
    await game.init({ systems: [renderer], autoStart: false, needScene: false });
    const pixiUpdate = renderer.application.ticker.update as jest.Mock;
    const logicalLateUpdate = jest.spyOn(renderer, 'lateUpdate');

    try {
      game.start();
      requestAnimationFrameMock.stepTo(0);
      expect(logicalLateUpdate).toHaveBeenCalledTimes(0);
      requestAnimationFrameMock.advanceBy(1);
      expect(logicalLateUpdate).toHaveBeenCalledTimes(0);
      requestAnimationFrameMock.advanceBy((1000 / 60) * 2);
      expect(logicalLateUpdate).toHaveBeenCalledTimes(2);
      requestAnimationFrameMock.advanceBy((1000 / 60) * 10);
      expect(logicalLateUpdate).toHaveBeenCalledTimes(7);

      expect(pixiUpdate).toHaveBeenCalledTimes(4);
      const presentedTimes = pixiUpdate.mock.calls.map(call => call[0]);
      expect(presentedTimes[0]).toBe(0);
      expect(presentedTimes[1]).toBe(1);
      expect(presentedTimes[2]).toBeCloseTo(1 + (1000 / 60) * 2);
      expect(presentedTimes[3]).toBeCloseTo(1 + (1000 / 60) * 12);
      expect(Ticker.shared.add).not.toHaveBeenCalled();
    } finally {
      game.destroy();
      requestAnimationFrameMock.reset();
    }
  });

  it.each([0, 2, 5])('advances Pixi exactly once for a physical frame with %i logical updates', async updates => {
    const gameObject = new GameObject('moving', { position: { x: 0, y: 0 } });
    const renderer = await makePresentationRenderer([gameObject]);
    const ticker = renderer.application.ticker as any;

    for (let index = 1; index <= updates; index++) {
      gameObject.transform.position.x = index * 10;
      renderer.update(logicalFrame(index));
      renderer.lateUpdate(logicalFrame(index));
    }
    renderer.frameUpdate(physicalFrame({ rafTime: 1234, updatesThisFrame: updates }));

    expect(ticker.update).toHaveBeenCalledTimes(1);
    expect(ticker.update).toHaveBeenCalledWith(1234);
    renderer.onDestroy();
  });

  it('uses raw RAF time and playback rate, including a frozen logical clock', async () => {
    const gameObject = new GameObject('paused', { position: { x: 42, y: 3 } });
    const renderer = await makePresentationRenderer([gameObject]);
    const ticker = renderer.application.ticker as any;
    renderer.lateUpdate(logicalFrame(1));

    renderer.frameUpdate(physicalFrame({ rafTime: 987.25, updatesThisFrame: 0, playbackRate: 0 }));

    expect(ticker.speed).toBe(0);
    expect(ticker.update).toHaveBeenCalledTimes(1);
    expect(ticker.update).toHaveBeenCalledWith(987.25);
    renderer.onDestroy();
  });

  it('seeds an existing entity on the zero-update baseline physical frame', async () => {
    const gameObject = new GameObject('baseline', { position: { x: 42, y: 3 } });
    const renderer = await makePresentationRenderer([gameObject]);
    const container = renderer.containerManager.getContainer(gameObject.id) as any;

    renderer.frameUpdate(physicalFrame({ updatesThisFrame: 0, interpolationAlpha: 0 }));

    expect(container.position).toEqual(expect.objectContaining({ x: 42, y: 3 }));
    renderer.onDestroy();
  });

  it('presents a new entity from its first real sample instead of zero', async () => {
    const gameObject = new GameObject('new', {
      position: { x: 80, y: 40 },
      scale: { x: 2, y: 3 },
    });
    const renderer = await makePresentationRenderer([gameObject]);
    const container = renderer.containerManager.getContainer(gameObject.id) as any;
    renderer.lateUpdate(logicalFrame(1));

    renderer.frameUpdate(physicalFrame({ interpolationAlpha: 0.05 }));

    expect(container.position).toEqual(expect.objectContaining({ x: 80, y: 40 }));
    expect(container.scale).toEqual(expect.objectContaining({ x: 2, y: 3 }));
    renderer.onDestroy();
  });

  it('keeps root anchor semantics while applying all presented transform fields', async () => {
    const gameObject = new GameObject('root', {
      position: { x: 10, y: 20 },
      size: { width: 40, height: 60 },
      origin: { x: 0.5, y: 0.25 },
      anchor: { x: 1, y: 1 },
      rotation: 0.75,
      scale: { x: 2, y: 3 },
      skew: { x: 0.1, y: 0.2 },
    });
    const renderer = await makePresentationRenderer([gameObject]);
    renderer.lateUpdate(logicalFrame(1));

    renderer.frameUpdate(physicalFrame());

    const container = renderer.containerManager.getContainer(gameObject.id) as any;
    expect(container.position).toEqual(expect.objectContaining({ x: 10, y: 20 }));
    expect(container.pivot).toEqual(expect.objectContaining({ x: 20, y: 15 }));
    expect(container.scale).toEqual(expect.objectContaining({ x: 2, y: 3 }));
    expect(container.skew).toEqual(expect.objectContaining({ x: 0.1, y: 0.2 }));
    expect(container.rotation).toBe(0.75);
    renderer.onDestroy();
  });

  it('uses the presented parent size for a child anchor and the presented size for pivot', async () => {
    const parent = new GameObject('parent', {
      size: { width: 100, height: 80 },
      origin: { x: 0.25, y: 0.5 },
    });
    const child = new GameObject('child', {
      position: { x: 10, y: 20 },
      anchor: { x: 0.5, y: 0.25 },
    });
    parent.addChild(child);
    const renderer = await makePresentationRenderer([parent, child]);
    renderer.lateUpdate(logicalFrame(1));
    parent.transform.size.width = 200;
    parent.transform.size.height = 120;
    renderer.lateUpdate(logicalFrame(2));

    renderer.frameUpdate(physicalFrame({ interpolationAlpha: 0.5 }));

    const parentContainer = renderer.containerManager.getContainer(parent.id) as any;
    const childContainer = renderer.containerManager.getContainer(child.id) as any;
    expect(parentContainer.pivot).toEqual(expect.objectContaining({ x: 37.5, y: 50 }));
    expect(childContainer.position).toEqual(expect.objectContaining({ x: 85, y: 45 }));
    expect(parent.transform.size).toEqual({ width: 200, height: 120 });
    renderer.onDestroy();
  });

  it('captures Layout lateUpdate writes after Renderer update instead of presenting a stale snapshot', async () => {
    const gameObject = new GameObject('layout-child', { position: { x: 0, y: 0 } });
    const renderer = await makePresentationRenderer([gameObject]);
    renderer.update(logicalFrame(1));
    renderer.lateUpdate(logicalFrame(1));

    renderer.update(logicalFrame(2));
    renderer.lateUpdate(logicalFrame(2));
    // On LayoutSystem's first reorder it can run after Renderer.lateUpdate once.
    // Its final write must still refresh the same logical snapshot before presentation.
    gameObject.transform.position.x = 80;
    renderer.frameUpdate(physicalFrame({ interpolationAlpha: 0.5 }));

    const container = renderer.containerManager.getContainer(gameObject.id) as any;
    expect(container.position.x).toBe(40);
    expect(gameObject.transform.position.x).toBe(80);
    renderer.onDestroy();
  });

  it('seeds a dynamically added Layout entity from its same-frame final value', async () => {
    const gameObjects: GameObject[] = [];
    const renderer = await makePresentationRenderer(gameObjects);
    const gameObject = new GameObject('dynamic-layout-child', { position: { x: 0, y: 0 } });
    gameObjects.push(gameObject);
    renderer.containerManager.addContainer({
      name: gameObject.id,
      container: new Container() as any,
      gameObject,
    });

    renderer.lateUpdate(logicalFrame(1));
    // Layout's final value arrives after the new entity's first Renderer capture.
    gameObject.transform.position.x = 80;
    renderer.frameUpdate(physicalFrame({ interpolationAlpha: 0.5 }));

    const container = renderer.containerManager.getContainer(gameObject.id) as any;
    expect(container.position.x).toBe(80);
    expect((renderer as any).transformInterpolation.sampleAllocationCount).toBe(3);
    renderer.onDestroy();
  });

  it('falls back to core parent size only when the presented parent history is unavailable', async () => {
    const parent = new GameObject('detached-parent', { size: { width: 100, height: 80 } });
    const child = new GameObject('orphaned-child', {
      position: { x: 10, y: 20 },
      anchor: { x: 0.5, y: 0.25 },
    });
    parent.addChild(child);
    const renderer = await makePresentationRenderer([child]);
    renderer.lateUpdate(logicalFrame(1));

    renderer.frameUpdate(physicalFrame());

    const childContainer = renderer.containerManager.getContainer(child.id) as any;
    expect(childContainer.position).toEqual(expect.objectContaining({ x: 60, y: 40 }));
    renderer.onDestroy();
  });

  it('does not apply removed entities and clears interpolation state on destroy', async () => {
    const gameObject = new GameObject('removed', { position: { x: 10, y: 0 } });
    const renderer = await makePresentationRenderer([gameObject]);
    renderer.lateUpdate(logicalFrame(1));
    const removedContainer = renderer.containerManager.getContainer(gameObject.id) as any;
    const positionBeforeRemoval = { ...removedContainer.position };

    (renderer.game as any).gameObjects = [];
    renderer.containerManager.removeContainer(gameObject.id);
    renderer.lateUpdate(logicalFrame(2));
    expect((renderer as any).transformInterpolation.size).toBe(0);
    renderer.frameUpdate(physicalFrame());

    expect(renderer.containerManager.getContainer(gameObject.id)).toBeUndefined();
    expect(removedContainer.position).toEqual(expect.objectContaining(positionBeforeRemoval));
    expect(() => renderer.onDestroy()).not.toThrow();
    expect((renderer as any).transformInterpolation.size).toBe(0);
  });
});
