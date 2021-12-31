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


## Usage

### With NPM
```bash
npm i @eva/eva.js @eva/plugin-renderer @eva/plugin-renderer-img --save
```

### In Browser
```html
<script src="https://unpkg.com/@eva/eva.js@1.0.4/dist/EVA.min.js"></script>
```

### Example

```html
<canvas id="canvas" ></canvas>
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
        url:
          'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
      },
    },
    preload: true,
  },
]);

const game = new Game({
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
  position: {
    x: 0,
    y: -319,
  },
  anchor: {
    x: 0,
    y: 0,
  },
});

image.addComponent(
  new Img({
    resource: 'imageName',
  })
);

game.scene.addChild(image);

```

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
