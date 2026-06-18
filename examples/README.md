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

`@eva/plugin-ui` 的 16 个组件由 `UISystem` 驱动。examples 目录已包含开箱即用的 demo。
其中 `src/plugin-ui-pixi-*.ts` 按官方 @pixi/ui Storybook 的 46 个 story export 拆成一一对应的单 story 入口,用于像素级对照和回归验证。

| 文件 | hash 路径 | 演示 |
|---|---|---|
| `src/plugin-ui-tour.ts` | `#./src/plugin-ui-tour.ts` | 全 16 组件巡览(UI / Button / FancyButton / CheckBox / Switcher / RadioGroup / ProgressBar / CircularProgressBar / Slider / DoubleSlider / Input / List / ScrollBox / Select / Dialog / MaskedFrame) |
| `src/plugin-ui-pixi-stories.ts` | `#./src/plugin-ui-pixi-stories.ts` | @pixi/ui Storybook parity overview — Button/UseGraphics + Button/UseSprite legacy gallery |
| `src/plugin-ui-pixi-button-use-graphics.ts` | `#./src/plugin-ui-pixi-button-use-graphics.ts` | @pixi/ui Storybook parity — Components/Button/Use Graphics 单 story 精确入口 |
| `src/plugin-ui-pixi-button-use-sprite.ts` | `#./src/plugin-ui-pixi-button-use-sprite.ts` | @pixi/ui Storybook parity — Components/Button/Use Sprite 单 story 精确入口 |
| `src/plugin-ui-pixi-stories-fancy-button.ts` | `#./src/plugin-ui-pixi-stories-fancy-button.ts` | @pixi/ui Storybook parity — FancyButton graphics/sprite/icon/text/nine-slice stories |
| `src/plugin-ui-pixi-stories-controls.ts` | `#./src/plugin-ui-pixi-stories-controls.ts` | @pixi/ui Storybook parity — ProgressBar 与 Slider/DoubleSlider 的 graphics/sprite/nine-slice stories |
| `src/plugin-ui-pixi-stories-selection.ts` | `#./src/plugin-ui-pixi-stories-selection.ts` | @pixi/ui Storybook parity — Checkbox、RadioGroup、Switcher selection stories |
| `src/plugin-ui-pixi-stories-forms.ts` | `#./src/plugin-ui-pixi-stories-forms.ts` | @pixi/ui Storybook parity — Input、Select、MaskedFrame form/frame stories |
| `src/plugin-ui-pixi-stories-select.ts` | `#./src/plugin-ui-pixi-stories-select.ts` | @pixi/ui Storybook parity — Select graphics/HTMLText/sprite dropdown stories |
| `src/plugin-ui-pixi-stories-layout.ts` | `#./src/plugin-ui-pixi-stories-layout.ts` | @pixi/ui Storybook parity — List 与 ScrollBox layout stories |
| `src/plugin-ui-pixi-stories-scrollbox.ts` | `#./src/plugin-ui-pixi-stories-scrollbox.ts` | @pixi/ui Storybook parity — ScrollBox graphics/sprite/dynamic/proximity stories |
| `src/plugin-ui-pixi-stories-dialog.ts` | `#./src/plugin-ui-pixi-stories-dialog.ts` | @pixi/ui Storybook parity — Dialog graphics/nine-slice/sprite dialog stories |
| `src/plugin-ui-button-and-bar.ts` | `#./src/plugin-ui-button-and-bar.ts` | Button/Use Graphics 复刻 + FancyButton × ProgressBar 协作 — 点按钮实时更新 HP 横条 + 圆环 CD 倒计时 |
| `src/plugin-ui-hud.ts` | `#./src/plugin-ui-hud.ts` | 战斗 HUD 复合场景 — 用 plugin-ui v2 wrapper + Transform/Layout 组合 HUD |

除上面的组件族 gallery 外,`src/plugin-ui-pixi-*.ts` 的 46 个单 story 入口覆盖官方 Storybook index 的全部 story。覆盖关系维护在 `src/plugin-ui-pixi-stories/manifest.ts`,记录 Storybook id、@pixi/ui 源文件/export 和 Eva example 文件。examples 首页会自动列出这些入口,命名规则和 Storybook title 对应,例如 `#./src/plugin-ui-pixi-fancy-button-use-graphics.ts`、`#./src/plugin-ui-pixi-dialog-graphics-three-buttons.ts`、`#./src/plugin-ui-pixi-slider-double-nine-slice-sprite.ts`。

启动方法:

```bash
cd libs/eva.js
npm run dev   # vite 默认 port 8083
# 然后浏览器访问 http://localhost:8083 从首页 ul 列表选择 plugin-ui-* 入口
```

每个 example 内部只挂一个 `UISystem`,不要为 plugin-ui 组件挂单独 system。

完整 plugin-ui 技术方案 / 注入指南 / 路线图见仓库根 `docs/plugin-ui/{EXTENSION-PLAN,INJECTION-PATTERN,DEMOS}.md`。
