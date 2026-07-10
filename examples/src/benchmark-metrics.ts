export interface BenchmarkFrame {
  readonly rafTime: number;
  readonly rafDeltaTime: number;
  readonly rafFps?: number;
  readonly rafFrameCount?: number;
  readonly updatesThisFrame: number;
}

export interface RateBucket {
  readonly elapsedTime: number;
  readonly presentFrameCount: number;
  readonly logicalUpdateCount: number;
  readonly updatesPerRaf: readonly number[];
}

export interface RateSnapshot extends RateBucket {
  readonly rafFps: number;
  readonly logicUps: number;
}

export interface RateMeter {
  readonly current: RateBucket;
  record(frame: BenchmarkFrame): RateSnapshot | undefined;
  reset(): void;
}

const UPDATE_BIN_COUNT = 6;
const DEFAULT_RATE_BUCKET_DURATION = 1000;

const normalizeUpdateCount = (updatesThisFrame: number) => {
  if (!Number.isFinite(updatesThisFrame)) return 0;
  return Math.min(UPDATE_BIN_COUNT - 1, Math.max(0, Math.floor(updatesThisFrame)));
};

export const createRateMeter = (bucketDuration = DEFAULT_RATE_BUCKET_DURATION): RateMeter => {
  if (!Number.isFinite(bucketDuration) || bucketDuration <= 0) {
    throw new RangeError('bucketDuration must be a finite positive number');
  }

  let elapsedTime = 0;
  let presentFrameCount = 0;
  let logicalUpdateCount = 0;
  let updatesPerRaf = new Array<number>(UPDATE_BIN_COUNT).fill(0);

  const reset = () => {
    elapsedTime = 0;
    presentFrameCount = 0;
    logicalUpdateCount = 0;
    updatesPerRaf = new Array<number>(UPDATE_BIN_COUNT).fill(0);
  };

  return {
    get current() {
      return {
        elapsedTime,
        presentFrameCount,
        logicalUpdateCount,
        updatesPerRaf: updatesPerRaf.slice(),
      };
    },

    record(frame) {
      const deltaTime = frame.rafDeltaTime;
      if (!Number.isFinite(deltaTime) || deltaTime <= 0) return undefined;

      const updateCount = normalizeUpdateCount(frame.updatesThisFrame);
      elapsedTime += deltaTime;
      presentFrameCount++;
      logicalUpdateCount += updateCount;
      updatesPerRaf[updateCount]++;

      if (elapsedTime + bucketDuration * 1e-12 < bucketDuration) return undefined;

      const snapshot: RateSnapshot = {
        elapsedTime,
        presentFrameCount,
        logicalUpdateCount,
        updatesPerRaf: updatesPerRaf.slice(),
        rafFps: (presentFrameCount * 1000) / elapsedTime,
        logicUps: (logicalUpdateCount * 1000) / elapsedTime,
      };
      reset();
      return snapshot;
    },

    reset,
  };
};

export interface RecordedFrame {
  /** Legacy elapsed-session timestamp. */
  readonly time: number;
  /** Legacy physical-frame delta alias. */
  readonly deltaTime: number;
  /** Legacy rounded physical FPS alias. */
  readonly fps: number;
  readonly presentFrame: number;
  readonly updateCount: number;
  readonly rafTime: number;
  readonly rafDeltaTime: number;
  readonly rafFps: number;
  readonly rafFrameCount: number;
  readonly updatesThisFrame: number;
}

export interface FrameRecorderAnalysis {
  readonly duration: number;
  readonly sampleCount: number;
  readonly retainedSampleCount: number;
  /** Samples overwritten by the bounded raw ring, not logical updates dropped by Ticker. */
  readonly droppedSampleCount: number;
  readonly avgDelta: number;
  readonly meanDelta: number;
  readonly minDelta: number;
  readonly maxDelta: number;
  readonly stdDev: number;
  readonly slowFrames: number;
  readonly verySlowFrames: number;
  readonly updatesPerRaf: readonly number[];
  readonly slowestFrames: readonly RecordedFrame[];
}

