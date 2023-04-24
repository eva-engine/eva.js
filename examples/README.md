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

## Vconsole打开方式
在非首页页面中，在手机环境里  

- 设置href中search里debug=true可以开启VConsole  
- 或者在屏幕上画V字也会打开VConsole