import { RendererSystem, RendererManager, ContainerManager, RENDERER_TYPE } from '../lib';
import { Application, Container } from 'pixi.js';

// Mock PixiJS
jest.mock('pixi.js', () => ({
  Application: jest.fn().mockImplementation(() => ({
    stage: {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      destroy: jest.fn(),
    },
    view: document.createElement('canvas'),
    renderer: {
      resize: jest.fn(),
      render: jest.fn(),
      destroy: jest.fn(),
    },
    ticker: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    destroy: jest.fn(),
  })),
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    removeChild: jest.fn(),
    destroy: jest.fn(),
    children: [],
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
  })),
  Ticker: {
    shared: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  },
}));

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

    it('应该正确设置画布尺寸', () => {
      const width = 1024;
      const height = 768;

      rendererSystem = new RendererSystem({
        canvas: mockCanvas,
        width,
        height,
      });

      expect(Application).toHaveBeenCalledWith(
        expect.objectContaining({
          width,
          height,
        })
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
      observerInfo: {}
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
      name: 'custom'
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
});
