declare const DEV: boolean;
declare const __DEV__: boolean;
declare const __TEST__: boolean;

// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R;
    toHaveBeenWarnedLast(): R;
    toHaveBeenWarnedTimes(n: number): R;
  }
}

declare namespace PIXI.miniprogram {
  export const globalAlias: any;
  export const Element: any;
  export const Event: any;
  export const EventTarget: any;
  export const HTMLCanvasElement: any;
  export const HTMLElement: any;
  export const HTMLMediaElement: any;
  export const HTMLVideoElement: any;
  export const HTMLImageElement: any;
  export const Node: any;
  export const XMLHttpRequestAlias: any;
  export const atob: any;
  export const cancelAnimationFrame: any;
  export const devicePixelRatio: any;
  export const dispatchMouseDown: any;
  export const dispatchMouseMove: any;
  export const dispatchMouseUp: any;
  export const dispatchPointerDown: any;
  export const dispatchPointerMove: any;
  export const dispatchPointerUp: any;
  export const dispatchTouchEnd: any;
  export const dispatchTouchMove: any;
  export const dispatchTouchStart: any;
  export const documentAlias: any;
  export const navigator: any;
  export const performance: any;
  export const registerCanvas: any;
  export const registerCanvas2D: any;
  export const requestAnimationFrame: any;
  export const screen: any;
  export const windowAlias: any;
}
