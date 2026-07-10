import { createFrameRecorder, createRateMeter } from '../src/benchmark-metrics';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface TestFrame {
  rafTime: number;
  rafDeltaTime: number;
  rafFps: number;
  rafFrameCount: number;
  updatesThisFrame: number;
}

const frame = (
  rafTime: number,
  rafDeltaTime: number,
  updatesThisFrame: number,
  rafFrameCount = Math.round(rafTime),
): TestFrame => ({
  rafTime,
  rafDeltaTime,
  rafFps: rafDeltaTime > 0 ? 1000 / rafDeltaTime : 0,
  rafFrameCount,
  updatesThisFrame,
});

const helperSource = readFileSync(resolve(__dirname, '../src/benchmark-metrics.ts'), 'utf8');

describe('benchmark rate meter', () => {
  test('reports 60 physical presents and 60 logical updates separately', () => {
    const meter = createRateMeter();
    let snapshot;

    for (let i = 1; i <= 60; i++) {
      snapshot = meter.record(frame((i * 1000) / 60, 1000 / 60, 1)) || snapshot;
    }

    expect(snapshot).toBeDefined();
    expect(snapshot!.rafFps).toBeCloseTo(60, 8);
    expect(snapshot!.logicUps).toBeCloseTo(60, 8);
    expect(snapshot!.presentFrameCount).toBe(60);
    expect(snapshot!.logicalUpdateCount).toBe(60);
    expect(snapshot!.updatesPerRaf).toEqual([0, 60, 0, 0, 0, 0]);
  });

  test('reports 30 physical presents and 60 logical updates without calling UPS FPS', () => {
    const meter = createRateMeter();
    let snapshot;

    for (let i = 1; i <= 30; i++) {
      snapshot = meter.record(frame((i * 1000) / 30, 1000 / 30, 2)) || snapshot;
    }

    expect(snapshot).toBeDefined();
    expect(snapshot!.rafFps).toBeCloseTo(30, 8);
    expect(snapshot!.logicUps).toBeCloseTo(60, 8);
    expect(snapshot!.updatesPerRaf).toEqual([0, 0, 30, 0, 0, 0]);
  });

  test('reports 120 physical presents and 60 logical updates with zero-step frames', () => {
    const meter = createRateMeter();
    let snapshot;

    for (let i = 1; i <= 120; i++) {
      snapshot = meter.record(frame((i * 1000) / 120, 1000 / 120, i % 2)) || snapshot;
    }

    expect(snapshot).toBeDefined();
    expect(snapshot!.rafFps).toBeCloseTo(120, 8);
    expect(snapshot!.logicUps).toBeCloseTo(60, 8);
    expect(snapshot!.updatesPerRaf).toEqual([60, 60, 0, 0, 0, 0]);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores invalid RAF delta %p', rafDeltaTime => {
    const meter = createRateMeter();

    expect(meter.record(frame(1, rafDeltaTime, 5))).toBeUndefined();
    expect(meter.current).toEqual({
      elapsedTime: 0,
      presentFrameCount: 0,
      logicalUpdateCount: 0,
      updatesPerRaf: [0, 0, 0, 0, 0, 0],
    });
  });
});

