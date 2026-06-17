import { GameObject } from '@eva/eva.js';

/**
 * `./matter` 是一份 webpack 打的 ESM bundle(>10000 行),jest 默认 CJS 解析器
 * 直接吃 `export default` 会报 SyntaxError,而 monorepo 又没装 matter-js,
 * 因此这里用 jest.mock 把 `./matter` 整体替换成一份"够用"的最小实现。
 *
 * 这份 mock 满足 plugin-matterjs 内部对 Matter API 的全部依赖:
 *   - Bodies.{circle,rectangle,polygon}
 *   - Engine / World / Render / Runner / Mouse / MouseConstraint / Constraint
 *   - Events.on / Events.trigger(spec 用)
 *
 * 注:每个 mock body 都附带 emit-friendly 字段(position/angle/...),
 * 让 Physics.update / 碰撞事件这一类联动测试能直接跑。
 */
jest.mock('../lib/matter', () => {
  type Listener = (payload: any) => void;
  const listenersBySource = new WeakMap<object, Map<string, Listener[]>>();

  const ensureBucket = (target: any, eventName: string): Listener[] => {
    if (!listenersBySource.has(target)) listenersBySource.set(target, new Map());
    const map = listenersBySource.get(target)!;
    if (!map.has(eventName)) map.set(eventName, []);
    return map.get(eventName)!;
  };

  let bodyIdSeq = 1;
  const makeBody = (
    type: 'circle' | 'rectangle' | 'polygon',
    x: number,
    y: number,
    extra: Record<string, any> = {},
    options: any = {},
  ) => {
    return {
      id: bodyIdSeq++,
      type,
      position: { x, y },
      angle: 0,
      isStatic: !!options.isStatic,
      friction: options.friction ?? 0.1,
      restitution: options.restitution ?? 0,
      density: options.density ?? 0.001,
      vertices: extra.vertices ?? [],
      circleRadius: extra.circleRadius,
      sides: extra.sides,
      ...extra,
    };
  };

  const Bodies = {
    circle: jest.fn((x: number, y: number, radius: number, options: any = {}) =>
      makeBody('circle', x, y, { circleRadius: radius }, options),
    ),
    rectangle: jest.fn((x: number, y: number, width: number, height: number, options: any = {}) =>
      makeBody(
        'rectangle',
        x,
        y,
        {
          width,
          height,
          vertices: [
            { x: x - width / 2, y: y - height / 2 },
            { x: x + width / 2, y: y - height / 2 },
            { x: x + width / 2, y: y + height / 2 },
            { x: x - width / 2, y: y + height / 2 },
          ],
        },
        options,
      ),
    ),
    polygon: jest.fn((x: number, y: number, sides: number, radius: number, options: any = {}) => {
      const vertices = [] as Array<{ x: number; y: number }>;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        vertices.push({ x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius });
      }
      return makeBody('polygon', x, y, { sides, circleRadius: radius, vertices }, options);
    }),
  };

  const Body = {
    setStatic: jest.fn((body: any, isStatic: boolean) => {
      body.isStatic = isStatic;
    }),
    setPosition: jest.fn((body: any, position: { x: number; y: number }) => {
      body.position = { ...position };
    }),
    setAngle: jest.fn((body: any, angle: number) => {
      body.angle = angle;
    }),
  };

  const World = {
    create: jest.fn((def: any = {}) => ({ bodies: [] as any[], def })),
    add: jest.fn((world: any, bodyOrArr: any) => {
      const bodies = Array.isArray(bodyOrArr) ? bodyOrArr : [bodyOrArr];
      world.bodies.push(...bodies);
    }),
    remove: jest.fn((world: any, body: any, _deep?: boolean) => {
      const idx = world.bodies.indexOf(body);
      if (idx >= 0) world.bodies.splice(idx, 1);
    }),
  };

  const Engine = {
    create: jest.fn(() => ({ world: World.create({}) })),
    update: jest.fn(),
  };

  const Composite = {
    add: jest.fn((world: any, body: any) => World.add(world, body)),
    remove: jest.fn((world: any, body: any) => World.remove(world, body, true)),
  };

  const Render = {
    create: jest.fn(() => ({ canvas: {}, options: {} })),
    run: jest.fn(),
  };

  const Runner = {
    create: jest.fn((opts: any = {}) => ({
      enabled: true,
      fps: opts.fps ?? 60,
      deltaSampleSize: opts.deltaSampleSize ?? 1,
    })),
    run: jest.fn(),
    tick: jest.fn(),
  };

  const Mouse = {
    create: jest.fn(() => ({ element: null })),
  };
  const MouseConstraint = {
    create: jest.fn(() => ({ mouse: {} })),
  };
  const Constraint = {
    create: jest.fn(() => ({})),
  };

  const Events = {
    on: jest.fn((target: any, eventName: string, listener: Listener) => {
      ensureBucket(target, eventName).push(listener);
    }),
    trigger: jest.fn((target: any, eventName: string, payload: any) => {
      const map = listenersBySource.get(target);
      if (!map) return;
      const arr = map.get(eventName);
      if (!arr) return;
      for (const fn of arr) fn(payload);
    }),
  };

  const Matter = {
    Bodies,
    Body,
    Engine,
    World,
    Composite,
    Render,
    Runner,
    Mouse,
    MouseConstraint,
    Constraint,
    Events,
  };
  return { __esModule: true, default: Matter };
});

