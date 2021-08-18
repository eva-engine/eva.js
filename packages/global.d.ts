import type { Game } from "./eva.js/lib";

declare global {
  interface Window {
    __EVA_GAME_INSTANCE__?: Game;
    __EVA_INSPECTOR_ENV__?: boolean;
  }
  const DEV: boolean;
  const __DEV__: boolean;
  const __TEST__: boolean;
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
