import { System } from '@eva/eva.js';
import { getSignalBus, SignalBus } from './SignalBus';
import type { SignalSchema } from './types';

interface Params {
  signals?: SignalSchema[];
}

/**
 * 把全局 SignalBus 挂到 Game 上。
 * 在 DSL 顶层声明:
 *   { systems: [{ name: "SignalBusSystem", params: { signals: [...] } }] }
 *
 * 之后任意 Component 都能 `getSignalBus().emit(...)` / `.on(...)`。
 */
export class SignalBusSystem extends System<Params> {
  static systemName = 'SignalBus';
  readonly name = 'SignalBus';

  bus: SignalBus;

  init(params?: Params) {
    this.bus = getSignalBus();
    if (params?.signals?.length) this.bus.registerMany(params.signals);
  }
}
