# @eva/plugin-renderer-dragonbone

Eva.js 的 DragonBones 骨骼动画渲染插件。基于内置 dragonBones runtime (`lib/db.js`),
适配 PixiJS v8 渲染管线。

## 安装

```bash
npm install @eva/plugin-renderer-dragonbone
```

## 快速上手

```ts
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { DragonBone, DragonBoneSystem } from '@eva/plugin-renderer-dragonbone';

resource.addResource([
  {
    name: 'hero',
    type: RESOURCE_TYPE.DRAGONBONE,
    src: {
      image: { type: 'png',  url: '/assets/hero/texture.png' },
      tex:   { type: 'json', url: '/assets/hero/texture.json' },   // TexturePacker 输出
      ske:   { type: 'json', url: '/assets/hero/skeleton.json' },  // DragonBones 骨骼数据
    },
    preload: true,
  },
]);

const game = new Game();
await game.init({
  systems: [
    new RendererSystem({ canvas, width: 750, height: 1000 }),
    new DragonBoneSystem(),
  ],
});

const go = new GameObject('hero', { anchor: { x: 0.5, y: 0.5 } });
const db = go.addComponent(new DragonBone({
  resource: 'hero',
  armatureName: 'Hero',
  animationName: 'idle',
  autoPlay: true,
}));

game.scene.addChild(go);

// 切动画
db.play('run');         // 默认按 ske 中的循环次数
db.play('attack', 1);   // 只播 1 次
db.play('idle', 0);     // 无限循环

// 停止
db.stop();
db.stop('idle');
```

## 组件参数

`new DragonBone(params: DragonBoneParams)`:

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `resource` | `string` | 是 | — | `resource.addResource` 注册的资源名 |
| `armatureName` | `string` | 是 | — | DragonBones 项目里的 armature 名 |
| `animationName` | `string` | 否 | — | 初始播放动画名;`autoPlay` 时会自动播 |
| `autoPlay` | `boolean` | 否 | `true` | 资源就绪后自动播放 `animationName` |

`armatureName` 缺失会在 `init` 抛错。`autoPlay=true` 且 armature 尚未就绪时,`play`
请求会被排队,资源加载完后自动 flush。

## 资源协议

`RESOURCE_TYPE.DRAGONBONE` 期望 `src` 提供三个字段:

```ts
{
  image: { type: 'png',  url: '<atlas image url>' },
  tex:   { type: 'json', url: '<atlas json>' },
  ske:   { type: 'json', url: '<skeleton json>' },
}
```

eva.js 资源加载器走 PixiJS v8 `Assets.load`,因此 `image` 在 `data` 阶段已经是
`Texture` 实例;`tex` / `ske` 是解析后的 JSON。Plugin 在 `registerInstance`
里识别 `Texture` 实例直接复用,无需再走 `Texture.from`。

## 事件

armature 上的事件会被组件转发,可直接 `db.on(eventName, handler)`:

| Eva 事件名 | DragonBones 含义 |
|---|---|
| `start` | 动画首次播放或循环开始 |
| `loopComplete` | 一次循环结束 |
| `complete` | 全部循环结束 |
| `fadeIn` | 淡入开始 |
| `fadeInComplete` | 淡入结束 |
| `fadeOut` | 淡出开始 |
| `fadeOutComplete` | 淡出结束 |
| `frameEvent` | 关键帧事件 |
| `soundEvent` | 声音事件 |

## API

- `play(name?: string, times?: number)`:切换并播放动画;`times=0` 无限循环。
- `stop(name?: string)`:停止指定动画(或当前);会把 `animationName` 清成 `null`。
- `armature`:底层 dragonBones armature 引擎,可直接拿来读 `armature.animation.lastAnimationState`
  做高级控制。

## PixiJS v8 兼容性说明

内置 `lib/db.js` 是基于 dragonBones PixiJS 渲染器(原写于 pixi v4/v5 时代)的运行时
bundle。文件头做了 v8 polyfill 桥接:

- `Container.prototype.setTransform` — v8 删了,polyfill 回 v7 行为,让 slot
  的 `_updateTransformV4` 能跑。
- `PIXI.BLEND_MODES` — v8 改成字符串字面量;polyfill 提供 v4 命名到 v8 字符串
  的映射(`normal`/`add`/`multiply`/...)。
- `PIXI.ticker.shared` — v8 把 Ticker 拍平到顶层 `Ticker.shared`;polyfill 桥接
  回旧路径。
- `PIXI.mesh.Mesh` — v8 删了 namespace;polyfill 提供 Sprite-based stub,
  让 `_buildSlot` 不爆。**已知限制**:依赖 mesh slot 真实顶点变形(衣服扭曲等)
  的资源会退化为未变形 Sprite,看起来是 image-based。绝大多数 dragonBones
  资源是纯 image slot,这条退路够用。
- `PIXI.Texture` 构造 — v8 改成单 options 对象;polyfill 套了一层工厂 shim,
  兼容旧式 `new PIXI.Texture(base, frame, orig, trim, rotate)` 5 参数调用。
- ticker 回调驱动 — v8 ticker callback 第一参数从 `deltaTime: number` 变成
  `Ticker` 实例;`DragonBoneSystem.init` 用 `ticker.deltaMS` 自接 advanceTime,
  不再依赖 v4 时代 `_clockHandler` 公式。

**未修的边缘路径**:

- `armature.debugDraw = true` 走 v7 Graphics API (`lineStyle`/`beginFill`/...),
  v8 已经改 API,默认 `debugDraw=false` 不触发,需要时再做适配。
- mesh slot 渲染:见上文,只有依赖 mesh 变形的资源会受影响。

## 测试

```bash
# 在 libs/eva.js 根目录
./node_modules/.bin/jest --runInBand packages/plugin-renderer-dragonbone
```

13 个用例覆盖:Component 字段、init、play/stop 排队、armature setter 回放、
System ticker 注册、ADD/REMOVE 事件转发。

## Demo

`examples/src/dragonbone.ts` 是最小可运行示例,资源放在 `examples/public/dragonbone/`
(`texture.png` + `texture.json` + `skeleton.json`)。运行 `npm run dev` 进 `#./src/dragonbone.ts` 即可。

## 链接

- [Eva.js 官网 (EN)](https://eva.js.org)
- [Eva.js 文档 (中文)](https://eva-engine.gitee.io)
- [DragonBones](https://github.com/DragonBones/DragonBonesData)
