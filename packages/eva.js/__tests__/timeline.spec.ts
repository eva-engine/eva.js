import { createNowTime } from '../lib/timeline/utils';
import type { FrameCallback, FrameParams } from '../lib';

describe('timeline clock', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prefers performance.now over Date.now', () => {
    jest.spyOn(performance, 'now').mockReturnValue(10);
    jest.spyOn(Date, 'now').mockReturnValue(20);

    const now = createNowTime();

    expect(now()).toBe(10);
  });

  it('keeps the Date.now fallback non-decreasing when the wall clock regresses', () => {
    const performanceDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'performance');
    Object.defineProperty(globalThis, 'performance', { configurable: true, value: undefined });
    jest.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(90).mockReturnValueOnce(110);

    try {
      const now = createNowTime();

      expect([now(), now(), now()]).toEqual([100, 100, 110]);
    } finally {
      if (performanceDescriptor) {
        Object.defineProperty(globalThis, 'performance', performanceDescriptor);
      } else {
        delete (globalThis as any).performance;
      }
    }
  });

  it('exports the physical frame callback contract from the package entry', () => {
    const callback: FrameCallback = (frame: FrameParams) => frame.rafFrameCount;

    expect(typeof callback).toBe('function');
  });
});
