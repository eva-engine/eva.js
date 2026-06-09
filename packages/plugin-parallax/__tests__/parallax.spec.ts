import { GameObject } from '@eva/eva.js';
import { Parallax, ParallaxSystem } from '../lib';

describe('plugin-parallax — 视差背景', () => {
  function setup(opts: { camX?: number; camY?: number; speedX?: number; speedY?: number; tileW?: number; tileH?: number; baseX?: number; baseY?: number } = {}) {
    const camera = new GameObject('camera', { position: { x: opts.camX ?? 0, y: opts.camY ?? 0 } });
    const bg = new GameObject('bg', { position: { x: opts.baseX ?? 0, y: opts.baseY ?? 0 } });
    // 必须把 params 通过 constructor 传入,因为 addComponent 会同步触发 init+awake
    // (使用 component.__componentDefaultParams)。
    const px = new Parallax({
      speedX: opts.speedX,
      speedY: opts.speedY,
      tileWidth: opts.tileW,
      tileHeight: opts.tileH,
      cameraEntity: 'camera',
    });
    bg.addComponent(px);
    // mock scene 链路 — 直接写 _scene 私有字段,避开 setter 的 addGameObject 调用
    (bg as any)._scene = { game: { scene: { gameObjects: [camera, bg] } } };
    return { camera, bg, px };
  }

  it('init 解析参数', () => {
    const px = new Parallax();
    px.init({ speedX: 0.5, speedY: 0.2, tileWidth: 100, tileHeight: 50, cameraEntity: 'cam' });
    expect((px as any).speedX).toBe(0.5);
    expect((px as any).speedY).toBe(0.2);
    expect((px as any).tileW).toBe(100);
    expect((px as any).tileH).toBe(50);
    expect((px as any).cameraEntity).toBe('cam');
  });

  it('awake 记录 base position', () => {
    const bg = new GameObject('bg', { position: { x: 50, y: 30 } });
    const px = new Parallax({ speedX: 0.5 });
    bg.addComponent(px);
    expect((px as any).baseX).toBe(50);
    expect((px as any).baseY).toBe(30);
  });

  it('speedX = 1 时 background 完全跟随相机(offset = 0)', () => {
    const { camera, bg, px } = setup({ camX: 100, speedX: 1, baseX: 200 });
    px.update();
    // offset = 100 * (1 - 1) = 0,position = base + 0 = 200
    expect(bg.transform.position.x).toBe(200);
    void camera;
  });

  it('speedX = 0 时 background 静止(offset = camX)', () => {
    const { bg, px } = setup({ camX: 100, speedX: 0, baseX: 0 });
    px.update();
    // offset = 100 * 1 = 100
    expect(bg.transform.position.x).toBe(100);
  });

  it('speedX = 0.3 时背景半速', () => {
    const { bg, px } = setup({ camX: 100, speedX: 0.3, baseX: 0 });
    px.update();
    // offset = 100 * 0.7 = 70
    expect(bg.transform.position.x).toBeCloseTo(70, 5);
  });

  it('tileWidth 触发 mod 回卷', () => {
    const { bg, px } = setup({ camX: 1500, speedX: 0, tileW: 500, baseX: 0 });
    px.update();
    // 1500 % 500 = 0
    expect(bg.transform.position.x).toBe(0);
  });

  it('tileWidth 对负坐标也正确(欧几里得 mod)', () => {
    const { bg, px } = setup({ camX: -100, speedX: 0, tileW: 250, baseX: 0 });
    px.update();
    // (-100 % 250 + 250) % 250 = 150
    expect(bg.transform.position.x).toBe(150);
  });

  it('y 轴等价行为', () => {
    const { bg, px } = setup({ camY: 200, speedY: 0.5, baseY: 0 });
    px.update();
    expect(bg.transform.position.y).toBeCloseTo(100, 5);
  });

  it('找不到相机时不抛错(各 offset 当 0)', () => {
    const bg = new GameObject('bg', { position: { x: 10, y: 20 } });
    const px = new Parallax({ speedX: 0.5, cameraEntity: 'no-such' });
    bg.addComponent(px);
    (bg as any)._scene = { game: { scene: { gameObjects: [bg] } } };
    expect(() => px.update()).not.toThrow();
    // base + 0 → 10
    expect(bg.transform.position.x).toBe(10);
  });

  it('未挂入 game 时 update 静默', () => {
    const px = new Parallax();
    expect(() => px.update()).not.toThrow();
  });

  describe('ParallaxSystem', () => {
    it('能实例化', () => {
      expect(new ParallaxSystem().name).toBe('Parallax');
    });
  });
});
