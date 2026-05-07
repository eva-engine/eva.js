# @eva/plugin-ai

AI DOM 覆盖层插件，在 Canvas 上方创建透明 DOM 层，将画布中每个渲染元素的位置、类型、内容和层级关系映射为 DOM 元素的 `data-*` 属性，使大模型能通过 DOM 快照理解 Eva.js 场景结构。

## 安装

```bash
npm install @eva/plugin-ai
```

## 基本用法

```typescript
import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { AISystem } from '@eva/plugin-ai';

const game = new Game();
await game.init({
  systems: [
    new RendererSystem({
      canvas,
      width: 750,
      height: 1000,
      backgroundColor: '#1a1a2e',
    }),
    // 其他渲染插件...
    new AISystem({ debug: true }), // 开启 debug 可视化红色边框
  ],
});
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用 DOM 覆盖层。设为 `false` 时完全关闭 DOM 渲染，不创建任何覆盖层元素（适用于生产环境关闭） |
| `debug` | `boolean` | `false` | 是否显示红色调试边框和半透明背景。关闭时 DOM 数据仍然存在，只是不显示可视化边框 |
| `zIndex` | `number` | `10001` | 覆盖层的 CSS z-index |

### 使用场景

```typescript
// 1. 开发调试：显示红色边框，方便确认 DOM 与画布元素对齐
new AISystem({ debug: true })

// 2. AI 接入（推荐）：DOM 数据存在但无可视化边框，不影响用户视觉
new AISystem()

// 3. 生产环境关闭：完全不渲染 DOM 覆盖层，零性能开销
new AISystem({ enabled: false })
```

## 工作原理

1. **运行时机**：在 `lateUpdate()` 中执行（RendererSystem 已完成 transform 同步后）
2. **边界获取**：通过 `container.getBounds()` 获取 PixiJS 世界坐标边界
3. **坐标转换**：乘以缩放比（canvas 实际像素 / 设计尺寸）转为屏幕坐标
4. **边界裁剪**：超出画布范围的 bounds 被 clamp 到可见区域
5. **DOM 同步**：每帧更新对应 DOM 元素的位置和属性

## DOM 输出结构

### 根节点（Overlay）

```html
<div data-ai-overlay="true"
     data-canvas-width="750"
     data-canvas-height="1000"
     data-background-color="#1a1a2e"
     data-background-alpha="0.5">
```

| 属性 | 说明 |
|------|------|
| `data-canvas-width` | 画布设计宽度 |
| `data-canvas-height` | 画布设计高度 |
| `data-background-color` | 画布背景色 |
| `data-background-alpha` | 画布背景透明度（仅非 1 时出现） |

### 元素节点

每个 GameObject 对应一个 div 子元素：

```html
<div data-name="title"
     data-type="Text"
     data-bounds="80,25,331,45"
     data-parent="header"
     data-children="..."
     data-text="Game Dashboard"
     data-font-size="40"
     data-color="#e0e1dd"
     data-font-family="Arial"
     data-font-weight="bold"
     data-text-align="left"
     aria-label="Text: title"
     role="img">
