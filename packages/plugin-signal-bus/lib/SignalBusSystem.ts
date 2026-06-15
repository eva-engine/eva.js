import { System } from '@eva/eva.js';
import { getSignalBus, __setGlobalSignalBus, SignalBus } from './SignalBus';
import type { SignalSchema, SignalTransport } from './types';

interface Params {
  signals?: SignalSchema[];
  /**
   * 外部 transport(通常是 mx.event)。传入则全局 bus 走 transport,不再走本地 listener。
   * 传 null/undefined 走本地 fallback。
   */
  transport?: SignalTransport | null;
  /** listener 抛错时是否 console.error。默认 true。 */
  logListenerErrors?: boolean;
  /**
   * 是否在 game `sceneChanged` 事件触发时自动清理 scope:'scene' 订阅。
   * 默认 true。设 false 仅在调用方完全自管 scene 边界时使用。
   */
  autoDisposeSceneScoped?: boolean;
}

/**
 * 把全局 SignalBus 挂到 Game 上。
 * 在 DSL 顶层声明:
 *   { systems: [{ type: "SignalBus", order: 50, params: { signals: [...] } }] }
 *
 * 之后任意 Component 都能 `getSignalBus().emit(...)` / `.on(...)`。
 *
 * D1 决策:默认 game 单例,跨 scene 保留 listener;需要 scene 边界自动清理时
 * 调用方显式传 `bus.on(name, fn, { scope: 'scene' })`,system 在 game 触发
 * `sceneChanged` 时统一 dispose 这些 handle。
 */
export class SignalBusSystem extends System<Params> {
  static systemName = 'SignalBus';
  readonly name = 'SignalBus';

  bus: SignalBus;
  private autoDisposeSceneScoped = true;
  private sceneChangedHandler: (() => void) | null = null;

  init(params?: Params) {
    const hasOpts = !!(params && (params.transport != null || params.logListenerErrors === false));
    if (hasOpts) {
      const fresh = new SignalBus({
        transport: params!.transport ?? null,
        logListenerErrors: params!.logListenerErrors,
      });
      __setGlobalSignalBus(fresh);
      this.bus = fresh;
    } else {
      this.bus = getSignalBus();
    }
    if (params?.signals?.length) this.bus.registerMany(params.signals);
    if (params?.autoDisposeSceneScoped === false) this.autoDisposeSceneScoped = false;
  }

  awake() {
    if (!this.autoDisposeSceneScoped) return;
    if (!this.game) return;
    this.sceneChangedHandler = () => {
      this.bus.disposeSceneScoped();
    };
    this.game.on('sceneChanged', this.sceneChangedHandler);
  }

  onDestroy() {
    if (this.sceneChangedHandler && this.game) {
      this.game.off('sceneChanged', this.sceneChangedHandler);
    }
    this.sceneChangedHandler = null;
  }
}
