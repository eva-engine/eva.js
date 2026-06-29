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
| [`@eva/plugin-renderer-particle`](#particleemitter---evaplugin-renderer-particle) | Particle emitter with zones, ranges and atlas frames |
| [`@eva/plugin-renderer-filter`](#filter---evaplugin-renderer-filter) | PixiJS 2D filters (blur, colorMatrix, displacement, noise, alpha) |
| [`@eva/plugin-renderer-render-texture`](#rendertexture---evaplugin-renderer-render-texture) | Phaser-style dynamic render texture |
| [`@eva/plugin-renderer-dom-element`](#domelement---evaplugin-renderer-dom-element) | Pin an HTML element to a GameObject transform |
| [`@eva/plugin-renderer-video`](#video---evaplugin-renderer-video) | HTML5 `<video>` rendering |
| [`@eva/plugin-renderer-tilemap`](#tilemap---evaplugin-renderer-tilemap) | 2D tilemap (Phaser v1 + Godot-style chunked v2) |
| [`@eva/plugin-renderer-spine36`](#spine36---evaplugin-renderer-spine36) | Spine 3.6 skeleton animation |
| [`@eva/plugin-hitarea`](#hitarea---evaplugin-hitarea) | Trigger-style overlap detection (Godot Area2D equivalent, no physics) |
| [`@eva/plugin-input-action`](#inputactionmap---evaplugin-input-action) | Map raw input (key / mouse / touch) to semantic action signals |
| [`@eva/plugin-camera2d`](#camera2d---evaplugin-camera2d) | 2D camera with follow / deadzone / shake |
| [`@eva/plugin-canvas-layer`](#canvaslayer---evaplugin-canvas-layer) | Named render layers with zIndex / screen-space flag |
| [`@eva/plugin-parallax`](#parallax---evaplugin-parallax) | Camera-driven background parallax with optional tiling |
| [`@eva/plugin-path-follow`](#pathfollow---evaplugin-path-follow) | Move a GameObject along a waypoint path (once / loop / pingpong) |
| [`@eva/plugin-tween`](#tween---evaplugin-tween) | Godot-style tween with sequence / parallel / yoyo |
| [`@eva/plugin-animation-track`](#animationtrack---evaplugin-animation-track) | Multi-track keyframe animation |
| [`@eva/plugin-easing`](#easing---evaplugin-easing) | Shared easing functions (linear / quad / cubic / elastic / back / bounce) |
| [`@eva/plugin-trigger`](#trigger---evaplugin-trigger) | Signal -> declarative actions, the stateless cousin of StateMachine |
| [`@eva/plugin-state-machine`](#statemachine---evaplugin-state-machine) | Finite state machine driven by signals |
| [`@eva/plugin-behavior-script`](#behaviorscript---evaplugin-behavior-script) | Godot-style scriptable behaviors |
| [`@eva/plugin-signal-bus`](#signalbus---evaplugin-signal-bus) | Namespaced global event bus |
| [`@eva/plugin-tick`](#ticker---evaplugin-tick) | Reliable frame scheduler with RAF / wall fallback |
| [`@eva/plugin-timer`](#timer---evaplugin-timer) | Godot-style countdown / interval timer |
| [`@eva/plugin-ui`](#ui---evaplugin-ui) | UI kit: shapes + 14 `@pixi/ui` widgets + RadioGroup |
| [`@eva/plugin-ai`](#ai---evaplugin-ai) | DOM AI overlay (semantic mirror of GameObjects) |
| [`@eva/plugin-persistence`](#persistence---evaplugin-persistence) | localStorage <-> mx.store auto sync |
| [`@eva/plugin-pool`](#pool---evaplugin-pool) | GameObject object pool with scene-scoped recycling |
| [`@eva/plugin-worker`](#worker---evaplugin-worker) | Run Eva.js inside a Web Worker (OffscreenCanvas) |
| [`@eva/spine-base`](#spinebase---evaspine-base) | Internal base for Spine renderers |
| [`@eva/renderer-adapter`](#rendereradapter---evarenderer-adapter) | Internal PixiJS display-object adapter layer |

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

### DragonBone - `@eva/plugin-renderer-dragonbone`

Play [DragonBones](https://github.com/DragonBones) skeleton animations. Compatible with PixiJS v8.

```javascript
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { DragonBone, DragonBoneSystem } from '@eva/plugin-renderer-dragonbone';

// DragonBones requires three asset files: skeleton json, atlas json, atlas image.
resource.addResource([
  {
    name: 'hero',
    type: RESOURCE_TYPE.DRAGONBONE,
    src: {
      image: { type: 'png',  url: '/assets/hero/texture.png' },
      tex:   { type: 'json', url: '/assets/hero/texture.json' },   // atlas
      ske:   { type: 'json', url: '/assets/hero/skeleton.json' },  // skeleton
    },
    preload: true,
  },
]);

game.addSystem(new DragonBoneSystem());

const db = go.addComponent(new DragonBone({
  resource: 'hero',
  armatureName: 'Hero',     // required: armature name in the DragonBones project
  animationName: 'idle',
  autoPlay: true,
}));

db.play('run');             // play default loop count
db.play('attack', 1);       // play once
db.play('idle', 0);         // loop forever
db.stop();
db.stop('walk');
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `resource` | `string` | | Resource name (DRAGONBONE type) |
| `armatureName` | `string` | | Armature name; required, throws on missing |
| `animationName` | `string` | | Initial animation to play |
| `autoPlay` | `boolean` | `true` | Auto play `animationName` once armature is ready |

| Event | Description |
|-------|-------------|
| `start` | Animation start / loop start |
| `loopComplete` | One loop finished |
| `complete` | All loops finished |
| `fadeIn` / `fadeInComplete` | Fade-in start / complete |
| `fadeOut` / `fadeOutComplete` | Fade-out start / complete |
| `frameEvent` | Custom keyframe event |
| `soundEvent` | Sound event |

> The internal `lib/db.js` is the DragonBones PixiJS runtime. PixiJS v8 polyfills
> for `setTransform`, `BLEND_MODES`, `Ticker.shared`, mesh slot stub and
> `Texture` constructor are applied at the import layer. Mesh slot vertex
> deformation falls back to a flat sprite — image-based slots render fully.

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

### ParticleEmitter - `@eva/plugin-renderer-particle`

GPU-batched particle emitter built on PixiJS `ParticleContainer` / `Particle`. Supports range-driven properties (`number`, `{min,max}`, `{start,end,ease}`, `number[]`), emit/death zones, atlas frame pools, gravity, acceleration and `moveTo` targeting.

```javascript
import { ParticleEmitter, ParticleEmitterSystem } from '@eva/plugin-renderer-particle';

game.addSystem(new ParticleEmitterSystem());

const emitter = go.addComponent(new ParticleEmitter({
  resource: 'sparkAtlas',
  frame: ['spark0.png', 'spark1.png'],   // random per emit (atlas) or single string
  auto: true,
  frequency: 30,            // ms between emits
  quantity: 4,               // particles per emit
  maxParticles: 500,
  lifespan: { min: 600, max: 1200 },
  speed: { min: 80, max: 200 },
  angle: { min: 0, max: 360 },         // degrees
  scale: { start: 1, end: 0, ease: 'quad.out' },
  alpha: { start: 1, end: 0 },
  tint: [0xffcc33, 0xff5522],
  gravityY: 200,
  emitZone: { shape: { type: 'circle', radius: 40 } },
  deathZone: { shape: { type: 'rect', x: -300, y: -300, width: 600, height: 600 }, mode: 'onLeave' },
}));

emitter.stop();    // pause emission (existing particles finish their lifespan)
emitter.start();   // resume
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `resource` | `string` | | Image or sprite atlas resource name |
| `frame` | `string \| string[]` | | Atlas frame(s); array samples randomly per emit |
| `auto` | `boolean` | `true` | Auto-start on add |
| `explode` | `number` | | One-shot burst of N particles (overrides `frequency`) |
| `duration` | `number` | `-1` | Emit duration in ms; `-1` = infinite |
| `stopAfter` | `number` | | Stop after N total particles emitted |
| `frequency` | `number` | `250` | ms between emits |
| `quantity` | `number` | `1` | Particles per emit |
| `maxParticles` | `number` | `500` | Hard cap of live particles |
| `lifespan` | `RangeValue` | `1000` | Particle lifespan (ms) |
| `speed` / `speedX` / `speedY` / `angle` | `RangeValue` | | Initial velocity; `angle` in degrees |
| `rotate` | `RangeValue` | | Per-particle rotation speed |
| `scale` / `scaleX` / `scaleY` / `alpha` | `RangeValue` | | Tween-capable via `{start,end,ease}` |
| `tint` | `number \| number[]` | | Hex color, or random sample from array |
| `gravityX` / `gravityY` | `number` | `0` | Constant world gravity |
| `accelerationX` / `accelerationY` | `RangeValue` | | Per-particle acceleration |
| `moveTo` | `{x, y}` | | Aim each particle at this point (overrides `angle`) |
| `emitZone` | `EmitZoneSpec` | | Spawn area: `point` / `rect` / `circle` / `ellipse` / `line`, `type:'random'\|'edge'` |
| `deathZone` | `DeathZoneSpec` | | Kill area with `mode:'onEnter'\|'onLeave'` |
| `onEmit` / `onUpdate` | `string` | | Named hooks resolved by host (DSL stores event keys) |

**RangeValue** forms: `number`, `{min, max}` (uniform), `{start, end, ease?}` (per-particle interpolation, see easing list), or `number[]` (random pick).

**Easing**: `linear`, `sine.in/out/inout`, `quad.in/out/inout`, `cubic.in/out`, `expo.out`.

---

### Filter - `@eva/plugin-renderer-filter`

Apply PixiJS built-in 2D filters to a `GameObject`. Each entry in `filters` is instantiated by `FilterSystem` and bound to the underlying display container's `filters` array.

```javascript
import { Filter, FilterSystem } from '@eva/plugin-renderer-filter';

game.addSystem(new FilterSystem());

sprite.addComponent(new Filter({
  filters: [
    { type: 'blur', strength: 8, quality: 4 },
    { type: 'colorMatrix', preset: 'sepia' },
    { type: 'displacement', resource: 'noiseMap', scaleX: 20, scaleY: 20 },
    { type: 'noise', noise: 0.3, seed: 0.1 },
    { type: 'alpha', alpha: 0.7 },
  ],
  filterArea: { x: 0, y: 0, width: 750, height: 1000 },
}));
```

| FilterSpec field | Type | Used by | Description |
|------------------|------|---------|-------------|
| `type` | `'blur' \| 'colorMatrix' \| 'displacement' \| 'noise' \| 'alpha'` | all | Filter kind |
| `enabled` | `boolean` | all | Per-filter toggle |
| `strength` / `quality` / `blurX` / `blurY` | `number` | blur | Pixi `BlurFilter` knobs |
| `preset` / `presetArg` / `matrix` | `ColorMatrixPreset` / `number` / `number[]` | colorMatrix | Built-in preset (e.g. `sepia`, `grayscale`, `negative`, `polaroid`, `vintage`, `hue`, `saturate`, `brightness`, `contrast`) or raw 4x5 matrix |
| `resource` / `scaleX` / `scaleY` | `string` / `number` | displacement | Displacement map image resource + scale |
| `noise` / `seed` / `noiseAnimSpeed` | `number` | noise | Noise filter params |
| `alpha` | `number` | alpha | 0..1 opacity multiplier |

**ColorMatrixPreset**: `sepia`, `grayscale`, `negative`, `polaroid`, `vintage`, `lsd`, `predator`, `kodachrome`, `browni`, `technicolor`, `blackAndWhite`, `tint`, `saturate`, `brightness`, `contrast`, `hue`, `night`

---

### RenderTexture - `@eva/plugin-renderer-render-texture`

Phaser-style dynamic render texture. Holds an offscreen Pixi `RenderTexture` and replays a declarative queue of draw ops (`fill`, `draw`, `drawFrame`, `drawText`, `erase`, `paint`, `clear`). Optionally registers the final texture as a resource via `saveAs` so other `Img` / `Sprite` components can reference it.

```javascript
import { RenderTexture, RenderTextureSystem } from '@eva/plugin-renderer-render-texture';

game.addSystem(new RenderTextureSystem());

const rt = go.addComponent(new RenderTexture({
  width: 512,
  height: 512,
  backgroundColor: 0x000000,
  backgroundAlpha: 0,
  append: true,        // accumulate ops (Phaser-like); false = clear each commit
  saveAs: 'paintCanvas',
  ops: [
    { type: 'fill', color: 0x222222, alpha: 1 },
    { type: 'draw', resource: 'bg', x: 0, y: 0, width: 512, height: 512 },
    { type: 'drawText', text: 'HELLO', x: 100, y: 60, style: { fontSize: 48, fill: 0xffffff } },
  ],
}));

// Mutate the queue at runtime — system detects via `dirty` counter
rt.addOp({ type: 'paint', resource: 'brush', x: 200, y: 200, step: { x: 4, y: 0 }, times: 8 });
rt.clearOps();
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | `number` | `256` | Logical RT width |
| `height` | `number` | `256` | Logical RT height |
| `ops` | `RenderTextureOp[]` | `[]` | Declarative draw queue, replayed on each commit |
| `backgroundColor` | `number` | `-1` | Clear color (when `append=false`); `-1` = transparent |
| `backgroundAlpha` | `number` | `1` | Background alpha |
| `append` | `boolean` | `true` | Append ops without clearing; `false` clears each commit |
| `saveAs` | `string` | | Register final RT as a resource key for `Img` / `Sprite` |

**Op types**: `fill` (solid rect), `clear` (transparent), `draw` (image / atlas frame at x,y with tint/anchor/scale/rotation/blendMode), `drawFrame` (atlas-frame shorthand), `drawText` (PIXI.Text), `erase` (destination-out rect), `paint` (repeat a sprite N times with offset for paint trails).

---

### DOMElement - `@eva/plugin-renderer-dom-element`

Pin a real HTML element onto a `GameObject`. The element lives in a `.eva-dom-layer` overlay aligned to the PixiJS canvas, while `transform.position / scale / rotation` are synced every frame to CSS `transform`. Useful for `<input>`, `<video>`, rich HTML buttons, or any DOM-only feature on top of Canvas.

```javascript
import { DOMElement, DOMElementSystem } from '@eva/plugin-renderer-dom-element';

game.addSystem(new DOMElementSystem());

// Option A: raw HTML string (first root node is used)
go.addComponent(new DOMElement({
  html: '<input type="text" placeholder="Name" />',
  width: 240,
  height: 48,
  anchorX: 0.5,
  anchorY: 0.5,
  style: { background: '#fff', borderRadius: '8px', padding: '0 12px' },
  attrs: { maxlength: '12' },
}));

// Option B: tag + style
go.addComponent(new DOMElement({
  element: 'div',
  className: 'overlay-card',
  cssText: 'background: rgba(0,0,0,0.6); color: #fff;',
  width: 320,
  height: 120,
  pointerEvents: 'auto',
  blendMode: 'multiply',
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `html` | `string` | | Raw HTML; first root node becomes the element |
| `element` | `string` | `'div'` | Tag name when `html` is empty |
| `className` | `string` | | className applied to the element |
| `cssText` | `string` | | Inline `style.cssText` |
| `style` | `Record<string,string>` | | Individual style props |
| `attrs` | `Record<string,string>` | | `setAttribute` map |
| `width` / `height` | `number` | | Element pixel size |
| `anchorX` / `anchorY` | `number` | `0.5` | Origin (0..1), Phaser-style |
| `blendMode` | `string` | | CSS `mix-blend-mode` |
| `pointerEvents` | `string` | `'auto'` | CSS `pointer-events` (layer itself is `none`) |

> The DOM layer is `pointer-events: none`; individual elements default to `auto` so inputs and buttons stay interactive. `Game.pause()` halts the layer-sync RAF loop to avoid forced layouts.

---

### Video - `@eva/plugin-renderer-video`

Phaser-style video component (MVP). Wires a detached `<video>` DOM element into a PixiJS `Sprite` so videos render inside the ECS pipeline. Browser autoplay restrictions still apply — keep `muted: true` if you need playback without a user gesture.

Not supported: HLS/DASH/MSE streaming, `getUserMedia`, alpha / chroma-key video, shader-bound video textures.

```javascript
import { Video, VideoSystem } from '@eva/plugin-renderer-video';

game.addSystem(new VideoSystem());

const video = go.addComponent(new Video({
  src: 'https://cdn.example.com/intro.mp4',  // raw URL or registered resource key
  loop: false,
  autoplay: true,
  muted: true,        // required for autoplay without user gesture
  volume: 1,
  playbackRate: 1,
  width: 640,
  height: 360,
  anchorX: 0.5,
  anchorY: 0.5,
  playsInline: true,  // iOS inline playback
  onComplete: 'video:ended',
}));

video.play();
video.pause();
video.setCurrentTime(3.5);             // seek (seconds)
const canvas = video.snapshot();        // current frame -> HTMLCanvasElement (or null)
video.videoElement.muted = false;       // raw <video> access if needed
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `src` | `string` | `''` | Video URL, or a registered resource key |
| `loop` | `boolean` | `false` | Loop playback |
| `autoplay` | `boolean` | `true` | Auto-start after `loadeddata` |
| `muted` | `boolean` | `true` | Required by browsers for unattended autoplay |
| `volume` | `number` | `1` | 0~1 |
| `playbackRate` | `number` | `1` | Playback speed |
| `width` / `height` | `number` | video intrinsic | Display size |
| `anchorX` / `anchorY` | `number` | `0.5` | Sprite anchor |
| `crossOrigin` | `'anonymous'` / `'use-credentials'` / `''` | `'anonymous'` | Required for `snapshot()` to read pixels |
| `playsInline` | `boolean` | `true` | iOS inline playback |
| `onComplete` | `string` | | DSL hook key, fired on `ended` |

---

### Tilemap - `@eva/plugin-renderer-tilemap`

2D tilemap renderer supporting two coexisting paths:

- **v1 (Phaser-style, static)**: drive layers from a row-major 2D `data[row][col]` array against a single `tileset` image.
- **v2 (Godot-style, chunked)**: drive layers from `tilemapRef` + `layersV2[].cellData.chunks` (16x16 chunks, packed `int32` per cell). The system also exposes peering / autotile / animation / mesh-vs-sprite strategy / static physics body helpers.

The `Tilemap` system picks the path automatically based on whether `tilemapRef` is set.

```javascript
import { Tilemap, TilemapSystem } from '@eva/plugin-renderer-tilemap';
import { resource, RESOURCE_TYPE } from '@eva/eva.js';

resource.addResource([
  { name: 'tiles', type: RESOURCE_TYPE.IMAGE, src: { image: { type: 'png', url: '/tiles.png' } }, preload: true },
]);

game.addSystem(new TilemapSystem());

// v1 Phaser-style: static 2D grid, id 0 = empty, id N = (N-1)th tile.
const tilemap = go.addComponent(new Tilemap({
  tileset: 'tiles',
  tileWidth: 32,
  tileHeight: 32,
  layers: [
    {
      name: 'ground',
      data: [
        [1, 1, 2, 0],
        [1, 2, 2, 3],
      ],
      offsetX: 0,
      offsetY: 0,
      alpha: 1,
    },
  ],
}));

// v2 Godot-style: chunked cellData via TILESET resource
// resource.addResource([{ name: 'world', type: 'TILESET', src: { json: { url: '/world.tileset.json' } } }])
// new Tilemap({ tilemapRef: 'world', layersV2: [...], renderStrategy: 'auto' })
```

| Param (v1) | Type | Default | Description |
|------------|------|---------|-------------|
| `tileset` | `string` | `''` | Tileset image resource key |
| `tileWidth` / `tileHeight` | `number` | `32` | Source tile size in tileset |
| `tilesetColumns` | `number` | auto | Columns in tileset (else derived from image) |
| `tilesetSpacing` / `tilesetMargin` | `number` | `0` | Atlas spacing / margin |
| `renderTileWidth` / `renderTileHeight` | `number` | tileW/H | Render-time tile size (scale) |
| `layers` | `TilemapLayer[]` | `[]` | `{ name, data[][], offsetX, offsetY, alpha, visible, tint }` |

| Param (v2) | Type | Default | Description |
|------------|------|---------|-------------|
| `tilemapRef` | `string` | | TILESET resource key (enables chunked v2 path) |
| `mapOrigin` | `{x,y}` | `{0,0}` | World origin of cell (0,0) |
| `cellSize` | `{width,height}` | derived | Cell pixel size (else from tileset doc) |
| `layersV2` | `TileMapLayerV2[]` | | Chunked layers (`cellData: { kind: 'chunked', chunks }`) |
| `renderStrategy` | `'sprite'` / `'mesh'` / `'auto'` | `'auto'` | Per-chunk renderer pick |
| `collisionEnabled` / `navigationEnabled` / `animationEnabled` | `boolean` | | Toggle physics body / navmesh / tile animations |

Also exports utilities: `decodeChunk` / `unpackCell` (cell codec), `PeeringBitIndex` / `pickAutotileCandidate` (autotile lookup), `TileAnimationDriver`, `buildChunkMesh`, `buildTileMapStaticBodies` (Matter.js bodies), `diffTilesetForChunkRebuild` (hot-reload diff).

---

### Spine36 - `@eva/plugin-renderer-spine36`

Spine skeleton animation for the **3.6 export format**, built on `pixi-spine36`. API is identical to `@eva/plugin-renderer-spine` (both extend the same `@eva/spine-base` base class) — pick this package when your Spine assets are exported from the 3.6 toolchain and the modern runtime cannot load them.

```javascript
import { Spine, SpineSystem } from '@eva/plugin-renderer-spine36';

game.addSystem(new SpineSystem());

const spine = go.addComponent(new Spine({
  resource: 'heroSpine36',
  animationName: 'idle',
  autoPlay: true,
}));

spine.play('walk', true);
spine.addAnimation('attack', 0, false);
spine.setMix('idle', 'walk', 0.2);
spine.setAttachment('weapon', 'sword');
```

The package also re-exports the bundled runtime as `pixiSpine` for advanced low-level access:

```javascript
import { pixiSpine } from '@eva/plugin-renderer-spine36';
// pixiSpine.Spine, pixiSpine.AtlasAttachmentLoader, ...
```

For the full event / Params reference see the [Spine](#spine---evaplugin-renderer-spine) section above — same params (`resource`, `animationName`, `autoPlay`, `scale`), same events (`start`, `complete`, `end`, `event`, `interrupt`).

---

### HitArea - `@eva/plugin-hitarea`

Trigger-style overlap detection without a physics engine — a lightweight Godot `Area2D` equivalent. Every frame the system pairs entities by `layer` / `mask` and emits enter / exit signals through `@eva/plugin-signal-bus`.

```javascript
import { HitArea, HitAreaSystem } from '@eva/plugin-hitarea';
import { getSignalBus } from '@eva/plugin-signal-bus';

game.addSystem(new HitAreaSystem());

// Monster: listens for rockets entering its body
monster.addComponent(new HitArea({
  shape: { type: 'circle', radius: 238 },
  layer: ['monster'],
  mask: ['rocket'],
  signalEnter: 'monster:hit',
  signalExit: 'monster:leave',
  oneShot: false,
  enabled: true,
}));

// Rocket: just declares its layer
rocket.addComponent(new HitArea({
  shape: { type: 'rect', width: 40, height: 80 },
  layer: ['rocket'],
  mask: [],
}));

getSignalBus().on('monster:hit', ({ selfGo, otherGo }) => {
  console.log('rocket', otherGo.name, 'hit monster', selfGo.name);
});
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `shape` | `{ type: 'circle', radius }` / `{ type: 'rect', width, height }` / `{ type: 'point' }` | `circle r=10` | Hit shape, with optional `offsetX` / `offsetY` |
| `layer` | `string[]` | `[]` | Which layers this area belongs to |
| `mask` | `string[]` | `[]` | Layers this area cares about (only matches when other.layer ∩ self.mask) |
| `signalEnter` | `string` | — | Signal emitted on first overlap |
| `signalExit` | `string` | — | Signal emitted when overlap ends |
| `oneShot` | `boolean` | `false` | Disable self after first enter |
| `enabled` | `boolean` | `true` | Skip evaluation when false |

Signal payload: `{ self, other, selfGo, otherGo }` (both components and GameObjects). If both `layer` and `mask` are empty, all HitAreas pair with each other (legacy DSL fallback). Broad phase is N² — fine for < ~50 active areas; add a quadtree above for larger scenes.

---

### InputActionMap - `@eva/plugin-input-action`

Map raw keyboard / mouse / touch / click events to semantic actions (e.g. `fire`, `left`, `jump`) and emit press / release / hold signals through `@eva/plugin-signal-bus`. Keeps gameplay components decoupled from the underlying input device.

```javascript
import { InputActionMap, InputActionSystem } from '@eva/plugin-input-action';
import { getSignalBus } from '@eva/plugin-signal-bus';

game.addSystem(new InputActionSystem());

const input = player.addComponent(new InputActionMap({
  bindings: [
    { action: 'fire', sources: [{ type: 'click' }, { type: 'key', code: 'Space' }] },
    { action: 'left', sources: [{ type: 'key', code: 'ArrowLeft' }] },
    { action: 'right', sources: [{ type: 'key', code: 'ArrowRight' }] },
  ],
}));

getSignalBus().on('input:fire:press', () => player.fire());
getSignalBus().on('input:left:hold', () => player.moveLeft());

// Polling-style query for non-signal callers
if (input.isPressed('right')) player.moveRight();
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `bindings` | `ActionBinding[]` | `[]` | Action → input source list |
| `rootSelector` | `string` | — | CSS selector for the listening element; defaults to `document` |

**Input sources**: `{ type: 'key', code }`, `{ type: 'mouse', button? }`, `{ type: 'touch' }`, `{ type: 'click' }` (touch + mouse merged).

**Default signals** (override per binding via `pressSignal` / `releaseSignal` / `holdSignal`):

| Signal | When |
|--------|------|
| `input:{action}:press` | First time any source goes down |
| `input:{action}:release` | When all sources are released |
| `input:{action}:hold` | Every frame while the action is held |

---

### Camera2D - `@eva/plugin-camera2d`

2D camera with follow target, deadzone, damping, world limits and shake. The camera does **not** alter a renderer viewport — instead it translates the `worldRoot` GameObject every frame in the opposite direction of the follow target. Pair with `@eva/plugin-canvas-layer` (`screenSpace: true`) for HUD entities that should stay fixed.

```javascript
import { Camera2D, Camera2DSystem } from '@eva/plugin-camera2d';
import { getSignalBus } from '@eva/plugin-signal-bus';

game.addSystem(new Camera2DSystem());

cameraGo.addComponent(new Camera2D({
  followEntity: 'Player',
  worldRoot: 'world',
  viewportCenter: { x: 360, y: 640 },
  deadzone: { x: 80, y: 60 },
  damping: 0.15,
  limits: { minX: 0, maxX: 2000, minY: 0, maxY: 1280 },
}));

// Trigger a shake via the signal bus
getSignalBus().emit('camera:shake', { intensity: 12, duration: 250 });
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `followEntity` | `string` | | Entity name to follow (searched in the active scene) |
| `worldRoot` | `string` | | Entity whose `transform.position` represents the world; gets offset every frame |
| `viewportCenter` | `{x,y}` | `{0,0}` | Screen point the target should be anchored to |
| `deadzone` | `{x,y}` | `{0,0}` | Pixel offset from `viewportCenter` before the camera starts moving |
| `damping` | `number` | `0` | Smoothing factor `0..1` — `0` snaps instantly, `1` never catches up |
| `limits` | `{minX,maxX,minY,maxY}` | | Clamp the world offset on each axis (any field optional) |

| Signal | Payload | Description |
|--------|---------|-------------|
| `camera:shake` | `{ intensity?: number; duration?: number }` | Trigger a decaying random shake (default `intensity=8`, `duration=200ms`) |

---

### CanvasLayer - `@eva/plugin-canvas-layer`

Declare which logical layer a GameObject belongs to and whether it should ignore the camera. The system sorts sibling children of any parent that contains `CanvasLayer` entities by `zIndex`; the `screenSpace` flag is read by `@eva/plugin-camera2d` to decide whether the entity should follow world translation.

```javascript
import { CanvasLayer, CanvasLayerSystem } from '@eva/plugin-canvas-layer';

game.addSystem(new CanvasLayerSystem());

worldGo.addComponent(new CanvasLayer({
  name: 'world',
  zIndex: 0,
  screenSpace: false,
}));

hudGo.addComponent(new CanvasLayer({
  name: 'ui-hud',
  zIndex: 1000,
  screenSpace: true,   // pinned to screen — Camera2D will skip translating it
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | | Semantic layer name (e.g. `background`, `world`, `ui-hud`, `ui-modal`) |
| `zIndex` | `number` | `0` | Sort key — higher renders in front (siblings re-sorted each frame) |
| `screenSpace` | `boolean` | `false` | When `true`, the entity is treated as HUD and won't be translated by `Camera2D` |

---

### Parallax - `@eva/plugin-parallax`

Move a GameObject opposite to a camera reference at a configurable speed factor, optionally wrapping after a tile width / height for looping backgrounds. Pair with `@eva/plugin-camera2d` (or any entity acting as a camera anchor).

```javascript
import { Parallax, ParallaxSystem } from '@eva/plugin-parallax';

game.addSystem(new ParallaxSystem());

// Far background — barely moves with the camera
far.addComponent(new Parallax({
  speedX: 0.2,
  tileWidth: 1080,
  cameraEntity: 'mainCamera',
}));

// Mid background — moves faster, also tiles vertically
mid.addComponent(new Parallax({
  speedX: 0.6,
  speedY: 0.6,
  tileWidth: 1080,
  tileHeight: 1920,
  cameraEntity: 'mainCamera',
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `speedX` | `number` | `0` | Horizontal parallax factor; `0` = static, `1` = locked to camera, `>1` = faster than camera |
| `speedY` | `number` | `0` | Vertical parallax factor |
| `tileWidth` | `number` | `0` | Wrap position.x by `tileWidth`; `0` disables tiling |
| `tileHeight` | `number` | `0` | Wrap position.y by `tileHeight` |
| `cameraEntity` | `string` | — | Name of the camera GameObject to read transform.position from |

The parallax entity must NOT be a child of the moving world root — keep it sibling to the camera (or under a fixed UI root), otherwise the world translation is applied twice. Base offset is captured in `awake()`, so set the entity's initial `position` to its design-time anchor.

---

### PathFollow - `@eva/plugin-path-follow`

Move a GameObject along a polyline of waypoints at constant speed, with `once` / `loop` / `pingpong` modes and optional tangent-aligned rotation. Useful for patrolling enemies, conveyor items, or scripted cameras.

```javascript
import { PathFollow, PathFollowSystem } from '@eva/plugin-path-follow';
import { getSignalBus } from '@eva/plugin-signal-bus';

game.addSystem(new PathFollowSystem());

const follow = enemy.addComponent(new PathFollow({
  waypoints: [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 200 },
    { x: 0, y: 200 },
  ],
  speed: 180,              // px / sec
  loop: 'pingpong',         // 'once' | 'loop' | 'pingpong'
  autostart: true,
  rotateToFace: true,       // align transform.rotation to current segment
  signal: 'enemy:path:done',
}));

follow.play();
follow.pause();
follow.stop();

getSignalBus().on('path:finish', ({ component }) => {
  console.log('reached the end', component);
});
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `waypoints` | `{ x, y }[]` | `[]` | Path points; ≥ 2 required to move |
| `speed` | `number` | `0` | Travel speed in pixels per second |
| `loop` | `'once' \| 'loop' \| 'pingpong'` | `'once'` | End-of-path behavior |
| `autostart` | `boolean` | `false` | Start moving from `awake()` |
| `rotateToFace` | `boolean` | `false` | Set `transform.rotation` to the current segment angle (radians) |
| `signal` | `string` | — | Extra signal emitted on `once` completion |

**Built-in signals**: `path:finish` always fires when a `once` path completes, with `{ component }` payload. Methods on the component: `play()`, `pause()`, `stop()` (resets to start and reapplies position).

---

### Tween - `@eva/plugin-tween`

Godot-equivalent `Tween` component. Differences vs. `@eva/plugin-transition`:

- Target is any path: `transform.*`, `components.<Name>.<field>`, `store.<key>` (mx.store)
- Built-in `sequence` and `parallel` orchestration
- Yoyo + finite/infinite loops
- Emits a named signal on finish

```javascript
import { Tween, TweenSystem, Easing } from '@eva/plugin-tween';

game.addSystem(new TweenSystem());

// Single-step tween
const tween = go.addComponent(new Tween({
  step: {
    target: 'components.RocketAimer.currentAngleDeg',
    from: -60, to: 60,
    duration: 1500,
    easing: 'easeInOutQuad',
  },
  yoyo: true,
  loop: -1,           // -1 = infinite
  autostart: true,
  signal: 'aimer:swept',
}));

// Multi-step (sequence by default, set parallel:true for simultaneous)
go.addComponent(new Tween({
  steps: [
    { target: 'transform.position.x', to: 300, duration: 500, easing: 'easeOutCubic' },
    { target: 'transform.position.y', to: 100, duration: 500, delay: 100 },
  ],
  parallel: false,
}));

tween.play();
tween.pause();
tween.resume();
tween.stop();
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `step` | `TweenStep` | - | Single-step shorthand |
| `steps` | `TweenStep[]` | `[]` | Multi-step list |
| `parallel` | `boolean` | `false` | Run `steps` in parallel instead of sequence |
| `yoyo` | `boolean` | `false` | Reverse on every cycle end |
| `loop` | `number` | `0` | `-1` for infinite, `0` for play-once |
| `autostart` | `boolean` | `false` | Start on awake |
| `signal` | `string` | - | Signal emitted on finish |

Each `TweenStep` is `{ target, from?, to, duration, easing?, delay? }`. If `from` is omitted, the current value at play-time is captured.

**Easing names**: `linear`, `easeIn|Out|InOutQuad`, `easeIn|Out|InOutCubic`, `easeIn|Out|InOutElastic`, `easeIn|Out|InOutBack`, `easeIn|Out|InOutBounce`. Import `Easing` to call the curves directly.

| Signal | When |
|--------|------|
| `tween:finish` | Always emitted on finish (non-looping completion) |
| `signal` | Emitted on finish if configured |

---

### AnimationTrack - `@eva/plugin-animation-track`

Multi-track keyframe animation driven by a single timeline. Each track binds to a property path on the GameObject (e.g. `transform.position.x`) and interpolates between keyframes with optional per-segment easing.

```javascript
import { AnimationTrack, AnimationTrackSystem } from '@eva/plugin-animation-track';

game.addSystem(new AnimationTrackSystem());

const track = go.addComponent(new AnimationTrack({
  duration: 2,          // seconds; if omitted, derived from max keyframe time
  loop: true,
  autostart: true,
  signal: 'intro:done', // emitted on plugin-signal-bus when non-looping finishes
  tracks: [
    {
      target: 'transform.position.x',
      keyframes: [
        { time: 0,   value: 0,   easing: 'easeInOutCubic' },
        { time: 1,   value: 200, easing: 'easeOutBack' },
        { time: 2,   value: 0 },
      ],
    },
  ],
}));

track.play();
track.pause();
track.stop();
track.seek(0.5);                 // jump to t=0.5s
track.setTracks(newTracks, 3);   // swap tracks at runtime
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `tracks` | `Track[]` | `[]` | Array of `{ target, keyframes }`; `target` is a dotted property path |
| `duration` | `number` | max keyframe time | Total timeline length in seconds |
| `autostart` | `boolean` | `false` | Start playing immediately on `awake` |
| `loop` | `boolean` | `false` | Loop the timeline |
| `signal` | `string` | | Signal name emitted on `getSignalBus()` when finished (non-loop only) |

A `Keyframe` is `{ time: number; value: number; easing?: EasingName }`. Easing names come from `@eva/plugin-easing` (`linear`, `easeInOutCubic`, `easeOutBack`, …). Completion always fires `track:finish` on the signal bus; `signal` adds a second custom emit.

---

### Easing - `@eva/plugin-easing`

Shared easing functions used by `plugin-transition`, `plugin-animation-track`, `plugin-path-follow`, `plugin-camera2d`. Pure math utility — no Component / System, no DSL.

```javascript
import { Easing, applyEase, type EasingName } from '@eva/plugin-easing';

// Direct lookup
const y = Easing.easeOutBack(0.5);

// Safe apply (falls back to linear if name is missing / unknown)
const v = applyEase('easeInOutCubic', 0.25);

// Use in a custom tween loop
function tween(from: number, to: number, t: number, name: EasingName) {
  return from + (to - from) * applyEase(name, t);
}
```

**Available easings**: `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInElastic`, `easeOutElastic`, `easeInOutElastic`, `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInBounce`, `easeOutBounce`, `easeInOutBounce`.

All easings accept and return `t ∈ [0, 1]`. Use this package instead of re-implementing easing math in your own plugin so curves stay consistent across the engine.

---

### Trigger - `@eva/plugin-trigger`

Maps signals to declarative actions — emit, mutate `mx.store`, log, or call a method on another component. Stateless cousin of `@eva/plugin-state-machine`: covers the 80% of "on button press, increment score" wiring without writing a custom Component.

```javascript
import { Trigger, TriggerSystem } from '@eva/plugin-trigger';

game.addSystem(new TriggerSystem());

go.addComponent(new Trigger({
  rules: [
    { on: 'input:fire:press',
      do: [
        { type: 'emit', signal: 'rocket:spawn' },
        { type: 'incStore', key: 'shotsFired' },
      ] },
    { on: 'rocket:hit',
      guard: 'ctx.allowedScene === true',
      do: [
        { type: 'incStore', key: 'score', delta: 10 },
        { type: 'callMethod', entity: 'Monster', component: 'MonsterAI', method: 'onHurt' },
      ] },
  ],
  context: { allowedScene: true },
}));
```

| Action Type | Fields | Description |
|-------------|--------|-------------|
| `emit` | `signal`, `payload?` | Re-emit via signal bus (default payload = incoming) |
| `setStore` | `key`, `value` | `mx.store.update(key, () => value)` |
| `incStore` | `key`, `delta?` | Numeric increment (default 1) |
| `log` | `message` | `console.log` with original payload |
| `callMethod` | `entity`, `component`, `method`, `args?`, `ref?` | Look up another GameObject's component and call a method; `ref` disambiguates same-name component instances on one entity |

`guard` is a JS expression with `payload` and `ctx` in scope; falsy result skips the rule.

---

### StateMachine - `@eva/plugin-state-machine`

Lightweight finite state machine. States are configured declaratively; transitions fire on signal-bus events, `after` timers, or explicit `goto()` calls. Designed to replace one-off NPC / UI controller components.

```javascript
import { StateMachine, StateMachineSystem } from '@eva/plugin-state-machine';

game.addSystem(new StateMachineSystem({
  emitSceneSwitch: true,         // emit 'fsm:scene-switch' on sceneChanged (default true)
  autoResetOnSceneSwitch: false, // auto-call reset() on all FSMs (default false)
}));

const fsm = go.addComponent(new StateMachine({
  initial: 'moving',
  states: {
    moving:    { onEnter: 'monster:state-moving',
                 transitions: [
                   { on: 'monster:hit', to: 'knockback' },
                   { after: 3000, to: 'resting' },
                 ] },
    resting:   { transitions: [{ after: 1000, to: 'moving' }] },
    knockback: { transitions: [{ after: 800, to: 'resting' }] },
  },
  signalChange: 'monster:state-change',
  context: { hp: 3 },
}));

fsm.goto('resting');                       // manual transition
fsm.goto('resting', { force: true });      // re-enter even if already there
fsm.reset();                                // back to initial, re-emit onEnter
fsm.reenterCurrent();                       // re-emit current onEnter (no exit)
console.log(fsm.state);                     // current state name
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `initial` | `string` | - | Initial state name |
| `states` | `Record<string, StateConfig>` | `{}` | State table; each value has `onEnter` / `onExit` / `transitions` |
| `signalChange` | `string` | - | Signal emitted on every transition with `{ from, to, reason }` |
| `context` | `Record<string, any>` | `{}` | Variables exposed to `guard` JS expressions |

Each `TransitionRule` supports `{ on?, after?, to, guard? }` — listen to a signal, wait N ms, or both. `guard` is a JS expression evaluated with `ctx` in scope.

| Signal | When |
|--------|------|
| `fsm:reset` | Any `StateMachine.reset()` call (global observer) |
| `fsm:scene-switch` | Game `sceneChanged` (framework does NOT auto-reset; consumer decides) |

---

### BehaviorScript - `@eva/plugin-behavior-script`

Godot-style scriptable behaviors. A script is a typed factory that returns an object with lifecycle hooks (`setup`, `ready`, `process`, `input`, `onSignal`, …) and runs inside a `BehaviorContext` that gives it groups, nodes, resources, signals, timers and disposers without any boilerplate.

```javascript
import {
  BehaviorScript,
  BehaviorScriptSystem,
  defineBehaviorScript,
} from '@eva/plugin-behavior-script';

const PlayerController = defineBehaviorScript({
  id: 'PlayerController',
  propsSchema: {
    speed: { type: 'number', default: 200 },
  },
  factory: (ctx) => ({
    setup() {
      ctx.onSignal('game:pause', () => ctx.addToGroup('paused'));
    },
    process({ deltaTime }) {
      if (ctx.isInGroup('paused')) return;
      const t = ctx.gameObject.transform;
      t.position.x += ctx.props.speed * (deltaTime / 1000);
    },
  }),
});

game.addSystem(new BehaviorScriptSystem({
  scripts: { PlayerController },   // or scriptModules: [...]
  runMode: 'play',                  // 'play' | 'edit'
  defaultPauseMode: 'stop',         // 'stop' | 'process'
}));

// Programmatic attach (DSL usage is the canonical path):
go.addComponent(new BehaviorScript({
  scriptId: 'PlayerController',
  props: { speed: 320 },
  enabled: true,
  priority: 0,
  groups: ['actors'],
  nodes: { sword: 'hand/sword' },
  resources: { hitSfx: 'sfx_hit' },
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scriptId` | `string` | | Registered script id (matches `defineBehaviorScript({ id })`) |
| `props` | `Record<string, any>` | `{}` | User props; observed deeply, triggers `propsChanged` |
| `enabled` | `boolean` | `true` | Toggle script execution; fires `enable` / `disable` hooks |
| `priority` | `number` | `0` | Higher runs first within a frame |
| `groups` | `string[]` | `[]` | Tags for `callGroup(name, method, …)` broadcast |
| `nodes` | `Record<string,string>` | `{}` | Named scene paths, retrieved via `ctx.getNode(name)` |
| `resources` | `Record<string,string>` | `{}` | Named resource refs, retrieved via `ctx.loadResource(name)` |
| `pauseMode` | `'inherit'\|'stop'\|'process'` | `'inherit'` | Per-script pause policy |
| `executeInEditMode` | `boolean` | `false` | Allow script to run in `runMode: 'edit'` |

Lifecycle hooks: `setup`, `enterTree`, `ready`, `process`, `lateProcess`, `physicsProcess`, `input`, `unhandledInput`, `onSignal`, `onEvent`, `propsChanged`, `enable` / `disable`, `pause` / `resume`, `onSceneSwitch`, `serializeState` / `restoreState`, `exitTree`, `destroy`. All hooks may be `async`. `ctx.fsm.attach(entity, ref)` bridges to `@eva/plugin-state-machine` for HFSM-driven scripts.

---

### SignalBus - `@eva/plugin-signal-bus`

Namespaced global event bus that replaces ad-hoc `EventBus.ts` per game. Signal names use a colon-separated namespace (`monster:hit`, `game:over`, `score:change`). Supports schema declaration (surfaces in manifest / inspector), external transports (wraps `mx.event` / `EventEmitter` without double-emitting), owner-scoped batch dispose, and scene-scoped auto-cleanup on `sceneChanged`. A type-safe facade is available via `.typed<P>()`.

```javascript
import { SignalBusSystem, getSignalBus } from '@eva/plugin-signal-bus';

game.addSystem(new SignalBusSystem({
  signals: [
    { name: 'monster:hit', description: 'Player hit a monster', payload: { id: 'string', damage: 'number' } },
    { name: 'game:over' },
  ],
  // transport: mxEvent,            // optional external bus, prevents double-emit
  // logListenerErrors: true,        // console.error inside listeners (default true)
  // autoDisposeSceneScoped: true,   // auto dispose { scope: 'scene' } on sceneChanged (default true)
}));

const bus = getSignalBus();

// emit + on with owner-scoped cleanup
class Hero extends Component {
  onAwake() {
    bus.on('monster:hit', (p) => console.log(p.id, p.damage), { owner: this });
    bus.on('game:over', this.onGameOver, { owner: this, scope: 'scene' });
  }
  onDestroy() {
    bus.disposeByOwner(this);   // one-line release of every subscription on `this`
  }
}

bus.emit('monster:hit', { id: 'm1', damage: 10 });
const handle = bus.once('game:over', () => {});
handle.dispose();

// Typed facade — zero-cost cast, compile-time payload check
type Events = { 'fire': { x: number }; 'die': void };
const tbus = bus.typed<Events>();
tbus.emit('fire', { x: 1 });    // ok
// tbus.emit('fire', { y: 1 }); // compile error
```

| `SignalBusSystem` param | Type | Default | Description |
|-------------------------|------|---------|-------------|
| `signals` | `SignalSchema[]` | | Schemas for manifest / inspector |
| `transport` | `SignalTransport` / `null` | `null` | External bus (mx.event / EventEmitter); when set, no local fanout (prevents double-emit) |
| `logListenerErrors` | `boolean` | `true` | `console.error` when a listener throws |
| `autoDisposeSceneScoped` | `boolean` | `true` | Auto-dispose `{ scope: 'scene' }` subs on `game.sceneChanged` |

| `SignalBus` method | Description |
|--------------------|-------------|
| `on(name, fn, { scope?, owner? })` | Subscribe, returns `SignalHandle` with `.dispose()` |
| `once(name, fn, opts?)` | Subscribe for a single emit |
| `off(name, fn?)` | Unsubscribe (omit `fn` to clear local listeners for `name`) |
| `emit(name, payload?)` | Fire a signal; listener snapshot taken before fanout (safe to off/on inside callbacks) |
| `disposeByOwner(owner)` | Batch-dispose every handle subscribed with `{ owner }` |
| `disposeSceneScoped()` | Dispose every `{ scope: 'scene' }` handle (called by system on `sceneChanged`) |
| `register(schema)` / `registerMany(schemas)` | Declare signal schemas |
| `getSchemas()` | All registered schemas |
| `typed<P>()` | Zero-cost cast to typed facade |
| `clear()` | Drop all local listeners (no-op in transport mode) |

In DSL, declare via `{ systems: [{ type: 'SignalBus', order: 50, params: { signals: [...] } }] }`. Dev builds also emit a `console.warn` for duplicate subscriptions (same `fn` reference on the same name, or `>=8` subs on a single owner) to catch leak patterns early.

---

### Ticker - `@eva/plugin-tick`

Unified frame scheduler. Replaces per-component `setInterval` + `performance.now` patterns with a single time source, dt clamp (max 50 ms), and ordered groups (`physics` -> `logic` -> `late`). Auto-falls back to `setInterval(16)` when the tab is hidden so countdowns and timers do not stall.

```javascript
import { TickerSystem, getTickerSystem } from '@eva/plugin-tick';

game.addSystem(new TickerSystem());

const ticker = getTickerSystem();

// Register a per-frame callback
const handle = ticker.add((dt, time) => {
  // dt: ms since last tick (clamped to [0, 50])
  // time: performance.now() snapshot
}, 'logic', 0); // group, priority

handle.dispose(); // unregister
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `fn` | `(dt, time) => void` | - | Per-frame callback; `dt` in ms, clamped to `[0, 50]` |
| `group` | `'physics' \| 'logic' \| 'late'` | `'logic'` | Execution group; fixed order physics -> logic -> late |
| `priority` | `number` | `0` | Within a group, smaller priority runs first |

The ticker is a process-level singleton shared across multiple `Game` instances (useful for editor hot-reload). `TickerSystem` ref-counts owners — `game.pause()` pauses the owner's ref, and the RAF loop only stops when every owner is paused or released.

---

### Timer - `@eva/plugin-timer`

Godot-equivalent `Timer` component. Driven by `Component.update(dt)` so it stays in sync with `@eva/plugin-tick`'s wall fallback when the tab is hidden — much more reliable than `setTimeout`/`setInterval` for in-game countdowns.

```javascript
import { Timer, TimerSystem } from '@eva/plugin-timer';

game.addSystem(new TimerSystem());

const timer = go.addComponent(new Timer({
  wait: 30000,                // ms until timeout
  oneShot: true,              // one-shot vs. looping (default true)
  autostart: true,            // start on awake (default false)
  signal: 'game:timeup',      // emitted at timeout (in addition to 'timer:timeout')
  tickSignal: 'countdown:tick', // emitted each tick (optional)
  tickInterval: 100,          // min ms between tick signals (0 = every frame)
}));

timer.start();
timer.pause();
timer.resume();
timer.stop();      // stop and zero out
timer.reset();     // zero out, keep running flag
console.log(timer.timeLeft, timer.timeElapsed);
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `wait` | `number` | `1000` | Countdown duration in ms |
| `oneShot` | `boolean` | `true` | If false, restarts forever (preserving sub-frame remainder) |
| `autostart` | `boolean` | `false` | Start on awake |
| `signal` | `string` | - | Extra signal emitted at timeout, with `{ component }` payload |
| `tickSignal` | `string` | - | Signal emitted each tick with `{ elapsed, left }` |
| `tickInterval` | `number` | `0` | Throttle for `tickSignal` (ms) |

| Signal | When |
|--------|------|
| `timer:timeout` | Always emitted at timeout |
| `signal` | Emitted at timeout if configured |
| `tickSignal` | Emitted while running, throttled by `tickInterval` |

---

### UI - `@eva/plugin-ui`

A full UI kit built on top of `@pixi/ui` v2. Ships 16 ECS components: a `Shape` primitive (rect / circle / ellipse / roundedRect with linear-gradient fills) and 14 widget wrappers — `Button`, `FancyButton`, `CheckBox`, `Switcher`, `Slider`, `DoubleSlider`, `ProgressBar`, `CircularProgressBar`, `Input`, `List`, `ScrollBox`, `Select`, `Dialog`, `MaskedFrame` — plus a cross-entity `RadioGroup` coordinator. One `UISystem` drives them all.

```javascript
import {
  UISystem,
  Shape, ShapeType,
  FancyButton,
  ProgressBar,
  CheckBox,
  RadioGroup,
} from '@eva/plugin-ui';

game.addSystem(new UISystem());

// 1) Vector shape (rect / circle / ellipse / roundedRect)
go.addComponent(new Shape({
  type: ShapeType.ROUNDED_RECT,
  style: {
    width: 200, height: 80, radius: 12,
    fill: 'linear-gradient(180deg, #340033 0%, #CB2269 100%)',
    stroke: '#ffffff', lineWidth: 2,
  },
}));

// 2) FancyButton with multiple visual states
const btn = go.addComponent(new FancyButton({
  text: 'Play',
  views: {
    default: { texture: 'btn_default' },
    hover:   { texture: 'btn_hover' },
    pressed: { texture: 'btn_pressed' },
  },
  nineSliceSprite: [12, 12, 12, 12],
  textStyle: { fontSize: 28, fill: '#fff' },
}));

// 3) ProgressBar bound to a store path (mx.store)
go.addComponent(new ProgressBar({
  value: 0,
  valueRange: [0, 100],
  width: 240, height: 16,
  bgView:   { texture: 'bar_bg' },
  fillView: { texture: 'bar_fill' },
  bindToStore: 'game.progress',
}));

// 4) CheckBox + RadioGroup (cross-entity selection)
radioParent.addComponent(new RadioGroup({
  selectedId: 'easy',
  childNames: ['easy', 'normal', 'hard'],
  direction: 'vertical',
  elementsMargin: 8,
}));
```

| Component | Key params |
|-----------|------------|
| `Shape` | `type`, `style`, `shapes[]` (stack multiple) |
| `Button` / `FancyButton` | `view` / `views.{default,hover,pressed,disabled,icon}`, `text`, `nineSliceSprite`, `enabled` |
| `CheckBox` | `checked`, `text`, `views.{checked,unchecked}`, `bindToStore` |
| `Switcher` | `active`, `views[]`, `triggerEvent` |
| `Slider` / `DoubleSlider` | `value`, `min`, `max`, `step`, `views.{bg,fill,thumb}` |
| `ProgressBar` / `CircularProgressBar` | `value`, `valueRange`, `bgView`/`fillView` or `radius`/`lineWidth` |
| `Input` | `value`, `placeholder`, `maxLength`, `secure`, `bgView` |
| `List` / `ScrollBox` | `type`/`direction`, `elementsMargin`, `padding`, `width`/`height` |
| `Select` | `items`, `selectedIndex`, `closedView`, `openView` |
| `Dialog` | `open`, `title`, `content`, `buttons[]`, `backdropView`, `backgroundView` |
| `MaskedFrame` | `targetView`, `maskView`, `borderView` |
| `RadioGroup` | `selectedId`, `childNames[]`, `direction` |

Widgets emit standard `@pixi/ui` signals (`press`, `down`, `up`, `hover`, `change`, `update`, `select`, `scroll`, …) which are bridged to the GameObject as `<signalPrefix>:<event>` (e.g. `button:press`, `slider:change`). `view` refs accept either a resolved PixiJS display object or a `{ texture: '<resourceName>' }` reference resolved against the resource pool.

---

### AI - `@eva/plugin-ai`

DOM accessibility / AI overlay. Mirrors every visible GameObject as a positioned `<div>` next to the canvas, carrying `data-*` attributes (name, type, bounds, text content, resource, hierarchy, interactivity). Useful for AI agents, e2e tests and screen readers that need a semantic view of the rendered scene.

System-only — there is no `AI` component to add. The system reads `RendererSystem` bounds and reflects every `gameObject` automatically.

```javascript
import { AISystem } from '@eva/plugin-ai';

game.addSystem(new AISystem({
  enabled: true,   // turn the DOM overlay on/off entirely
  debug: false,    // draw red outlines around mirrored nodes
  zIndex: 10001,   // overlay z-index relative to the canvas
}));
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Master switch — when `false`, no DOM nodes are created |
| `debug` | `boolean` | `false` | Draw a red outline + faint fill around each mirrored element |
| `zIndex` | `number` | `10001` | CSS z-index of the overlay container |

Each mirrored element exposes (when applicable): `data-name`, `data-type`, `data-bounds`, `data-parent`, `data-children`, `data-text`, `data-resource`, `data-interactive`, plus `aria-label` and `role="img"`.

---

### Persistence - `@eva/plugin-persistence`

Auto-sync selected `mx.store` keys to `localStorage`. Loads on `awake`, listens to `store:change:{key}` signals (via `@eva/plugin-signal-bus`) and debounces writes. Flushes once more on destroy.

```javascript
import { Persistence, PersistenceSystem } from '@eva/plugin-persistence';

game.addSystem(new PersistenceSystem());

const persist = go.addComponent(new Persistence({
  namespace: 'nian',
  keys: ['highScore', 'completedTutorial'],
  autoload: true,        // on awake: read storage -> mx.store
  autosave: true,         // on store:change:{key} signal: write storage
  saveDebounceMs: 200,
}));

// Imperative API
persist.load();   // pull from localStorage into mx.store
persist.save();   // push current mx.store values to localStorage
persist.clear();  // remove all namespaced keys from localStorage
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `namespace` | `string` | | Storage key prefix. Effective key = `${namespace}:${storeKey}` |
| `keys` | `string[]` | `[]` | Which `mx.store` paths to persist |
| `autoload` | `boolean` | `true` | Load from storage into store on `awake` |
| `autosave` | `boolean` | `true` | Auto-save when `store:change:{key}` is emitted |
| `saveDebounceMs` | `number` | `200` | Debounce window for batched writes |

> Host must emit `store:change:{key}` on the shared SignalBus when `mx.store` updates; otherwise only manual `save()` will persist.

---

### Pool - `@eva/plugin-pool`

Object pool for `GameObject`s with explicit lifecycle scope. `PoolSystem` listens to `sceneChanged` and auto-recycles every `scope: 'scene'` pool to prevent orphaned GameObjects from leaking across scenes.

```javascript
import { Pool, PoolSystem } from '@eva/plugin-pool';

game.addSystem(new PoolSystem());

// 1) Declare the pool (usually on a global entity or scene root)
root.addComponent(new Pool({
  name: 'rocket',
  initialSize: 8,
  maxSize: 32,
  scope: 'scene',          // 'scene' (default, recycled on sceneChanged) | 'game'
}));

// 2) Inject factory / hooks from code (cannot be expressed in DSL)
const pool = Pool.get('rocket');
pool.setFactory(() => cloneFromPrefab('Rocket'));
pool.setReset((go) => { /* clean state before pooling */ });
pool.setActivate((go) => { /* prep state before reuse */ });
pool.warmup();

// 3) Acquire / release at runtime
const go = pool.acquire();   // reuse from free, or factory() on miss
pool.release(go);             // back to pool (or destroy if over maxSize)

// Bulk
pool.releaseAll();
pool.destroyFree();

// Metrics
pool.hitRate;     // hitCount / acquireCount
pool.freeCount;
pool.usedCount;
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | | Global pool id; look up via `Pool.get(name)` |
| `initialSize` | `number` | `0` | Warmup count |
| `maxSize` | `number` | `Infinity` | Free queue cap; excess release destroys the GameObject |
| `scope` | `'scene' \| 'game'` | `'scene'` | `'scene'` auto-recycles on `sceneChanged`; `'game'` survives scene switches |
| `factory` | `() => GameObject` | | Required for `acquire()`; usually set from code via `setFactory` |
| `reset` | `(go) => void` | | Called when entering the pool |
| `activate` | `(go) => void` | | Called when leaving the pool |

> Pools default to `scope: 'scene'`. Cross-scene global pools must opt in with `scope: 'game'`, otherwise `PoolSystem` will `releaseAll() + destroyFree()` on every scene switch.

---

### Worker - `@eva/plugin-worker`

Run the Eva.js / PixiJS renderer inside a Web Worker with `OffscreenCanvas`. The plugin installs PixiJS's `EventSystem` with `WebWorkerAdapter` and provides an `eventHandler` that the main thread forwards normalized DOM events to, so canvas-attached events still work from inside the worker.

```javascript
// === Worker entry (e.g. game.worker.js) ===
import { eventHandler } from '@eva/plugin-worker';
import { Game } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';

self.onmessage = (e) => {
  const { type } = e.data;
  // Forward init + pointer/touch events to the worker EventSystem
  eventHandler(e.data);

  if (type === 'start') {
    const { canvas, width, height } = e.data; // OffscreenCanvas
    const game = new Game();
    game.init({
      systems: [new RendererSystem({ canvas, width, height, transparent: true })],
    });
  }
};

// === Main thread ===
const worker = new Worker(new URL('./game.worker.js', import.meta.url), { type: 'module' });
const canvas = document.querySelector('#canvas');
const offscreen = canvas.transferControlToOffscreen();

// 1) tell the worker which canvases exist (keyed by id)
worker.postMessage({ type: 'eva-init', canvasMap: { main: { width: 750, height: 1000 } } });
worker.postMessage({ type: 'start', canvas: offscreen, width: 750, height: 1000 }, [offscreen]);

// 2) forward DOM events into the worker
function forward(eventName) {
  canvas.addEventListener(eventName, (event) => {
    worker.postMessage({
      type: 'eva-events',
      id: 'main',
      canvasRect: canvas.getBoundingClientRect(),
      events: [{ eventName, event: serialize(event) }],
    });
  });
}
['pointerdown', 'pointermove', 'pointerup', 'wheel'].forEach(forward);
```

| Message Type | Direction | Description |
|--------------|-----------|-------------|
| `eva-init` | main -> worker | Provide `canvasMap` (id -> rect/size) so the worker EventSystem knows about each canvas |
| `eva-events` | main -> worker | Forward a batch of `{ eventName, event, normalizedEvents }` records for canvas id `id` |

The worker side is intentionally tiny — it only registers the PixiJS `EventSystem` extension and dispatches forwarded events. All other rendering / ECS plugins are imported and run inside the worker as usual. Importing this package **must** happen inside a Worker module; it calls `DOMAdapter.set(WebWorkerAdapter)` at load time.

---

### SpineBase - `@eva/spine-base`

**Internal base — typically not used directly.** Shared `Spine` component, `SpineSystem` and skeleton-data cache used by `@eva/plugin-renderer-spine` (Spine 3.8+) and `@eva/plugin-renderer-spine36` (Spine 3.6). Registers the `SPINE` resource type with the Eva.js resource loader on import.

```javascript
// You almost never import this package directly.
// Use @eva/plugin-renderer-spine or @eva/plugin-renderer-spine36 instead,
// which inject the version-specific @pixi-spine runtime into SpineSystem.
import { Spine, SpineSystem } from '@eva/spine-base';
import * as pixiSpine from '@pixi-spine/runtime-4.1';

game.addSystem(new SpineSystem({ pixiSpine }));
```

The public component / API surface (`play`, `stop`, `addAnimation`, `setMix`, `setAttachment`, `getBone`, `addSlotObject`, …) is documented under the [Spine](#spine---evaplugin-renderer-spine) section — the plugin packages re-export the same `Spine` class from here.

---

### RendererAdapter - `@eva/renderer-adapter`

**Internal base — typically not used directly.** Thin re-export layer over PixiJS display objects (`Application`, `Container`, `Sprite`, `TilingSprite`, `NinePatch`, `Graphics`, `Text`, `HTMLText`, `BitmapText`, `SpriteAnimation`) used by `@eva/plugin-renderer` and the `plugin-renderer-*` family. Keeps Eva.js's renderer plugins decoupled from PixiJS's exact class shape so upgrades (e.g. v7 -> v8) only need to be handled here.

```javascript
// Only relevant when authoring a new renderer plugin.
import { Container, Sprite, NinePatch } from '@eva/renderer-adapter';

class MyCustomRenderer {
  createContainer() { return new Container(); }
  createSprite(texture) { return new Sprite(texture); }
}
```

Application code should depend on the higher-level plugin packages (`@eva/plugin-renderer-img`, `@eva/plugin-renderer-text`, etc.) instead of importing from this adapter directly.

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
