import { System } from '@eva/eva.js';
import { Ticker } from './Ticker';

let GLOBAL_TICKER: Ticker | null = null;

/**
 * TickerSystem:把 Ticker 实例挂到 Game 系统树上。
 *
 * 用法:`game.addSystem(new TickerSystem())`,之后 `getTickerSystem(game)`
 * 或直接 `import { Ticker } from '@eva/plugin-tick'` 都能拿到同一个实例。
 *
 * 设计取舍:GLOBAL_TICKER 仍然是进程级单例(多个 Game / 编辑器热重载场景下复用),
 * 但通过 addRef/pauseRef/resumeRef/release 做 ref-count,确保:
 * - Game.pause() → onPause → pauseRef:本 Game 视角下 RAF 停跑
 * - 仍有其它 active Game(eva-design 编辑器多预览常态)时 RAF 不停
 * - 所有 owner 都 paused 或 release 后,RAF 真正 cancelAnimationFrame
 */
export class TickerSystem extends System {
  static systemName = 'Tick';
  readonly name = 'Tick';

  ticker: Ticker;

  init() {
    if (!GLOBAL_TICKER) {
      GLOBAL_TICKER = new Ticker();
    }
    this.ticker = GLOBAL_TICKER;
    // ref-count + 第一次 addRef 会自动 start
    this.ticker.addRef(this);
  }

  /** Game.pause() → triggerPause → onPause:把本 owner 标记 paused,reconcileLoop 决定是否真停。 */
  onPause() {
    this.ticker?.pauseRef(this);
  }

  /** Game.resume() → triggerResume → onResume:重新激活本 owner。 */
  onResume() {
    this.ticker?.resumeRef(this);
  }

  onDestroy() {
    // 释放 ref;若是最后一个 active owner,ticker 会停掉,
    // 不会出现\"editor 热重载后旧 ticker 残留空跑\"的情况。
    this.ticker?.release(this);
  }
}

/**
 * Sentinel owner,用于 `getTickerSystem()` 的纯函数风格调用。
 * 这样未挂 TickerSystem 的代码(examples、第三方脚本)也能拿到一个跑着的 ticker,
 * 同时不会因为单一 Game 的 pause 让全局 ticker 停掉。
 *
 * 用 plain object 作为 owner key,避免 Symbol 不能作 Map key 类型(object) 的 TS 限制。
 */
const STANDALONE_OWNER: object = { __plugin_tick_standalone__: true };

export function getTickerSystem(): Ticker {
  if (!GLOBAL_TICKER) {
    GLOBAL_TICKER = new Ticker();
  }
  // 加 ref(幂等),保证返回的是 active 的 ticker。standalone owner 不会被 pauseRef,
  // 因此即使所有 TickerSystem 都暂停,通过 getTickerSystem 直接消费的代码仍能拿到帧。
  // 业务想关掉它就显式 GLOBAL_TICKER.release(STANDALONE_OWNER) 或 GLOBAL_TICKER.stop()。
  GLOBAL_TICKER.addRef(STANDALONE_OWNER);
  return GLOBAL_TICKER;
}

/** 测试 / 热重载场景:重置进程级 ticker 单例。会先停掉再丢弃,生产代码不要调。 */
export function __resetGlobalTickerForTests(): void {
  if (GLOBAL_TICKER) {
    GLOBAL_TICKER.stop();
  }
  GLOBAL_TICKER = null;
}
