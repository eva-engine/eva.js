// Mock for ./db.js — 真实文件是 615KB 的 dragonbones bundle,在 jsdom + ts-jest 下加载
// 既慢又依赖 PIXI 实现细节。这里只暴露 system.ts / engine.ts 实际访问的最小 API:
//   - dragonBones.PixiFactory.factory.{buildArmatureDisplay, parseDragonBonesData,
//     parseTextureAtlasData, removeDragonBonesData, removeTextureAtlasData}
//   - dragonBones.PixiFactory._clockHandler (作为 ticker 回调,只要存在即可)

class MockArmatureAnimation {
  isPlaying = false;
  play = jest.fn((name?: string, _times?: number) => {
    this.isPlaying = true;
    return name;
  });
  stop = jest.fn(() => {
    this.isPlaying = false;
  });
}

class MockArmature {
  destroyed = false;
  parent: any = null;
  animation = new MockArmatureAnimation();
  private listeners: Record<string, Array<(e?: unknown) => void>> = {};

  on(name: string, callback: (e?: unknown) => void) {
    this.listeners[name] = this.listeners[name] || [];
    this.listeners[name].push(callback);
    return this;
  }
  emit(name: string, event?: unknown) {
    (this.listeners[name] || []).forEach(cb => cb(event));
  }
  removeAllListeners = jest.fn(() => {
    this.listeners = {};
  });
  destroy = jest.fn((_opts?: any) => {
    this.destroyed = true;
  });
}

const factory = {
  buildArmatureDisplay: jest.fn((armatureName: string) => {
    const armature = new MockArmature();
    (armature as any).armatureName = armatureName;
    return armature;
  }),
  parseDragonBonesData: jest.fn(),
  parseTextureAtlasData: jest.fn(),
  removeDragonBonesData: jest.fn(),
  removeTextureAtlasData: jest.fn(),
};

const dragonBones = {
  PixiFactory: {
    factory,
    _clockHandler: jest.fn(),
  },
};

export default dragonBones;
export { MockArmature, MockArmatureAnimation };