describe('bounded physical-frame recorder', () => {
  test('keeps the newest samples in chronological order and counts only ring overwrites as dropped', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(0, 0, 0));

    for (let i = 1; i <= 5; i++) {
      recorder.record(frame(i, i, i));
    }

    const report = recorder.stop()!;
    expect(report.analysis.sampleCount).toBe(5);
    expect(report.analysis.retainedSampleCount).toBe(3);
    expect(report.analysis.droppedSampleCount).toBe(2);
    expect(report.raw.map(sample => sample.time)).toEqual([3, 4, 5]);
    expect(report.raw.map(sample => sample.deltaTime)).toEqual([3, 4, 5]);
    expect(report.raw.map(sample => sample.presentFrame)).toEqual([3, 4, 5]);
    expect(report.raw.map(sample => sample.updateCount)).toEqual([3, 4, 5]);
    expect((report.analysis as any).droppedLogicalUpdateCount).toBeUndefined();
  });

  test('computes online population statistics, strict thresholds, and update bins over the full session', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(0, 0, 0));
    recorder.record(frame(1, 10, 0));
    recorder.record(frame(2, 20, 1));
    recorder.record(frame(3, 30, 2));
    recorder.record(frame(4, 40, 5));

    const analysis = recorder.stop()!.analysis;
    expect(analysis.avgDelta).toBe(25);
    expect(analysis.meanDelta).toBe(25);
    expect(analysis.minDelta).toBe(10);
    expect(analysis.maxDelta).toBe(40);
    expect(analysis.stdDev).toBeCloseTo(Math.sqrt(125), 10);
    expect(analysis.slowFrames).toBe(2);
    expect(analysis.verySlowFrames).toBe(1);
    expect(analysis.updatesPerRaf).toEqual([1, 1, 1, 0, 0, 1]);
  });

  test('maintains only the slowest ten samples and freezes them in descending order', () => {
    const recorder = createFrameRecorder({ capacity: 4 });
    recorder.start();
    recorder.record(frame(0, 0, 0));

    for (let i = 1; i <= 12; i++) {
      recorder.record(frame(i, i + 4, i % 6));
    }

    const report = recorder.stop()!;
    expect(report.analysis.slowestFrames).toHaveLength(10);
    expect(report.analysis.slowestFrames.map(sample => sample.deltaTime)).toEqual([
      16, 15, 14, 13, 12, 11, 10, 9, 8, 7,
    ]);
    expect(report.analysis.sampleCount).toBe(12);
    expect(report.analysis.retainedSampleCount).toBe(4);
  });

  test('keeps the hot record path allocation-free for slowest-frame candidates', () => {
    const recorderStart = helperSource.indexOf('export const createFrameRecorder');
    const recordStart = helperSource.indexOf('    record(frame) {', recorderStart);
    const recordEnd = helperSource.indexOf('    stop() {', recordStart);

    expect(recorderStart).toBeGreaterThan(-1);
    expect(recordStart).toBeGreaterThan(-1);
    expect(recordEnd).toBeGreaterThan(recordStart);
    expect(helperSource.slice(recordStart, recordEnd)).not.toContain('createRecordedFrame(');
  });

  test('uses the first physical frame only as a session clock anchor', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();

    expect(recorder.record(frame(100, 17, 1, 6))).toBeUndefined();
    expect(recorder.sampleCount).toBe(0);
    recorder.record(frame(117, 17, 2, 7));

    const report = recorder.stop()!;
    expect(report.analysis.sampleCount).toBe(1);
    expect(report.raw[0]).toMatchObject({
      time: 17,
      deltaTime: 17,
      fps: 59,
      presentFrame: 7,
      updateCount: 2,
      rafTime: 117,
      rafDeltaTime: 17,
      rafFrameCount: 7,
      updatesThisFrame: 2,
    });
    expect(report.raw[0].rafFps).toBeCloseTo(1000 / 17, 10);
  });

  test('records the exact duration boundary, auto-stops there, and ignores later frames', () => {
    const recorder = createFrameRecorder({ capacity: 5, maxDuration: 60 });
    recorder.start();
    recorder.record(frame(100, 0, 0));
    recorder.record(frame(159, 59, 1));

    const automaticReport = recorder.record(frame(160, 1, 0));
    expect(automaticReport).toBeDefined();
    expect(recorder.recording).toBe(false);
    expect(automaticReport!.analysis.sampleCount).toBe(2);
    expect(automaticReport!.raw.map(sample => sample.time)).toEqual([59, 60]);

    expect(recorder.record(frame(161, 1, 1))).toBeUndefined();
    expect(recorder.stop()).toBe(automaticReport);
  });

  test('stop is idempotent and restarting cannot mutate an old lazy report', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(0, 0, 0));
    recorder.record(frame(1, 10, 1));

    const first = recorder.stop()!;
    expect(recorder.stop()).toBe(first);
    expect(Object.getOwnPropertyDescriptor(first, 'raw')!.get).toEqual(expect.any(Function));
    expect(Object.getOwnPropertyDescriptor(first, 'csv')!.get).toEqual(expect.any(Function));

    recorder.start();
    recorder.record(frame(100, 0, 0));
    recorder.record(frame(102, 40, 2));
    const second = recorder.stop()!;

    expect(second).not.toBe(first);
    expect(second.analysis.avgDelta).toBe(40);
    expect(first.analysis.avgDelta).toBe(10);
    expect(first.raw.map(sample => sample.deltaTime)).toEqual([10]);
    expect(first.csv).toContain('\n1.00,10.00,100,1,1\n');
  });

  test('every start begins a fresh session even if the previous session was still recording', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(0, 0, 0));
    recorder.record(frame(1, 10, 1));

    recorder.start();
    recorder.record(frame(100, 0, 0));
    recorder.record(frame(101, 30, 2));

    const report = recorder.stop()!;
    expect(report.analysis.sampleCount).toBe(1);
    expect(report.analysis.avgDelta).toBe(30);
    expect(report.raw.map(sample => sample.time)).toEqual([1]);
  });

  test('stops an empty anchored session with stable zero-valued legacy analysis', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(100, 0, 0));

    const report = recorder.stop()!;
    expect(report.analysis).toMatchObject({
      duration: 0,
      sampleCount: 0,
      retainedSampleCount: 0,
      droppedSampleCount: 0,
      avgDelta: 0,
      minDelta: 0,
      maxDelta: 0,
      stdDev: 0,
      slowFrames: 0,
      verySlowFrames: 0,
    });
    expect(report.raw).toEqual([]);
    expect(report.csv).toBe('Time(ms),DeltaTime(ms),FPS,PresentFrame,UpdateCount\n');
    expect(recorder.stop()).toBe(report);
  });

  test('ignores non-finite timestamps and invalid deltas without polluting statistics', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(Number.NaN, 16, 1));
    recorder.record(frame(0, 0, 0));
    recorder.record(frame(1, 0, 1));
    recorder.record(frame(2, -1, 2));
    recorder.record(frame(3, Number.NaN, 3));
    recorder.record(frame(4, Number.POSITIVE_INFINITY, 4));
    recorder.record(frame(5, 5, 1));

    const report = recorder.stop()!;
    expect(report.analysis.sampleCount).toBe(1);
    expect(report.analysis.avgDelta).toBe(5);
    expect(report.analysis.updatesPerRaf).toEqual([0, 1, 0, 0, 0, 0]);
    expect(report.raw.map(sample => sample.time)).toEqual([5]);
  });

  test('materializes bounded raw rows and CSV only through lazy getters', () => {
    const recorder = createFrameRecorder({ capacity: 3 });
    recorder.start();
    recorder.record(frame(0, 0, 0));
    for (let i = 1; i <= 5; i++) recorder.record(frame(i, 10 + i, i % 6));

    const report = recorder.stop()!;
    const rawDescriptor = Object.getOwnPropertyDescriptor(report, 'raw')!;
    const csvDescriptor = Object.getOwnPropertyDescriptor(report, 'csv')!;
    expect(rawDescriptor).not.toHaveProperty('value');
    expect(csvDescriptor).not.toHaveProperty('value');
    expect(rawDescriptor.get).toEqual(expect.any(Function));
    expect(csvDescriptor.get).toEqual(expect.any(Function));

    expect(report.raw).toHaveLength(3);
    const lines = report.csv.trim().split('\n');
    expect(lines[0]).toBe('Time(ms),DeltaTime(ms),FPS,PresentFrame,UpdateCount');
    expect(lines).toHaveLength(4);
  });

  test('defaults to a 16,384-entry ring and does not consult the global clock', () => {
    const recorder = createFrameRecorder();
    const now = jest.spyOn(performance, 'now').mockImplementation(() => {
      throw new Error('the recorder must use FrameParams.rafTime');
    });

    try {
      expect(recorder.capacity).toBe(16384);
      recorder.start();
      recorder.record(frame(0, 0, 0));
      recorder.record(frame(1, 1, 1));
      expect(recorder.stop()!.analysis.sampleCount).toBe(1);
      expect(now).not.toHaveBeenCalled();
    } finally {
      now.mockRestore();
    }
  });
});

