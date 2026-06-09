import { Component, decorators } from '@eva/eva.js';
import { getSignalBus, SignalHandle } from '@eva/plugin-signal-bus';
import type { Camera2DParams } from './types';

interface ShakeState {
  intensity: number;
  duration: number;
  elapsed: number;
}

/**
 * Camera2D 组件 — 跟随 + deadzone + limits + shake。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "Camera2D",
 *   "props": {
 *     "followEntity": "Player",
 *     "viewportCenter": { "x": 360, "y": 640 },
 *     "deadzone": { "x": 80, "y": 60 },
 *     "damping": 0.15,
 *     "limits": { "minX": 0, "maxX": 2000 },
 *     "worldRoot": "world"
 *   }
 * }
 * ```
 *
 * 行为:
 * - 每帧用 worldRoot 实体的 transform.position 偏移整个世界(camera 是反向的)。
 * - shake 通过监听 `camera:shake` 信号触发: { intensity, duration }
 *
 * 设计取舍:
 * - 不修改 game canvas viewport,因为 Eva.js 的 renderer 不暴露统一 viewport API。
 * - 只让 worldRoot 实体的 transform 反向移动,其他 screenSpace=true 的子节点应该挂在 worldRoot 之外。
 */
@decorators.componentObserver({})
export class Camera2D extends Component<Camera2DParams> {
  static componentName = 'Camera2D';

  private params: Camera2DParams = {} as any;
  private shake: ShakeState | null = null;
  private cx = 0;
  private cy = 0; // 当前已平移的世界偏移
  private subs: SignalHandle[] = [];

  init(params?: Camera2DParams) {
    if (!params) return;
    this.params = params;
  }

  awake() {
    const bus = getSignalBus();
    this.subs.push(
      bus.on('camera:shake', (p: { intensity?: number; duration?: number } | undefined) => {
        this.shake = {
          intensity: p?.intensity ?? 8,
          duration: p?.duration ?? 200,
          elapsed: 0,
        };
      })
    );
  }

  update(e: { deltaTime: number }) {
    const game: any = (this as any).gameObject?.scene?.game ?? (this as any).game;
    if (!game?.scene) return;

    const target = this.params.followEntity ? this.findGo(game.scene, this.params.followEntity) : null;
    const root = this.params.worldRoot ? this.findGo(game.scene, this.params.worldRoot) : null;
    if (!root?.transform?.position) return;

    if (target?.transform?.position) {
      const center = this.params.viewportCenter ?? { x: 0, y: 0 };
      const dz = this.params.deadzone ?? { x: 0, y: 0 };
      const damping = this.params.damping ?? 0;
      // 期望让 target.x + cx 落在 center.x 附近(允许 deadzone 偏差)
      const desiredCx = center.x - target.transform.position.x;
      const desiredCy = center.y - target.transform.position.y;
      const dx = desiredCx - this.cx;
      const dy = desiredCy - this.cy;
      let stepX = dx;
      let stepY = dy;
      if (Math.abs(dx) <= dz.x) stepX = 0;
      if (Math.abs(dy) <= dz.y) stepY = 0;
      // 阻尼,damping 大 = 慢
      const k = 1 - Math.max(0, Math.min(1, damping));
      this.cx += stepX * k;
      this.cy += stepY * k;
    }

    if (this.params.limits) {
      const l = this.params.limits;
      if (l.minX != null) this.cx = Math.max(this.cx, l.minX);
      if (l.maxX != null) this.cx = Math.min(this.cx, l.maxX);
      if (l.minY != null) this.cy = Math.max(this.cy, l.minY);
      if (l.maxY != null) this.cy = Math.min(this.cy, l.maxY);
    }

    let sx = 0;
    let sy = 0;
    if (this.shake) {
      this.shake.elapsed += e.deltaTime;
      if (this.shake.elapsed >= this.shake.duration) {
        this.shake = null;
      } else {
        const remain = 1 - this.shake.elapsed / this.shake.duration;
        sx = (Math.random() * 2 - 1) * this.shake.intensity * remain;
        sy = (Math.random() * 2 - 1) * this.shake.intensity * remain;
      }
    }

    root.transform.position.x = this.cx + sx;
    root.transform.position.y = this.cy + sy;
  }

  private findGo(scene: any, name: string): any {
    const stack: any[] = [...(scene.gameObjects ?? [])];
    while (stack.length) {
      const go = stack.pop();
      if (!go) continue;
      if (go.name === name) return go;
      if (go.transform?.children?.length) {
        for (const ch of go.transform.children) stack.push(ch.gameObject);
      }
    }
    return null;
  }

  onDestroy() {
    for (const h of this.subs) h.dispose();
    this.subs = [];
  }
}
