# Eva.js (Interactive Game Engine)

![npm-version](https://img.shields.io/npm/v/@eva/eva.js)
![npm-size](https://img.shields.io/bundlephobia/minzip/@eva/eva.js)
![npm-download](https://img.shields.io/npm/dm/@eva/eva.js)

Chinese ｜ [English](./README.md)

## 介绍
Eva.js 是一个专注于开发互动游戏项目的前端游戏引擎。

**易用**：Eva.js 提供开箱即用的游戏组件供开发人员立即使用。是的，它简单而优雅！

**高性能**：Eva.js 由高效的运行时和渲染管道 ([Pixi.JS](http://pixijs.io/)) 提供支持，这使得释放设备的全部潜力成为可能。

**可扩展**：得益于 ECS（实体-组件-系统）结构，您可以通过高度可定制的 API 扩展您的需求。唯一的限制是你的想象力！ 

## 文档

你可以在官方网站 [eva.js.org](https://eva-engine.gitee.io/#/) 找到 Eva.js 的文档, 在 [文档仓库](https://github.com/eva-engine/eva-engine.github.io) 提交 PR 为 Eva.js 文档进行查漏补缺。

- [在线案例](https://eva.js.org/playground)
- [快速开始](https://eva.js.org/#/tutorials/quickstart)
- [基础脚手架](https://github.com/eva-engine/start-demo)


## 使用
提供两种使用方式，一种是基于NPM，另外一种直接在浏览器中使用外链JS文件。

### 基于NPM
```bash
npm i @eva/eva.js @eva/plugin-renderer @eva/plugin-renderer-img --save
```

### 在浏览器中
```html
<script src="https://unpkg.com/@eva/eva.js@1.0.4/dist/EVA.min.js"></script>
```

### 案例

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

## 问题交流
可以在 [Gitter](https://gitter.im/eva-engine/Eva.js) 或者 [DingTalk](https://www.dingtalk.com/) (钉钉) 扫码 [二维码](https://gw.alicdn.com/imgextra/i3/O1CN01I0KDY41JkjGZ4xxks_!!6000000001067-2-tps-465-668.png) 进行交流.


## Issues
按照 [Issue Reporting Checklist](.github/ISSUE_TEMPLATE.md) 提交 issue. 不符合准则的问题可能会立即关闭。

## Changelog
[版本记录](https://eva-engine.gitee.io/#/others/changelog).

## Contribute
[如何贡献](.github/HOW_TO_CONTRIBUTE.md)

## License
MIT, See [LICENSE file](./LICENSE).
