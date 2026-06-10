class MockSpine {
  destroyed = false;
  x = 0;
  y = 0;
  state = {
    timeScale: 1,
    tracks: [{ animation: { name: 'idle' } }],
    data: {
      defaultMix: 0,
      setMix: jest.fn(),
    },
    addListener: jest.fn(),
    setAnimation: jest.fn(),
    setEmptyAnimation: jest.fn(),
    addAnimation: jest.fn(),
  };
  skeleton = {
    data: {
      findSkin: jest.fn((name: string) => name),
    },
    setAttachment: jest.fn(),
    findBone: jest.fn(),
    setSkin: jest.fn(),
    setSkinByName: jest.fn(),
    setSlotsToSetupPose: jest.fn(),
  };

  constructor(public options?: unknown) {}

  update = jest.fn();
  destroy = jest.fn(() => {
    this.destroyed = true;
  });
  addSlotObject = jest.fn();
  removeSlotObject = jest.fn();
}

export default {
  Spine: MockSpine,
};