export interface FrameRecorderReport {
  readonly analysis: FrameRecorderAnalysis;
  readonly raw: readonly RecordedFrame[];
  readonly csv: string;
}

export interface FrameRecorderOptions {
  capacity?: number;
  maxDuration?: number;
}

export interface FrameRecorder {
  readonly capacity: number;
  readonly maxDuration: number;
  readonly recording: boolean;
  readonly sampleCount: number;
  readonly lastReport: FrameRecorderReport | undefined;
  start(): void;
  record(frame: BenchmarkFrame): FrameRecorderReport | undefined;
  stop(): FrameRecorderReport | undefined;
}

interface RecorderSession {
  recording: boolean;
  anchorTime: number | undefined;
  duration: number;
  sampleCount: number;
  meanDelta: number;
  deltaM2: number;
  minDelta: number;
  maxDelta: number;
  slowFrames: number;
  verySlowFrames: number;
  updatesPerRaf: number[];
  slowestFrames: SlowestFrameSlots;
  elapsedTimes: Float64Array;
  deltaTimes: Float64Array;
  rafTimes: Float64Array;
  rafFpsValues: Float64Array;
  presentFrames: Float64Array;
  updateCounts: Uint8Array;
  report: FrameRecorderReport | undefined;
}

interface SlowestFrameSlots {
  count: number;
  elapsedTimes: Float64Array;
  deltaTimes: Float64Array;
  rafTimes: Float64Array;
  rafFpsValues: Float64Array;
  presentFrames: Float64Array;
  updateCounts: Uint8Array;
}

const DEFAULT_RECORDER_CAPACITY = 16384;
const DEFAULT_RECORDER_DURATION = 60000;
const SLOW_FRAME_THRESHOLD = 20;
const VERY_SLOW_FRAME_THRESHOLD = 30;
const SLOWEST_FRAME_COUNT = 10;

const createSlowestFrameSlots = (): SlowestFrameSlots => ({
  count: 0,
  elapsedTimes: new Float64Array(SLOWEST_FRAME_COUNT),
  deltaTimes: new Float64Array(SLOWEST_FRAME_COUNT),
  rafTimes: new Float64Array(SLOWEST_FRAME_COUNT),
  rafFpsValues: new Float64Array(SLOWEST_FRAME_COUNT),
  presentFrames: new Float64Array(SLOWEST_FRAME_COUNT),
  updateCounts: new Uint8Array(SLOWEST_FRAME_COUNT),
});

const createSession = (capacity: number): RecorderSession => ({
  recording: true,
  anchorTime: undefined,
  duration: 0,
  sampleCount: 0,
  meanDelta: 0,
  deltaM2: 0,
  minDelta: Infinity,
  maxDelta: -Infinity,
  slowFrames: 0,
  verySlowFrames: 0,
  updatesPerRaf: new Array<number>(UPDATE_BIN_COUNT).fill(0),
  slowestFrames: createSlowestFrameSlots(),
  elapsedTimes: new Float64Array(capacity),
  deltaTimes: new Float64Array(capacity),
  rafTimes: new Float64Array(capacity),
  rafFpsValues: new Float64Array(capacity),
  presentFrames: new Float64Array(capacity),
  updateCounts: new Uint8Array(capacity),
  report: undefined,
});

const createRecordedFrame = (
  elapsedTime: number,
  deltaTime: number,
  rafTime: number,
  rafFps: number,
  presentFrame: number,
  updateCount: number,
): RecordedFrame => ({
  time: elapsedTime,
  deltaTime,
  fps: Math.round(rafFps),
  presentFrame,
  updateCount,
  rafTime,
  rafDeltaTime: deltaTime,
  rafFps,
  rafFrameCount: presentFrame,
  updatesThisFrame: updateCount,
});

