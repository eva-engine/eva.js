import { ParticleEmitter, ParticleEmitterSystem, Emitter } from '../lib';

jest.mock('pixi.js', () => {
  const pixi = jest.requireActual('../../eva.js/__tests__/__mocks__/pixi.js');
  const Particle = jest.fn().mockImplementation((opts: any) => ({
    x: opts?.x ?? 0,
    y: opts?.y ?? 0,
    scaleX: opts?.scaleX ?? 1,
    scaleY: opts?.scaleY ?? 1,
    rotation: opts?.rotation ?? 0,
    alpha: opts?.alpha ?? 1,
    tint: opts?.tint ?? 0xffffff,
    anchorX: opts?.anchorX ?? 0.5,
    anchorY: opts?.anchorY ?? 0.5,
  }));
  const ParticleContainer = jest.fn().mockImplementation(() => ({
    particleChildren: [] as any[],
    update: jest.fn(),
    destroy: jest.fn(),
    texture: null,
  }));
  return {
    ...pixi,
    Particle,
    ParticleContainer,
    Texture: pixi.Texture,
  };
});

describe('ParticleEmitter Plugin - 粒子发射器', () => {
  describe('Component', () => {
    it('应该使用默认值实例化', () => {
      const c = new ParticleEmitter();
      expect(c.name).toBe('ParticleEmitter');
      expect(c.auto).toBe(true);
      expect(c.frequency).toBe(250);
      expect(c.quantity).toBe(1);
      expect(c.maxParticles).toBe(500);
    });

    it('应该接收 init 参数', () => {
      const c = new ParticleEmitter();
      c.init({
        resource: 'fire',
        explode: 100,
        speed: { min: 50, max: 200 },
        scale: { start: 1, end: 0, ease: 'quad.out' },
      });
      expect(c.resource).toBe('fire');
      expect(c.explode).toBe(100);
      expect(c.speed).toEqual({ min: 50, max: 200 });
    });

    it('stop/start 应该切换 paused 标记', () => {
      const c = new ParticleEmitter();
      expect(c.paused).toBe(false);
      c.stop();
      expect(c.paused).toBe(true);
      c.start();
      expect(c.paused).toBe(false);
    });
  });

  describe('System', () => {
    it('systemName 应该等于 ParticleEmitter', () => {
      expect(ParticleEmitterSystem.systemName).toBe('ParticleEmitter');
    });

    it('应该可以实例化 System', () => {
      const sys = new ParticleEmitterSystem();
      expect(sys).toBeDefined();
      expect(sys.name).toBe('ParticleEmitter');
    });
  });

  describe('Emitter (核心算法)', () => {
    const fakeContainer = (): any => ({ particleChildren: [], update: jest.fn() });
    const fakeTexture = {} as any;

    it('explode 模式应该一次性发射 N 个粒子', () => {
      const params = { resource: 'p', explode: 10, lifespan: 1000 };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(16);
      expect(container.particleChildren.length).toBe(10);
    });

    it('frequency 模式累计 dt 后才发射', () => {
      const params = { resource: 'p', frequency: 100, quantity: 1, lifespan: 5000 };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(50);
      expect(container.particleChildren.length).toBe(0);
      emitter.update(60);
      expect(container.particleChildren.length).toBe(1);
    });

    it('lifespan 到期粒子被回收', () => {
      const params = { resource: 'p', explode: 5, lifespan: 100 };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(16);
      expect(container.particleChildren.length).toBe(5);
      emitter.update(200);
      expect(container.particleChildren.length).toBe(0);
    });

    it('paused 时停止发射', () => {
      const params = { resource: 'p', frequency: 50, quantity: 1, lifespan: 5000, paused: true };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(100);
      expect(container.particleChildren.length).toBe(0);
    });

    it('maxParticles 限制粒子总数', () => {
      const params = { resource: 'p', explode: 1000, lifespan: 1000, maxParticles: 50 };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(16);
      expect(container.particleChildren.length).toBe(50);
    });

    it('stopAfter 累计达到后停止发射', () => {
      const params = {
        resource: 'p',
        frequency: 50,
        quantity: 1,
        lifespan: 10000,
        stopAfter: 3,
      };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      for (let i = 0; i < 20; i++) emitter.update(50);
      expect(container.particleChildren.length).toBe(3);
    });

    it('moveTo 模式产生朝向目标的速度', () => {
      const params = {
        resource: 'p',
        explode: 1,
        lifespan: 1000,
        speed: 100,
        moveTo: { x: 100, y: 0 },
      };
      const container = fakeContainer();
      const emitter = new Emitter(params as any, container, fakeTexture);
      emitter.update(16);
      const p = container.particleChildren[0];
      emitter.update(1000);
      expect(p.x).toBeGreaterThan(0);
    });
  });
});
