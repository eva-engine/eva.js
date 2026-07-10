import { mocked } from 'ts-jest/utils';
import { Game, Scene, GameObject, System } from '../lib';
import type { FrameParams } from '../lib';
import Ticker from '../lib/game/Ticker';
import { TestSystem, Test2System, TestComponent } from '@eva/plugin-renderer-test';

const MockTicker = mocked(Ticker, true);
const mockTickerAdd = jest.fn();
const mockTickerAddFrameStart = jest.fn();
const mockTickerAddFrame = jest.fn();
const mockTickerUpdate = jest.fn();
const mockTickerRemove = jest.fn();
const mockTickerStart = jest.fn();
const mockTickerPause = jest.fn();
const mockTickerActive = jest.fn();
const mockTickerBackground = jest.fn();
const mockTickerBindEvent = jest.fn();
jest.mock('../lib/game/Ticker', () => {
  return jest.fn().mockImplementation(() => ({
    update: mockTickerUpdate,
    add: mockTickerAdd,
    addFrameStart: mockTickerAddFrameStart,
    addFrame: mockTickerAddFrame,
    remove: mockTickerRemove,
    start: mockTickerStart,
    pause: mockTickerPause,
    active: mockTickerActive,
    background: mockTickerBackground,
    bindEvent: mockTickerBindEvent,
  }));
});

