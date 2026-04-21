# Eva.js (Interactive Game Engine)

<p align="center"><a href="https://eva.js.org" target="_blank" rel="noopener noreferrer"><img width="300" src="https://user-images.githubusercontent.com/4632277/145818886-e0b1ca70-d789-4735-a8fe-411046263aa5.png" alt="Eva.js logo"></a></p>

![npm-version](https://img.shields.io/npm/v/@eva/eva.js)
![npm-size](https://img.shields.io/bundlephobia/minzip/@eva/eva.js)
![npm-download](https://img.shields.io/npm/dm/@eva/eva.js)

English ｜ [Chinese](./README_CN.md)

## Introduction

Eva.js is a front-end game engine specifically for creating interactive game projects.

**Easy to Use**: Eva.js provides out-of-box game components for developers to use right away. Yes, it's simple and elegant!

**High-performance**: Eva.js is powered by efficient runtime and rendering pipeline ([Pixi.JS](http://pixijs.io/)) which makes it possible to unleash the full potential of your device.

**Scalability**: Thanks to the ECS(Entity-Component-System) structure, you can expand your needs by highly customizable APIs. The only limitation is your imagination!

## Documentation

You can find the Eva.js Documentation on [eva.js.org](https://eva.js.org), we appreciate your devotion by sending pull requests to [this repository](https://github.com/eva-engine/eva-engine.github.io).

Checking out the [Live example](https://eva.js.org/playground).

- [Quick Start](https://eva.js.org/#/tutorials/quickstart)
- [Start Demo](https://github.com/eva-engine/start-demo)
- [Awesome](https://github.com/eva-engine/awesome)

## Packages

| Package | Description |
|---------|-------------|
| [`@eva/eva.js`](#core---evaevejs) | Core engine: Game, GameObject, Component, System, Resource |
| [`@eva/plugin-renderer`](#rendersystem---evaplugin-renderer) | Core renderer (PixiJS) |
| [`@eva/plugin-renderer-img`](#img---evaplugin-renderer-img) | Image rendering |
| [`@eva/plugin-renderer-text`](#text--htmltext--bitmaptext---evaplugin-renderer-text) | Text rendering (Text, HTMLText, BitmapText) |
| [`@eva/plugin-renderer-sprite`](#sprite---evaplugin-renderer-sprite) | Sprite sheet rendering |
| [`@eva/plugin-renderer-sprite-animation`](#spriteanimation---evaplugin-renderer-sprite-animation) | Frame animation |
| [`@eva/plugin-renderer-spine`](#spine---evaplugin-renderer-spine) | Spine skeleton animation |
| [`@eva/plugin-renderer-dragonbone`](#dragonbone---evaplugin-renderer-dragonbone) | DragonBones skeleton animation |
| [`@eva/plugin-renderer-lottie`](#lottie---evaplugin-renderer-lottie) | Lottie animation |
| [`@eva/plugin-renderer-graphics`](#graphics---evaplugin-renderer-graphics) | Vector graphics drawing |
| [`@eva/plugin-renderer-nine-patch`](#ninepatch---evaplugin-renderer-nine-patch) | Nine-slice scaling |
| [`@eva/plugin-renderer-tiling-sprite`](#tilingsprite---evaplugin-renderer-tiling-sprite) | Tiling sprite |
| [`@eva/plugin-renderer-mask`](#mask---evaplugin-renderer-mask) | Mask / clipping |
| [`@eva/plugin-renderer-mesh`](#perspectivemesh---evaplugin-renderer-mesh) | Perspective mesh deformation |
| [`@eva/plugin-renderer-render`](#render---evaplugin-renderer-render) | Render properties (alpha, zIndex, visible) |
| [`@eva/plugin-renderer-event`](#event---evaplugin-renderer-event) | Touch / pointer events |
| [`@eva/plugin-sound`](#sound---evaplugin-sound) | Audio playback |
| [`@eva/plugin-transition`](#transition---evaplugin-transition) | Tween animation |
| [`@eva/plugin-a11y`](#a11y---evaplugin-a11y) | Accessibility |
| [`@eva/plugin-evax`](#evax---evaplugin-evax) | Global state management |
| [`@eva/plugin-matterjs`](#physics---evaplugin-matterjs) | Physics engine (Matter.js) |
| [`@eva/plugin-layout`](#layout---evaplugin-layout) | Flexbox layout |
| [`@eva/plugin-stats`](#stats---evaplugin-stats) | Performance monitor |

## Usage

### Install

```bash
npm i @eva/eva.js @eva/plugin-renderer @eva/plugin-renderer-img --save
```

### Quick Start

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

## API Reference

### Core - `@eva/eva.js`

#### Game

Game engine entry. Manages systems, scenes, and the game loop.

```javascript
import { Game } from '@eva/eva.js';

const game = new Game();
await game.init({
  autoStart: true,       // auto start the game loop (default: true)
  frameRate: 60,         // target frame rate (default: 60)
  systems: [],           // systems to register
  needScene: true,       // auto create default scene (default: true)
});
```

| Method | Description |
|--------|-------------|
| `addSystem(system)` | Register a system |
| `removeSystem(system)` | Remove a system |
| `getSystem(SystemClass)` | Get registered system instance |
| `start()` | Start the game loop |
| `pause()` | Pause the game loop |
| `resume()` | Resume the game loop |
| `destroy()` | Destroy the game |
| `loadScene({ scene, mode?, params? })` | Load a scene |
| `findByName(name)` | Find first GameObject by name |
| `findAllByName(name)` | Find all GameObjects by name |

| Property | Description |
|----------|-------------|
| `scene` | Current main scene |
| `playing` | Whether the game is running |
| `ticker` | Ticker instance |
| `systems` | Registered systems array |

#### GameObject

Entity in the ECS architecture. Holds components and supports parent-child hierarchy.

```javascript
import { GameObject } from '@eva/eva.js';

const go = new GameObject('name', {
  position: { x: 0, y: 0 },
  size: { width: 100, height: 100 },
  origin: { x: 0, y: 0 },     // transform origin
  anchor: { x: 0.5, y: 0.5 }, // anchor point
  scale: { x: 1, y: 1 },
  rotation: 0,                  // radians
  skew: { x: 0, y: 0 },
});
```

| Method | Description |
|--------|-------------|
| `addComponent(component)` | Add a component instance |
| `addComponent(ComponentClass, params)` | Add component by class + params |
| `removeComponent(component)` | Remove a component |
| `getComponent(ComponentClass)` | Get component by class |
| `addChild(gameObject)` | Add child GameObject |
| `removeChild(gameObject)` | Remove child GameObject |
| `remove()` | Remove self from parent |
| `destroy()` | Destroy self and all children |

| Property | Description |
|----------|-------------|
| `transform` | Transform component |
| `parent` | Parent GameObject |
| `children` | Child GameObjects |
| `scene` | Scene this object belongs to |

#### Component

Base class for all components.

```javascript
import { Component } from '@eva/eva.js';

class MyComponent extends Component {
  static componentName = 'MyComponent';

  init(params) {}        // called when added to GameObject
  awake() {}             // called after init
  start() {}             // called before first update
  update({ deltaTime, time, fps }) {}
  lateUpdate({ deltaTime }) {}
  onPause() {}
  onResume() {}
  onDestroy() {}
}
```

#### System

Base class for all systems. Processes components each frame.

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

Global resource manager singleton.

```javascript
import { resource, RESOURCE_TYPE, LOAD_EVENT } from '@eva/eva.js';

// Add resources
resource.addResource([
  {
    name: 'img',
    type: RESOURCE_TYPE.IMAGE,
    src: { image: { type: 'png', url: 'path/to/image.png' } },
    preload: true,
  },
]);

// Preload all preload:true resources
resource.preload();

// Listen to loading progress
resource.on(LOAD_EVENT.PROGRESS, (progress) => {});  // 0-1
resource.on(LOAD_EVENT.COMPLETE, () => {});
resource.on(LOAD_EVENT.ERROR, (err) => {});

// Get resource (async)
const res = await resource.getResource('img');

// Destroy resource
resource.destroy('img');
```

**RESOURCE_TYPE**: `IMAGE`, `SPRITE`, `SPRITE_ANIMATION`, `AUDIO`, `VIDEO`, `FONT`

---

### RendererSystem - `@eva/plugin-renderer`

Core rendering system powered by PixiJS. Required by all renderer plugins.

```javascript
import { RendererSystem } from '@eva/plugin-renderer';

new RendererSystem({
  canvas: document.querySelector('#canvas'),
  width: 750,
  height: 1000,
  preference: 'webgl',   // 'webgl' | 'webgpu' | 'canvas'
  backgroundAlpha: 1,    // 0=fully transparent, 1=opaque
  antialias: false,
  resolution: window.devicePixelRatio,
  backgroundColor: 0x000000,
  enableScroll: false,
  debugMode: false,
});
```

| Method | Description |
|--------|-------------|
| `resize(width, height)` | Resize the canvas |

---

### Img - `@eva/plugin-renderer-img`

Render a single image.

```javascript
import { Img, ImgSystem } from '@eva/plugin-renderer-img';

// Register system
game.addSystem(new ImgSystem());

// Add component
go.addComponent(new Img({ resource: 'imageName' }));
```

| Param | Type | Description |
|-------|------|-------------|
| `resource` | `string` | Resource name (IMAGE type) |

---

### Sprite - `@eva/plugin-renderer-sprite`

Render a sub-image from a sprite sheet.

```javascript
import { Sprite, SpriteSystem } from '@eva/plugin-renderer-sprite';

game.addSystem(new SpriteSystem());

go.addComponent(new Sprite({
  resource: 'spriteName',
  spriteName: 'frame01.png',
}));
```

| Param | Type | Description |
|-------|------|-------------|
| `resource` | `string` | Resource name (SPRITE type) |
| `spriteName` | `string` | Sub-image name in the sprite sheet |

---

### SpriteAnimation - `@eva/plugin-renderer-sprite-animation`

Play frame-by-frame animation from a sprite sheet.

```javascript
import { SpriteAnimation, SpriteAnimationSystem } from '@eva/plugin-renderer-sprite-animation';

game.addSystem(new SpriteAnimationSystem());

const anim = go.addComponent(new SpriteAnimation({
  resource: 'animResource',
  autoPlay: true,
  speed: 100,       // ms per frame
  forwards: false,  // stop at last frame when done
}));

anim.play(3);                // play 3 times
anim.gotoAndPlay(5);         // jump to frame 5 and play
anim.gotoAndStop(0);         // jump to frame 0 and stop
anim.stop();
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `resource` | `string` | | Resource name (SPRITE_ANIMATION type) |
| `autoPlay` | `boolean` | `true` | Auto play on load |
| `speed` | `number` | `100` | Milliseconds per frame |
| `forwards` | `boolean` | `false` | Freeze on last frame when complete |

| Property | Description |
|----------|-------------|
| `currentFrame` | Current frame number |
| `totalFrames` | Total frame count |

| Event | Description |
|-------|-------------|
| `complete` | All play iterations finished |
| `loop` | Each loop iteration |
| `frameChange` | Frame changed |

---

### Text / HTMLText / BitmapText - `@eva/plugin-renderer-text`

Render text content with three rendering modes.

```javascript
import { Text, HTMLText, BitmapText, TextSystem } from '@eva/plugin-renderer-text';

game.addSystem(new TextSystem());

// Canvas Text
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

// HTML Rich Text (supports <b>, <i>, <span>, <br> tags)
go.addComponent(new HTMLText({
  text: '<b>Bold</b> and <i>italic</i>',
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0x000000,
    wordWrap: true,
    wordWrapWidth: 300,
  },
}));

// Bitmap Text (using bitmap font resource)
go.addComponent(new BitmapText({
  text: 'Score: 100',
  style: {
    fontFamily: 'myBitmapFont',
    fontSize: 32,
  },
}));
```

---

### Graphics - `@eva/plugin-renderer-graphics`

Draw vector shapes using PixiJS Graphics API.

```javascript
import { Graphics, GraphicsSystem } from '@eva/plugin-renderer-graphics';

game.addSystem(new GraphicsSystem());

const comp = go.addComponent(new Graphics());
// Use PixiJS Graphics API directly
comp.graphics.rect(0, 0, 100, 100);
comp.graphics.fill(0xff0000);
comp.graphics.circle(50, 50, 30);
comp.graphics.fill(0x00ff00);
```

---

### NinePatch - `@eva/plugin-renderer-nine-patch`

Nine-slice scaling. Corners stay fixed while edges and center stretch.

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

| Param | Type | Description |
|-------|------|-------------|
| `resource` | `string` | Image or sprite resource name |
| `spriteName` | `string` | Sub-image name (when using SPRITE resource) |
| `leftWidth` | `number` | Left non-stretch width |
| `topHeight` | `number` | Top non-stretch height |
| `rightWidth` | `number` | Right non-stretch width |
| `bottomHeight` | `number` | Bottom non-stretch height |

---

### TilingSprite - `@eva/plugin-renderer-tiling-sprite`

Repeating tiled texture within a region.

```javascript
import { TilingSprite, TilingSpriteSystem } from '@eva/plugin-renderer-tiling-sprite';

game.addSystem(new TilingSpriteSystem());

go.addComponent(new TilingSprite({
  resource: 'bgTexture',
  tileScale: { x: 1, y: 1 },
  tilePosition: { x: 0, y: 0 },
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `resource` | `string` | | Image resource name |
| `tileScale` | `{x, y}` | `{x:1, y:1}` | Tile scale |
| `tilePosition` | `{x, y}` | `{x:0, y:0}` | Tile offset |

---

### Mask - `@eva/plugin-renderer-mask`

Clip the display area of a GameObject.

```javascript
import { Mask, MaskSystem, MASK_TYPE } from '@eva/plugin-renderer-mask';

game.addSystem(new MaskSystem());

// Circle mask
go.addComponent(new Mask({
  type: MASK_TYPE.Circle,
  style: { x: 50, y: 50, radius: 50 },
}));

// Rect mask
go.addComponent(new Mask({
  type: MASK_TYPE.Rect,
  style: { x: 0, y: 0, width: 200, height: 100 },
}));

// Image mask (alpha-based)
go.addComponent(new Mask({
  type: MASK_TYPE.Img,
  resource: 'maskImg',
  style: { x: 0, y: 0, width: 200, height: 200 },
}));
```

**MASK_TYPE**: `Circle`, `Ellipse`, `Rect`, `RoundedRect`, `Polygon`, `Img`, `Sprite`

---

### PerspectiveMesh - `@eva/plugin-renderer-mesh`

Perspective mesh deformation by adjusting four corner points.

```javascript
import { PerspectiveMesh, MeshSystem } from '@eva/plugin-renderer-mesh';

game.addSystem(new MeshSystem());

const mesh = go.addComponent(new PerspectiveMesh({
  resource: 'cardImg',
  verticesX: 10,    // horizontal vertex count
  verticesY: 10,    // vertical vertex count
}));

// Set four corners (x0,y0 x1,y1 x2,y2 x3,y3)
// top-left, top-right, bottom-right, bottom-left
mesh.setCorners(0, 0, 200, 20, 180, 300, 20, 280);
```

---

### Render - `@eva/plugin-renderer-render`

Control render properties: visibility, transparency, z-order.

```javascript
import { Render, RenderSystem } from '@eva/plugin-renderer-render';

game.addSystem(new RenderSystem());

go.addComponent(new Render({
  alpha: 1,               // opacity 0-1
  visible: true,
  zIndex: 0,
  sortableChildren: false,
  resolution: 1,
}));
```

---

### Event - `@eva/plugin-renderer-event`

Add touch/pointer interaction to GameObjects.

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
  console.log('tapped!', e.data.position);
});

evt.on('touchstart', (e) => {
  e.stopPropagation(); // stop bubbling
});
```

**Events**: `tap`, `touchstart`, `touchmove`, `touchend`, `touchendoutside`, `touchcancel`

**Event data**:
- `data.position` - global coordinates `{x, y}`
- `data.localPosition` - local coordinates `{x, y}`
- `data.pointerId` - pointer ID
- `gameObject` - target GameObject
- `stopPropagation()` - stop event bubbling

**HIT_AREA_TYPE**: `Circle`, `Ellipse`, `Polygon`, `Rect`, `RoundedRect`

---

### Spine - `@eva/plugin-renderer-spine`

Play Spine skeleton animations. Use `@eva/plugin-renderer-spine36` for Spine 3.6 format.

```javascript
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine';

game.addSystem(new SpineSystem());

const spine = go.addComponent(new Spine({
  resource: 'spineRes',
  animationName: 'idle',
  autoPlay: true,
  scale: 1,
}));

spine.play('walk', true);               // play looping
spine.stop();
spine.addAnimation('attack', 0, false); // queue animation
spine.setMix('idle', 'walk', 0.2);      // transition blend
spine.setAttachment('weapon', 'sword'); // slot attachment (skin swap)
spine.getBone('head');                   // get bone

// Mount a GameObject to a spine slot
spine.addSlotObject('hand', weaponGameObject);
spine.removeSlotObject(weaponGameObject);
```

| Event | Description |
|-------|-------------|
| `complete` | Animation complete |
| `start` | Animation started |
| `end` | Animation ended |
| `event` | Spine event triggered |
| `interrupt` | Animation interrupted |

---

### Lottie - `@eva/plugin-renderer-lottie`

Play Lottie (After Effects) animations.

```javascript
import { Lottie, LottieSystem } from '@eva/plugin-renderer-lottie';

game.addSystem(new LottieSystem());

const lottie = go.addComponent(new Lottie({
  resource: 'lottieRes',
  autoStart: false,
}));

// Play frame range [0, 60], loop infinitely
lottie.play([0, 60], { repeats: -1 });

// Play with slot replacement
lottie.play([0, 100], {
  slot: [
    { type: 'IMAGE', name: 'layerName', url: 'newImg.png' },
    { type: 'TEXT', name: 'textLayer', value: 'New Text', style: { fontSize: 24 } },
  ],
});

// Tap interaction on named layer
lottie.onTap('buttonLayer', () => console.log('clicked'));
```

| Event | Description |
|-------|-------------|
| `complete` | Play complete |
| `loopComplete` | Loop iteration |
| `enterFrame` | Each frame |

---

### Sound - `@eva/plugin-sound`

Audio playback based on Web Audio API.

```javascript
import { Sound, SoundSystem } from '@eva/plugin-sound';

game.addSystem(new SoundSystem({
  autoPauseAndStart: true,  // sync with game pause/resume
}));

const sound = go.addComponent(new Sound({
  resource: 'bgm',
  autoplay: false,
  loop: true,
  volume: 0.8,
  speed: 1,
  muted: false,
  onEnd: () => console.log('done'),
}));

sound.play();
sound.pause();
sound.resume();
sound.stop();
sound.volume = 0.5;
sound.muted = true;
```

| Property | Description |
|----------|-------------|
| `playing` | Whether sound is playing |
| `volume` | Volume (0-1) |
| `muted` | Mute state |
| `state` | `'unloaded'` / `'loading'` / `'loaded'` |

---

### Transition - `@eva/plugin-transition`

Tween animation with keyframes and easing.

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
transition.play('moveRight', Infinity);  // loop forever
transition.stop('fadeIn');

transition.on('finish', (name) => console.log(`${name} finished`));
```

**Easing functions**: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `bounce-in`, `bounce-out`, `bounce-in-out`

---

### A11y - `@eva/plugin-a11y`

Accessibility support. Creates transparent DOM overlay with ARIA attributes over canvas.

```javascript
import { A11y, A11ySystem, A11yActivate } from '@eva/plugin-a11y';

game.addSystem(new A11ySystem({
  debug: false,
  activate: A11yActivate.CHECK,  // CHECK | ENABLE | DISABLE
  delay: 100,
}));

go.addComponent(new A11y({
  hint: 'Play button',
  role: 'button',
  'aria-label': 'Start the game',
}));
```

---
### Physics - `@eva/plugin-matterjs`

2D physics powered by Matter.js.

```javascript
import { Physics, PhysicsSystem, PhysicsType } from '@eva/plugin-matterjs';

game.addSystem(new PhysicsSystem({
  resolution: 1,
  isTest: false,           // debug render
  world: {
    gravity: { x: 0, y: 1 },
  },
}));

// Rectangle body
go.addComponent(new Physics({
  type: PhysicsType.RECTANGLE,
  bodyOptions: {
    isStatic: false,
    restitution: 0.8,
    density: 0.01,
  },
}));

// Circle body
go.addComponent(new Physics({
  type: PhysicsType.CIRCLE,
  radius: 25,
  bodyOptions: { restitution: 1 },
}));

// Polygon body
go.addComponent(new Physics({
  type: PhysicsType.POLYGON,
  sides: 6,
  radius: 30,
}));
```

**PhysicsType**: `RECTANGLE`, `CIRCLE`, `POLYGON`

---

### Layout - `@eva/plugin-layout`

Flexbox-like layout system.

```javascript
import { Layout, LayoutChild, LayoutSystem } from '@eva/plugin-layout';

game.addSystem(new LayoutSystem());

// Container
container.addComponent(new Layout({
  direction: 'row',           // 'row' | 'column'
  justifyContent: 'center',  // 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  alignItems: 'center',      // 'start' | 'center' | 'end' | 'stretch'
  gap: 10,
  padding: [10, 20],         // number | [v,h] | [top,right,bottom,left]
  autoSize: true,             // auto-fit container size
}));

// Child item
child.addComponent(new LayoutChild({
  flexGrow: 1,
  flexShrink: 0,
  alignSelf: 'center',
  margin: 5,
  fixedSize: { width: 100 },
}));
```

---

### Stats - `@eva/plugin-stats`

Performance monitoring panel displaying FPS and other metrics.

```javascript
import { Stats, StatsSystem } from '@eva/plugin-stats';

game.addSystem(new StatsSystem({
  show: true,
  style: { x: 0, y: 0, width: 200, height: 100 },
}));

go.addComponent(new Stats());
```

---

## Questions

For questions and support please use [Gitter](https://gitter.im/eva-engine/Eva.js) or [WeChat](https://weixin.qq.com/) (微信) to scan [this QR Code](https://gw.alicdn.com/imgextra/i4/O1CN015W09ux1QD1RAxBkYN_!!6000000001941-2-tps-610-1279.png).

## Issues

Please make sure to read the [Issue Reporting Checklist](.github/ISSUE_TEMPLATE.md) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## Changelog

[release notes](https://github.com/eva-engine/eva.js/releases) in documentation.

## Contribute

[How to Contribute](.github/HOW_TO_CONTRIBUTE.md)

## License

The Eva.js is released under the MIT license. See [LICENSE file](./LICENSE).