// 必须在 jest.mock 之后再 import,否则 PhysicsEngine 会先抓真 matter
import { Physics, PhysicsType, PhysicsSystem } from '../lib';
import BodiesFactory from '../lib/BodiesFactory';
import PhysicsEngine from '../lib/PhysicsEngine';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Matter = require('../lib/matter').default;

/**
 * 给 BodiesFactory.getCoordinate 制造一个最小但合规的父子层级:
 * BodiesFactory 会读 gameObject.parent.transform.size,所以必须显式挂一个 parent。
 */
function makeChildWithParent(opts: {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  scale?: { x: number; y: number };
  anchor?: { x: number; y: number };
  parentSize?: { width: number; height: number };
} = {}) {
  const child = new GameObject('child', {
    position: opts.position ?? { x: 0, y: 0 },
    size: opts.size ?? { width: 100, height: 50 },
    scale: opts.scale ?? { x: 1, y: 1 },
    anchor: opts.anchor ?? { x: 0, y: 0 },
  });
  const parent = new GameObject('parent', {
    size: opts.parentSize ?? { width: 800, height: 600 },
  });
  // BodiesFactory.getCoordinate 直接读 gameObject.parent.transform.size,
  // 这里只关心 transform 链路,不关心 scene。
  child.transform.parent = parent.transform;
  return { child, parent };
}

/** 最小 Game stub:只提供 PhysicsSystem.init / PhysicsEngine.start 真正访问的字段。 */
function makeFakeGame() {
  const canvas: any = {
    width: 750,
    height: 1334,
    setAttribute: jest.fn(),
  };
  return { canvas } as any;
}