describe('Game', () => {
  beforeEach(() => {
    MockTicker.mockClear();
    mockTickerAdd.mockClear();
    mockTickerAddFrameStart.mockClear();
    mockTickerAddFrame.mockClear();
    mockTickerUpdate.mockClear();
    mockTickerRemove.mockClear();
    mockTickerStart.mockClear();
    mockTickerPause.mockClear();
    mockTickerActive.mockClear();
    mockTickerBackground.mockClear();
    mockTickerBindEvent.mockClear();
  });

  it('make game with default props', async () => {
    const game = new Game();
    await game.init();
    expect(game.scene).toBeInstanceOf(Scene);
    expect(MockTicker).toHaveBeenCalledTimes(1);
    expect(mockTickerAdd).toHaveBeenCalledTimes(1);
    expect(mockTickerStart).toHaveBeenCalledTimes(1);
  });

  it('make game with custom props', async () => {
    const game = new Game();
    await game.init({
      systems: [new TestSystem(), new Test2System()],
      needScene: false,
      autoStart: false,
    });
    expect(game.scene).toBeUndefined();
    expect(MockTicker).toHaveBeenCalledTimes(1);
    expect(mockTickerAdd).toHaveBeenCalledTimes(1);
  });

  it('add system instance', async () => {
    const game = new Game();
    await game.init();
    const system1 = new TestSystem();
    const system2 = new Test2System();
    await game.addSystem(system1);
    await game.addSystem(system2);
    expect(game.systems).toContain(system1);
    expect(game.systems).toContain(system2);
    expect(game.systems.length).toBe(2);
  });

  it('add system constructor', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    expect(game.systems.length).toBe(2);
    expect(game.systems[0]).toBeInstanceOf(TestSystem);
    expect(game.systems[1]).toBeInstanceOf(Test2System);
  });

  it('add system twice', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    await game.addSystem(TestSystem);
    expect(`${TestSystem.systemName} System has been added`).toHaveBeenWarned();
  });

  it('add any other things', async () => {
    const system: any = null;
    const game = new Game();
    await game.init();
    await game.addSystem(system);
    expect('can only add System').toHaveBeenWarned();
  });
  it('remove system successfully by systemName', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    game.removeSystem(TestSystem.systemName);
    expect(game.systems.length).toBe(0);
    await game.addSystem(Test2System);
    expect(game.systems.length).toBe(1);
    game.removeSystem(Test2System.systemName);
    expect(game.systems.length).toBe(0);
  });

  it('remove system successfully by constructor', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    game.removeSystem(TestSystem);
    expect(game.systems.length).toBe(0);
    await game.addSystem(Test2System);
    expect(game.systems.length).toBe(1);
    game.removeSystem(Test2System);
    expect(game.systems.length).toBe(0);
  });

  it('remove system successfully by system instance', async () => {
    const game = new Game();
    await game.init();
    let testSys: System = new TestSystem();
    await game.addSystem(testSys);
    expect(game.systems.length).toBe(1);
    game.removeSystem(testSys);
    expect(game.systems.length).toBe(0);
    testSys = new Test2System();
    await game.addSystem(testSys);
    expect(game.systems.length).toBe(1);
    game.removeSystem(testSys);
    expect(game.systems.length).toBe(0);
  });

  it('when throug in anything else', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    const system = null;
    game.removeSystem(system);
    expect(game.systems.length).toBe(1);
  });

  it('get system by systemName', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    const system = game.getSystem(TestSystem.systemName);
    expect(system).toBeInstanceOf(TestSystem);
  });

  it('get system by system constructor', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    const system = game.getSystem(TestSystem);
    expect(system).toBeInstanceOf(TestSystem);
  });

  it('pause', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    game.pause();
    expect(mockTickerPause).toBeCalled();
    expect(game.playing).toBeFalsy();
  });

  it('pause when pausing', async () => {
    const game = new Game();
    await game.init({ autoStart: false });
    game.pause();
    expect(mockTickerPause).not.toBeCalled();
    expect(game.playing).toBeFalsy();
  });

  it('start', async () => {
    const game = new Game();
    await game.init({ autoStart: false });
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    game.start();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('start when playing', async () => {
    const game = new Game();
    await game.init();
    game.start();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('resume', async () => {
    const game = new Game();
    await game.init({ autoStart: false });
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    game.resume();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('resume when playing', async () => {
    const game = new Game();
    await game.init();
    game.resume();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  /**
   * component start method called
   * system start method called
   * component onPlay method Called
   */
  it('trigger Start', async () => {
    const game = new Game();
    await game.init({
      systems: [new TestSystem(), new Test2System()],
    });

    // add gameobject and compnents
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    game.scene.addGameObject(gameObj);

    game.triggerResume();
  });

  it('tritter Pause', async () => {
    const game = new Game();
    await game.init({
      systems: [new TestSystem(), new Test2System()],
    });

    // add gameobject and compnents
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    game.scene.addGameObject(gameObj);

    game.triggerPause();
  });

  it('trigger pause without scene', async () => {
    const game = new Game();
    await game.init({ needScene: false, systems: [new TestSystem(), new Test2System()] });
    game.triggerPause();
  });

  it('init tracker', async () => {
    // first called in constructor
    const game = new Game();
    await game.init({
      systems: [new TestSystem()],
    });

    // add gameobject and compnents
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    game.scene.addGameObject(gameObj);
    game.initTicker();

    const fn = mockTickerAdd.mock.calls[0][0];
    fn();
    expect(mockTickerAdd).toBeCalled();
    expect(mockTickerAdd).toBeCalledTimes(2);
  });

  it('init ticker without scene', async () => {
    const game = new Game();
    await game.init({ needScene: false });
    const fn = mockTickerAdd.mock.calls[0][0];
    fn();
    expect(mockTickerAdd).toBeCalled();
    expect(mockTickerAdd).toBeCalledTimes(1);
  });

  it('dispatches one frameStart, two logical updates, then one frameUpdate in strict order', async () => {
    const trace: string[] = [];
    class TraceSystem extends System {
      static systemName = 'TraceSystem';
      frameStart() {
        trace.push('frameStart');
      }
      update() {
        trace.push('update');
      }
      lateUpdate() {
        trace.push('lateUpdate');
      }
      frameUpdate() {
        trace.push('frameUpdate');
      }
    }

    const game = new Game();
    await game.init({ systems: [new TraceSystem()], autoStart: false, needScene: false });

    const frame = { updatesThisFrame: 2 } as FrameParams;
    mockTickerAddFrameStart.mock.calls[0][0](frame);
    mockTickerAdd.mock.calls[0][0]({});
    mockTickerAdd.mock.calls[0][0]({});
    mockTickerAddFrame.mock.calls[0][0](frame);

    expect(trace).toEqual(['frameStart', 'update', 'lateUpdate', 'update', 'lateUpdate', 'frameUpdate']);
  });

  it('dispatches both physical hooks when a frame has zero logical updates', async () => {
    const trace: string[] = [];
    class TraceSystem extends System {
      static systemName = 'ZeroUpdateTraceSystem';
      frameStart() {
        trace.push('frameStart');
      }
      frameUpdate() {
        trace.push('frameUpdate');
      }
    }

    const game = new Game();
    await game.init({ systems: [new TraceSystem()], autoStart: false, needScene: false });

    const frame = { updatesThisFrame: 0 } as FrameParams;
    mockTickerAddFrameStart.mock.calls[0][0](frame);
    mockTickerAddFrame.mock.calls[0][0](frame);

    expect(trace).toEqual(['frameStart', 'frameUpdate']);
  });

  it('does not start a legacy-only System on baseline or playback-rate-zero physical frames', async () => {
    const trace: string[] = [];
    class LegacySystem extends System {
      static systemName = 'LegacyOnlySystem';
      start() {
        trace.push('start');
      }
      update() {
        trace.push('update');
      }
    }

    const game = new Game();
    await game.init({ systems: [new LegacySystem()], autoStart: false, needScene: false });
    const frozenFrame = { updatesThisFrame: 0, playbackRate: 0 } as FrameParams;

    mockTickerAddFrameStart.mock.calls[0][0](frozenFrame);
    mockTickerAddFrame.mock.calls[0][0](frozenFrame);
    expect(trace).toEqual([]);

    mockTickerAdd.mock.calls[0][0]({});
    expect(trace).toEqual(['start', 'update']);
  });

  it('starts a frameUpdate-only System immediately before its first frameUpdate hook', async () => {
    const trace: string[] = [];
    class FrameUpdateOnlySystem extends System {
      static systemName = 'FrameUpdateOnlySystem';
      start() {
        trace.push('start');
      }
      frameUpdate() {
        trace.push('frameUpdate');
      }
    }

    const game = new Game();
    await game.init({
      systems: [new FrameUpdateOnlySystem()],
      autoStart: false,
      needScene: false,
    });
    const frame = { updatesThisFrame: 0 } as FrameParams;

    mockTickerAddFrameStart.mock.calls[0][0](frame);
    expect(trace).toEqual([]);
    mockTickerAddFrame.mock.calls[0][0](frame);
    expect(trace).toEqual(['start', 'frameUpdate']);
  });

  it('starts every System before its first physical hook, including one added after frameStart', async () => {
    const trace: string[] = [];
    class InitialSystem extends System {
      static systemName = 'InitialPhysicalSystem';
      start() {
        trace.push('initial:start');
      }
      frameStart() {
        trace.push('initial:frameStart');
      }
      frameUpdate() {
        trace.push('initial:frameUpdate');
      }
    }
    class AddedSystem extends System {
      static systemName = 'AddedPhysicalSystem';
      start() {
        trace.push('added:start');
      }
      frameUpdate() {
        trace.push('added:frameUpdate');
      }
    }

    const game = new Game();
    await game.init({ systems: [new InitialSystem()], autoStart: false, needScene: false });
    const frame = { updatesThisFrame: 0 } as FrameParams;

    mockTickerAddFrameStart.mock.calls[0][0](frame);
    await game.addSystem(new AddedSystem());
    mockTickerAddFrame.mock.calls[0][0](frame);

    expect(trace).toEqual([
      'initial:start',
      'initial:frameStart',
      'initial:frameUpdate',
      'added:start',
      'added:frameUpdate',
    ]);
  });

  it('isolates errors in both physical hooks so later Systems still run', async () => {
    const trace: string[] = [];
    class ThrowingSystem extends System {
      static systemName = 'ThrowingPhysicalSystem';
      frameStart() {
        throw new Error('frameStart failed');
      }
      frameUpdate() {
        throw new Error('frameUpdate failed');
      }
    }
    class LaterSystem extends System {
      static systemName = 'LaterPhysicalSystem';
      frameStart() {
        trace.push('later:frameStart');
      }
      frameUpdate() {
        trace.push('later:frameUpdate');
      }
    }

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const game = new Game();
      await game.init({
        systems: [new ThrowingSystem(), new LaterSystem()],
        autoStart: false,
        needScene: false,
      });
      const frame = { updatesThisFrame: 0 } as FrameParams;

      mockTickerAddFrameStart.mock.calls[0][0](frame);
      mockTickerAddFrame.mock.calls[0][0](frame);

      expect(trace).toEqual(['later:frameStart', 'later:frameUpdate']);
      expect(errorSpy).toHaveBeenCalledTimes(2);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('destory System', async () => {
    const game = new Game();
    await game.init();
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    expect(game.systems.length).toBe(2);

    game.destroySystems();
    expect(game.systems.length).toBe(0);
  });

  it('destory', async () => {
    const game = new Game();
    await game.init({ autoStart: false, needScene: false });
    await game.addSystem(TestSystem);
    await game.addSystem(Test2System);
    expect(game.systems.length).toBe(2);

    game.destroy();
    expect(game.systems.length).toBe(0);
    expect(mockTickerPause).toBeCalled();
    expect(game.ticker).toBeNull();
    expect(game.scene).toBeNull();
    expect(game.canvas).toBeNull();
  });
});
