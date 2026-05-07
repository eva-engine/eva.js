# Eva.js

Eva.js 是一个基于 ECS（Entity-Component-System）架构的前端互动游戏引擎，底层渲染基于 PixiJS。

## 项目结构

Monorepo（Lerna + npm workspaces），所有包位于 `packages/` 目录下，包名以 `@eva/` 为前缀。

### 参考源码

`temp/hd-pixijs/` 目录包含 PixiJS 源码，仅作为阅读参考，用于理解 Eva.js 底层渲染能力。**不要修改该目录下的任何文件。**

## Packages 说明

### 核心

| 包 | 说明 |
|---|---|
| `@eva/eva.js` | 核心引擎，提供 Game、GameObject、Component、System、Transform、Scene、资源加载器、装饰器、游戏循环 |
| `@eva/plugin-renderer` | 核心渲染系统，初始化 PixiJS Application/Canvas，提供 RendererSystem |
| `@eva/renderer-adapter` | 渲染器抽象层，将 PixiJS 显示对象封装为统一适配器 API |

### 渲染插件

| 包 | 说明 |
|---|---|
| `@eva/plugin-renderer-img` | 图片渲染（IMAGE 资源类型） |
| `@eva/plugin-renderer-sprite` | 精灵图渲染（Sprite Atlas） |
| `@eva/plugin-renderer-sprite-animation` | 帧动画播放 |
| `@eva/plugin-renderer-text` | 文本渲染（Text / HTMLText / BitmapText 三种模式） |
| `@eva/plugin-renderer-graphics` | 矢量图形绘制（矩形、圆形、线条等） |
| `@eva/plugin-renderer-nine-patch` | 九宫格缩放（UI 面板/按钮常用） |
| `@eva/plugin-renderer-tiling-sprite` | 平铺精灵（滚动背景等） |
| `@eva/plugin-renderer-mask` | 遮罩/裁剪（形状遮罩或图片 Alpha 遮罩） |
| `@eva/plugin-renderer-mesh` | 透视网格变形（四角顶点变换） |
| `@eva/plugin-renderer-render` | 渲染属性控制（alpha、visible、zIndex、sortableChildren） |
| `@eva/plugin-renderer-event` | 触摸/指针事件系统（tap、touchstart 等） |

### 骨骼动画

| 包 | 说明 |
|---|---|
| `@eva/spine-base` | Spine 共享基类，注册 SPINE 资源类型 |
| `@eva/plugin-renderer-spine` | Spine 骨骼动画（最新版） |
| `@eva/plugin-renderer-spine36` | Spine 3.6 格式骨骼动画 |
| `@eva/plugin-renderer-dragonbone` | DragonBones 骨骼动画 |

### 动画/音频

| 包 | 说明 |
|---|---|
| `@eva/plugin-renderer-lottie` | Lottie 动画播放（支持插槽替换） |
| `@eva/plugin-transition` | 补间动画（关键帧属性动画，支持缓动函数和循环） |
| `@eva/plugin-sound` | 音频播放（Web Audio API） |

### 功能插件

| 包 | 说明 |
|---|---|
| `@eva/plugin-a11y` | 无障碍访问（DOM 透明覆盖层 + ARIA 属性） |
| `@eva/plugin-evax` | 全局状态管理（响应式 store，类似 Vuex/Redux） |
| `@eva/plugin-matterjs` | 2D 物理引擎（Matter.js 集成） |
| `@eva/plugin-layout` | Flexbox 布局系统 |
| `@eva/plugin-stats` | 性能监控面板（FPS） |
| `@eva/plugin-worker` | Web Worker 事件系统（Worker 内运行事件处理） |

### 测试/内部

| 包 | 说明 |
|---|---|
| `plugin-renderer-test` | 测试用骨架插件，不发布 |

## 开发命令

```bash
# 安装依赖
npm run bootstrap

# 启动开发服务器（examples）
npm run dev

# 构建
npm run build              # 全量构建（dev + prod）
npm run buildDev           # 仅开发环境构建
npm run buildProd          # 仅生产环境构建

# 构建单个/多个包
node ./scripts/build.js eva.js              # 构建单个包
node ./scripts/build.js eva.js plugin-renderer  # 构建多个包
node ./scripts/build.js plugin -- -ad       # 模糊匹配构建所有含 plugin 的包

# 构建参数
#   -d / --devOnly    仅开发环境
#   -p / --prodOnly   仅生产环境
#   -f / --formats    指定格式（cjs/iife/esm）
#   -t / --types      生成 d.ts
#   -s / --sourcemap  生成 sourcemap
#   -a / --all        模糊匹配构建多个

# 测试
npm test                   # 运行测试
npm run test:all           # 运行全部测试（核心 + 插件）
npm run test:core          # 仅核心模块测试
npm run test:plugins       # 仅插件测试
npm run test:renderer      # 仅渲染器测试
npm run test:watch         # 监听模式
npm run test:coverage      # 生成覆盖率报告

# 创建新包
npm run scaffold
```

## 开发注意事项

### 架构要点

- **ECS 模式**：每个插件通常导出一个 Component（数据容器）和一个 System（逻辑处理器）。新增功能应遵循此模式。
- **渲染插件依赖链**：所有 `plugin-renderer-*` 依赖 `@eva/plugin-renderer`，后者依赖 `@eva/renderer-adapter`。
- **spine-base 必须先构建**：Spine 相关包依赖 `@eva/spine-base`，构建脚本已通过 `prebuildDev`/`prebuildProd` 处理。

### 源码约定

- 源码位于 `packages/<name>/lib/`，使用 TypeScript。
- 编译输出在 `packages/<name>/dist/`。
- 使用装饰器（`experimentalDecorators: true`）。
- 全局变量：`DEV`、`__DEV__`、`__TEST__` 用于条件编译。

### 测试

- 测试框架：Jest + ts-jest。
- 测试文件位于 `packages/<name>/__tests__/`，后缀 `.spec.ts` 或 `.test.ts`。
- 测试中可使用全局变量 `DEV`、`__DEV__`、`__TEST__`。

### 发布

- Lerna independent 版本模式，各包独立版本号。
- 发布命令：`npm run release`。
- 当前分支 `v2` 为 2.x 开发分支。

### TypeScript 路径映射

`tsconfig.json` 配置了路径别名，开发时可直接引用：
- `@eva/plugin-*` -> `packages/plugin-*/lib`
- `@eva/eva.js` -> `packages/eva.js/lib`
- `@eva/renderer-adapter` -> `packages/renderer-adapter/lib`
- `@eva/spine-base` -> `packages/spine-base/lib`