describe('benchmark physical-frame integration', () => {
  const source = readFileSync(resolve(__dirname, '../src/benchmark.ts'), 'utf8');

  test('records and meters from one physical-frame callback, never from Movement', () => {
    const movementBody = source.slice(source.indexOf('class Movement'), source.indexOf('export async function init'));

    expect(source).toContain("from './benchmark-metrics'");
    expect(source.match(/game\.ticker\.addFrame\(/g)).toHaveLength(1);
    expect(movementBody).not.toContain('deltaRecorder');
    expect(movementBody).not.toContain('isFirstUpdate');
  });

  test('labels physical presentation and logical update rates unambiguously', () => {
    expect(source).toContain('RAF FPS');
    expect(source).toContain('Logic UPS');
    expect(source).toContain('U/RAF');
    expect(source).not.toContain('`FPS: ${fps}');
  });

  test('preserves debug compatibility and does not let auto-start replace a manual session', () => {
    expect(source).toContain('window.game = game;');
    expect(source).toContain('window.benchmark = {');
    expect(source).toContain('deltaRecorder,');
    expect(source).toContain('startRecording: () => deltaRecorder.start()');
    expect(source).toContain('stopRecording: () => deltaRecorder.stop()');
    expect(source).toContain('addSprites: (count: number) =>');
    expect(source).toContain('removeSprites: (count: number) =>');
    expect(source).toMatch(/setTimeout\(\(\) => \{\s*if \(!deltaRecorder\.recording\) deltaRecorder\.start\(\);/);
  });
});
