declare const DEV: boolean;
declare const __DEV__: boolean;
declare const __TEST__: boolean;
declare interface Window {
   __EVA_GAME_INSTANCE__: any;
   __EVA_INSPECTOR_ENV__: boolean;
}
// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R;
    toHaveBeenWarnedLast(): R;
    toHaveBeenWarnedTimes(n: number): R;
  }
}

declare namespace PIXI.miniprogram {
  export const type = 'taobao miniprogram';
}
