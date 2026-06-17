import { GameObject, Component } from '@eva/eva.js';
import { AISystem } from '../lib';
import {
  detectComponentType,
  generateDescription,
  extractRenderInfo,
  extractVisibility,
  isInteractive,
} from '../lib/utils';

// ---- Stub 组件,只提供 static componentName + 任意 props ----
function makeStubComponent(name: string) {
  class Stub extends Component<any> {
    static componentName = name;
    // 把 init 接到的 params 拷贝到自身,方便 utils 直接读 .text/.style 等
    init(params: any = {}) {
      Object.assign(this, params);
    }
  }
  // 覆盖派生类 displayName,避免 jest 警告
  Object.defineProperty(Stub, 'name', { value: name });
  return Stub as any;
}

// 常用组件桩
const ImgStub = makeStubComponent('Img');
const TextStub = makeStubComponent('Text');
const BitmapTextStub = makeStubComponent('BitmapText');
const HTMLTextStub = makeStubComponent('HTMLText');
const SpriteStub = makeStubComponent('Sprite');
const SpriteAnimationStub = makeStubComponent('SpriteAnimation');
const SpineStub = makeStubComponent('Spine');
const LottieStub = makeStubComponent('Lottie');
const GraphicsStub = makeStubComponent('Graphics');
const NinePatchStub = makeStubComponent('NinePatch');
const TilingSpriteStub = makeStubComponent('TilingSprite');
const RenderStub = makeStubComponent('Render');
const EventStub = makeStubComponent('Event');

