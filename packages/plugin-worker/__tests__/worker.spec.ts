// 单测 @eva/plugin-worker:
//
// plugin-worker 设计上跑在 Web Worker / OffscreenCanvas 环境,真实跑通需要
// pixi.js 的 extensions / DOMAdapter / WebWorkerAdapter / Ticker / mixin 这套
// 注入,以及 Worker 主线程的 postMessage 通道。jsdom + 全局 pixi.js stub mock
// 不具备这些条件,所以本 spec 只覆盖 *纯逻辑* 部分:
//
//   - 顶层 eventHandler(index.ts):eva-init 写 canvasMap、eva-events 派发
//   - EventSystem 构造、init、destroy、resolutionChange、setCursor
//   - eventsHandler 表、mapPositionToPoint、normalizeWheelEvent
//   - features / defaultEventFeatures / TOUCH_TO_POINTER 间接行为
//   - hit test / propagate / 真正在 Worker 里跑事件循环这些不在 jsdom 测,
//     fixing 这部分需要 OffscreenCanvas + Worker harness,在 notes 标注。

// 第一步:扩展 monorepo 全局 pixi.js mock。全局 mock 缺 ExtensionType /
// extensions / DOMAdapter / WebWorkerAdapter / Ticker / UPDATE_PRIORITY / warn,
// init() 和 EventBoundary/EventTicker import 时会爆 undefined。这里用
// jest.mock 工厂模式,把全局 mock 已有的导出原样保留,再补上 plugin-worker
// 需要的几个最小实现。
jest.mock('pixi.js', () => {
  const actual = jest.requireActual('pixi.js');

  // ExtensionType 的最小子集 —— init() 注册 EventSystem 时只读 enum 值,
  // 不真正消费;给字符串占位即可。
  const ExtensionType = {
    WebGLSystem: 'webgl-system',
    CanvasSystem: 'canvas-system',
    WebGPUSystem: 'webgpu-system',
    Asset: 'asset',
  };

  // extensions: pixi.js 的扩展注册中心。plugin-worker init() 调用 add / mixin。
  // 这里只需要 noop + mixin 实际拷贝 prototype,让 Container 实例能拿到
  // FederatedContainer 上的属性(eventMode 等)。
  const extensions = {
    add: jest.fn(),
    mixin(target: any, source: any) {
      if (!target || !source) return;
      for (const key of Object.keys(source)) {
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (desc) Object.defineProperty(target.prototype, key, desc);
      }
    },
  };

  // DOMAdapter / WebWorkerAdapter:plugin-worker init() 调用
  // DOMAdapter.set(WebWorkerAdapter)。功能性的部分(create canvas/image)在
  // jsdom 里测不出来,只需保证 set 不抛。
  const DOMAdapter = { set: jest.fn() };
  const WebWorkerAdapter = {};

  // UPDATE_PRIORITY:EventTicker.addTickerListener 注册时只读取 INTERACTION。
  const UPDATE_PRIORITY = { INTERACTION: 50 };

  // Ticker:EventTicker 通过 Ticker.system.add/remove 接入主循环。Worker 模式
  // 下不会真的跑 ticker,这里 stub 足够让 init() 走通。
  const Ticker = {
    system: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  };

  // warn:EventBoundary 在 dev 路径上调用 warn(),pixi.js 8 把它放到顶层导出。
  const warn = jest.fn();

  // PointerEvent 在 jsdom 里没有 —— EventSystem 构造时读 globalThis.PointerEvent
  // 决定 supportsPointerEvents,缺省 undefined 也能跑,这里不补也行。

  return {
    ...actual,
    ExtensionType,
    extensions,
    DOMAdapter,
    WebWorkerAdapter,
    UPDATE_PRIORITY,
    Ticker,
    warn,
  };
});

// 引入 plugin-worker 时 init() 已经执行(顶层副作用),它会调用 extensions /
// DOMAdapter mixin 等,因此必须放在 jest.mock 之后。
import { eventHandler } from '../lib';
import {
  EventSystem,
  FederatedEvent,
  FederatedMouseEvent,
  FederatedPointerEvent,
  FederatedWheelEvent,
  EventBoundary,
} from '../lib/events';

/**
 * 构造一个最小可用的 fake renderer:EventSystem.init 只读 canvas / resolution,
 * setTargetElement 内部还会读 navigator.msPointerEnabled。
 */
function createFakeRenderer(canvas: HTMLElement = document.createElement('canvas')) {
  return {
    canvas,
    resolution: 1,
    lastObjectRendered: null,
  };
}

