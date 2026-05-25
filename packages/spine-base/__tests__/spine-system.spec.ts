import SpineSystem from '../lib/SpineSystem';

describe('SpineSystem runtime cleanup', () => {
  it('skips destroyed armatures during the update loop', () => {
    const spineSystem = new SpineSystem();
    const update = jest.fn(() => {
      throw new Error('destroyed armature should not be updated');
    });

    (spineSystem as any).armatures[1] = {
      destroyed: true,
      update,
    };

    expect(() => {
      spineSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
    }).not.toThrow();
    expect(update).not.toHaveBeenCalled();
    expect((spineSystem as any).armatures[1]).toBeUndefined();
  });

  it('skips armatures for destroyed Spine components during the update loop', () => {
    const spineSystem = new SpineSystem();
    const update = jest.fn(() => {
      throw new Error('stale armature should not be updated');
    });

    (spineSystem as any).armatures[1] = {
      destroyed: false,
      update,
    };
    (spineSystem as any)._spineComponents[1] = {
      destroied: true,
      _flushPendingSlotObjects: jest.fn(),
    };

    expect(() => {
      spineSystem.update({ deltaTime: 16.67, frameCount: 1, time: 16.67, currentTime: 16.67, fps: 60 });
    }).not.toThrow();
    expect(update).not.toHaveBeenCalled();
    expect((spineSystem as any).armatures[1]).toBeUndefined();
    expect((spineSystem as any)._spineComponents[1]).toBeUndefined();
  });
});