describe('@eva/plugin-matterjs', () => {
  describe('PhysicsType 枚举', () => {
    it('exports CIRCLE/RECTANGLE/POLYGON 三个值,字符串与 matter API 对齐', () => {
      expect(PhysicsType.CIRCLE).toBe('circle');
      expect(PhysicsType.RECTANGLE).toBe('rectangle');
      expect(PhysicsType.POLYGON).toBe('polygon');
    });
  });

  describe('Physics 组件 init', () => {
    it('init 把 params 原样存到 bodyParams', () => {
      const phys = new Physics();
      const params = {
        type: PhysicsType.CIRCLE,
        radius: 25,
        bodyOptions: { restitution: 0.8, density: 0.01, friction: 0.3, isStatic: false },
        stopRotation: true,
      };
      phys.init(params);
      expect(phys.bodyParams).toBe(params);
      expect(phys.bodyParams.type).toBe(PhysicsType.CIRCLE);
      expect(phys.bodyParams.bodyOptions).toEqual({
        restitution: 0.8,
        density: 0.01,
        friction: 0.3,
        isStatic: false,
      });
      expect(phys.bodyParams.stopRotation).toBe(true);
    });

    it('Physics.componentName 等于 "Physics" — DSL 类型映射依赖此名', () => {
      expect(Physics.componentName).toBe('Physics');
    });

    it('PhysicsSystem.systemName 等于 "PhysicsSystem"', () => {
      expect((PhysicsSystem as any).systemName).toBe('PhysicsSystem');
    });
  });

  describe('BodiesFactory.create — 三种 PhysicsType 都返回 body', () => {
    let factory: BodiesFactory;
    beforeEach(() => {
      factory = new BodiesFactory();
      Matter.Bodies.circle.mockClear();
      Matter.Bodies.rectangle.mockClear();
      Matter.Bodies.polygon.mockClear();
    });

    it('CIRCLE 调用 Matter.Bodies.circle(x, y, radius, options)', () => {
      const { child } = makeChildWithParent({ position: { x: 100, y: 50 } });
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 30,
        bodyOptions: { isStatic: false },
      });
      child.addComponent(phys);
      const body = factory.create(phys);
      expect(body).toBeTruthy();
      expect(body.position).toEqual({ x: 100, y: 50 });
      expect(body.circleRadius).toBe(30);
      expect(Matter.Bodies.circle).toHaveBeenCalledTimes(1);
      expect(Matter.Bodies.circle).toHaveBeenCalledWith(100, 50, 30, { isStatic: false });
    });

    it('RECTANGLE 用 transform.size * scale 决定宽高,并透传 options', () => {
      const { child } = makeChildWithParent({
        position: { x: 200, y: 80 },
        size: { width: 60, height: 40 },
        scale: { x: 2, y: 3 },
      });
      const phys = new Physics({
        type: PhysicsType.RECTANGLE,
        bodyOptions: { isStatic: true, friction: 0.4 },
      });
      child.addComponent(phys);
      const body = factory.create(phys);
      expect(body).toBeTruthy();
      expect(body.position).toEqual({ x: 200, y: 80 });
      // size.width(60)*scale.x(2)=120, size.height(40)*scale.y(3)=120
      expect(Matter.Bodies.rectangle).toHaveBeenCalledWith(200, 80, 120, 120, {
        isStatic: true,
        friction: 0.4,
      });
      expect(body.isStatic).toBe(true);
    });

    it('POLYGON 把 sides + radius 透传给 Matter.Bodies.polygon', () => {
      const { child } = makeChildWithParent({ position: { x: 0, y: 0 } });
      const phys = new Physics({
        type: PhysicsType.POLYGON,
        sides: 6,
        radius: 20,
        bodyOptions: {},
      });
      child.addComponent(phys);
      const body = factory.create(phys);
      expect(body).toBeTruthy();
      expect(Matter.Bodies.polygon).toHaveBeenCalledWith(0, 0, 6, 20, {});
      expect(body.sides).toBe(6);
      expect(body.vertices.length).toBe(6);
    });

    it('bodyParams.position 显式覆盖 gameObject 坐标', () => {
      const { child } = makeChildWithParent({ position: { x: 100, y: 100 } });
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 10,
        position: { x: 999, y: -42 },
        bodyOptions: {},
      });
      child.addComponent(phys);
      const body = factory.create(phys);
      expect(body.position).toEqual({ x: 999, y: -42 });
      expect(Matter.Bodies.circle).toHaveBeenCalledWith(999, -42, 10, {});
    });

    it('未指定 position 时使用 transform.position + anchor*parent.size', () => {
      const { child } = makeChildWithParent({
        position: { x: 50, y: 30 },
        anchor: { x: 0.5, y: 0.5 },
        parentSize: { width: 400, height: 200 },
      });
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 5,
        bodyOptions: {},
      });
      child.addComponent(phys);
      const body = factory.create(phys);
      // 50 + 0.5 * 400 = 250, 30 + 0.5 * 200 = 130
      expect(body.position).toEqual({ x: 250, y: 130 });
    });
  });

  describe('Physics.update — body 位置/旋转同步到 transform', () => {
    it('body.position 写入 transform.position,anchor 强制归零', () => {
      const { child } = makeChildWithParent({
        position: { x: 0, y: 0 },
        anchor: { x: 0.5, y: 0.5 },
      });
      const phys = new Physics({ type: PhysicsType.CIRCLE, radius: 5, bodyOptions: {} });
      child.addComponent(phys);
      // 注入 fake body — 不依赖 PhysicsEngine
      (phys as any).body = { position: { x: 333, y: 444 }, angle: 0 };
      phys.update();
      expect(child.transform.position.x).toBe(333);
      expect(child.transform.position.y).toBe(444);
      expect(child.transform.anchor.x).toBe(0);
      expect(child.transform.anchor.y).toBe(0);
    });

    it('默认会同步 body.angle 到 transform.rotation', () => {
      const { child } = makeChildWithParent();
      const phys = new Physics({ type: PhysicsType.CIRCLE, radius: 5, bodyOptions: {} });
      child.addComponent(phys);
      (phys as any).body = { position: { x: 0, y: 0 }, angle: Math.PI / 4 };
      phys.update();
      expect(child.transform.rotation).toBeCloseTo(Math.PI / 4, 5);
    });

    it('stopRotation = true 时 transform.rotation 不被覆盖', () => {
      const { child } = makeChildWithParent();
      child.transform.rotation = 1.234;
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 5,
        stopRotation: true,
        bodyOptions: {},
      });
      child.addComponent(phys);
      (phys as any).body = { position: { x: 10, y: 20 }, angle: 0.99 };
      phys.update();
      expect(child.transform.position.x).toBe(10);
      expect(child.transform.rotation).toBe(1.234);
    });

    it('body 还没被 PhysicsEngine 注入时 update 是 no-op,不抛错', () => {
      const { child } = makeChildWithParent({ position: { x: 7, y: 8 } });
      const phys = new Physics({ type: PhysicsType.CIRCLE, radius: 5, bodyOptions: {} });
      child.addComponent(phys);
      // body 默认 undefined
      expect(() => phys.update()).not.toThrow();
      expect(child.transform.position.x).toBe(7);
      expect(child.transform.position.y).toBe(8);
    });
  });

  describe('PhysicsEngine — 物理体生命周期与碰撞事件', () => {
    it('start 后 enabled=true,Engine.create / World.create 被调用', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      expect(engine.enabled).toBe(false);
      engine.start();
      expect(engine.enabled).toBe(true);
      expect(Matter.Engine.create).toHaveBeenCalled();
      expect(Matter.World.create).toHaveBeenCalled();
    });

    it('add 把 body 注入 component,且把 component 反向挂在 body 上', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      engine.start();

      const { child } = makeChildWithParent({ position: { x: 100, y: 100 } });
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 20,
        bodyOptions: { isStatic: true },
      });
      child.addComponent(phys);

      engine.add(phys);
      expect(phys.body).toBeDefined();
      expect(phys.body.position).toEqual({ x: 100, y: 100 });
      expect((phys.body as any).component).toBe(phys);
      // PhysicsEngine 把 Matter 命名空间的几个引用也挂到 component 上,留给运行时调用
      expect((phys as any).Body).toBe(Matter.Body);
      expect((phys as any).PhysicsEngine).toBeDefined();
      expect((phys as any).World).toBe(Matter.World);
    });

    it('change 替换旧 body 为新 body', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      engine.start();
      const { child } = makeChildWithParent({ position: { x: 0, y: 0 } });
      const phys = new Physics({
        type: PhysicsType.CIRCLE,
        radius: 10,
        bodyOptions: {},
      });
      child.addComponent(phys);
      engine.add(phys);
      const oldBody = phys.body;

      // 改 bodyParams 后调用 change 应换出新的 matter body
      phys.bodyParams = {
        type: PhysicsType.CIRCLE,
        radius: 50,
        position: { x: 20, y: 30 },
        bodyOptions: {},
      };
      engine.change(phys);
      expect(phys.body).not.toBe(oldBody);
      expect(phys.body.position).toEqual({ x: 20, y: 30 });
    });

    it('remove 把 body 从 world 拿掉,component.body 重置', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      engine.start();
      const { child } = makeChildWithParent();
      const phys = new Physics({ type: PhysicsType.CIRCLE, radius: 10, bodyOptions: {} });
      child.addComponent(phys);
      engine.add(phys);
      expect(phys.body).toBeDefined();
      engine.remove(phys);
      expect(phys.body).toBeUndefined();
    });

    it('stop 把 enabled / runner.enabled 设为 false,awake 重新打开', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      engine.start();
      engine.stop();
      expect(engine.enabled).toBe(false);
      expect((engine as any).runner.enabled).toBe(false);
      engine.awake();
      expect(engine.enabled).toBe(true);
      expect((engine as any).runner.enabled).toBe(true);
    });

    it('collisionStart 事件时 componentA / componentB 的 emit 被同步触发', () => {
      const game = makeFakeGame();
      const engine = new PhysicsEngine(game, { world: {} });
      engine.start();

      const { child: childA } = makeChildWithParent({ position: { x: 0, y: 0 } });
      const { child: childB } = makeChildWithParent({ position: { x: 30, y: 0 } });
      const physA = new Physics({ type: PhysicsType.CIRCLE, radius: 20, bodyOptions: {} });
      const physB = new Physics({ type: PhysicsType.CIRCLE, radius: 20, bodyOptions: {} });
      childA.addComponent(physA);
      childB.addComponent(physB);
      engine.add(physA);
      engine.add(physB);

      const onAHit = jest.fn();
      const onBHit = jest.fn();
      physA.on('collisionStart', onAHit);
      physB.on('collisionStart', onBHit);

      // 直接通过 mock Matter.Events.trigger 触发 collisionStart
      Matter.Events.trigger((engine as any).engine, 'collisionStart', {
        pairs: [{ bodyA: physA.body, bodyB: physB.body }],
      });

      expect(onAHit).toHaveBeenCalledTimes(1);
      expect(onBHit).toHaveBeenCalledTimes(1);
      // emit(eventName, otherGameObject, selfGameObject) — A 收到 B、B 收到 A
      expect(onAHit.mock.calls[0][0]).toBe(childB);
      expect(onAHit.mock.calls[0][1]).toBe(childA);
      expect(onBHit.mock.calls[0][0]).toBe(childA);
      expect(onBHit.mock.calls[0][1]).toBe(childB);
    });
  });

  describe('PhysicsSystem — 顶层 system 的 init / start', () => {
    it('init 创建内部 engine 并把 resolution 写到 canvas data 属性', () => {
      const sys = new PhysicsSystem();
      const game = makeFakeGame();
      (sys as any).game = game;
      sys.init({ resolution: 2, world: {} });
      expect((sys as any).engine).toBeInstanceOf(PhysicsEngine);
      expect(game.canvas.setAttribute).toHaveBeenCalledWith('data-pixel-ratio', 2);
    });

    it('start 后底层 engine.enabled = true', () => {
      const sys = new PhysicsSystem();
      const game = makeFakeGame();
      (sys as any).game = game;
      sys.init({ world: {} });
      sys.start();
      expect((sys as any).engine.enabled).toBe(true);
    });

    it('onPause 把 engine 停掉,onResume 再拉起来', () => {
      const sys = new PhysicsSystem();
      const game = makeFakeGame();
      (sys as any).game = game;
      sys.init({ world: {} });
      sys.start();
      sys.onPause();
      expect((sys as any).engine.enabled).toBe(false);
      sys.onResume();
      expect((sys as any).engine.enabled).toBe(true);
    });
  });
});
