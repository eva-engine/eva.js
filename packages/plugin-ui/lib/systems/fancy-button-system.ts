import { System, decorators, OBSERVER_TYPE, type ComponentChanged } from '@eva/eva.js';
import FancyButton, { type FancyButtonState } from '../components/fancy-button';

/**
 * FancyButtonSystem
 *
 * 两件事:
 * 1. props 变更兜底 redraw / re-apply state(applyDeclarativeProps 是 hot-sync 主路径,
 *    本 System 仅在纯 runtime 场景下生效,DSL `systems: ["FancyButtonSystem"]` 才激活)。
 * 2. 监听同 entity 上 Event 组件的事件,把 state 切换到 hover/pressed/default 并触发 apply。
 *    Event 组件依赖 `@eva/plugin-renderer-event`(plugin-ui 的 peerDep)。
 */
@decorators.componentObserver({
  FancyButton: [
    { prop: ['enabled'], deep: false },
    { prop: ['state'], deep: false },
    { prop: ['selected'], deep: false },
    { prop: ['labelChildName'], deep: false },
    { prop: ['backgroundChildName'], deep: false },
    { prop: ['iconChildName'], deep: false },
    { prop: ['states'], deep: true },
  ],
})
export default class FancyButtonSystem extends System {
  static systemName = 'FancyButtonSystem';
  name = 'FancyButtonSystem';

  /** entityId → 已绑定的 listener,unmount 时拆 */
  private bound: Map<number, { off: () => void }> = new Map();

  componentChanged(changed: ComponentChanged) {
    if (changed.componentName !== 'FancyButton') return;
    const fb = changed.component as FancyButton;
    if (changed.type === OBSERVER_TYPE.ADD) {
      this.bindEvents(fb);
      fb.applyState(fb.computeEffectiveState(), /* force */ true);
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      fb.applyState(fb.computeEffectiveState(), /* force */ true);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.unbindEvents(fb);
    }
  }

  private bindEvents(fb: FancyButton): void {
    const go: any = fb.gameObject;
    if (!go) return;
    const evt: any = go.getComponent?.('Event');
    if (!evt || typeof evt.on !== 'function') return;

    const setState = (s: FancyButtonState) => {
      if (!fb.enabled) return;
      fb.setState(s, 'runtime');
    };
    const onTouchStart = () => setState('pressed');
    const onTouchEnd = () => setState(fb.selected ? 'selected' : 'default');
    const onTouchOver = () => setState('hover');
    const onTouchOut = () => setState(fb.selected ? 'selected' : 'default');

    try {
      evt.on('touchstart', onTouchStart);
      evt.on('touchend', onTouchEnd);
      evt.on('touchendoutside', onTouchEnd);
      evt.on('touchover', onTouchOver);
      evt.on('touchout', onTouchOut);
    } catch (_) {
      return;
    }

    this.bound.set(go.id, {
      off: () => {
        try {
          evt.off?.('touchstart', onTouchStart);
          evt.off?.('touchend', onTouchEnd);
          evt.off?.('touchendoutside', onTouchEnd);
          evt.off?.('touchover', onTouchOver);
          evt.off?.('touchout', onTouchOut);
        } catch (_) {}
      },
    });
  }

  private unbindEvents(fb: FancyButton): void {
    const go: any = fb.gameObject;
    if (!go) return;
    const entry = this.bound.get(go.id);
    if (entry) {
      entry.off();
      this.bound.delete(go.id);
    }
  }
}