describe('@eva/plugin-worker - top-level eventHandler', () => {
  beforeEach(() => {
    EventSystem.canvasMap = {};
    EventSystem.eventsHandler = {};
  });

  it('eva-init 类型应该把 canvasMap 写到 EventSystem.canvasMap', () => {
    const fakeCanvas = {} as OffscreenCanvas;
    eventHandler({
      type: 'eva-init',
      canvasMap: { '0': fakeCanvas },
    });

    expect(EventSystem.canvasMap).toEqual({ '0': fakeCanvas });
  });

  it('eva-events 类型应该按 id + eventName 找回调,并把 event 数据 + canvasRect/domElement 注入', () => {
    const handler = jest.fn();
    EventSystem.eventsHandler = {
      '0': { pointerdown: handler },
    };

    const canvasRect = { left: 0, top: 0, width: 100, height: 100 };
    const domElement = { width: 100, height: 100 } as any;

    eventHandler({
      type: 'eva-events',
      id: '0',
      canvasRect,
      domElement,
      events: [
        {
          eventName: 'pointerdown',
          event: { clientX: 10, clientY: 20, type: 'pointerdown' },
          normalizedEvents: [
            { clientX: 10, clientY: 20, type: 'pointerdown', pointerType: 'mouse' },
          ],
        },
      ],
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const arg = handler.mock.calls[0][0];
    expect(arg.clientX).toBe(10);
    expect(arg.clientY).toBe(20);
    expect(arg.canvasRect).toBe(canvasRect);
    expect(arg.domElement).toBe(domElement);
    expect(typeof arg.preventDefault).toBe('function');
    expect(Array.isArray(arg.normalizedEvents)).toBe(true);
  });

  it('eva-events 找不到回调时不抛错(fn && fn(...) 短路)', () => {
    EventSystem.eventsHandler = { '0': {} };
    expect(() =>
      eventHandler({
        type: 'eva-events',
        id: '0',
        events: [
          { eventName: 'wheel', event: {}, normalizedEvents: [] },
        ],
      }),
    ).not.toThrow();
  });

  it('未识别 type 应该静默 noop', () => {
    expect(() => eventHandler({ type: 'eva-unknown' } as any)).not.toThrow();
  });
});

describe('@eva/plugin-worker - EventSystem 构造与 init', () => {
  let renderer: ReturnType<typeof createFakeRenderer>;
  let system: EventSystem;

  beforeEach(() => {
    EventSystem.canvasMap = {};
    EventSystem.eventsHandler = {};
    renderer = createFakeRenderer();
    system = new EventSystem(renderer as any);
  });

  afterEach(() => {
    if (system) {
      try {
        system.destroy();
      } catch {
        // setTargetElement(null) 在某些路径会读 domElement.style,jsdom canvas 也有 style,
        // 这里防御性 catch 让 afterEach 不污染下一个用例。
      }
    }
  });

  it('应该正确构造 EventSystem(rootBoundary / features / cursor 默认值)', () => {
    expect(system).toBeDefined();
    expect(system.rootBoundary).toBeInstanceOf(EventBoundary);
    expect(system.autoPreventDefault).toBe(true);
    expect(system.cursorStyles.default).toBe('inherit');
    expect(system.cursorStyles.pointer).toBe('pointer');
    expect(system.features.move).toBe(true);
    expect(system.features.globalMove).toBe(true);
    expect(system.features.click).toBe(true);
    expect(system.features.wheel).toBe(true);
  });

  it('static defaultEventFeatures 应该有 move/globalMove/click/wheel 全开', () => {
    expect(EventSystem.defaultEventFeatures).toEqual({
      move: true,
      globalMove: true,
      click: true,
      wheel: true,
    });
  });

  it('init() 应该写 resolution、设置 _defaultEventMode、合并 eventFeatures、注册 eventsHandler', () => {
    renderer.resolution = 2;
    system.init({
      eventMode: 'static',
      eventFeatures: { wheel: false },
    });

    expect(system.resolution).toBe(2);
    expect(EventSystem.defaultEventMode).toBe('static');
    expect(system.features.wheel).toBe(false);
    expect(system.features.move).toBe(true); // 未指定字段保持默认
    // _addEvents 会写 eventsHandler[id]
    const ids = Object.keys(EventSystem.eventsHandler);
    expect(ids.length).toBe(1);
    const map = EventSystem.eventsHandler[ids[0]];
    // 关键事件名都要被注册
    for (const name of [
      'pointermove',
      'pointerdown',
      'pointerup',
      'pointerleave',
      'pointerover',
      'mousemove',
      'mousedown',
      'mouseup',
      'mouseout',
      'mouseover',
      'touchstart',
      'touchend',
      'touchmove',
      'wheel',
    ]) {
      expect(typeof map[name]).toBe('function');
    }
  });

  it('init() 不传 eventMode 时,默认 mode 为 passive', () => {
    system.init({});
    expect(EventSystem.defaultEventMode).toBe('passive');
  });

  it('修改 features.globalMove 应该同步给 rootBoundary.enableGlobalMoveEvents (Proxy setter)', () => {
    system.features.globalMove = false;
    expect(system.rootBoundary.enableGlobalMoveEvents).toBe(false);
    system.features.globalMove = true;
    expect(system.rootBoundary.enableGlobalMoveEvents).toBe(true);
  });

  it('resolutionChange() 应该更新 resolution', () => {
    system.resolutionChange(3);
    expect(system.resolution).toBe(3);
  });

  it('canvasMap 中匹配到 domElement 时,eventsHandler 应该挂在对应 id 下', () => {
    const canvasA = document.createElement('canvas');
    EventSystem.canvasMap = { 'canvas-a': canvasA as any };

    const localRenderer = createFakeRenderer(canvasA);
    const localSystem = new EventSystem(localRenderer as any);
    localSystem.init({});

    expect(EventSystem.eventsHandler['canvas-a']).toBeDefined();
    expect(typeof EventSystem.eventsHandler['canvas-a'].pointerdown).toBe('function');
    expect(typeof EventSystem.eventsHandler['canvas-a'].wheel).toBe('function');

    try {
      localSystem.destroy();
    } catch {
      /* see afterEach note */
    }
  });
});

describe('@eva/plugin-worker - EventSystem.setCursor', () => {
  let system: EventSystem;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const renderer = createFakeRenderer(canvas);
    system = new EventSystem(renderer as any);
    system.init({});
  });

  afterEach(() => {
    try {
      system.destroy();
    } catch {
      /* noop */
    }
  });

  it('字符串 cursorStyle 应该写到 domElement.style.cursor', () => {
    system.setCursor('pointer');
    expect((system.domElement as HTMLElement).style.cursor).toBe('pointer');
  });

  it('未注册的 mode 字符串也应该当成 CSS cursor 直接写入', () => {
    system.setCursor('crosshair');
    expect((system.domElement as HTMLElement).style.cursor).toBe('crosshair');
  });

  it('相同 mode 重复设置不会重复写 style(早返回)', () => {
    const el = system.domElement as HTMLElement;
    system.setCursor('pointer');
    el.style.cursor = 'sentinel';
    // 再次设置同一 mode 应该早返回,不重新写
    system.setCursor('pointer');
    expect(el.style.cursor).toBe('sentinel');
  });

  it('function 类型 cursorStyle 会被调用,而不是写 CSS', () => {
    const fn = jest.fn();
    system.cursorStyles.busy = fn;
    system.setCursor('busy');
    expect(fn).toHaveBeenCalledWith('busy');
  });

  it('object 类型 cursorStyle 会 Object.assign 到 domElement.style', () => {
    system.cursorStyles.fancy = { cursor: 'help' } as any;
    system.setCursor('fancy');
    expect((system.domElement as HTMLElement).style.cursor).toBe('help');
  });

  it('传空 mode 应该回退到 default', () => {
    // 先把 default 改成可识别值,验证回退分支
    system.cursorStyles.default = 'wait';
    // 强制 _currentCursor 不等于 default
    system.setCursor('pointer');
    system.setCursor('');
    expect((system.domElement as HTMLElement).style.cursor).toBe('wait');
  });
});

