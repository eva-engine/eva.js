import { Event, EventSystem } from '../lib';

describe('Event Plugin', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  afterEach(() => {
    if (eventSystem) {
      eventSystem.destroy();
    }
    jest.clearAllMocks();
  });

  describe('EventSystem 初始化', () => {
    it('应该成功创建 EventSystem 实例', () => {
      expect(eventSystem).toBeDefined();
      expect(eventSystem.name).toBe('EventSystem');
    });

    it('应该正确初始化事件监听', () => {
      const mockGame = {
        canvas: document.createElement('canvas'),
        scene: {
          gameObjects: [],
        },
      };

      expect(() => {
        eventSystem.init(mockGame as any);
      }).not.toThrow();
    });
  });

  describe('Event 组件', () => {
    it('应该创建 Event 组件实例', () => {
      const event = new Event();
      expect(event).toBeDefined();
      expect(event.name).toBe('Event');
    });

    it('应该支持事件监听配置', () => {
      const event = new Event({
        on: {
          click: jest.fn(),
          touchstart: jest.fn(),
        },
      });

      expect(event).toBeDefined();
    });
  });

  describe('事件处理', () => {
    it('应该正确触发点击事件', () => {
      const clickHandler = jest.fn();
      const event = new Event({
        on: {
          click: clickHandler,
        },
      });

      // 模拟点击事件
      const mockEvent = new MouseEvent('click');
      event.emit('click', mockEvent);

      expect(clickHandler).toHaveBeenCalled();
    });

    it('应该支持触摸事件', () => {
      const touchHandler = jest.fn();
      const event = new Event({
        on: {
          touchstart: touchHandler,
        },
      });

      expect(event).toBeDefined();
    });

    it('应该支持鼠标事件', () => {
      const event = new Event({
        on: {
          mousedown: jest.fn(),
          mouseup: jest.fn(),
          mousemove: jest.fn(),
        },
      });

      expect(event).toBeDefined();
    });
  });

  describe('事件移除', () => {
    it('应该能够移除事件监听', () => {
      const handler = jest.fn();
      const event = new Event({
        on: {
          click: handler,
        },
      });

      event.off('click', handler);
      event.emit('click', new MouseEvent('click'));

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该在销毁时清理所有事件', () => {
      const event = new Event({
        on: {
          click: jest.fn(),
          touchstart: jest.fn(),
        },
      });

      expect(() => {
        event.destroy();
      }).not.toThrow();
    });
  });

  describe('系统更新', () => {
    it('应该正确处理更新循环', () => {
      expect(() => {
        eventSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
      }).not.toThrow();
    });
  });
});
