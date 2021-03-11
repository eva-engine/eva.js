import {mocked} from 'ts-jest/utils';
import {Game, Scene, GameObject} from '../lib';
import Ticker from '../lib/game/Ticker';
import {TestSystem, TestComponent} from '@eva/plugin-renderer-test';

const MockTicker = mocked(Ticker, true);
const mockTickerAdd = jest.fn();
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
    mockTickerUpdate.mockClear();
    mockTickerRemove.mockClear();
    mockTickerStart.mockClear();
    mockTickerPause.mockClear();
    mockTickerActive.mockClear();
    mockTickerBackground.mockClear();
    mockTickerBindEvent.mockClear();
  });

  it('make game with default props', () => {
    const game = new Game();
    expect(game.scene).toBeInstanceOf(Scene);
    expect(MockTicker).toHaveBeenCalledTimes(1);
    expect(mockTickerAdd).toHaveBeenCalledTimes(1);
    expect(mockTickerStart).toHaveBeenCalledTimes(1);
  });

  it('make game with custon props', () => {
    const game = new Game({
      systems: [new TestSystem()],
      needScene: false,
      autoStart: false,
    });
    expect(game.scene).toBeUndefined();
    expect(MockTicker).toHaveBeenCalledTimes(1);
    expect(mockTickerAdd).toHaveBeenCalledTimes(1);
  });

  it('add system instance', () => {
    const game = new Game();
    const system = new TestSystem();
    game.addSystem(system);
    expect(game.systems).toContain(system);
    expect(game.systems.length).toBe(1);
  });

  it('add system constructor', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    expect(game.systems[0]).toBeInstanceOf(TestSystem);
  });

  it('add system twice', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    game.addSystem(TestSystem);
    expect(`${TestSystem.systemName} System has been added`).toHaveBeenWarned();
  });

  it('add any other things', () => {
    const system: any = null;
    const game = new Game();
    game.addSystem(system);
    expect(`can only add System`).toHaveBeenWarned();
  });
  it('remove system successfully by systemName', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    game.removeSystem(TestSystem.systemName);
    expect(game.systems.length).toBe(0);
  });

  it('remove system successfully by constructor', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    game.removeSystem(TestSystem);
    expect(game.systems.length).toBe(0);
  });

  it('remove system successfully by system instance', () => {
    const game = new Game();
    const testSys = new TestSystem();
    game.addSystem(testSys);
    expect(game.systems.length).toBe(1);
    game.removeSystem(testSys);
    expect(game.systems.length).toBe(0);
  });

  it('when throug in anything else', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);
    let system: any = null;
    game.removeSystem(system);
    expect(game.systems.length).toBe(1);
  });

  it('get system by systemName', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    const system = game.getSystem(TestSystem.systemName);
    expect(system).toBeInstanceOf(TestSystem);
  });

  it('get system by system constructor', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    const system = game.getSystem(TestSystem);
    expect(system).toBeInstanceOf(TestSystem);
  });

  it('pause', () => {
    const game = new Game();
    game.pause();
    expect(mockTickerPause).toBeCalled();
    expect(game.playing).toBeFalsy();
  });

  it('pause when pausing', () => {
    const game = new Game({autoStart: false});
    game.pause();
    expect(mockTickerPause).not.toBeCalled();
    expect(game.playing).toBeFalsy();
  });

  it('start', () => {
    const game = new Game({autoStart: false});
    game.start();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('start when playing', () => {
    const game = new Game();
    game.start();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('resume', () => {
    const game = new Game({autoStart: false});
    game.resume();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  it('resume when playing', () => {
    const game = new Game();
    game.resume();
    expect(mockTickerStart).toBeCalled();
    expect(game.playing).toBeTruthy();
  });

  /**
   * component start method called
   * system start method called
   * component onPlay method Called
   */
  it('trigger Start', () => {
    const game = new Game({
      systems: [new TestSystem()],
    });

    // add gameobject and compnents
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    game.scene.addGameObject(gameObj);

    game.triggerResume();
  });

  it('tritter Pause', () => {
    const game = new Game({
      systems: [new TestSystem()],
    });

    // add gameobject and compnents
    const gameObj = new GameObject('gameObj');
    gameObj.addComponent(TestComponent);
    game.scene.addGameObject(gameObj);

    game.triggerPause();
  });

  it('trigger pause without scene', () => {
    const game = new Game({needScene: false, systems: [new TestSystem()]});
    game.triggerPause();
  });

  it('init tracker', () => {
    // first called in constructor
    const game = new Game({
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

  it('init ticker without scene', () => {
    new Game({needScene: false});
    const fn = mockTickerAdd.mock.calls[0][0];
    fn();
    expect(mockTickerAdd).toBeCalled();
    expect(mockTickerAdd).toBeCalledTimes(1);
  });

  it('destory System', () => {
    const game = new Game();
    game.addSystem(TestSystem);
    expect(game.systems.length).toBe(1);

    game.destroySystems();
    expect(game.systems.length).toBe(0);
  });

  it('destory', () => {
    const game = new Game();
    game.destroy();

    expect(mockTickerPause).toBeCalled();
    expect(game.ticker).toBeNull();
    expect(game.scene).toBeNull();
    expect(game.canvas).toBeNull();
  });
});
