import Ticker from '../lib/game/Ticker';
import { requestAnimationFrameMock } from './__mocks__/requestAnimationFrame';

function sleep(timeout = 100) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

describe('Ticker', () => {
  let ticker: Ticker;
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  it('add raf callback to ticker', async () => {
    ticker = new Ticker({ autoStart: false, frameRate: 60 });
    const callback1 = jest.fn();
    ticker.add(callback1);

    requestAnimationFrame(() => ticker.update());
    await sleep(17);
    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(callback1).toBeCalled();
    const params = callback1.mock.calls[0][0];
    expect(params.deltaTime).toBeGreaterThan(16);
  });

  it('add null callback to ticker', async () => {
    ticker = new Ticker({ autoStart: false, frameRate: 60 });
    ticker.add(null);
    ticker.start();

    await sleep(17);
    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(1);
  });

  it('it trigger raf less than 17ms', async () => {
    ticker = new Ticker();
    const callback = jest.fn();
    ticker.add(callback);

    await sleep(10);
    expect(requestAnimationFrameMock.queue.size).toBe(1);
    requestAnimationFrameMock.triggerNextAnimationFrame();
    expect(callback).not.toBeCalled();

    await sleep(8);
    expect(requestAnimationFrameMock.queue.size).toBe(1);
    requestAnimationFrameMock.triggerNextAnimationFrame();
    expect(callback).toBeCalled();
  });

  it('remove raf callback', async () => {
    ticker = new Ticker({ autoStart: false, frameRate: 60 });
    const callback = jest.fn();
    ticker.add(callback);

    requestAnimationFrame(() => ticker.update());
    await sleep(17);
    requestAnimationFrameMock.triggerNextAnimationFrame();
    expect(callback).toBeCalled();
    expect(callback).toBeCalledTimes(1);

    ticker.remove(callback);
    requestAnimationFrame(() => ticker.update());
    await sleep(17);
    requestAnimationFrameMock.triggerNextAnimationFrame();
    expect(callback).toBeCalledTimes(1);
  });

  it('pause ticker', async () => {
    ticker = new Ticker();
    ticker.start();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(1);

    ticker.pause();
    await sleep(30);
    expect(requestAnimationFrameMock.queue.size).toBe(1);
  });

  describe('catch-up frames (低电量模式 / RAF 节流场景)', () => {
    it('RAF 节流到 30fps 时应通过补帧保持游戏时间同步', async () => {
      // 60fps ticker，每帧间隔 ~16.67ms
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 模拟 30fps RAF：等待 ~34ms 后才触发一次 update
      // 期望补帧 2 次（34ms / 16.67ms ≈ 2）
      await sleep(34);
      ticker.update();

      expect(callback).toBeCalledTimes(2);
      // 每次回调的 deltaTime 都应是固定的帧间隔
      callback.mock.calls.forEach(call => {
        expect(call[0].deltaTime).toBeCloseTo(1000 / 60, 0);
      });
      // frameCount 应连续递增
      expect(callback.mock.calls[0][0].frameCount).toBe(1);
      expect(callback.mock.calls[1][0].frameCount).toBe(2);
    });

    it('RAF 节流到 20fps 时应补帧 3 次', async () => {
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // ~50ms 间隔，50 / 16.67 ≈ 3 帧
      await sleep(50);
      ticker.update();

      expect(callback).toBeCalledTimes(3);
    });

    it('长时间挂起应限制最大补帧数为 5', async () => {
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 200ms 间隔，理论 12 帧，但应被限制为 5
      await sleep(200);
      ticker.update();

      expect(callback).toBeCalledTimes(5);
    });

    it('补帧达到上限后应重新同步时间，不会在下次持续追帧', async () => {
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 第一次：长时间挂起，触发上限
      await sleep(200);
      ticker.update();
      expect(callback).toBeCalledTimes(5);

      callback.mockClear();

      // 第二次：正常间隔，不应再有多余的补帧
      await sleep(17);
      ticker.update();
      expect(callback).toBeCalledTimes(1);
    });

    it('累计游戏时间应与真实时间大致同步', async () => {
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      let totalGameTime = 0;
      ticker.add((params) => {
        totalGameTime += params.deltaTime;
      });

      // 模拟 30fps RAF：连续 10 次，每次间隔 33ms
      const intervals = 10;
      for (let i = 0; i < intervals; i++) {
        await sleep(33);
        ticker.update();
      }

      const realElapsed = 33 * intervals; // ~330ms
      // 游戏时间应接近真实时间（允许一帧的误差）
      expect(totalGameTime).toBeGreaterThanOrEqual(realElapsed - 1000 / 60);
      expect(totalGameTime).toBeLessThanOrEqual(realElapsed + 1000 / 60);
    });
  });

  afterEach(() => {
    ticker.pause();
    ticker = null;
  });
});
