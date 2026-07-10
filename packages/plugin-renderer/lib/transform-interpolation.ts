type Vector2 = { x: number; y: number };
type Size2 = { width: number; height: number };

export interface TransformSample {
  position: Vector2;
  rotation: number;
  scale: Vector2;
  skew: Vector2;
  size: Size2;
  origin: Vector2;
  anchor: Vector2;
  parentId: number | null;
}

interface TransformSource {
  position: Vector2;
  rotation: number;
  scale: Vector2;
  skew: Vector2;
  size: Size2;
  origin: Vector2;
  anchor: Vector2;
  parent?: { gameObject?: { id?: number } } | null;
}

interface TransformHistory {
  previous: TransformSample;
  current: TransformSample;
  presented: TransformSample;
  logicalFrameCount: number;
  hasAdvancedSinceSeed: boolean;
}

const TAU = Math.PI * 2;

function parentIdOf(source: TransformSource): number | null {
  const parentId = source.parent?.gameObject?.id;
  return typeof parentId === 'number' ? parentId : null;
}

function createSample(): TransformSample {
  return {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 },
    skew: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    origin: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 },
    parentId: null,
  };
}

function copySourceInto(target: TransformSample, source: TransformSource): void {
  target.position.x = source.position.x;
  target.position.y = source.position.y;
  target.rotation = source.rotation;
  target.scale.x = source.scale.x;
  target.scale.y = source.scale.y;
  target.skew.x = source.skew.x;
  target.skew.y = source.skew.y;
  target.size.width = source.size.width;
  target.size.height = source.size.height;
  target.origin.x = source.origin.x;
  target.origin.y = source.origin.y;
  target.anchor.x = source.anchor.x;
  target.anchor.y = source.anchor.y;
  target.parentId = parentIdOf(source);
}

function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * alpha;
}

function lerpRotation(from: number, to: number, alpha: number): number {
  const delta = ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return from + delta * alpha;
}

function interpolateVector(target: Vector2, from: Vector2, to: Vector2, alpha: number) {
  target.x = lerp(from.x, to.x, alpha);
  target.y = lerp(from.y, to.y, alpha);
}

function interpolateSize(target: Size2, from: Size2, to: Size2, alpha: number) {
  target.width = lerp(from.width, to.width, alpha);
  target.height = lerp(from.height, to.height, alpha);
}

/** Renderer-private fixed-step transform history and presentation interpolation. */
export class TransformInterpolation {
  private histories = new Map<number, TransformHistory>();
  private allocatedSamples = 0;

  get size(): number {
    return this.histories.size;
  }

  /** Test/debug counter proving capture does not allocate after entity seeding. */
  get sampleAllocationCount(): number {
    return this.allocatedSamples;
  }

  private allocateSample(): TransformSample {
    this.allocatedSamples++;
    return createSample();
  }

  capture(id: number, source: TransformSource, logicalFrameCount: number): void {
    const history = this.histories.get(id);
    if (!history) {
      const previous = this.allocateSample();
      const current = this.allocateSample();
      const presented = this.allocateSample();
      copySourceInto(previous, source);
      copySourceInto(current, source);
      copySourceInto(presented, source);
      this.histories.set(id, {
        previous,
        current,
        presented,
        logicalFrameCount,
        hasAdvancedSinceSeed: false,
      });
      return;
    }

    if (history.current.parentId !== parentIdOf(source)) {
      copySourceInto(history.previous, source);
      copySourceInto(history.current, source);
      history.hasAdvancedSinceSeed = false;
    } else if (history.logicalFrameCount === logicalFrameCount) {
      if (!history.hasAdvancedSinceSeed) {
        copySourceInto(history.previous, source);
      }
      copySourceInto(history.current, source);
    } else {
      const reusable = history.previous;
      history.previous = history.current;
      history.current = reusable;
      copySourceInto(history.current, source);
      history.hasAdvancedSinceSeed = true;
    }
    history.logicalFrameCount = logicalFrameCount;
  }

  present(id: number, interpolationAlpha: number): TransformSample | undefined {
    const history = this.histories.get(id);
    if (!history) return undefined;

    const alpha = Math.max(0, Math.min(1, interpolationAlpha));
    const { previous, current, presented } = history;
    interpolateVector(presented.position, previous.position, current.position, alpha);
    presented.rotation = lerpRotation(previous.rotation, current.rotation, alpha);
    interpolateVector(presented.scale, previous.scale, current.scale, alpha);
    interpolateVector(presented.skew, previous.skew, current.skew, alpha);
    interpolateSize(presented.size, previous.size, current.size, alpha);
    interpolateVector(presented.origin, previous.origin, current.origin, alpha);
    interpolateVector(presented.anchor, previous.anchor, current.anchor, alpha);
    presented.parentId = current.parentId;
    return presented;
  }

  getPresented(id: number): TransformSample | undefined {
    return this.histories.get(id)?.presented;
  }

  remove(id: number): void {
    this.histories.delete(id);
  }

  prune(activeIds: ReadonlySet<number>): void {
    for (const id of this.histories.keys()) {
      if (!activeIds.has(id)) this.histories.delete(id);
    }
  }

  clear(): void {
    this.histories.clear();
  }
}
