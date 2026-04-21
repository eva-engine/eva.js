# Eva.js (互动游戏引擎)

<p align="center"><a href="https://eva.js.org" target="_blank" rel="noopener noreferrer"><img width="300" src="https://user-images.githubusercontent.com/4632277/145818886-e0b1ca70-d789-4735-a8fe-411046263aa5.png" alt="Eva.js logo"></a></p>


![npm-version](https://img.shields.io/npm/v/@eva/eva.js)
![npm-size](https://img.shields.io/bundlephobia/minzip/@eva/eva.js)
![npm-download](https://img.shields.io/npm/dm/@eva/eva.js)

中文 ｜ [English](./README.md)

## 介绍
Eva.js 是一个专注于开发互动游戏项目的前端游戏引擎。

**易用**：Eva.js 提供开箱即用的游戏组件供开发人员立即使用。是的，它简单而优雅！

**高性能**：Eva.js 由高效的运行时和渲染管道 ([Pixi.JS](http://pixijs.io/)) 提供支持，这使得释放设备的全部潜力成为可能。

**可扩展**：得益于 ECS（实体-组件-系统）架构，你可以通过高度可定制的 API 扩展您的需求。唯一的限制是你的想象力！

## 文档

你可以在官方网站 [eva.js.org](https://eva-engine.gitee.io/#/) 找到 Eva.js 的文档, 在 [文档仓库](https://github.com/eva-engine/eva-engine.github.io) 提交 PR 为 Eva.js 文档进行查漏补缺。

- [在线案例](https://eva.js.org/playground)
- [快速开始](https://eva.js.org/#/tutorials/quickstart)
- [基础脚手架](https://github.com/eva-engine/start-demo)
- [Awesome](https://github.com/eva-engine/awesome)

## 包列表

| 包名 | 描述 |
|------|------|
| [`@eva/eva.js`](#核心---evaevejs) | 核心引擎：Game、GameObject、Component、System、Resource |
| [`@eva/plugin-renderer`](#渲染系统---evaplugin-renderer) | 核心渲染器 (PixiJS) |
| [`@eva/plugin-renderer-img`](#图片---evaplugin-renderer-img) | 图片渲染 |
| [`@eva/plugin-renderer-text`](#文本--html文本--位图文本---evaplugin-renderer-text) | 文本渲染 (Text, HTMLText, BitmapText) |
| [`@eva/plugin-renderer-sprite`](#精灵---evaplugin-renderer-sprite) | 精灵图渲染 |
| [`@eva/plugin-renderer-sprite-animation`](#精灵动画---evaplugin-renderer-sprite-animation) | 帧动画 |
| [`@eva/plugin-renderer-spine`](#spine---evaplugin-renderer-spine) | Spine 骨骼动画 |
| [`@eva/plugin-renderer-dragonbone`](#dragonbone---evaplugin-renderer-dragonbone) | DragonBones 骨骼动画 |
| [`@eva/plugin-renderer-lottie`](#lottie---evaplugin-renderer-lottie) | Lottie 动画 |
| [`@eva/plugin-renderer-graphics`](#图形---evaplugin-renderer-graphics) | 矢量图形绘制 |
| [`@eva/plugin-renderer-nine-patch`](#九宫格---evaplugin-renderer-nine-patch) | 九宫格缩放 |
| [`@eva/plugin-renderer-tiling-sprite`](#平铺精灵---evaplugin-renderer-tiling-sprite) | 平铺精灵 |
| [`@eva/plugin-renderer-mask`](#遮罩---evaplugin-renderer-mask) | 遮罩/裁剪 |
| [`@eva/plugin-renderer-mesh`](#透视网格---evaplugin-renderer-mesh) | 透视网格变形 |
| [`@eva/plugin-renderer-render`](#渲染属性---evaplugin-renderer-render) | 渲染属性 (alpha, zIndex, visible) |
| [`@eva/plugin-renderer-event`](#事件---evaplugin-renderer-event) | 触摸/指针事件 |
| [`@eva/plugin-sound`](#音频---evaplugin-sound) | 音频播放 |
| [`@eva/plugin-transition`](#过渡动画---evaplugin-transition) | 补间动画 |
| [`@eva/plugin-a11y`](#无障碍---evaplugin-a11y) | 无障碍支持 |
| [`@eva/plugin-evax`](#evax---evaplugin-evax) | 全局状态管理 |
| [`@eva/plugin-matterjs`](#物理引擎---evaplugin-matterjs) | 物理引擎 (Matter.js) |
| [`@eva/plugin-layout`](#布局---evaplugin-layout) | Flexbox 布局 |
| [`@eva/plugin-stats`](#性能监控---evaplugin-stats) | 性能监控 |

## 使用

### 安装

```bash
npm i @eva/eva.js @eva/plugin-renderer @eva/plugin-renderer-img --save
```

### 快速开始

```html
<canvas id="canvas"></canvas>
```

```javascript
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';

resource.addResource([
  {
    name: 'imageName',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: 'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
      },
    },
    preload: true,
  },
]);

const game = new Game();
await game.init({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('#canvas'),
      width: 750,
      height: 1000,
    }),
    new ImgSystem(),
  ],
});

const image = new GameObject('image', {
  size: { width: 750, height: 1319 },
  origin: { x: 0, y: 0 },
  position: { x: 0, y: -319 },
  anchor: { x: 0, y: 0 },
});

image.addComponent(
  new Img({
    resource: 'imageName',
  }),
);

game.scene.addChild(image);
```

---

## API 参考

### 核心 - `@eva/eva.js`

#### Game

游戏引擎入口，管理系统、场景和游戏循环。

```javascript
import { Game } from '@eva/eva.js';

const game = new Game();
await game.init({
  autoStart: true,       // 自动启动游戏循环（默认: true）
  frameRate: 60,         // 目标帧率（默认: 60）
  systems: [],           // 注册的系统
  needScene: true,       // 自动创建默认场景（默认: true）
});
```

| 方法 | 描述 |
|------|------|
| `addSystem(system)` | 注册系统 |
| `removeSystem(system)` | 移除系统 |
| `getSystem(SystemClass)` | 获取已注册的系统实例 |
| `start()` | 启动游戏循环 |
| `pause()` | 暂停游戏循环 |
| `resume()` | 恢复游戏循环 |
| `destroy()` | 销毁游戏 |
| `loadScene({ scene, mode?, params? })` | 加载场景 |
| `findByName(name)` | 按名称查找第一个 GameObject |
| `findAllByName(name)` | 按名称查找所有 GameObject |

| 属性 | 描述 |
|------|------|
| `scene` | 当前主场景 |
| `playing` | 游戏是否运行中 |
| `ticker` | Ticker 实例 |
| `systems` | 已注册系统数组 |

#### GameObject

ECS 架构中的实体，持有组件并支持父子层级关系。

```javascript
import { GameObject } from '@eva/eva.js';

const go = new GameObject('name', {
  position: { x: 0, y: 0 },
  size: { width: 100, height: 100 },
  origin: { x: 0, y: 0 },     // 变换原点
  anchor: { x: 0.5, y: 0.5 }, // 锚点
  scale: { x: 1, y: 1 },
  rotation: 0,                  // 弧度
  skew: { x: 0, y: 0 },
});
```

| 方法 | 描述 |
|------|------|
| `addComponent(component)` | 添加组件实例 |
| `addComponent(ComponentClass, params)` | 通过类+参数添加组件 |
| `removeComponent(component)` | 移除组件 |
| `getComponent(ComponentClass)` | 通过类获取组件 |
| `addChild(gameObject)` | 添加子 GameObject |
| `removeChild(gameObject)` | 移除子 GameObject |
| `remove()` | 从父级移除自身 |
| `destroy()` | 销毁自身及所有子对象 |

| 属性 | 描述 |
|------|------|
| `transform` | Transform 组件 |
| `parent` | 父 GameObject |
| `children` | 子 GameObject 列表 |
| `scene` | 所属场景 |

#### Component

所有组件的基类。

```javascript
import { Component } from '@eva/eva.js';

class MyComponent extends Component {
  static componentName = 'MyComponent';

  init(params) {}        // 添加到 GameObject 时调用
  awake() {}             // init 之后调用
  start() {}             // 第一次 update 之前调用
  update({ deltaTime, time, fps }) {}
  lateUpdate({ deltaTime }) {}
  onPause() {}
  onResume() {}
  onDestroy() {}
}
```

#### System

所有系统的基类，每帧处理组件。

```javascript
import { System } from '@eva/eva.js';

class MySystem extends System {
  static systemName = 'MySystem';

  init(params) {}
  awake() {}
  start() {}
  update({ deltaTime, time, fps }) {}
  lateUpdate({ deltaTime }) {}
  onPause() {}
  onResume() {}
  onDestroy() {}
}
```

#### resource

全局资源管理器单例。

```javascript
import { resource, RESOURCE_TYPE, LOAD_EVENT } from '@eva/eva.js';

// 添加资源
resource.addResource([
  {
    name: 'img',
    type: RESOURCE_TYPE.IMAGE,
    src: { image: { type: 'png', url: 'path/to/image.png' } },
    preload: true,
  },
]);

// 预加载所有 preload:true 的资源
resource.preload();

// 监听加载进度
resource.on(LOAD_EVENT.PROGRESS, (progress) => {});  // 0-1
resource.on(LOAD_EVENT.COMPLETE, () => {});
resource.on(LOAD_EVENT.ERROR, (err) => {});

// 获取资源（异步）
const res = await resource.getResource('img');

// 销毁资源
resource.destroy('img');
```

**RESOURCE_TYPE**: `IMAGE`, `SPRITE`, `SPRITE_ANIMATION`, `AUDIO`, `VIDEO`, `FONT`

---

### 渲染系统 - `@eva/plugin-renderer`

基于 PixiJS 的核心渲染系统，所有渲染插件均需依赖此系统。

```javascript
import { RendererSystem } from '@eva/plugin-renderer';

new RendererSystem({
  canvas: document.querySelector('#canvas'),
  width: 750,
  height: 1000,
  preference: 'webgl',   // 'webgl' | 'webgpu' | 'canvas'
  backgroundAlpha: 1,    // 0=完全透明, 1=不透明
  antialias: false,
  resolution: window.devicePixelRatio,
  backgroundColor: 0x000000,
  enableScroll: false,
  debugMode: false,
});
```

| 方法 | 描述 |
|------|------|
| `resize(width, height)` | 调整画布大小 |

---

### 图片 - `@eva/plugin-renderer-img`

渲染单张图片。

```javascript
import { Img, ImgSystem } from '@eva/plugin-renderer-img';

// 注册系统
game.addSystem(new ImgSystem());

// 添加组件
go.addComponent(new Img({ resource: 'imageName' }));
```

| 参数 | 类型 | 描述 |
|------|------|------|
| `resource` | `string` | 资源名称 (IMAGE 类型) |

---

### 精灵 - `@eva/plugin-renderer-sprite`

从精灵图集中渲染子图片。

```javascript
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';

game.addSystem(new SpriteSystem());

go.addComponent(new Sprite({
  resource: 'spriteName',
  spriteName: 'frame01.png',
}));
```

| 参数 | 类型 | 描述 |
|------|------|------|
| `resource` | `string` | 资源名称 (SPRITE 类型) |
| `spriteName` | `string` | 精灵图集中的子图片名称 |

---

### 精灵动画 - `@eva/plugin-renderer-sprite-animation`

从精灵图集播放逐帧动画。

```javascript
import { SpriteAnimation, SpriteAnimationSystem } from '@eva/plugin-renderer-sprite-animation';

game.addSystem(new SpriteAnimationSystem());

const anim = go.addComponent(new SpriteAnimation({
  resource: 'animResource',
  autoPlay: true,
  speed: 100,       // 每帧毫秒数
  forwards: false,  // 完成后停留在最后一帧
}));

anim.play(3);                // 播放 3 次
anim.gotoAndPlay(5);         // 跳到第 5 帧并播放
anim.gotoAndStop(0);         // 跳到第 0 帧并停止
anim.stop();
```

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `resource` | `string` | | 资源名称 (SPRITE_ANIMATION 类型) |
| `autoPlay` | `boolean` | `true` | 加载后自动播放 |
| `speed` | `number` | `100` | 每帧毫秒数 |
| `forwards` | `boolean` | `false` | 完成后停留在最后一帧 |

| 属性 | 描述 |
|------|------|
| `currentFrame` | 当前帧号 |
| `totalFrames` | 总帧数 |

| 事件 | 描述 |
|------|------|
| `complete` | 所有播放次数完成 |
| `loop` | 每次循环 |
| `frameChange` | 帧变化 |

---

### 文本 / HTML文本 / 位图文本 - `@eva/plugin-renderer-text`

三种渲染模式的文本内容渲染。

```javascript
import { Text, HTMLText, BitmapText, TextSystem } from '@eva/plugin-renderer-text';

game.addSystem(new TextSystem());

// Canvas 文本
go.addComponent(new Text({
  text: 'Hello World',
  style: {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xff1010,
    stroke: { color: 0xffffff, width: 5 },
    fontWeight: 'bold',
    wordWrap: true,
    wordWrapWidth: 200,
    align: 'center',
    dropShadow: {
      alpha: 1, angle: Math.PI / 6,
      blur: 5, color: 0x000000, distance: 5,
    },
  },
}));

// HTML 富文本（支持 <b>, <i>, <span>, <br> 标签）
go.addComponent(new HTMLText({
  text: '<b>粗体</b> 和 <i>斜体</i>',
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0x000000,
    wordWrap: true,
    wordWrapWidth: 300,
  },
}));

// 位图文本（使用位图字体资源）
go.addComponent(new BitmapText({
  text: 'Score: 100',
  style: {
    fontFamily: 'myBitmapFont',
    fontSize: 32,
  },
}));
```

---

### 图形 - `@eva/plugin-renderer-graphics`

使用 PixiJS Graphics API 绘制矢量图形。

```javascript
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';

game.addSystem(new GraphicsSystem());

const comp = go.addComponent(new Graphics());
// 直接使用 PixiJS Graphics API
comp.graphics.rect(0, 0, 100, 100);
comp.graphics.fill(0xff0000);
comp.graphics.circle(50, 50, 30);
comp.graphics.fill(0x00ff00);
```

---

### 九宫格 - `@eva/plugin-renderer-nine-patch`

九宫格缩放，角落保持固定，边缘和中心拉伸。

```javascript
import { NinePatch, NinePatchSystem } from '@eva/plugin-renderer-nine-patch';

game.addSystem(new NinePatchSystem());

go.addComponent(new NinePatch({
  resource: 'panelImg',
  leftWidth: 20,
  topHeight: 20,
  rightWidth: 20,
  bottomHeight: 20,
}));
```

| 参数 | 类型 | 描述 |
|------|------|------|
| `resource` | `string` | 图片或精灵资源名称 |
| `spriteName` | `string` | 子图片名称（使用 SPRITE 资源时） |
| `leftWidth` | `number` | 左侧不拉伸宽度 |
| `topHeight` | `number` | 顶部不拉伸高度 |
| `rightWidth` | `number` | 右侧不拉伸宽度 |
| `bottomHeight` | `number` | 底部不拉伸高度 |

---

### 平铺精灵 - `@eva/plugin-renderer-tiling-sprite`

在区域内重复平铺纹理。

```javascript
import { TilingSprite, TilingSpriteSystem } from '@eva/plugin-renderer-tiling-sprite';

game.addSystem(new TilingSpriteSystem());

go.addComponent(new TilingSprite({
  resource: 'bgTexture',
  tileScale: { x: 1, y: 1 },
  tilePosition: { x: 0, y: 0 },
}));
```

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `resource` | `string` | | 图片资源名称 |
| `tileScale` | `{x, y}` | `{x:1, y:1}` | 平铺缩放 |
| `tilePosition` | `{x, y}` | `{x:0, y:0}` | 平铺偏移 |

---

### 遮罩 - `@eva/plugin-renderer-mask`

裁剪 GameObject 的显示区域。

```javascript
import { Mask, MaskSystem, MASK_TYPE } from '@eva/plugin-renderer-mask';

game.addSystem(new MaskSystem());

// 圆形遮罩
go.addComponent(new Mask({
  type: MASK_TYPE.Circle,
  style: { x: 50, y: 50, radius: 50 },
}));

// 矩形遮罩
go.addComponent(new Mask({
  type: MASK_TYPE.Rect,
  style: { x: 0, y: 0, width: 200, height: 100 },
}));

// 图片遮罩（基于透明度）
go.addComponent(new Mask({
  type: MASK_TYPE.Img,
  resource: 'maskImg',
  style: { x: 0, y: 0, width: 200, height: 200 },
}));
```

**MASK_TYPE**: `Circle`, `Ellipse`, `Rect`, `RoundedRect`, `Polygon`, `Img`, `Sprite`

---

### 透视网格 - `@eva/plugin-renderer-mesh`

通过调整四个角点实现透视网格变形。

```javascript
import { PerspectiveMesh, MeshSystem } from '@eva/plugin-renderer-mesh';

game.addSystem(new MeshSystem());

const mesh = go.addComponent(new PerspectiveMesh({
  resource: 'cardImg',
  verticesX: 10,    // 水平顶点数
  verticesY: 10,    // 垂直顶点数
}));

// 设置四个角点 (x0,y0 x1,y1 x2,y2 x3,y3)
// 左上, 右上, 右下, 左下
mesh.setCorners(0, 0, 200, 20, 180, 300, 20, 280);
```

---

### 渲染属性 - `@eva/plugin-renderer-render`

控制渲染属性：可见性、透明度、层级排序。

```javascript
import { Render, RenderSystem } from '@eva/plugin-renderer-render';

game.addSystem(new RenderSystem());

go.addComponent(new Render({
  alpha: 1,               // 透明度 0-1
  visible: true,
  zIndex: 0,
  sortableChildren: false,
  resolution: 1,
}));
```

---

### 事件 - `@eva/plugin-renderer-event`

为 GameObject 添加触摸/指针交互。

```javascript
import { Event, EventSystem, HIT_AREA_TYPE } from '@eva/plugin-renderer-event';

game.addSystem(new EventSystem());

const evt = go.addComponent(new Event({
  hitArea: {
    type: HIT_AREA_TYPE.Rect,
    style: { x: 0, y: 0, width: 100, height: 100 },
  },
}));

evt.on('tap', (e) => {
  console.log('点击了!', e.data.position);
});

evt.on('touchstart', (e) => {
  e.stopPropagation(); // 阻止冒泡
});
```

**事件类型**: `tap`, `touchstart`, `touchmove`, `touchend`, `touchendoutside`, `touchcancel`

**事件数据**:
- `data.position` - 全局坐标 `{x, y}`
- `data.localPosition` - 本地坐标 `{x, y}`
- `data.pointerId` - 指针 ID
- `gameObject` - 目标 GameObject
- `stopPropagation()` - 阻止事件冒泡

**HIT_AREA_TYPE**: `Circle`, `Ellipse`, `Polygon`, `Rect`, `RoundedRect`

---

### Spine - `@eva/plugin-renderer-spine`

播放 Spine 骨骼动画。使用 `@eva/plugin-renderer-spine36` 支持 Spine 3.6 格式。

```javascript
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';

game.addSystem(new SpineSystem());

const spine = go.addComponent(new Spine({
  resource: 'spineRes',
  animationName: 'idle',
  autoPlay: true,
  scale: 1,
}));

spine.play('walk', true);               // 循环播放
spine.stop();
spine.addAnimation('attack', 0, false); // 队列动画
spine.setMix('idle', 'walk', 0.2);      // 过渡混合
spine.setAttachment('weapon', 'sword'); // 插槽附件（换装）
spine.getBone('head');                   // 获取骨骼

// 将 GameObject 挂载到 spine 插槽
spine.addSlotObject('hand', weaponGameObject);
spine.removeSlotObject(weaponGameObject);
```

| 事件 | 描述 |
|------|------|
| `complete` | 动画完成 |
| `start` | 动画开始 |
| `end` | 动画结束 |
| `event` | Spine 事件触发 |
| `interrupt` | 动画被打断 |

---

### Lottie - `@eva/plugin-renderer-lottie`

播放 Lottie (After Effects) 动画。

```javascript
import { Lottie, LottieSystem } from '@eva/plugin-renderer-lottie';

game.addSystem(new LottieSystem());

const lottie = go.addComponent(new Lottie({
  resource: 'lottieRes',
  autoStart: false,
}));

// 播放帧范围 [0, 60]，无限循环
lottie.play([0, 60], { repeats: -1 });

// 带插槽替换的播放
lottie.play([0, 100], {
  slot: [
    { type: 'IMAGE', name: 'layerName', url: 'newImg.png' },
    { type: 'TEXT', name: 'textLayer', value: '新文本', style: { fontSize: 24 } },
  ],
});

// 命名图层的点击交互
lottie.onTap('buttonLayer', () => console.log('点击了'));
```

| 事件 | 描述 |
|------|------|
| `complete` | 播放完成 |
| `loopComplete` | 循环迭代 |
| `enterFrame` | 每帧 |

---

### 音频 - `@eva/plugin-sound`

基于 Web Audio API 的音频播放。

```javascript
import { Sound, SoundSystem } from '@eva/plugin-sound';

game.addSystem(new SoundSystem({
  autoPauseAndStart: true,  // 与游戏暂停/恢复同步
}));

const sound = go.addComponent(new Sound({
  resource: 'bgm',
  autoplay: false,
  loop: true,
  volume: 0.8,
  speed: 1,
  muted: false,
  onEnd: () => console.log('播放结束'),
}));

sound.play();
sound.pause();
sound.resume();
sound.stop();
sound.volume = 0.5;
sound.muted = true;
```

| 属性 | 描述 |
|------|------|
| `playing` | 是否正在播放 |
| `volume` | 音量 (0-1) |
| `muted` | 静音状态 |
| `state` | `'unloaded'` / `'loading'` / `'loaded'` |

---

### 过渡动画 - `@eva/plugin-transition`

带关键帧和缓动的补间动画。

```javascript
import { Transition, TransitionSystem } from '@eva/plugin-transition';

game.addSystem(new TransitionSystem());

const render = go.addComponent(new Render({ alpha: 1 }));

const transition = go.addComponent(new Transition({
  group: {
    fadeIn: [
      {
        name: 'alpha',
        component: render,
        values: [
          { time: 0, value: 0, tween: 'ease-in' },
          { time: 1000, value: 1 },
        ],
      },
    ],
    moveRight: [
      {
        name: 'position.x',
        component: go.transform,
        values: [
          { time: 0, value: 0, tween: 'ease-out' },
          { time: 500, value: 300 },
        ],
      },
    ],
  },
}));

transition.play('fadeIn');
transition.play('moveRight', Infinity);  // 无限循环
transition.stop('fadeIn');

transition.on('finish', (name) => console.log(`${name} 完成`));
```

**缓动函数**: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `bounce-in`, `bounce-out`, `bounce-in-out`

---

### 无障碍 - `@eva/plugin-a11y`

无障碍支持。在画布上方创建带 ARIA 属性的透明 DOM 层。

```javascript
import { A11y, A11ySystem, A11yActivate } from '@eva/plugin-a11y';

game.addSystem(new A11ySystem({
  debug: false,
  activate: A11yActivate.CHECK,  // CHECK | ENABLE | DISABLE
  delay: 100,
}));

go.addComponent(new A11y({
  hint: '播放按钮',
  role: 'button',
  'aria-label': '开始游戏',
}));
```

---

### 物理引擎 - `@eva/plugin-matterjs`

基于 Matter.js 的 2D 物理引擎。

```javascript
import { Physics, PhysicsSystem, PhysicsType } from '@eva/plugin-matterjs';

game.addSystem(new PhysicsSystem({
  resolution: 1,
  isTest: false,           // 调试渲染
  world: {
    gravity: { x: 0, y: 1 },
  },
}));

// 矩形刚体
go.addComponent(new Physics({
  type: PhysicsType.RECTANGLE,
  bodyOptions: {
    isStatic: false,
    restitution: 0.8,
    density: 0.01,
  },
}));

// 圆形刚体
go.addComponent(new Physics({
  type: PhysicsType.CIRCLE,
  radius: 25,
  bodyOptions: { restitution: 1 },
}));

// 多边形刚体
go.addComponent(new Physics({
  type: PhysicsType.POLYGON,
  sides: 6,
  radius: 30,
}));
```

**PhysicsType**: `RECTANGLE`, `CIRCLE`, `POLYGON`

---

### 布局 - `@eva/plugin-layout`

类 Flexbox 的布局系统。

```javascript
import { Layout, LayoutChild, LayoutSystem } from '@eva/plugin-layout';

game.addSystem(new LayoutSystem());

// 容器
container.addComponent(new Layout({
  direction: 'row',           // 'row' | 'column'
  justifyContent: 'center',  // 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  alignItems: 'center',      // 'start' | 'center' | 'end' | 'stretch'
  gap: 10,
  padding: [10, 20],         // number | [v,h] | [top,right,bottom,left]
  autoSize: true,             // 自动适应容器大小
}));

// 子项
child.addComponent(new LayoutChild({
  flexGrow: 1,
  flexShrink: 0,
  alignSelf: 'center',
  margin: 5,
  fixedSize: { width: 100 },
}));
```

---

### 性能监控 - `@eva/plugin-stats`

显示 FPS 等指标的性能监控面板。

```javascript
import { Stats, StatsSystem } from '@eva/plugin-stats';

game.addSystem(new StatsSystem({
  show: true,
  style: { x: 0, y: 0, width: 200, height: 100 },
}));

go.addComponent(new Stats());
```

---

## 问题交流
可以在 [Gitter](https://gitter.im/eva-engine/Eva.js) 或者 [微信](https://weixin.qq.com/) 扫码 [二维码](https://gw.alicdn.com/imgextra/i4/O1CN015W09ux1QD1RAxBkYN_!!6000000001941-2-tps-610-1279.png) 进行交流.


## Issues
按照 [Issue Reporting Checklist](.github/ISSUE_TEMPLATE.md) 提交 issue. 不符合准则的问题可能会立即关闭。

## Changelog
[版本记录](https://github.com/eva-engine/eva.js/releases).

## Contribute
[如何贡献](.github/HOW_TO_CONTRIBUTE.md)

## License
MIT, See [LICENSE file](./LICENSE).
