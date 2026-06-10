class MockAnimation {
  keyframes = { ip: 0, op: 60 };
  group = { destroy: jest.fn() };
  isImagesLoaded = true;
  timeScale = 1;
  private listeners: Record<string, Array<(event?: unknown) => void>> = {};

  on(name: string, callback: (event?: unknown) => void) {
    this.listeners[name] = this.listeners[name] || [];
    this.listeners[name].push(callback);
    return this;
  }

  emit(name: string, event?: unknown) {
    (this.listeners[name] || []).forEach(callback => callback(event));
  }

  playSegment = jest.fn();
  pause = jest.fn();
  stop = jest.fn();
  goToAndStop = jest.fn();
  setSpeed = jest.fn((speed: number) => {
    this.timeScale = speed;
  });
  replaceData = jest.fn();
  bindSlot = jest.fn();
  unbindSlot = jest.fn();
  querySelector = jest.fn(() => ({
    display: {
      interactive: false,
      addChild: jest.fn(),
      on: jest.fn(),
    },
  }));
  destroy = jest.fn();
}

export class AnimationManager {
  constructor(public app?: unknown) {}

  parseAnimation() {
    return new MockAnimation();
  }
}
