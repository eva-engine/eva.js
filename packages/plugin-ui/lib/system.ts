import { System, decorators, OBSERVER_TYPE, type ComponentChanged } from '@eva/eva.js';
import UI from './component';

/**
 * UISystem
 *
 * 监听 `UI` 组件 props 变化,在没有外部 hot-sync 兜底时主动调用 `redraw()`。
 * 编辑器侧已经有 `runtime-ui-hot-sync.ts` 走精细 diff,本 system 只在纯 runtime
 * 场景(workspace/* 跑游戏、dsl-demo 等)生效,保证 DSL 顶层声明 `UISystem` 的
 * 工程在不依赖编辑器时也能响应 shapes/style 的实时改动。
 */
@decorators.componentObserver({
  UI: [{ prop: ['shapes'], deep: true }, { prop: ['style'], deep: true }, 'componentName', 'type'],
})
export default class UISystem extends System {
  static systemName = 'UISystem';
  name = 'UISystem';

  componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'UI') return;
    if (changed.type === OBSERVER_TYPE.ADD || changed.type === OBSERVER_TYPE.CHANGE) {
      const ui = changed.component as UI;
      if (typeof ui.redraw === 'function') {
        ui.redraw();
      }
    }
  }
}