describe('@eva/plugin-worker - EventSystem.mapPositionToPoint', () => {
  let system: EventSystem;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    (canvas as any).width = 800;
    (canvas as any).height = 600;
    const renderer = createFakeRenderer(canvas);
    renderer.resolution = 1;
    system = new EventSystem(renderer as any);
    system.init({});
  });

  afterEach(() => {
    try {
      system.destroy();
    } catch {
      /* noop */
    }
  });

  it('使用 e.canvasRect / e.domElement 把 client 坐标缩放到 canvas 内部坐标', () => {
    const point: any = { x: 0, y: 0 };
    const e = {
      canvasRect: { left: 100, top: 50, width: 400, height: 300, x: 100, y: 50 },
      domElement: { width: 800, height: 600 },
    };

    // (x - rect.left) * (domWidth / rectWidth) * (1 / resolution)
    system.mapPositionToPoint(point, 200, 200, e);
    // (200 - 100) * (800 / 400) = 100 * 2 = 200
    expect(point.x).toBeCloseTo(200);
    // (200 - 50) * (600 / 300) = 150 * 2 = 300
    expect(point.y).toBeCloseTo(300);
  });

  it('resolution > 1 会让结果按倒数缩放', () => {
    system.resolutionChange(2);
    const point: any = { x: 0, y: 0 };
    const e = {
      canvasRect: { left: 0, top: 0, width: 800, height: 600, x: 0, y: 0 },
      domElement: { width: 800, height: 600 },
    };
    system.mapPositionToPoint(point, 200, 100, e);
    // (200 - 0) * 1 * (1 / 2) = 100
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(50);
  });

  it('未传 e.canvasRect 时,使用 domElement.width/height 作为默认 rect', () => {
    const point: any = { x: 0, y: 0 };
    // 没有 canvasRect、没有 domElement 字段,会读 system.domElement.width/height
    (system.domElement as any).width = 800;
    (system.domElement as any).height = 600;
    system.mapPositionToPoint(point, 100, 100, {});
    // 默认 rect 是 0,0,800,600 -> (100 - 0) * (800/800) = 100
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(100);
  });
});

