import { Component, decorators } from '@eva/eva.js';
import type { CanvasLayerParams } from './types';

/**
 * CanvasLayer 组件 — 声明实体所在的渲染层。
 *
 * DSL 用法:
 * ```json
 * { "type": "CanvasLayer", "props": { "name": "ui-hud", "zIndex": 1000, "screenSpace": true } }
 * ```
 *
 * 行为:
 * - 在 awake 阶段,把 zIndex 写到 GameObject.transform 上(底层渲染会读)。
 * - screenSpace 标记为运行时元数据,后续 plugin-camera2d 会读取以判断是否随相机平移。
 *
 * 不主动改变其他实体,只声明本实体的层级偏好。
 */
@decorators.componentObserver({})
export class CanvasLayer extends Component<CanvasLayerParams> {
  static componentName = 'CanvasLayer';

  layerName = '';
  zIndex = 0;
  screenSpace = false;

  init(params?: CanvasLayerParams) {
    if (!params) return;
    this.layerName = params.name;
    this.zIndex = params.zIndex ?? 0;
    this.screenSpace = !!params.screenSpace;
  }

  awake() {
    const t = this.gameObject?.transform as any;
    if (!t) return;
    // 写入运行时元数据,supplement(camera2d/renderer)读取
    t._canvasLayerName = this.layerName;
    t._canvasLayerZ = this.zIndex;
    t._screenSpace = this.screenSpace;
    if ('zIndex' in t) {
      try {
        t.zIndex = this.zIndex;
      } catch {}
    }
  }
}