describe('plugin-ai/utils — 纯函数', () => {
  describe('detectComponentType', () => {
    it('未挂任何已知视觉组件时返回 Container', () => {
      const go = new GameObject('blank');
      expect(detectComponentType(go)).toBe('Container');
    });

    it('挂了 Img 时返回 Img', () => {
      const go = new GameObject('imgnode');
      go.addComponent(ImgStub, { resource: 'foo' });
      expect(detectComponentType(go)).toBe('Img');
    });

    it('挂了 Text 时返回 Text', () => {
      const go = new GameObject('textnode');
      go.addComponent(TextStub, { text: 'hi' });
      expect(detectComponentType(go)).toBe('Text');
    });

    it('挂了 Spine 时返回 Spine(优先视觉组件,而非 Render)', () => {
      const go = new GameObject('spinenode');
      go.addComponent(SpineStub, { resource: 'sp' });
      go.addComponent(RenderStub, { visible: true });
      expect(detectComponentType(go)).toBe('Spine');
    });
  });

  describe('generateDescription', () => {
    it('用 type + name 拼描述', () => {
      const go = new GameObject('hero');
      expect(generateDescription(go, 'Img')).toBe('Img: hero');
    });

    it('name 为空时 fallback 到 GameObject_<id>', () => {
      const go = new GameObject('');
      const desc = generateDescription(go, 'Container');
      expect(desc).toMatch(/^Container: GameObject_\d+$/);
    });
  });

  describe('extractRenderInfo', () => {
    it('Text 组件:抽出 text + style 字段', () => {
      const go = new GameObject('t');
      go.addComponent(TextStub, {
        text: 'hello',
        style: {
          fontSize: 24,
          fill: '#ff0000',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          align: 'center',
        },
      });
      const info = extractRenderInfo(go);
      expect(info.text).toBe('hello');
      expect(info['font-size']).toBe('24');
      expect(info['color']).toBe('#ff0000');
      expect(info['font-family']).toBe('Arial');
      expect(info['font-weight']).toBe('bold');
      expect(info['text-align']).toBe('center');
    });

    it('Text 组件且未提供 style 时只返回 text', () => {
      const go = new GameObject('t2');
      go.addComponent(TextStub, { text: 'plain' });
      const info = extractRenderInfo(go);
      expect(info.text).toBe('plain');
      expect(info['font-size']).toBeUndefined();
    });

    it('BitmapText 组件:抽出 text 与基础 style', () => {
      const go = new GameObject('bt');
      go.addComponent(BitmapTextStub, {
        text: 'BMP',
        style: { fontSize: 18, fill: 0xff00ff },
      });
      const info = extractRenderInfo(go);
      expect(info.text).toBe('BMP');
      expect(info['font-size']).toBe('18');
      expect(info['color']).toBe(String(0xff00ff));
    });

    it('HTMLText 组件:只抽 text', () => {
      const go = new GameObject('html');
      go.addComponent(HTMLTextStub, { text: '<b>html</b>' });
      const info = extractRenderInfo(go);
      expect(info.text).toBe('<b>html</b>');
    });

    it('Img 组件:抽 resource', () => {
      const go = new GameObject('img');
      go.addComponent(ImgStub, { resource: 'bg.png' });
      expect(extractRenderInfo(go)).toEqual({ resource: 'bg.png' });
    });

    it('Sprite 组件:抽 resource + sprite-name', () => {
      const go = new GameObject('sp');
      go.addComponent(SpriteStub, { resource: 'atlas', spriteName: 'frame_01' });
      const info = extractRenderInfo(go);
      expect(info.resource).toBe('atlas');
      expect(info['sprite-name']).toBe('frame_01');
    });

    it('SpriteAnimation 组件:speed/playing 写成字符串', () => {
      const go = new GameObject('anim');
      go.addComponent(SpriteAnimationStub, {
        resource: 'walk',
        speed: 1.5,
        autoPlay: false,
      });
      const info = extractRenderInfo(go);
      expect(info.resource).toBe('walk');
      expect(info.speed).toBe('1.5');
      expect(info.playing).toBe('false');
    });

    it('Spine 组件:抽 resource + animation', () => {
      const go = new GameObject('sk');
      go.addComponent(SpineStub, { resource: 'hero', animationName: 'idle' });
      const info = extractRenderInfo(go);
      expect(info.resource).toBe('hero');
      expect(info.animation).toBe('idle');
    });

    it('Lottie 组件:resource 从 options 里读', () => {
      const go = new GameObject('lt');
      go.addComponent(LottieStub, { options: { resource: 'lt-data' } });
      const info = extractRenderInfo(go);
      expect(info.resource).toBe('lt-data');
    });

    it('NinePatch / TilingSprite:抽 resource', () => {
      const np = new GameObject('np');
      np.addComponent(NinePatchStub, { resource: 'panel', spriteName: 'btn' });
      const npInfo = extractRenderInfo(np);
      expect(npInfo.resource).toBe('panel');
      expect(npInfo['sprite-name']).toBe('btn');

      const ts = new GameObject('ts');
      ts.addComponent(TilingSpriteStub, { resource: 'tile' });
      expect(extractRenderInfo(ts)).toEqual({ resource: 'tile' });
    });

    it('Graphics 组件:从 PixiJS v8 instructions 抽 fill-color(数值转 hex)', () => {
      const go = new GameObject('g1');
      go.addComponent(GraphicsStub, {
        graphics: {
          context: {
            _instructions: [
              { action: 'fill', data: { style: { color: 0xff0000 } } },
            ],
          },
        },
      });
      const info = extractRenderInfo(go);
      expect(info['fill-color']).toBe('#ff0000');
    });

    it('Graphics 组件:走 PixiJS v7 _fillStyle 路径', () => {
      const go = new GameObject('g2');
      go.addComponent(GraphicsStub, {
        graphics: {
          _fillStyle: { color: 0x00ff00 },
        },
      });
      const info = extractRenderInfo(go);
      expect(info['fill-color']).toBe('#00ff00');
    });

    it('Graphics 组件:fill 是字符串色值时原样返回', () => {
      const go = new GameObject('g3');
      go.addComponent(GraphicsStub, {
        graphics: {
          context: {
            _instructions: [
              { action: 'fill', data: { style: { color: '#abcdef' } } },
            ],
          },
        },
      });
      expect(extractRenderInfo(go)['fill-color']).toBe('#abcdef');
    });

    it('Graphics 组件:可从 container.children 上找到 graphics 实例', () => {
      const go = new GameObject('g4');
      go.addComponent(GraphicsStub, { graphics: {} });
      const container = {
        children: [
          {
            context: {
              _instructions: [
                { action: 'fill', data: { style: { color: 0x123456 } } },
              ],
            },
          },
        ],
      };
      const info = extractRenderInfo(go, container);
      expect(info['fill-color']).toBe('#123456');
    });

    it('完全没有视觉组件时返回空对象', () => {
      const go = new GameObject('empty');
      expect(extractRenderInfo(go)).toEqual({});
    });
  });

  describe('extractVisibility', () => {
    it('Render 默认值时不写任何 key', () => {
      const go = new GameObject('rdef');
      go.addComponent(RenderStub, {});
      expect(extractVisibility(go)).toEqual({});
    });

    it('Render alpha 非 1 / visible=false / zIndex 非 0 时全部输出', () => {
      const go = new GameObject('rfull');
      go.addComponent(RenderStub, { alpha: 0.5, visible: false, zIndex: 3 });
      expect(extractVisibility(go)).toEqual({
        alpha: '0.5',
        visible: 'false',
        'z-index': '3',
      });
    });

    it('没有 Render 组件时返回空对象', () => {
      const go = new GameObject('norender');
      expect(extractVisibility(go)).toEqual({});
    });
  });

  describe('isInteractive', () => {
    it('挂了 Event 组件 -> true', () => {
      const go = new GameObject('btn');
      go.addComponent(EventStub, {});
      expect(isInteractive(go)).toBe(true);
    });

    it('未挂 Event 组件 -> false', () => {
      const go = new GameObject('static');
      expect(isInteractive(go)).toBe(false);
    });
  });
});

