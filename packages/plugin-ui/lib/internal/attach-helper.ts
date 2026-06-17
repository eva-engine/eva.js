import type { Game, GameObject } from '@eva/eva.js';
import type { Container } from 'pixi.js';

/**
 * Eva GameObject -> PIXI.Container resolver.
 *
 * 通过 RendererSystem.containerManager 拿到 GameObject 对应的 PIXI.Container。
 * Eva 引擎的 RendererSystem 在 Transform ADD 时为每个 GameObject 创建空 Container,
 * 渲染插件 (Img/Sprite/Graphics/...) 把自己的显示对象 addChild 到该 Container。
 *
 * plugin-ui 在 attach @pixi/ui 实例时也走同一路径,与现有渲染管线对齐。
 *
 * @returns 该 GameObject 的 PIXI.Container,未就绪时返回 null
 */
export function getEvaContainer(game: Game | undefined, go: GameObject): Container | null {
  if (!game || !go) return null;
  const rendererSystem = findRendererSystem(game);
  const containerManager = rendererSystem?.containerManager ?? rendererSystem?.rendererManager?.containerManager;
  if (!containerManager?.getContainer) return null;
  return containerManager.getContainer(go.id) ?? null;
}

/**
 * 反查 RendererSystem 实例。
 *
 * 注意:`@eva/plugin-renderer` 的实际 class name 是 `Renderer`,`static systemName = 'Renderer'`。
 * 外部 import 时通常起别名 `RendererSystem`(import/export 别名),
 * 但 Eva.js 的 game.getSystem(string) 走 `system.name === S` 匹配,所以查询字符串是 'Renderer'。
 *
 * 同时遍历 systems 数组兜底:有 containerManager 字段的 system 即可识别为 RendererSystem。
 */
function findRendererSystem(game: Game): any {
  // 1) 优先 string getSystem('Renderer')
  const tryStr = (game as any).getSystem?.('Renderer');
  if (tryStr) return tryStr;
  // 2) 遍历:系统名 / 类名 / 独有的 containerManager 字段
  const systems: any[] = (game as any).systems ?? [];
  for (const sys of systems) {
    const ctorName = sys?.constructor?.systemName ?? sys?.constructor?.name;
    if (ctorName === 'Renderer' || ctorName === 'RendererSystem') return sys;
    if (sys?.name === 'Renderer' || sys?.name === 'RendererSystem') return sys;
    if (sys?.containerManager) return sys;
  }
  return null;
}

/**
 * 把 @pixi/ui 实例 attach 到 GameObject 的 PIXI.Container。
 *
 * 行为:addChildAt(instance, 0) — 与 Img/Graphics 系列保持一致放在 z=0 底层。
 * 如果 Container 还没就绪(同帧 Transform 尚未处理),返回 false,调用方应在
 * queueMicrotask 后重试一次。
 */
export function attachToGameObject(game: Game | undefined, go: GameObject, instance: Container): boolean {
  const container = getEvaContainer(game, go);
  if (!container) return false;
  try {
    if ((instance as any).parent && (instance as any).parent !== container) {
      (instance as any).parent.removeChild(instance);
    }
    if (typeof (container as any).addChildAt === 'function') {
      (container as any).addChildAt(instance, 0);
    } else {
      (container as any).addChild(instance);
    }
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 反之:从 GameObject Container 移除并 destroy @pixi/ui 实例。
 *
 * destroy({ children: true }) 会递归销毁内部 view,但 Texture 不被销毁
 * (texture: false 默认)以避免共享纹理被误销毁。
 */
export function detachFromGameObject(game: Game | undefined, go: GameObject, instance: Container | null | undefined): void {
  if (!instance) return;
  const container = getEvaContainer(game, go);
  try {
    if (container && (instance as any).parent === container) {
      (container as any).removeChild(instance);
    }
    if (typeof (instance as any).destroy === 'function') {
      (instance as any).destroy({ children: true });
    }
  } catch (_) {
    // ignore — destroy 二次调用 / 已 detach 都视为成功
  }
}

/**
 * 在 Container 未就绪时延后执行 fn。
 * 行为:同步尝试一次,失败 queueMicrotask 重试,最多 4 次(每 microtask 回合一次)。
 * 主要应对 plugin-ui Component 与核心 Transform 在同帧 ADD 时的时序竞争。
 */
export function whenContainerReady(game: Game | undefined, go: GameObject, fn: (container: Container) => void, attempts = 4): void {
  const container = getEvaContainer(game, go);
  if (container) {
    fn(container);
    return;
  }
  if (attempts <= 0) return;
  queueMicrotask(() => whenContainerReady(game, go, fn, attempts - 1));
}
