# How to use vite to develop Eva.js

For an development example, You just need create an ts module file in dir ./examples/ts. This module must export a function named 'init' which accepts an param whose type is HTMLCanvasElement. By the way, this module also export an string named 'name' as new page's title.

Example:

```typescript
  import { Game} from "../../packages/eva.js/lib";
  export const name = 'compressed-textures';
  export const init = async (canvas:HTMLCanvasElement)=>{
    // your code here.
    const game = new Game();
    // you can write your code continue...
  }
```

This development way prefer incresing your development efficiency to making an example for Eva.js learner.

## plugin-ui examples

`@eva/plugin-ui` 的 16 个组件由唯一一个 `PluginUiSystem` 驱动。examples 目录已包含三份开箱即用的 demo:

| 文件 | hash 路径 | 演示 |
|---|---|---|
| `src/plugin-ui-tour.ts` | `#./src/plugin-ui-tour.ts` | 全 16 组件巡览(UI / FancyButton / ProgressBar / CheckBox / Switch / Slider / Stepper / RadioGroup / ScrollBox / Tooltip / Modal / ToastHost / TabBar / HUDAnchor) |
| `src/plugin-ui-button-and-bar.ts` | `#./src/plugin-ui-button-and-bar.ts` | FancyButton × ProgressBar 协作 — 点按钮实时更新 HP 横条 + 圆环 CD 倒计时 |
| `src/plugin-ui-hud.ts` | `#./src/plugin-ui-hud.ts` | 战斗 HUD 复合场景 — 4 个 HUDAnchor + 多分辨率 safe-area 自动适配 |

启动方法:

```bash
cd libs/eva.js
npm run dev   # vite 默认 port 8083
# 然后浏览器访问 http://localhost:8083 从首页 ul 列表选择 plugin-ui-* 入口
```

每个 example 内部只挂一个 `PluginUiSystem`,而不是为每个 plugin-ui 组件挂一个单独的 system —— 这是 plugin-ui 在 v0.3 之后的标准做法。

完整 plugin-ui 技术方案 / 注入指南 / 路线图见仓库根 `docs/plugin-ui/{EXTENSION-PLAN,INJECTION-PATTERN,DEMOS}.md`。