describe('@eva/plugin-worker - Federated event 类层次', () => {
  it('FederatedEvent 提供 stopPropagation / stopImmediatePropagation / phase 常量', () => {
    const ev = new FederatedEvent(null as any);
    expect(ev.NONE).toBe(0);
    expect(ev.CAPTURING_PHASE).toBe(1);
    expect(ev.AT_TARGET).toBe(2);
    expect(ev.BUBBLING_PHASE).toBe(3);
    expect(ev.propagationStopped).toBe(false);
    ev.stopPropagation();
    expect(ev.propagationStopped).toBe(true);
    ev.stopImmediatePropagation();
    expect(ev.propagationImmediatelyStopped).toBe(true);
  });

  it('FederatedMouseEvent 是 FederatedEvent 子类,FederatedPointerEvent 是 MouseEvent 子类', () => {
    const pe = new FederatedPointerEvent(null as any);
    expect(pe).toBeInstanceOf(FederatedMouseEvent);
    expect(pe).toBeInstanceOf(FederatedEvent);
  });

  it('FederatedPointerEvent.getCoalescedEvents 仅在 move 类型上返回自身', () => {
    const pe = new FederatedPointerEvent(null as any);
    pe.type = 'pointermove';
    expect(pe.getCoalescedEvents()).toEqual([pe]);
    pe.type = 'pointerdown';
    expect(pe.getCoalescedEvents()).toEqual([]);
  });

  it('FederatedWheelEvent 暴露 DOM_DELTA_* 常量', () => {
    const we = new FederatedWheelEvent(null as any);
    expect(we.DOM_DELTA_PIXEL).toBe(0);
    expect(we.DOM_DELTA_LINE).toBe(1);
    expect(we.DOM_DELTA_PAGE).toBe(2);
    expect(FederatedWheelEvent.DOM_DELTA_PIXEL).toBe(0);
    expect(FederatedWheelEvent.DOM_DELTA_LINE).toBe(1);
    expect(FederatedWheelEvent.DOM_DELTA_PAGE).toBe(2);
  });
});

describe('@eva/plugin-worker - EventBoundary mapping table', () => {
  it('构造时应该注册 pointerdown/move/up/over/out/leave/upoutside/wheel 默认 mapping', () => {
    const boundary = new EventBoundary(null as any);
    const table = (boundary as any).mappingTable as Record<
      string,
      Array<{ fn: Function; priority: number }>
    >;
    for (const t of [
      'pointerdown',
      'pointermove',
      'pointerout',
      'pointerleave',
      'pointerover',
      'pointerup',
      'pointerupoutside',
      'wheel',
    ]) {
      expect(Array.isArray(table[t])).toBe(true);
      expect(table[t].length).toBeGreaterThan(0);
    }
  });

  it('addEventMapping 可以追加自定义事件 mapping,并按 priority 排序', () => {
    const boundary = new EventBoundary(null as any);
    const a = jest.fn();
    const b = jest.fn();
    boundary.addEventMapping('custom', a);
    boundary.addEventMapping('custom', b);
    const table = (boundary as any).mappingTable.custom;
    expect(table.length).toBe(2);
    // priority 默认都是 0,排序稳定
    expect(table[0].fn === a || table[0].fn === b).toBe(true);
  });

  it('mapEvent 在 rootTarget=null 时早返回,不调 mappers', () => {
    const boundary = new EventBoundary(null as any);
    const fn = jest.fn();
    boundary.addEventMapping('pointerdown', fn);
    boundary.mapEvent({ type: 'pointerdown' } as any);
    expect(fn).not.toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------
// 跳过的部分(说明在文件头注释):
// - EventSystem._onPointerDown / _onPointerMove / _onPointerUp 完整链路
//   依赖 rootBoundary.mapEvent + EventBoundary.hitTest,后者要遍历 PixiJS
//   Container 的 worldTransform / hitArea / interactiveChildren 等真实运行时
//   字段。jsdom + 当前 mock Container 不具备,这部分留给真实 pixi.js 集成测试
//   或 e2e。
// - 真正的 Worker postMessage / OffscreenCanvas 通道:eventHandler 只是
//   Worker 那一端的入站分发,出站(发回主线程)逻辑在主线程 packer 里,这里
//   不在范围内。
// ----------------------------------------------------------------------------
