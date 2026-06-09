import { System } from '@eva/eva.js';
import { Ticker } from './Ticker';

let GLOBAL_TICKER: Ticker | null = null;

/**
 * TickerSystem:把 Ticker 实例挂到 Game 系统树上。
 *
 * 用法:`game.addSystem(new TickerSystem())`,之后 `getTickerSystem(game)`
 * 或直接 `import { Ticker } from '@eva/plugin-tick'` 都能拿到同一个实例。
 *
 * 设计取舍:全局单例足够,因为同一时刻通常只有一个 Game 在跑。
 * 如果未来支持多 Game,改成 `game.systems.find(System.tick)` 即可。
 */
export class TickerSystem extends System {
  static systemName = 'Tick';
  readonly name = 'Tick';

  ticker: Ticker;

  init() {
    if (!GLOBAL_TICKER) {
      GLOBAL_TICKER = new Ticker();
      GLOBAL_TICKER.start();
    }
    this.ticker = GLOBAL_TICKER;
  }

  onDestroy() {
    // 不停 ticker:多个 Game 实例 / 编辑器热重载场景下要复用
  }
}

export function getTickerSystem(): Ticker {
  if (!GLOBAL_TICKER) {
    GLOBAL_TICKER = new Ticker();
    GLOBAL_TICKER.start();
  }
  return GLOBAL_TICKER;
}
