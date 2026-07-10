import Ticker from '../lib/game/Ticker';
import { requestAnimationFrameMock } from './__mocks__/requestAnimationFrame';

describe('Ticker', () => {
  let ticker: Ticker;
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  it('add raf callback to ticker', () => {
    ticker = new Ticker({ frameRate: 60 });
    const callback1 = jest.fn();
    ticker.add(callback1);

    requestAnimationFrameMock.stepTo(0);
    requestAnimationFrameMock.advanceBy(17);

    expect(callback1).toBeCalled();
    const params = callback1.mock.calls[0][0];
    expect(params.deltaTime).toBeGreaterThan(16);
  });

  it('add null callback to ticker', () => {
    ticker = new Ticker({ autoStart: false, frameRate: 60 });
    ticker.add(null);
    ticker.start();

    requestAnimationFrameMock.triggerNextAnimationFrame();

    expect(requestAnimationFrameMock.queue.size).toBe(1);
  });

  it('it trigger raf less than 17ms', () => {
    ticker = new Ticker({ frameRate: 60 });
    const callback = jest.fn();
    ticker.add(callback);

    requestAnimationFrameMock.stepTo(0);
    requestAnimationFrameMock.advanceBy(10);
    expect(callback).not.toBeCalled();

    requestAnimationFrameMock.advanceBy(8);
    expect(callback).toBeCalled();
  });

  it('remove raf callback', () => {
    ticker = new Ticker({ frameRate: 60 });
    const callback = jest.fn();
    ticker.add(callback);

    requestAnimationFrameMock.stepTo(0);
    requestAnimationFrameMock.advanceBy(17);
    expect(callback).toBeCalled();
    expect(callback).toBeCalledTimes(1);

    ticker.remove(callback);
    requestAnimationFrameMock.advanceBy(17);
    expect(callback).toBeCalledTimes(1);
  });

  it('pause ticker', () => {
    ticker = new Ticker();
    ticker.start();
    expect(requestAnimationFrameMock.queue.size).toBe(1);

    ticker.pause();
    expect(requestAnimationFrameMock.queue.size).toBe(0);
  });

  it('uses the RAF timestamp to advance one logical update', () => {
    ticker = new Ticker({ frameRate: 60 });
    const callback = jest.fn();
    ticker.add(callback);

    requestAnimationFrameMock.stepTo(0);
    requestAnimationFrameMock.advanceBy(1000 / 60);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('exposes physical frame start and frame update channels', () => {
    ticker = new Ticker({ autoStart: false });

    expect(typeof (ticker as any).addFrameStart).toBe('function');
    expect(typeof (ticker as any).removeFrameStart).toBe('function');
    expect(typeof (ticker as any).addFrame).toBe('function');
    expect(typeof (ticker as any).removeFrame).toBe('function');
  });

  describe('physical frame channels', () => {
    it('runs both physical phases with zero logical updates on the first frame', () => {
      ticker = new Ticker({ frameRate: 60 });
      const order: string[] = [];
      const frames: any[] = [];
      ticker.addFrameStart(frame => order.push(`start:${frame.updatesThisFrame}`));
      ticker.add(() => order.push('logical'));
      ticker.addFrame(frame => {
        frames.push(frame);
        order.push(`frame:${frame.updatesThisFrame}`);
      });

      requestAnimationFrameMock.stepTo(0);

      expect(order).toEqual(['start:0', 'frame:0']);
      expect(frames[0]).toMatchObject({
        rafTime: 0,
        rafDeltaTime: 0,
        rafFps: 0,
        rafFrameCount: 1,
        updatesThisFrame: 0,
        interpolationAlpha: 0,
        simulationTime: 0,
        playbackRate: 1,
      });
    });

    it('orders two logical updates between the physical phases', () => {
      ticker = new Ticker({ frameRate: 60 });
      const order: string[] = [];
      ticker.addFrameStart(frame => order.push(`start:${frame.updatesThisFrame}`));
      ticker.add(() => order.push('logical'));
      ticker.addFrame(frame => order.push(`frame:${frame.updatesThisFrame}`));
      requestAnimationFrameMock.stepTo(0);
      order.length = 0;

      requestAnimationFrameMock.advanceBy(1000 / 30);

      expect(order).toEqual(['start:2', 'logical', 'logical', 'frame:2']);
    });

    it('caps a tab-gap frame at five logical updates between the physical phases', () => {
      ticker = new Ticker({ frameRate: 60 });
      const order: string[] = [];
      ticker.addFrameStart(frame => order.push(`start:${frame.updatesThisFrame}`));
      ticker.add(() => order.push('logical'));
      ticker.addFrame(frame => order.push(`frame:${frame.updatesThisFrame}`));
      requestAnimationFrameMock.stepTo(0);
      order.length = 0;

      requestAnimationFrameMock.advanceBy(200);

      expect(order).toEqual(['start:5', 'logical', 'logical', 'logical', 'logical', 'logical', 'frame:5']);
    });

    it('runs frame callbacks by ascending priority and removes them by identity', () => {
      ticker = new Ticker({ frameRate: 60 });
      const order: string[] = [];
      const start1 = () => order.push('start:1');
      const start5 = () => order.push('start:5');
      const start10 = () => order.push('start:10');
      const frame1 = () => order.push('frame:1');
      const frame5 = () => order.push('frame:5');
      const frame5Later = () => order.push('frame:5-later');
      const frame10 = () => order.push('frame:10');
      ticker.addFrameStart(start10, 10);
      ticker.addFrameStart(start1, 1);
      ticker.addFrameStart(start5, 5);
      ticker.addFrame(frame10, 10);
      ticker.addFrame(frame1, 1);
      ticker.addFrame(frame5, 5);
      ticker.addFrame(frame5Later, 5);

      requestAnimationFrameMock.stepTo(0);
      expect(order).toEqual(['start:1', 'start:5', 'start:10', 'frame:1', 'frame:5', 'frame:5-later', 'frame:10']);

      order.length = 0;
      ticker.removeFrameStart(start5);
      ticker.removeFrame(frame5);
      requestAnimationFrameMock.advanceBy(1);
      expect(order).toEqual(['start:1', 'start:10', 'frame:1', 'frame:5-later', 'frame:10']);
    });

    it('uses a stable frame callback snapshot when callbacks mutate the channel', () => {
      ticker = new Ticker({ frameRate: 60 });
      const order: string[] = [];
      const added = () => order.push('added');
      const removed = () => order.push('removed');
      const mutator = () => {
        order.push('mutator');
        ticker.removeFrame(removed);
        ticker.addFrame(added, 2);
      };
      ticker.addFrame(mutator, 0);
      ticker.addFrame(removed, 1);

      requestAnimationFrameMock.stepTo(0);
      expect(order).toEqual(['mutator', 'removed']);

      order.length = 0;
      requestAnimationFrameMock.advanceBy(1);
      expect(order).toEqual(['mutator', 'added']);
    });

    it('keeps 59.94 Hz jitter on one physical callback pair with bounded interpolation', () => {
      ticker = new Ticker({ frameRate: 60 });
      const starts: any[] = [];
      const frames: any[] = [];
      ticker.addFrameStart(frame => starts.push(frame));
      ticker.addFrame(frame => frames.push(frame));
      requestAnimationFrameMock.stepTo(0);
      starts.length = 0;
      frames.length = 0;

      const baseInterval = 1000 / 59.94;
      const jitterPattern = [-0.75, 0.55, -0.25, 0.85, -0.4];
      const intervals = Array.from({ length: 60 }, (_, index) => baseInterval + jitterPattern[index % 5]);
      for (const interval of intervals) {
        requestAnimationFrameMock.advanceBy(interval);
      }

      expect(starts).toHaveLength(intervals.length);
      expect(frames).toHaveLength(intervals.length);
      expect(frames.map(frame => frame.updatesThisFrame)).toContain(0);
      expect(frames.map(frame => frame.updatesThisFrame)).toContain(2);
      for (let index = 0; index < frames.length; index++) {
        expect(starts[index].updatesThisFrame).toBe(frames[index].updatesThisFrame);
        expect(frames[index].interpolationAlpha).toBeGreaterThanOrEqual(0);
        expect(frames[index].interpolationAlpha).toBeLessThan(1);
        expect(Number.isFinite(frames[index].rafFps)).toBe(true);
        if (index > 0) {
          expect(frames[index].simulationTime).toBeGreaterThanOrEqual(frames[index - 1].simulationTime);
          expect(frames[index].rafTime).toBeGreaterThanOrEqual(frames[index - 1].rafTime);
        }
      }
    });

    it('freezes logical updates at playback rate zero while physical frames continue', () => {
      ticker = new Ticker({ frameRate: 60 });
      const logical = jest.fn();
      const frames: any[] = [];
      ticker.add(logical);
      ticker.addFrame(frame => frames.push(frame));
      ticker.setPlaybackRate(0);

      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(1000);

      expect(logical).not.toHaveBeenCalled();
      expect(frames).toHaveLength(2);
      expect(frames[1]).toMatchObject({
        playbackRate: 0,
        updatesThisFrame: 0,
        interpolationAlpha: 0,
        simulationTime: 0,
      });
    });

    it('advances one logical update for two fixed steps at playback rate 0.5', () => {
      ticker = new Ticker({ frameRate: 60 });
      const logical = jest.fn();
      const frames: any[] = [];
      ticker.add(logical);
      ticker.addFrame(frame => frames.push(frame));
      ticker.setPlaybackRate(0.5);

      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy((1000 / 60) * 2);

      expect(logical).toHaveBeenCalledTimes(1);
      expect(frames[1].playbackRate).toBe(0.5);
      expect(frames[1].updatesThisFrame).toBe(1);
      expect(frames[1].simulationTime).toBeCloseTo(1000 / 60);
    });

    it('advances two logical updates for one fixed step at playback rate 2', () => {
      ticker = new Ticker({ frameRate: 60 });
      const logical = jest.fn();
      const frames: any[] = [];
      ticker.add(logical);
      ticker.addFrame(frame => frames.push(frame));
      ticker.setPlaybackRate(2);

      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(1000 / 60);

      expect(logical).toHaveBeenCalledTimes(2);
      expect(frames[1].playbackRate).toBe(2);
      expect(frames[1].updatesThisFrame).toBe(2);
      expect(frames[1].simulationTime).toBeCloseTo((1000 / 60) * 2);
    });

    it.each([
      ['NaN', Number.NaN],
      ['positive infinity', Number.POSITIVE_INFINITY],
      ['negative infinity', Number.NEGATIVE_INFINITY],
      ['a negative number', -0.5],
    ])('rejects %s playback rate without corrupting clock state', (_label, invalidRate) => {
      const frameDuration = 1000 / 60;
      ticker = new Ticker({ frameRate: 60 });
      const logical = jest.fn();
      const frames: any[] = [];
      ticker.add(logical);
      ticker.addFrame(frame => frames.push(frame));
      ticker.setPlaybackRate(0.5);
      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(frameDuration);
      expect(logical).not.toHaveBeenCalled();
      expect(frames[1].interpolationAlpha).toBeCloseTo(0.5);

      let thrown: unknown;
      try {
        ticker.setPlaybackRate(invalidRate);
      } catch (error) {
        thrown = error;
      }

      requestAnimationFrameMock.advanceBy(frameDuration);
      const frameAfterRejection = frames[2];
      ticker.setPlaybackRate(1);
      requestAnimationFrameMock.advanceBy(frameDuration);

      expect(thrown).toBeInstanceOf(RangeError);
      expect(frameAfterRejection).toMatchObject({
        playbackRate: 0.5,
        updatesThisFrame: 1,
        interpolationAlpha: 0,
      });
      expect(logical).toHaveBeenCalledTimes(2);
      for (const frame of frames) {
        for (const value of Object.values(frame)) {
          expect(Number.isFinite(value)).toBe(true);
        }
        expect(frame.updatesThisFrame).toBeGreaterThanOrEqual(0);
        expect(frame.updatesThisFrame).toBeLessThanOrEqual(5);
      }
    });

    it('skips dropped whole steps on the simulation timeline while preserving the fractional remainder', () => {
      const frameDuration = 1000 / 60;
      ticker = new Ticker({ frameRate: 60 });
      const logicalFrames: Array<{ time: number; currentTime: number }> = [];
      const frameStarts: any[] = [];
      const frames: any[] = [];
      ticker.add(params => logicalFrames.push({ time: params.time, currentTime: params.currentTime }));
      ticker.addFrameStart(frame => frameStarts.push(frame));
      ticker.addFrame(frame => frames.push(frame));
      requestAnimationFrameMock.stepTo(0);

      requestAnimationFrameMock.advanceBy(frameDuration * 12.5);
      expect(logicalFrames).toHaveLength(5);
      logicalFrames.forEach((params, index) => {
        expect(params.time).toBeCloseTo(frameDuration * (index + 1));
        expect(params.currentTime).toBe(params.time);
      });
      expect(frameStarts[1].simulationTime).toBe(0);
      expect(frames[1].updatesThisFrame).toBe(5);
      expect(frames[1].simulationTime).toBeCloseTo(frameDuration * 12);
      expect(frames[1].interpolationAlpha).toBeCloseTo(0.5);

      requestAnimationFrameMock.advanceBy(frameDuration * 0.5);
      expect(logicalFrames).toHaveLength(6);
      expect(logicalFrames[5].time).toBeCloseTo(frameDuration * 13);
      expect(logicalFrames[5].currentTime).toBe(logicalFrames[5].time);
      expect(frameStarts[2].simulationTime).toBeCloseTo(frameDuration * 12);
      expect(frames[2].updatesThisFrame).toBe(1);
      expect(frames[2].interpolationAlpha).toBeCloseTo(0);
      expect(frames[2].simulationTime).toBeCloseTo(frameDuration * 13);

      requestAnimationFrameMock.advanceBy(frameDuration);
      expect(logicalFrames).toHaveLength(7);
      expect(logicalFrames[6].time).toBeCloseTo(frameDuration * 14);
      expect(logicalFrames[6].currentTime).toBe(logicalFrames[6].time);
      expect(frameStarts[3].simulationTime).toBeCloseTo(frameDuration * 13);
      expect(frames[3].updatesThisFrame).toBe(1);
      expect(frames[3].simulationTime).toBeCloseTo(frameDuration * 14);
      expect(frames[3].interpolationAlpha).toBeCloseTo(0);
    });

    it('clamps a regressing RAF timestamp to a monotonic physical clock', () => {
      ticker = new Ticker({ frameRate: 60 });
      const frames: any[] = [];
      ticker.addFrame(frame => frames.push(frame));

      requestAnimationFrameMock.stepTo(100);
      requestAnimationFrameMock.stepTo(90);
      requestAnimationFrameMock.stepTo(110);

      expect(frames[1].rafTime).toBe(100);
      expect(frames[1].rafDeltaTime).toBe(0);
      expect(frames[1].simulationTime).toBe(frames[0].simulationTime);
      expect(frames[2].rafTime).toBe(110);
      expect(frames[2].rafDeltaTime).toBe(10);
    });

    it('rebases the clock on resume without changing the configured playback rate', () => {
      ticker = new Ticker({ autoStart: false, frameRate: 60 });
      const logical = jest.fn();
      const frames: any[] = [];
      ticker.add(logical);
      ticker.addFrame(frame => frames.push(frame));
      ticker.setPlaybackRate(0.5);
      ticker.start();
      requestAnimationFrameMock.stepTo(0);

      ticker.pause();
      expect(requestAnimationFrameMock.queue.size).toBe(0);
      ticker.start();
      requestAnimationFrameMock.stepTo(10_000);

      expect(logical).not.toHaveBeenCalled();
      expect(frames[1]).toMatchObject({
        rafDeltaTime: 0,
        updatesThisFrame: 0,
        playbackRate: 0.5,
      });

      requestAnimationFrameMock.advanceBy((1000 / 60) * 2);
      expect(logical).toHaveBeenCalledTimes(1);
    });

    it('uses performance.now for manual updates when no RAF timestamp is supplied', () => {
      const now = jest
        .spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1000 / 60);
      try {
        ticker = new Ticker({ autoStart: false, frameRate: 60 });
        const logical = jest.fn();
        ticker.add(logical);

        ticker.update();
        ticker.update();

        expect(logical).toHaveBeenCalledTimes(1);
      } finally {
        now.mockRestore();
      }
    });
  });

  describe('catch-up frames (低电量模式 / RAF 节流场景)', () => {
    it('RAF 节流到 30fps 时应通过补帧保持游戏时间同步', () => {
      // 60fps ticker，每帧间隔 ~16.67ms
      ticker = new Ticker({ frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 模拟 30fps RAF：在 34ms 时刻触发一次 update
      // 期望补帧 2 次（34ms / 16.67ms ≈ 2）
      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(34);

      expect(callback).toBeCalledTimes(2);
      // 每次回调的 deltaTime 都应是固定的帧间隔
      callback.mock.calls.forEach(call => {
        expect(call[0].deltaTime).toBeCloseTo(1000 / 60, 0);
      });
      // frameCount 应连续递增
      expect(callback.mock.calls[0][0].frameCount).toBe(1);
      expect(callback.mock.calls[1][0].frameCount).toBe(2);
    });

    it('RAF 节流到 20fps 时应补帧 3 次', () => {
      ticker = new Ticker({ frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // ~50ms 间隔，51 / 16.67 ≈ 3 帧
      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(51);

      expect(callback).toBeCalledTimes(3);
    });

    it('长时间挂起应限制最大补帧数为 5', () => {
      ticker = new Ticker({ frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 200ms 间隔，理论 12 帧，但应被限制为 5
      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(200);

      expect(callback).toBeCalledTimes(5);
    });

    it('补帧达到上限后应重新同步时间，不会在下次持续追帧', () => {
      ticker = new Ticker({ frameRate: 60 });
      const callback = jest.fn();
      ticker.add(callback);

      // 第一次：长时间挂起，触发上限
      requestAnimationFrameMock.stepTo(0);
      requestAnimationFrameMock.advanceBy(200);
      expect(callback).toBeCalledTimes(5);

      callback.mockClear();

      // 第二次：正常间隔，不应再有多余的补帧
      requestAnimationFrameMock.advanceBy(17);
      expect(callback).toBeCalledTimes(1);
    });

    it('累计游戏时间应与真实时间大致同步', () => {
      ticker = new Ticker({ frameRate: 60 });
      let totalGameTime = 0;
      ticker.add(params => {
        totalGameTime += params.deltaTime;
      });

      // 模拟 30fps RAF：连续 10 次，每次间隔 33ms
      const intervals = 10;
      requestAnimationFrameMock.stepTo(0);
      for (let i = 0; i < intervals; i++) {
        requestAnimationFrameMock.advanceBy(33);
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