```

## 属性说明

### 通用属性（所有元素）

| 属性 | 说明 | 示例 |
|------|------|------|
| `data-name` | GameObject 名称 | `"title"` |
| `data-type` | 渲染组件类型 | `"Text"`, `"Img"`, `"Sprite"` 等 |
| `data-bounds` | 裁剪后的边界 `x,y,width,height`（设计坐标） | `"80,25,331,45"` |
| `data-parent` | 父节点名称 | `"header"` |
| `data-children` | 子节点名称列表（逗号分隔） | `"card-1,card-2,card-3"` |
| `aria-label` | 无障碍描述 `类型: 名称` | `"Text: title"` |

### 可见性属性（仅非默认值时出现）

| 属性 | 说明 | 来源 |
|------|------|------|
| `data-alpha` | 透明度（0-1） | Render 组件，仅 != 1 时出现 |
| `data-visible` | 是否可见 | Render 组件，仅 `false` 时出现 |
| `data-z-index` | 渲染层级 | Render 组件，仅 != 0 时出现 |

### 交互属性

| 属性 | 说明 |
|------|------|
| `data-interactive` | 值为 `"true"` 表示有 Event 组件，可响应点击/触摸 |

### 按类型的特有属性

#### Text / BitmapText / HTMLText

| 属性 | 说明 |
|------|------|
| `data-text` | 文本内容 |
| `data-font-size` | 字号 |
| `data-color` | 文本颜色 |
| `data-font-family` | 字体族 |
| `data-font-weight` | 字重 |
| `data-text-align` | 对齐方式 |

#### Img

| 属性 | 说明 |
|------|------|
| `data-resource` | 图片资源名称 |

#### Sprite

| 属性 | 说明 |
|------|------|
| `data-resource` | 精灵图集资源名称 |
| `data-sprite-name` | 图集中的子图名称 |

#### SpriteAnimation

| 属性 | 说明 |
|------|------|
| `data-resource` | 帧动画资源名称 |
| `data-speed` | 播放速度（ms/帧） |
| `data-playing` | 是否在播放 |

#### Graphics

| 属性 | 说明 |
|------|------|
| `data-fill-color` | 填充颜色（hex） |

#### NinePatch

| 属性 | 说明 |
|------|------|
| `data-resource` | 九宫格资源名称 |
| `data-sprite-name` | 图集中的子图名称（可选） |

#### TilingSprite

| 属性 | 说明 |
|------|------|
| `data-resource` | 平铺图片资源名称 |

#### PerspectiveMesh

| 属性 | 说明 |
|------|------|
| `data-resource` | 网格图片资源名称 |

#### Spine

| 属性 | 说明 |
|------|------|
| `data-resource` | Spine 资源名称 |
| `data-animation` | 当前播放的动画名称 |

#### Lottie

| 属性 | 说明 |
|------|------|
| `data-resource` | Lottie JSON 资源名称 |

## 支持的组件类型检测

按优先级匹配：`Img` > `Text` > `BitmapText` > `HTMLText` > `Sprite` > `SpriteAnimation` > `Spine` > `Lottie` > `Graphics` > `NinePatch` > `TilingSprite` > `PerspectiveMesh` > `DragonBone`。无渲染组件时标记为 `Container`。

## 示例 Demo

项目中提供了两个示例：

- `examples/src/ai.ts` — 平铺展示所有渲染类型
- `examples/src/ai-hierarchy.ts` — 复杂层级关系（4 层深度嵌套）

启动方式：

```bash
npm run dev
# 访问 http://localhost:8083/#./src/ai.ts
# 访问 http://localhost:8083/#./src/ai-hierarchy.ts
```

## 与 Playwright/浏览器自动化配合

通过浏览器快照工具获取 DOM 结构，大模型即可理解画布内容：

```yaml
# Playwright accessibility snapshot 输出示例
- generic:
  - 'img "Container: scene"'
  - 'img "Text: title"'          # data-text="Game Dashboard"
  - 'img "Img: card-3-img"'      # data-resource="bgImage"
  - 'img "Spine: character-spine"' # data-animation="idle"
  - 'img "Graphics: progress-fill"' # data-fill-color="#52b788"
```

通过 `document.querySelector('[data-ai-overlay]')` 可以用 JS 获取完整属性集。

## 设计决策

- **零配置**：自动检测所有 GameObject，无需手动标记
- **非侵入**：不修改任何渲染组件，纯 DOM 层覆盖
- **性能**：`overflow: hidden` 裁剪超出元素，`pointerEvents: none` 不拦截交互
- **与 A11ySystem 架构一致**：参考 `plugin-a11y` 的 DOM overlay 模式，缩放比计算方式相同
- **lateUpdate 时机**：确保 RendererSystem 已完成 transform 同步后再读取 bounds
