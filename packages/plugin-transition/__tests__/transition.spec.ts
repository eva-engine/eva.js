import { Transition, TransitionSystem } from '../lib';
import { Component } from '@eva/eva.js';

// Mock component for testing
class MockComponent extends Component {
  static componentName = 'MockComponent';
  x = 0;
  y = 0;
  alpha = 1;
}

describe('Transition Plugin - 动画系统', () => {
  let transitionSystem: TransitionSystem;

  beforeEach(() => {
    transitionSystem = new TransitionSystem();
  });

  afterEach(() => {
    if (transitionSystem) {
      transitionSystem.destroy();
    }
    jest.clearAllMocks();
  });

  describe('TransitionSystem 初始化', () => {
    it('应该成功创建 TransitionSystem 实例', () => {
      expect(transitionSystem).toBeDefined();
      expect(transitionSystem.name).toBe('transition');
    });

    it('应该正确初始化过渡系统', () => {
      const mockGame = {
        scene: {
          gameObjects: [],
        },
      };

      expect(() => {
        transitionSystem.init(mockGame as any);
      }).not.toThrow();
    });
  });

  describe('Transition 组件', () => {
    it('应该创建 Transition 组件实例', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });

      expect(transition).toBeDefined();
      expect(transition.name).toBe('Transition');
    });

    it('应该支持多属性动画', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
            {
              name: 'y',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });

      expect(transition).toBeDefined();
      expect(transition.group).toBeDefined();
    });

    it('应该支持多个动画组', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          moveX: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
          fadeIn: [
            {
              name: 'alpha',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'ease-in' },
                { time: 500, value: 1 },
              ],
            },
          ],
        },
      });

      expect(transition.group.moveX).toBeDefined();
      expect(transition.group.fadeIn).toBeDefined();
    });
  });

  describe('动画控制', () => {
    let transition: Transition;
    let mockComponent: MockComponent;

    beforeEach(() => {
      mockComponent = new MockComponent();
      transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();
      transition.awake();
    });

    it('应该能够播放指定动画', () => {
      expect(() => {
        transition.play('move');
      }).not.toThrow();
    });

    it('应该能够停止动画', () => {
      transition.play('move');
      expect(() => {
        transition.stop('move');
      }).not.toThrow();
    });

    it('应该能够停止所有动画', () => {
      transition.play('move');
      expect(() => {
        transition.stop(null);
      }).not.toThrow();
    });

    it('应该能够暂停动画', () => {
      transition.play('move');
      expect(() => {
        transition.onPause();
      }).not.toThrow();
    });

    it('应该能够恢复动画', () => {
      transition.play('move');
      transition.onPause();
      expect(() => {
        transition.onResume();
      }).not.toThrow();
    });
  });

  describe('动画事件', () => {
    it('应该触发 finish 事件', (done) => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 100, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();
      transition.awake();

      transition.on('finish', (name) => {
        expect(name).toBe('move');
        done();
      });

      transition.play('move');
      transition.update({ time: 0, deltaTime: 0, frameCount: 0, currentTime: 0, fps: 60 });
      transition.update({ time: 100, deltaTime: 100, frameCount: 1, currentTime: 100, fps: 60 });
    });

    it('应该触发 update 事件', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();
      transition.awake();

      const updateCallback = jest.fn();
      transition.on('update', updateCallback);

      transition.play('move');
      transition.update({ time: 0, deltaTime: 0, frameCount: 0, currentTime: 0, fps: 60 });
      transition.update({ time: 500, deltaTime: 500, frameCount: 1, currentTime: 500, fps: 60 });

      expect(updateCallback).toHaveBeenCalled();
    });
  });

  describe('缓动函数', () => {
    const easingFunctions = [
      'linear',
      'ease-in',
      'ease-out',
      'ease-in-out',
      'bounce-in',
      'bounce-out',
      'bounce-in-out',
    ];

    easingFunctions.forEach((easing) => {
      it(`应该支持 ${easing} 缓动函数`, () => {
        const mockComponent = new MockComponent();
        const transition = new Transition({
          group: {
            move: [
              {
                name: 'x',
                component: mockComponent,
                values: [
                  { time: 0, value: 0, tween: easing },
                  { time: 1000, value: 100 },
                ],
              },
            ],
          },
        });

        expect(transition).toBeDefined();
      });
    });
  });

  describe('组件更新', () => {
    it('应该正确更新组件属性', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();
      transition.awake();

      transition.play('move');
      transition.update({ time: 0, deltaTime: 0, frameCount: 0, currentTime: 0, fps: 60 });
      transition.update({ time: 500, deltaTime: 500, frameCount: 1, currentTime: 500, fps: 60 });

      // 动画应该更新了组件的属性
      expect(mockComponent.x).toBeGreaterThan(0);
    });
  });

  describe('动画迭代', () => {
    it('应该支持设置迭代次数', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 100, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();
      transition.awake();

      expect(() => {
        transition.play('move', 3); // 重复 3 次
      }).not.toThrow();
    });
  });

  describe('组件销毁', () => {
    it('应该正确清理资源', () => {
      const mockComponent = new MockComponent();
      const transition = new Transition({
        group: {
          move: [
            {
              name: 'x',
              component: mockComponent,
              values: [
                { time: 0, value: 0, tween: 'linear' },
                { time: 1000, value: 100 },
              ],
            },
          ],
        },
      });
      transition.init();

      expect(() => {
        transition.onDestroy();
      }).not.toThrow();

      expect(transition.tweenGroup).toBeNull();
      expect(transition.group).toBeNull();
    });
  });
});
