import Ticker from '../lib/game/Ticker';
import {requestAnimationFrameMock} from './__mocks__/requestAnimationFrame';

function sleep(timeout = 100) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

describe('Ticker', () => {
  let ticker: Ticker;
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  it('add raf callback to ticker', async () => {
    ticker = new Ticker({autoStart: false, frameRate: 60});
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
    ticker = new Ticker({autoStart: false, frameRate: 60});
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
    ticker = new Ticker({autoStart: false, frameRate: 60});
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

  it('active ticker when ticker pausing', async () => {
    ticker = new Ticker({autoStart: false, frameRate: 60});
    ticker.active();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(1);
  });

  it('active ticker when ticker background', async () => {
    ticker = new Ticker({autoStart: false, frameRate: 60});
    ticker.background();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(0);

    ticker.active();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(0);
  });

  it('background ticker when ticker started', async () => {
    ticker = new Ticker({autoStart: false, frameRate: 60});
    ticker.start();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(1);

    ticker.background();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(1);

    ticker.active();
    await sleep(17);
    expect(requestAnimationFrameMock.queue.size).toBe(2);
  });

  afterEach(() => {
    ticker.pause();
    ticker = null;
  });
});
