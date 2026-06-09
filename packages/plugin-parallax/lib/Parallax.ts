import { Component, decorators } from '@eva/eva.js';
import type { ParallaxParams } from './types';

/**
 * Parallax 组件 — 把实体按 (cameraX * speedX) 反向偏移,生成视差。
 *
 * DSL 用法:
 * ```json
 * { "type": "Parallax", "props": { "speedX": 0.3, "tileWidth": 1080 } }
 * ```
 *
 * 行为:
 * - 每帧读取相机/世界根的 transform.position,作用 speedX/Y 系数后反向写入本实体 transform.position。
 * - 平铺:超出 tileWidth 后 mod 回卷,适合背景循环图。
 * - 工作前提:本实体不挂在被相机平移的世界根下,而是与相机同级或挂在固定根。
 */
@decorators.componentObserver({})
export class Parallax extends Component<ParallaxParams> {
  static componentName = 'Parallax';

  private speedX = 0;
  private speedY = 0;
  private tileW = 0;
  private tileH = 0;
  private cameraEntity?: string;
  private baseX = 0;
  private baseY = 0;

  init(params?: ParallaxParams) {
    if (!params) return;
    this.speedX = params.speedX ?? 0;
    this.speedY = params.speedY ?? 0;
    this.tileW = params.tileWidth ?? 0;
    this.tileH = params.tileHeight ?? 0;
    this.cameraEntity = params.cameraEntity;
  }

  awake() {
    const t = this.gameObject.transform as any;
    if (t?.position) {
      this.baseX = t.position.x ?? 0;
      this.baseY = t.position.y ?? 0;
    }
  }

  update() {
    const game: any = (this as any).gameObject?.scene?.game;
    if (!game?.scene) return;
    const cam = this.cameraEntity ? this.findGo(game.scene, this.cameraEntity) : null;
    const cx = cam?.transform?.position?.x ?? 0;
    const cy = cam?.transform?.position?.y ?? 0;

    // camera 是反向世界偏移,parallax 我们想让 background 慢一点,所以乘 (1 - speed) 再叠到 base
    const offsetX = cx * (1 - this.speedX);
    const offsetY = cy * (1 - this.speedY);

    let x = this.baseX + offsetX;
    let y = this.baseY + offsetY;
    if (this.tileW > 0) x = ((x % this.tileW) + this.tileW) % this.tileW;
    if (this.tileH > 0) y = ((y % this.tileH) + this.tileH) % this.tileH;

    const t = this.gameObject.transform as any;
    if (t?.position) {
      t.position.x = x;
      t.position.y = y;
    }
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
}