const retainSlowFrame = (
  session: RecorderSession,
  elapsedTime: number,
  deltaTime: number,
  rafTime: number,
  rafFps: number,
  presentFrame: number,
  updateCount: number,
) => {
  const slots = session.slowestFrames;
  let index = slots.count;
  if (slots.count < SLOWEST_FRAME_COUNT) {
    slots.count++;
  } else {
    index = 0;
    for (let i = 1; i < SLOWEST_FRAME_COUNT; i++) {
      if (slots.deltaTimes[i] < slots.deltaTimes[index]) index = i;
    }
    if (deltaTime <= slots.deltaTimes[index]) return;
  }

  slots.elapsedTimes[index] = elapsedTime;
  slots.deltaTimes[index] = deltaTime;
  slots.rafTimes[index] = rafTime;
  slots.rafFpsValues[index] = rafFps;
  slots.presentFrames[index] = presentFrame;
  slots.updateCounts[index] = updateCount;
};

const materializeSlowestFrames = (slots: SlowestFrameSlots): readonly RecordedFrame[] => {
  const result = new Array<RecordedFrame>(slots.count);
  for (let i = 0; i < slots.count; i++) {
    result[i] = Object.freeze(
      createRecordedFrame(
        slots.elapsedTimes[i],
        slots.deltaTimes[i],
        slots.rafTimes[i],
        slots.rafFpsValues[i],
        slots.presentFrames[i],
        slots.updateCounts[i],
      ),
    );
  }
  result.sort((a, b) => b.deltaTime - a.deltaTime || a.time - b.time);
  return Object.freeze(result);
};

const materializeRaw = (session: RecorderSession, capacity: number): readonly RecordedFrame[] => {
  const retainedSampleCount = Math.min(session.sampleCount, capacity);
  const startIndex = session.sampleCount > capacity ? session.sampleCount % capacity : 0;
  const result = new Array<RecordedFrame>(retainedSampleCount);

  for (let offset = 0; offset < retainedSampleCount; offset++) {
    const index = (startIndex + offset) % capacity;
    result[offset] = Object.freeze(
      createRecordedFrame(
        session.elapsedTimes[index],
        session.deltaTimes[index],
        session.rafTimes[index],
        session.rafFpsValues[index],
        session.presentFrames[index],
        session.updateCounts[index],
      ),
    );
  }

  return Object.freeze(result);
};

const materializeCsv = (raw: readonly RecordedFrame[]) => {
  const rows = new Array<string>(raw.length + 1);
  rows[0] = 'Time(ms),DeltaTime(ms),FPS,PresentFrame,UpdateCount';
  for (let i = 0; i < raw.length; i++) {
    const sample = raw[i];
    rows[i + 1] = `${sample.time.toFixed(2)},${sample.deltaTime.toFixed(2)},${sample.fps},${sample.presentFrame},${
      sample.updateCount
    }`;
  }
  return `${rows.join('\n')}\n`;
};

