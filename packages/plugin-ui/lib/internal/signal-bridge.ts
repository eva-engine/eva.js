import type { GameObject } from '@eva/eva.js';

/**
 * @pixi/ui 实例的 Signal 协议:
 *   instance.onPress.connect(handler) -> SignalConnection
 *
 * 我们把 @pixi/ui 的 typed-signals 桥接到 Eva 现有的两个事件入口:
 *   1) GameObject 自身的 emit(name, payload) — 与 @eva/plugin-renderer-event 一致,
 *      DSL 用户写 evt.on('change', ...) 仍能收到
 *   2) globalThis.mx.event — Eva 项目惯例的全局 bus,DSL 跨 entity 通信用
 *
 * 关键约束:
 *   - 必须返回 disconnect 函数集合,用于 REMOVE 时清理
 *   - 任何 handler 不能抛异常打断 @pixi/ui 内部流程,因此包 try/catch
 */

interface SignalLike {
  connect(handler: (...args: any[]) => void): SignalConnection;
}

interface SignalConnection {
  disconnect(): void;
}

interface BridgeOptions {
  /** GameObject — 用来取 entity name 与发 emit */
  go: GameObject;
  /** 事件命名前缀 — 通常等于 component name 转小写,例:fancybutton / progressbar / slider */
  prefix: string;
  /** 是否同时往 mx.event 上发,默认 true */
  emitToMx?: boolean;
}

/**
 * 把 @pixi/ui 实例的多个 Signal 桥接到 Eva 事件系统。
 *
 * 用法:
 *   const offs = bridgeSignals(instance, { go, prefix: 'fancybutton' }, {
 *     press: (e) => ({ pointerId: e?.pointerId }),
 *     hover: () => ({}),
 *   });
 *   // REMOVE 时 offs.forEach(o => o())
 */
export function bridgeSignals(
  instance: any,
  options: BridgeOptions,
  signalMap: Record<string, ((...args: any[]) => Record<string, any>) | true>,
): Array<() => void> {
  const offs: Array<() => void> = [];
  const { go, prefix, emitToMx = true } = options;

  for (const [signalName, projector] of Object.entries(signalMap)) {
    const signal = pickSignal(instance, signalName);
    if (!signal) continue;
    const conn = signal.connect((...args: any[]) => {
      const payloadFromArgs = projector === true ? args[0] : safeProject(projector as any, args);
      const payload = typeof payloadFromArgs === 'object' && payloadFromArgs !== null
        ? { entityName: go.name, ...payloadFromArgs }
        : { entityName: go.name, value: payloadFromArgs };
      // 1) GameObject local emit
      try { (go as any).emit?.(signalName, payload); } catch (_) {}
      // 2) component-prefixed local emit (`fancybutton:press`),与 Eva 现有惯例一致
      try { (go as any).emit?.(`${prefix}:${signalName}`, payload); } catch (_) {}
      // 3) global mx bus
      if (emitToMx) {
        const mx: any = (typeof globalThis !== 'undefined' ? (globalThis as any).mx : undefined);
        if (mx?.event?.emit) {
          try { mx.event.emit(`${prefix}:${signalName}`, payload); } catch (_) {}
        }
      }
    });
    offs.push(() => { try { conn.disconnect(); } catch (_) {} });
  }
  return offs;
}

/**
 * @pixi/ui Signal 命名:onPress / onUp / onDown / onHover / onChange / onSelect / onCheck / onUpdate / onScroll / onClose / onProximityChange
 *
 * 我们 signalMap 的 key 用语义动词(press/change/select/...),通过加 `on` 前缀
 * 与首字母大写映射到实际属性名。
 */
function pickSignal(instance: any, signalName: string): SignalLike | null {
  const candidates = [
    `on${signalName.charAt(0).toUpperCase()}${signalName.slice(1)}`,  // press -> onPress
    `on${signalName.charAt(0).toUpperCase()}${signalName.slice(1)}Change`, // proximity -> onProximityChange
  ];
  for (const cand of candidates) {
    const sig = instance?.[cand];
    if (sig && typeof sig.connect === 'function') return sig as SignalLike;
  }
  return null;
}

function safeProject(projector: (...args: any[]) => Record<string, any>, args: any[]): Record<string, any> {
  try {
    return projector(...args) ?? {};
  } catch (_) {
    return {};
  }
}
