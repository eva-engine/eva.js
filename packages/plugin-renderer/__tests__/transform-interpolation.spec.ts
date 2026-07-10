import { TransformInterpolation } from '../lib/transform-interpolation';

const TAU = Math.PI * 2;

function makeTransform(overrides: Record<string, any> = {}) {
  return {
    position: { x: 10, y: 20 },
    rotation: 0.25,
    scale: { x: 1, y: 2 },
    skew: { x: 0.1, y: 0.2 },
    size: { width: 100, height: 200 },
    origin: { x: 0.25, y: 0.75 },
    anchor: { x: 0.5, y: 1 },
    parent: null,
    ...overrides,
  };
}

describe('TransformInterpolation', () => {
  it('uses the first sample for both history slots and copies every scalar', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform();

    interpolation.capture(1, source as any, 1);
    const presented = interpolation.present(1, 0.1);

    expect(presented).toEqual({
      position: { x: 10, y: 20 },
      rotation: 0.25,
      scale: { x: 1, y: 2 },
      skew: { x: 0.1, y: 0.2 },
      size: { width: 100, height: 200 },
      origin: { x: 0.25, y: 0.75 },
      anchor: { x: 0.5, y: 1 },
      parentId: null,
    });
  });

  it('interpolates position, rotation, scale, skew, size, origin, and anchor without mutating core Transform', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({
      position: { x: 10, y: 20 },
      rotation: 0,
      scale: { x: 1, y: 2 },
      skew: { x: 0, y: 0.2 },
      size: { width: 100, height: 200 },
      origin: { x: 0, y: 0.5 },
      anchor: { x: 0.25, y: 0.5 },
    });
    interpolation.capture(1, source as any, 1);

    Object.assign(source.position, { x: 20, y: 40 });
    source.rotation = 1;
    Object.assign(source.scale, { x: 3, y: 4 });
    Object.assign(source.skew, { x: 0.4, y: 0.6 });
    Object.assign(source.size, { width: 300, height: 400 });
    Object.assign(source.origin, { x: 1, y: 0.75 });
    Object.assign(source.anchor, { x: 0.75, y: 1 });
    interpolation.capture(1, source as any, 2);

    const presented = interpolation.present(1, 0.25);

    expect(presented).toEqual({
      position: { x: 12.5, y: 25 },
      rotation: 0.25,
      scale: { x: 1.5, y: 2.5 },
      skew: { x: 0.1, y: 0.3 },
      size: { width: 150, height: 250 },
      origin: { x: 0.25, y: 0.5625 },
      anchor: { x: 0.375, y: 0.625 },
      parentId: null,
    });
    expect(source).toEqual(
      expect.objectContaining({
        position: { x: 20, y: 40 },
        rotation: 1,
        scale: { x: 3, y: 4 },
        skew: { x: 0.4, y: 0.6 },
        size: { width: 300, height: 400 },
        origin: { x: 1, y: 0.75 },
        anchor: { x: 0.75, y: 1 },
      }),
    );
    expect(presented.position).not.toBe(source.position);
    expect(presented.scale).not.toBe(source.scale);
    expect(presented.size).not.toBe(source.size);
  });

  it('takes the shortest arc across the rotation wrap', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({ rotation: (350 / 360) * TAU });
    interpolation.capture(1, source as any, 1);
    source.rotation = (10 / 360) * TAU;
    interpolation.capture(1, source as any, 2);

    expect(interpolation.present(1, 0.5).rotation).toBeCloseTo(TAU);
  });

  it('recaptures current values in the same logical frame without advancing previous history', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({ position: { x: 10, y: 0 } });
    interpolation.capture(1, source as any, 1);

    source.position.x = 20;
    interpolation.capture(1, source as any, 2);
    source.position.x = 30;
    interpolation.capture(1, source as any, 2);

    expect(interpolation.present(1, 0.5).position.x).toBe(20);
  });

  it('reseeds both history buffers when the first logical sample is corrected in the same frame', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({ position: { x: 0, y: 0 } });
    interpolation.capture(1, source as any, 1);

    source.position.x = 80;
    interpolation.capture(1, source as any, 1);

    expect(interpolation.present(1, 0.5).position.x).toBe(80);
    expect(interpolation.sampleAllocationCount).toBe(3);
  });

  it('preserves distinct logical history when two updates occur before the first presentation', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({ position: { x: 0, y: 0 } });
    interpolation.capture(1, source as any, 1);
    source.position.x = 80;
    interpolation.capture(1, source as any, 2);

    // A final same-frame correction may refresh current, but must not reseed previous.
    source.position.x = 100;
    interpolation.capture(1, source as any, 2);

    expect(interpolation.present(1, 0.5).position.x).toBe(50);
    expect(interpolation.sampleAllocationCount).toBe(3);
  });

  it('resets history when the parent changes', () => {
    const interpolation = new TransformInterpolation();
    const parent1 = { gameObject: { id: 10 } };
    const parent2 = { gameObject: { id: 20 } };
    const source = makeTransform({ position: { x: 10, y: 0 }, parent: parent1 });
    interpolation.capture(1, source as any, 1);
    source.position.x = 20;
    interpolation.capture(1, source as any, 2);

    source.parent = parent2;
    source.position.x = 50;
    interpolation.capture(1, source as any, 3);

    expect(interpolation.present(1, 0.25)).toEqual(
      expect.objectContaining({ position: { x: 50, y: 0 }, parentId: 20 }),
    );
  });

  it('reuses the renderer-private presented object and supports remove, prune, and clear', () => {
    const interpolation = new TransformInterpolation();
    interpolation.capture(1, makeTransform() as any, 1);
    interpolation.capture(2, makeTransform() as any, 1);

    const first = interpolation.present(1, 0);
    const second = interpolation.present(1, 0.5);
    expect(second).toBe(first);

    interpolation.remove(1);
    expect(interpolation.present(1, 0)).toBeUndefined();
    interpolation.capture(1, makeTransform() as any, 2);
    interpolation.prune(new Set([1]));
    expect(interpolation.present(1, 0)).toBeDefined();
    expect(interpolation.present(2, 0)).toBeUndefined();

    interpolation.clear();
    expect(interpolation.present(1, 0)).toBeUndefined();
    expect(interpolation.size).toBe(0);
  });

  it('allocates its three sample buffers once per entity and reuses them in steady state', () => {
    const interpolation = new TransformInterpolation();
    const source = makeTransform({ position: { x: 0, y: 0 } });
    interpolation.capture(1, source as any, 1);
    const presented = interpolation.present(1, 0.5);
    const history = (interpolation as any).histories.get(1);
    const initialPrevious = history.previous;
    const initialCurrent = history.current;

    expect(interpolation.sampleAllocationCount).toBe(3);
    expect(initialPrevious).not.toBe(initialCurrent);
    expect(history.presented).not.toBe(initialPrevious);
    expect(history.presented).not.toBe(initialCurrent);

    source.position.x = 2;
    interpolation.capture(1, source as any, 2);
    expect(history.previous).toBe(initialCurrent);
    expect(history.current).toBe(initialPrevious);
    expect(history.presented).toBe(presented);

    for (let frame = 3; frame <= 1000; frame++) {
      source.position.x = frame;
      source.size.width = 100 + frame;
      interpolation.capture(1, source as any, frame);
      interpolation.capture(1, source as any, frame);
      expect(interpolation.present(1, 0.25)).toBe(presented);
    }

    source.parent = { gameObject: { id: 99 } };
    interpolation.capture(1, source as any, 1001);
    expect(interpolation.sampleAllocationCount).toBe(3);
  });
});