export const createFrameRecorder = (options: FrameRecorderOptions = {}): FrameRecorder => {
  const capacity = options.capacity === undefined ? DEFAULT_RECORDER_CAPACITY : options.capacity;
  const maxDuration = options.maxDuration === undefined ? DEFAULT_RECORDER_DURATION : options.maxDuration;
  if (!Number.isInteger(capacity) || capacity <= 0) throw new RangeError('capacity must be a positive integer');
  if (!Number.isFinite(maxDuration) || maxDuration <= 0)
    throw new RangeError('maxDuration must be a finite positive number');

  let session: RecorderSession | undefined;
  let lastReport: FrameRecorderReport | undefined;

  const finalize = (target: RecorderSession) => {
    if (target.report) return target.report;
    target.recording = false;

    const retainedSampleCount = Math.min(target.sampleCount, capacity);
    const slowestFrames = materializeSlowestFrames(target.slowestFrames);
    const analysis: FrameRecorderAnalysis = Object.freeze({
      duration: target.duration,
      sampleCount: target.sampleCount,
      retainedSampleCount,
      droppedSampleCount: target.sampleCount - retainedSampleCount,
      avgDelta: target.sampleCount ? target.meanDelta : 0,
      meanDelta: target.sampleCount ? target.meanDelta : 0,
      minDelta: target.sampleCount ? target.minDelta : 0,
      maxDelta: target.sampleCount ? target.maxDelta : 0,
      stdDev: target.sampleCount ? Math.sqrt(target.deltaM2 / target.sampleCount) : 0,
      slowFrames: target.slowFrames,
      verySlowFrames: target.verySlowFrames,
      updatesPerRaf: Object.freeze(target.updatesPerRaf.slice()),
      slowestFrames,
    });

    let raw: readonly RecordedFrame[] | undefined;
    let csv: string | undefined;
    const report = { analysis } as FrameRecorderReport;
    Object.defineProperties(report, {
      raw: {
        enumerable: true,
        get: () => {
          if (!raw) raw = materializeRaw(target, capacity);
          return raw;
        },
      },
      csv: {
        enumerable: true,
        get: () => {
          if (csv === undefined) {
            if (!raw) raw = materializeRaw(target, capacity);
            csv = materializeCsv(raw);
          }
          return csv;
        },
      },
    });
    target.report = Object.freeze(report);
    lastReport = target.report;
    return target.report;
  };

  return {
    capacity,
    maxDuration,

    get recording() {
      return Boolean(session && session.recording);
    },

    get sampleCount() {
      return session ? session.sampleCount : 0;
    },

    get lastReport() {
      return lastReport;
    },

    start() {
      session = createSession(capacity);
    },

    record(frame) {
      if (!session || !session.recording || !Number.isFinite(frame.rafTime)) return undefined;
      if (session.anchorTime === undefined) {
        session.anchorTime = frame.rafTime;
        return undefined;
      }

      const elapsedTime = Math.max(0, frame.rafTime - session.anchorTime);
      session.duration = Math.min(elapsedTime, maxDuration);
      if (elapsedTime > maxDuration) return finalize(session);

      const deltaTime = frame.rafDeltaTime;
      if (Number.isFinite(deltaTime) && deltaTime > 0) {
        const updateCount = normalizeUpdateCount(frame.updatesThisFrame);
        const rafFps = Number.isFinite(frame.rafFps) && frame.rafFps! >= 0 ? frame.rafFps! : 1000 / deltaTime;
        const presentFrame =
          Number.isFinite(frame.rafFrameCount) && frame.rafFrameCount! >= 0
            ? Math.floor(frame.rafFrameCount!)
            : session.sampleCount + 1;
        const index = session.sampleCount % capacity;
        session.elapsedTimes[index] = elapsedTime;
        session.deltaTimes[index] = deltaTime;
        session.rafTimes[index] = frame.rafTime;
        session.rafFpsValues[index] = rafFps;
        session.presentFrames[index] = presentFrame;
        session.updateCounts[index] = updateCount;

        session.sampleCount++;
        const meanDifference = deltaTime - session.meanDelta;
        session.meanDelta += meanDifference / session.sampleCount;
        session.deltaM2 += meanDifference * (deltaTime - session.meanDelta);
        session.minDelta = Math.min(session.minDelta, deltaTime);
        session.maxDelta = Math.max(session.maxDelta, deltaTime);
        if (deltaTime > SLOW_FRAME_THRESHOLD) session.slowFrames++;
        if (deltaTime > VERY_SLOW_FRAME_THRESHOLD) session.verySlowFrames++;
        session.updatesPerRaf[updateCount]++;
        retainSlowFrame(session, elapsedTime, deltaTime, frame.rafTime, rafFps, presentFrame, updateCount);
      }

      return elapsedTime >= maxDuration ? finalize(session) : undefined;
    },

    stop() {
      if (!session) return lastReport;
      return finalize(session);
    },
  };
};
