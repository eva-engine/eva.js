# Eva.js (Gamification Engine)

![npm-version](https://img.shields.io/npm/v/@eva/eva.js)
![npm-size](https://img.shields.io/bundlephobia/minzip/@eva/eva.js)
![npm-download](https://img.shields.io/npm/dm/@eva/eva.js)

## Introduction

Eva.js is a front-end game engine for create project of gamification. 


**Efficient**: Eva.js provides common and basic game component in the development of gamification projects, Eva makes it easy to develop project of gamification.

**High-performace**: Eva.js provides efficient runtime and rendering capabilities, you can create complex game scenes.

**Scalable**: Based on the ECS(Entity-Component-System) design pattern, you can freely expand functions of engine and build a more prosperous ecosystem.

## Documentation

Finding the Eva.js Documentation on [eva.js.org](https://eva.js.org), you can improve it by sending pull requests to [this repository](https://github.com/eva-engine/eva-engine.github.io).

Checking out the [Live example](https://eva.js.org/playground).

- [Quick Start](https://eva.js.org/#/tutorials/quickstart)
- [Start Demo](https://github.com/eva-engine/start-demo)


## Usage

### Install
```sh
npm i @eva/eva.js @eva/plugin-renderer @eva/plugin-renderer-img --save
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
For questions and support please use [DingTalk](https://www.dingtalk.com/) (钉钉) to scan [this QR Code](https://gw.alicdn.com/imgextra/i3/O1CN01I0KDY41JkjGZ4xxks_!!6000000001067-2-tps-465-668.png).


## Issues
Please make sure to read the [Issue Reporting Checklist](.github/ISSUE_TEMPLATE.md) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## Changelog
[release notes](https://eva.js.org/#/others/changelog) in documentation.

## Contribute
[How to Contribute](./github/HOW_TO_CONTRIBUTE.md)

## License
The Eva.js is released under the MIT license. See [LICENSE file](./LICENSE).