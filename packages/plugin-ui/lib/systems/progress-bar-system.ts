import { System, decorators, OBSERVER_TYPE, type ComponentChanged } from '@eva/eva.js';
import ProgressBar from '../components/progress-bar';

/**
 * ProgressBarSystem
 *
 * 监听 ProgressBar 组件 props 变更触发 redraw。Component 自身已实现
 * RuntimeEditableComponent.applyDeclarativeProps,编辑器 hot-sync 路径会优先走那条;
 * 本 System 是纯 runtime 兜底,DSL `systems: ["ProgressBarSystem"]` 显式声明才激活。
 */
@decorators.componentObserver({
  ProgressBar: [
    { prop: ['value'], deep: false },
    { prop: ['fillMode'], deep: false },
    { prop: ['width'], deep: false },
    { prop: ['height'], deep: false },
    { prop: ['radius'], deep: false },
    { prop: ['thickness'], deep: false },
    { prop: ['valueRange'], deep: true },
    { prop: ['trackStyle'], deep: true },
    { prop: ['fillStyle'], deep: true },
    { prop: ['fillPadding'], deep: true },
  ],
})
export default class ProgressBarSystem extends System {
  static systemName = 'ProgressBarSystem';
  name = 'ProgressBarSystem';

  componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'ProgressBar') return;
    if (changed.type === OBSERVER_TYPE.ADD || changed.type === OBSERVER_TYPE.CHANGE) {
      const bar = changed.component as ProgressBar;
      if (typeof bar.redraw === 'function') {
        bar.redraw();
      }
    }
  }
}
