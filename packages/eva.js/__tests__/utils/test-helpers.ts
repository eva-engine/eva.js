/**
 * 测试辅助工具集
 */
import { Game, GameObject, Scene } from '../../lib';
import { Container, Application } from 'pixi.js';

/**
 * 创建测试用的 Game 实例
 */
export function createTestGame(options = {}) {
  const defaultOptions = {
    systems: [],
    autoStart: false,
    frameRate: 60,
  };

  return new Game({
    ...defaultOptions,
    ...options,
  });
}

/**
 * 创建测试用的 Scene
 */
export function createTestScene(name = 'testScene') {
  return new Scene(name);
}

/**
 * 创建测试用的 GameObject
 */
export function createTestGameObject(name = 'testGameObject', options = {}) {
  return new GameObject(name, options);
}

/**
 * Mock PixiJS Container
 */
export function createMockContainer(): Partial<Container> {
  return {
    addChild: jest.fn(),
    removeChild: jest.fn(),
    destroy: jest.fn(),
    children: [],
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    alpha: 1,
    visible: true,
  };
}

/**
 * Mock PixiJS Application
 */
export function createMockApplication(): Partial<Application> {
  return {
    stage: createMockContainer() as any,
    view: document.createElement('canvas'),
    renderer: {
      resize: jest.fn(),
      render: jest.fn(),
      destroy: jest.fn(),
    } as any,
    ticker: {
      add: jest.fn(),
      remove: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any,
    destroy: jest.fn(),
  };
}

/**
 * 等待异步操作完成
 */
export function waitForAsync(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模拟 requestAnimationFrame
 */
export function mockAnimationFrame() {
  let rafId = 0;
  const callbacks = new Map();

  global.requestAnimationFrame = jest.fn((callback) => {
    const id = ++rafId;
    callbacks.set(id, callback);
    return id;
  });

  global.cancelAnimationFrame = jest.fn((id) => {
    callbacks.delete(id);
  });

  return {
    trigger: () => {
      const timestamp = Date.now();
      callbacks.forEach(callback => callback(timestamp));
      callbacks.clear();
    },
    clear: () => {
      callbacks.clear();
    },
  };
}

/**
 * 创建 Mock 图片元素
 */
export function createMockImage(width = 100, height = 100): HTMLImageElement {
  const img = new Image(width, height);
  Object.defineProperty(img, 'width', { value: width, writable: true });
  Object.defineProperty(img, 'height', { value: height, writable: true });
  return img;
}

/**
 * 创建 Mock Canvas 元素
 */
export function createMockCanvas(width = 800, height = 600): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 检查组件是否已添加到 GameObject
 */
export function hasComponent(gameObject: GameObject, componentName: string): boolean {
  return gameObject.components.some(c => c.name === componentName);
}

/**
 * 获取 GameObject 的指定组件
 */
export function getComponent(gameObject: GameObject, componentName: string) {
  return gameObject.components.find(c => c.name === componentName);
}

/**
 * Mock 资源加载
 */
export function mockResourceLoad(resources: Record<string, any> = {}) {
  return {
    load: jest.fn((name: string) => {
      if (resources[name]) {
        return Promise.resolve(resources[name]);
      }
      return Promise.reject(new Error(`Resource ${name} not found`));
    }),
    get: jest.fn((name: string) => resources[name]),
    add: jest.fn(),
    destroy: jest.fn(),
  };
}

/**
 * 创建 Mock 音频上下文
 */
export function createMockAudioContext() {
  return {
    createBufferSource: jest.fn(() => ({
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
    })),
    createGain: jest.fn(() => ({
      gain: { value: 1 },
      connect: jest.fn(),
      disconnect: jest.fn(),
    })),
    destination: {},
    decodeAudioData: jest.fn((buffer) => Promise.resolve(buffer)),
  };
}

/**
 * 断言错误被抛出
 */
export async function expectAsyncError(fn: () => Promise<any>, errorMessage?: string) {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (errorMessage) {
      expect(error.message).toContain(errorMessage);
    }
    return error;
  }
}

/**
 * 创建测试环境
 */
export function setupTestEnvironment() {
  const game = createTestGame();
  const scene = createTestScene();
  const gameObject = createTestGameObject();

  return {
    game,
    scene,
    gameObject,
    cleanup: () => {
      // 清理资源
    },
  };
}
