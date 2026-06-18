# @eva/plugin-ui

Vector shape plugin for Eva.js. Provides a `Shape` Component that draws
rect / circle / ellipse / roundedRect with solid color or `linear-gradient`
fill + stroke, backed by `@eva/plugin-renderer-graphics`.

```ts
import { Shape, UISystem, ShapeType } from '@eva/plugin-ui';

new Shape({
  type: ShapeType.ROUNDED_RECT,
  style: {
    width: 200,
    height: 80,
    radius: 16,
    fill: 'linear-gradient(180deg, #340033 4%, #93005D 83%, #CB2269 99%)',
    stroke: '#FFFFFF',
    lineWidth: 2,
  },
});
```

More Introduction
- [EN](https://eva.js.org)
- [中文](https://eva-engine.gitee.io)