// ============================================================================
// AISystem 集成测试 — 不走 Game.init,直接挂载 stub `game`,命令式调 lateUpdate
// ============================================================================
describe('plugin-ai/AISystem', () => {
  // 创建一个挂载在 document 上的 canvas + parent host
  function mountCanvas() {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const canvas = document.createElement('canvas');
    // jsdom 没真实布局,getBoundingClientRect 返回 0;手动 patch 一份
    (canvas as any).getBoundingClientRect = () => ({
      width: 750,
      height: 1000,
      left: 0,
      top: 0,
      right: 750,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON() {
        return {};
      },
    });
    host.appendChild(canvas);
    return { host, canvas };
  }

  // 一个尽量贴近真实 RendererSystem 的最小桩
  function makeRendererSystemStub() {
    return {
      params: { width: 750, height: 1000, backgroundColor: 0x000000, backgroundAlpha: 0.9 },
      containerManager: {
        getContainer(_id: number) {
          // 返回一个非空 container,避免 syncElement 直接 return
          return { children: [] };
        },
      },
      getBounds(go: GameObject, _opts?: any) {
        // 默认所有 GameObject 在画布中央 100x100
        if ((go as any).__bounds) return (go as any).__bounds;
        return { x: 100, y: 100, width: 100, height: 100 };
      },
    };
  }

  // 把 AISystem 挂到一个 stub game 上,跳过真实 Game 启动流程
  function mountAISystem(params: any = {}) {
    const { host, canvas } = mountCanvas();
    const renderer = makeRendererSystemStub();
    const sys = new AISystem(params);
    const game: any = {
      canvas,
      gameObjects: [] as GameObject[],
      getSystem(_S: any) {
        return renderer as any;
      },
    };
    (sys as any).game = game;
    sys.init(params);
    sys.start?.();
    return { sys, game, renderer, host, canvas };
  }

  afterEach(() => {
    // 清空 jsdom body,防止上一条用例残留
    document.body.innerHTML = '';
  });

  it('enabled=true(默认) 时 start 会创建 [data-ai-overlay] DOM', () => {
    const { canvas } = mountAISystem();
    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(overlay.style.position).toBe('absolute');
    expect(overlay.style.pointerEvents).toBe('none');
    // canvas 旁边
    expect(overlay.parentNode).toBe(canvas.parentNode);
    // canvas meta
    expect(overlay.getAttribute('data-canvas-width')).toBe('750');
    expect(overlay.getAttribute('data-canvas-height')).toBe('1000');
    expect(overlay.getAttribute('data-background-color')).toBe('0');
    expect(overlay.getAttribute('data-background-alpha')).toBe('0.9');
  });

  it('enabled=false 时 start 不创建 overlay,lateUpdate 也不写 DOM', () => {
    const { sys, game } = mountAISystem({ enabled: false });
    expect(document.querySelector('[data-ai-overlay="true"]')).toBeNull();
    // 加一个 GameObject,触发 lateUpdate
    const go = new GameObject('ghost');
    game.gameObjects.push(go);
    sys.lateUpdate?.();
    // 仍然没有 overlay
    expect(document.querySelector('[data-ai-overlay="true"]')).toBeNull();
    expect(document.querySelectorAll('[data-name]').length).toBe(0);
  });

  it('lateUpdate 为每个 GameObject 在 overlay 下生成镜像 div,带 data-name/type/bounds/aria', () => {
    const { sys, game } = mountAISystem();
    const a = new GameObject('hero');
    a.addComponent(ImgStub, { resource: 'hero.png' });
    const b = new GameObject('label');
    b.addComponent(TextStub, { text: 'HP' });
    game.gameObjects.push(a, b);

    sys.lateUpdate?.();

    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    const mirrors = overlay.querySelectorAll<HTMLElement>('div[data-name]');
    expect(mirrors.length).toBe(2);

    const heroEl = Array.from(mirrors).find(el => el.getAttribute('data-name') === 'hero')!;
    expect(heroEl).toBeTruthy();
    expect(heroEl.getAttribute('data-type')).toBe('Img');
    expect(heroEl.getAttribute('data-bounds')).toBe('100,100,100,100');
    expect(heroEl.getAttribute('data-resource')).toBe('hero.png');
    expect(heroEl.getAttribute('aria-label')).toBe('Img: hero');
    expect(heroEl.getAttribute('role')).toBe('img');

    const labelEl = Array.from(mirrors).find(el => el.getAttribute('data-name') === 'label')!;
    expect(labelEl.getAttribute('data-type')).toBe('Text');
    expect(labelEl.getAttribute('data-text')).toBe('HP');
  });

  it('Render.visible=false 的实体不会得到镜像 DOM', () => {
    const { sys, game } = mountAISystem();
    const hidden = new GameObject('hidden');
    hidden.addComponent(ImgStub, { resource: 'x' });
    hidden.addComponent(RenderStub, { visible: false });
    game.gameObjects.push(hidden);

    sys.lateUpdate?.();
    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    expect(overlay.querySelector('[data-name="hidden"]')).toBeNull();
  });

  it('实体销毁后下一次 lateUpdate 把镜像 DOM 移除', () => {
    const { sys, game } = mountAISystem();
    const a = new GameObject('aa');
    a.addComponent(ImgStub, { resource: 'a' });
    const b = new GameObject('bb');
    b.addComponent(ImgStub, { resource: 'b' });
    game.gameObjects.push(a, b);

    sys.lateUpdate?.();
    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    expect(overlay.querySelectorAll('[data-name]').length).toBe(2);

    // 移除 b
    game.gameObjects = [a];
    sys.lateUpdate?.();

    const remain = overlay.querySelectorAll<HTMLElement>('[data-name]');
    expect(remain.length).toBe(1);
    expect(remain[0].getAttribute('data-name')).toBe('aa');
  });

  it('Event 组件实体得到 data-interactive=true', () => {
    const { sys, game } = mountAISystem();
    const btn = new GameObject('btn');
    btn.addComponent(ImgStub, { resource: 'btn.png' });
    btn.addComponent(EventStub, {});
    game.gameObjects.push(btn);

    sys.lateUpdate?.();
    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    const el = overlay.querySelector('[data-name="btn"]') as HTMLElement;
    expect(el.getAttribute('data-interactive')).toBe('true');
  });

  it('debug=true 时镜像 div 带红色 outline + 红色背景', () => {
    const { sys, game } = mountAISystem({ debug: true });
    const a = new GameObject('dbg');
    a.addComponent(ImgStub, { resource: 'd' });
    game.gameObjects.push(a);

    sys.lateUpdate?.();
    const el = document.querySelector('[data-name="dbg"]') as HTMLElement;
    expect(el.style.outline).toContain('rgba(255, 0, 0');
    expect(el.style.background).toContain('rgba(255, 0, 0');
  });

  it('zIndex 自定义 + bounds 越界时被 clamp 到画布范围内', () => {
    const { sys, game, renderer } = mountAISystem({ zIndex: 99999 });
    const overlay = document.querySelector('[data-ai-overlay="true"]') as HTMLElement;
    expect(overlay.style.zIndex).toBe('99999');

    const big = new GameObject('big');
    big.addComponent(ImgStub, { resource: 'big' });
    // 超出画布 (renderWidth=750, renderHeight=1000)
    (big as any).__bounds = { x: -50, y: -50, width: 2000, height: 2000 };
    // 让 renderer 返回这个 bounds
    renderer.getBounds = () => (big as any).__bounds;
    game.gameObjects.push(big);

    sys.lateUpdate?.();
    const el = document.querySelector('[data-name="big"]') as HTMLElement;
    // clamp 后:x=0,y=0,width=750,height=1000(ratio=1)
    expect(el.getAttribute('data-bounds')).toBe('0,0,750,1000');
  });

  it('onDestroy 移除 overlay,清空 cache', () => {
    const { sys, game } = mountAISystem();
    const a = new GameObject('xx');
    a.addComponent(ImgStub, { resource: 'x' });
    game.gameObjects.push(a);
    sys.lateUpdate?.();

    expect(document.querySelector('[data-ai-overlay="true"]')).not.toBeNull();
    sys.destroy(); // 调到 onDestroy
    expect(document.querySelector('[data-ai-overlay="true"]')).toBeNull();
    // cache 也被清空
    expect((sys as any).cache.size).toBe(0);
    expect((sys as any).div).toBeNull();
  });

  it('父子层级 -> data-parent / data-children 写入', () => {
    const { sys, game } = mountAISystem();
    const parent = new GameObject('parent');
    parent.addComponent(ImgStub, { resource: 'p' });
    const child = new GameObject('child');
    child.addComponent(ImgStub, { resource: 'c' });
    parent.addChild(child);
    game.gameObjects.push(parent, child);

    sys.lateUpdate?.();

    const parentEl = document.querySelector('[data-name="parent"]') as HTMLElement;
    const childEl = document.querySelector('[data-name="child"]') as HTMLElement;
    expect(parentEl.getAttribute('data-children')).toBe('child');
    expect(childEl.getAttribute('data-parent')).toBe('parent');
  });
});
