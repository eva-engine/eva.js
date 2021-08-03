import Transform from '../lib/core/Transform';

describe('transform component', () => {
  it('create transform Component with params', () => {
    const transform = new Transform({
      size: { width: 200, height: 200 },
      position: { x: 10, y: 10 },
      origin: { x: 0, y: 0 },
      anchor: { x: 20, y: 20 },
      skew: { x: 10, y: 10 },
      scale: { x: 1.2, y: 1.2 },
    });
    expect(transform.children.length).toBe(0);
    expect(transform.name).toBe('Transform');
    expect(transform.parent).toBeNull();
  });

  it('set parent', () => {
    const parentTransform = new Transform();
    const transform = new Transform();
    transform.parent = parentTransform;

    expect(transform.parent).toStrictEqual(parentTransform);
    expect(parentTransform.children.length).toBe(1);
    expect(parentTransform.children[0]).toStrictEqual(transform);
  });

  it('remove parent', () => {
    const parentTransform = new Transform();
    const transform = new Transform();
    transform.parent = parentTransform;
    expect(parentTransform.children.length).toBe(1);

    transform.parent = null;
    expect(parentTransform.children.length).toBe(0);
  });

  it('should add child transform at lasest', () => {
    const parent = new Transform();
    const child1 = new Transform();
    parent.addChild(child1);
    expect(parent.children[0]).toStrictEqual(child1);

    const child2 = new Transform();
    parent.addChild(child2);
    parent.addChild(child1);

    expect(parent.children.pop()).toStrictEqual(child1);
    expect(child1.parent).toStrictEqual(parent);
  });

  it('add child which have parent', () => {
    const parent = new Transform();
    const child = new Transform();
    parent.addChild(child);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toStrictEqual(child);

    const parent1 = new Transform();
    parent1.addChild(child);

    expect(parent.children.length).toBe(0);
    expect(parent1.children.length).toBe(1);
    expect(parent1.children[0]).toStrictEqual(child);
  });

  it('remove child', () => {
    const parent = new Transform();
    const child = new Transform();
    parent.addChild(child);
    expect(parent.children[0]).toStrictEqual(child);

    parent.removeChild(child);
    expect(parent.children.length).toBe(0);
    expect(child.parent).toBeNull();
  });

  it('remove all child', () => {
    const parent = new Transform();
    const child = new Transform();
    const child1 = new Transform();

    parent.addChild(child);
    parent.addChild(child1);
    expect(parent.children.length).toBe(2);

    parent.clearChildren();
    expect(parent.children.length).toBe(0);
  });
});
