/**
 * UISystem - generic handler driven by COMPONENT_DEFINITIONS metadata.
 *
 * 16 个 ECS 组件(UI 自渲染 + 14 个 @pixi/ui factory wrapper + RadioGroup 独立)由本 system 统一驱动。
 * 不再为每个组件写独立 handler 方法 - 14 个 @pixi/ui 组件走 handleGeneric,RadioGroup 单独处理。
 */

import { System, decorators, OBSERVER_TYPE, type ComponentChanged } from '@eva/eva.js';
import { CheckBox as PixiCheckBox, RadioGroup as PixiRadioGroup } from '@pixi/ui';
import { Container as PixiContainer } from 'pixi.js';

import UI from './component';
import RadioGroup from './radio-group';
import { COMPONENT_DEFINITIONS } from './components';
import {
  resolveViewsBySchema,
  type ComponentDefinition,
} from './component-factory';
import { resolveViewRef } from './internal/view-resolver';
import {
  attachToGameObject,
  detachFromGameObject,
  whenContainerReady,
  getEvaContainer,
} from './internal/attach-helper';
import { bridgeSignals } from './internal/signal-bridge';

// observer schema:把 COMPONENT_DEFINITIONS.fields 转成 componentObserver decorator 参数
function buildObserverSchema(): Record<string, Array<{ prop: string[]; deep: boolean }>> {
  const out: Record<string, Array<{ prop: string[]; deep: boolean }>> = {
    UI: [{ prop: ['shapes'], deep: true }],
    RadioGroup: [
      { prop: ['selectedId'], deep: false },
      { prop: ['direction'], deep: false },
      { prop: ['elementsMargin'], deep: false },
    ],
  };
  for (const [name, def] of Object.entries(COMPONENT_DEFINITIONS)) {
    const props: Array<{ prop: string[]; deep: boolean }> = [];
    for (const [field, spec] of Object.entries(def.fields)) {
      const deep = spec.kind === 'shallowMerge' || spec.kind === 'tuple' || spec.kind === 'arrayCopy';
      props.push({ prop: [field], deep });
    }
    out[name] = props;
  }
  return out;
}

@decorators.componentObserver(buildObserverSchema())
export default class UISystem extends System {
  static systemName = 'UISystem';
  name = 'UISystem';

  /** componentName -> instance map(generic 共享一份) */
  private instances: Map<string, Map<number, any>> = new Map();
  private signalCleanups = new Map<number, Array<() => void>>();
  /** 给 RadioGroup 反查 PixiCheckBox 实例用 */
  private get checkBoxInstances(): Map<number, PixiCheckBox> {
    let m = this.instances.get('CheckBox');
    if (!m) { m = new Map(); this.instances.set('CheckBox', m); }
    return m;
  }
  private radioGroupInstances = new Map<number, PixiRadioGroup>();

  // 每帧:把 componentObserver 队列里的事件派发到 componentChanged。
  // System 基类没默认实现 update,@eva/plugin-renderer 的 Renderer 基类才有,
  // 这里 UISystem 直接 extends System,必须自己实现这个 dispatch 循环。
  update(_e?: any): void {
    const changes = this.componentObserver?.clear?.() ?? [];
    for (const changed of changes) {
      this.componentChanged(changed);
    }
  }

  componentChanged(changed: ComponentChanged): void {
    const name = changed.componentName;
    if (name === 'UI') return this.handleUI(changed);
    if (name === 'RadioGroup') return this.handleRadioGroup(changed);
    const def = COMPONENT_DEFINITIONS[name];
    if (def) return this.handleGeneric(def, changed);
  }

  // ============================================================
  // UI(自渲染,无 @pixi/ui 实例)
  // ============================================================
  private handleUI(changed: ComponentChanged): void {
    if (changed.type === OBSERVER_TYPE.ADD || changed.type === OBSERVER_TYPE.CHANGE) {
      const ui = changed.component as UI;
      if (typeof ui.redraw === 'function') ui.redraw();
    }
  }

  // ============================================================
  // Generic handler(14 个 @pixi/ui wrapper)
  // ============================================================
  private handleGeneric(def: ComponentDefinition, changed: ComponentChanged): void {
    const c: any = changed.component;
    const go: any = c.gameObject;
    if (!go) return;

    const instMap = this.getInstanceMap(def.name);
    if (changed.type === OBSERVER_TYPE.ADD) {
      whenContainerReady(this.gameRef(go), go, () => this.attachGeneric(def, c, go, instMap));
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      const inst = instMap.get(go.id);
      if (!inst) {
        // view 还没就绪导致 attach 失败,等下一帧重试
        whenContainerReady(this.gameRef(go), go, () => this.attachGeneric(def, c, go, instMap));
        return;
      }
      def.syncOnChange?.(inst, c);
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.detachGeneric(go.id, instMap, go);
    }
  }

  private attachGeneric(def: ComponentDefinition, c: any, go: any, instMap: Map<number, any>): void {
    if (instMap.has(go.id)) return;
    const game = this.gameRef(go);

    // 1) resolve views
    const views = resolveViewsBySchema(game, go, c, def.views);
    if (def.views && views === null) return; // 必填 view 缺失 → abort

    // 2) 特殊组件 inline view resolve(ProgressBar / Select / Dialog / MaskedFrame)
    //    它们的 view ref 不在统一 folder,通过自定义字段名,这里给 wrapper component 挂 __resolved_*
    inlineResolveSpecialViews(def.name, c, game, go);
    if (!validateInlineResolved(def.name, c)) return;

    // 3) collectChildContainers(List / ScrollBox)— 把子 entity 的 PIXI Container 收集为 items
    if (def.name === 'List' || def.name === 'ScrollBox') {
      const childName = def.name === 'List' ? c.itemsChildName : c.contentChildName;
      c.__resolved_items = collectChildContainers(game, go, childName);
    }

    // 4) 构造 PIXI 实例
    const built = def.optionsBuilder(c, views ?? {});
    const inst = def.positional
      ? new (def.pixiClass as any)(...(built as any[]))
      : new (def.pixiClass as any)(built);

    // 5) postCreate(enabled / selected tint 等)
    def.postCreate?.(inst, c);

    // 6) 注册 + attach
    instMap.set(go.id, inst);
    attachToGameObject(game, go, inst);

    // 7) onAttachedExtra(Dialog 挂 contentChild)
    if (def.name === 'Dialog') {
      const contentChild = findChildEntity(go, c.contentChildName ?? 'content');
      if (contentChild) {
        const cc = getEvaContainer(game, contentChild);
        if (cc) { try { (inst as any).addChild?.(cc); } catch (_) {} }
      }
    }
    // MaskedFrame 挂 borderView 作为 child
    if (def.name === 'MaskedFrame' && c.borderView) {
      const border = resolveViewRef(game, go, c.borderView);
      if (border) { try { (inst as any).addChild?.(border); } catch (_) {} }
    }

    // 8) signal 桥接
    if (def.signalMap) {
      const offs = bridgeSignals(inst, { go, prefix: def.signalPrefix }, def.signalMap(c));
      this.signalCleanups.set(go.id, offs);
    }

    def.onAttachedExtra?.(inst, c, go, game);
  }

  private detachGeneric(id: number, instMap: Map<number, any>, go: any): void {
    const inst = instMap.get(id);
    detachFromGameObject(this.gameRef(go), go, inst);
    instMap.delete(id);
    const offs = this.signalCleanups.get(id);
    if (offs) { offs.forEach((o) => o()); this.signalCleanups.delete(id); }
  }

  // ============================================================
  // RadioGroup(独立 handler — 跨实体协调)
  // ============================================================
  private handleRadioGroup(changed: ComponentChanged): void {
    const c = changed.component as RadioGroup;
    const go: any = (c as any).gameObject;
    if (!go) return;
    if (changed.type === OBSERVER_TYPE.ADD) {
      whenContainerReady(this.gameRef(go), go, () =>
        queueMicrotask(() => this.attachRadioGroup(c)),
      );
    } else if (changed.type === OBSERVER_TYPE.CHANGE) {
      c.applySelection();
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      const inst = this.radioGroupInstances.get(go.id);
      detachFromGameObject(this.gameRef(go), go, inst as any);
      this.radioGroupInstances.delete(go.id);
      const offs = this.signalCleanups.get(go.id);
      if (offs) { offs.forEach((o) => o()); this.signalCleanups.delete(go.id); }
    }
  }
  private attachRadioGroup(c: RadioGroup): void {
    const go: any = (c as any).gameObject;
    const game = this.gameRef(go);
    if (!go || this.radioGroupInstances.has(go.id)) return;
    c.boundCheckBoxes = [];
    const items: PixiCheckBox[] = [];
    const childNames: string[] = [];
    const tfChildren = go.transform?.children || [];
    for (const tf of tfChildren) {
      const child = tf?.gameObject;
      if (!child) continue;
      if (c.childNames && !c.childNames.includes(child.name)) continue;
      const cbWrapper: any = child.getComponent?.('CheckBox');
      if (!cbWrapper) continue;
      const inst = this.checkBoxInstances.get(child.id);
      if (!inst) continue;
      try { (inst as any).parent?.removeChild?.(inst); } catch (_) {}
      items.push(inst);
      childNames.push(child.name);
      c.boundCheckBoxes.push({ name: child.name, cb: cbWrapper });
    }
    if (items.length === 0) return;
    const typeMap: Record<string, 'horizontal' | 'vertical' | 'bidirectional'> = {
      horizontal: 'horizontal', vertical: 'vertical', bidirectional: 'bidirectional',
    };
    const initialIndex = c.selectedId ? Math.max(0, childNames.indexOf(c.selectedId)) : 0;
    const inst = new PixiRadioGroup({
      items, type: typeMap[c.direction] ?? 'vertical',
      elementsMargin: c.elementsMargin, selectedItem: initialIndex,
    });
    this.radioGroupInstances.set(go.id, inst);
    attachToGameObject(game, go, inst as any);
    const offs = bridgeSignals(inst, { go, prefix: 'radiogroup' }, {
      change: (idx: number, val: string) => {
        const childName = childNames[idx] ?? val;
        c.selectedId = childName;
        return { selectedId: c.selectedId, index: idx };
      },
    });
    this.signalCleanups.set(go.id, offs);
  }

  // ============================================================
  // Helpers
  // ============================================================
  private getInstanceMap(name: string): Map<number, any> {
    let m = this.instances.get(name);
    if (!m) { m = new Map(); this.instances.set(name, m); }
    return m;
  }

  private gameRef(go?: any): any {
    // 1) System 上的 game(由 Eva 在系统注册后注入)
    const sysGame = (this as any).game;
    if (sysGame) return sysGame;
    // 2) Fallback: GameObject 反查 game(用 Eva 的 GameObject -> scene -> game 链)
    if (go) {
      return go.game ?? go.scene?.game ?? null;
    }
    return null;
  }
}

// ============================================================
// Special inline view resolution + child collection
// ============================================================

/**
 * 4 个 wrapper 的 view ref 不放在统一 folder,需要 inline resolve 后挂 __resolved_*
 * 让 optionsBuilder 通过 c.__resolved_xxx 访问。
 *
 * - ProgressBar:bgView/fillView
 * - Select:closedView/openView
 * - Dialog:backdropView/backgroundView
 * - MaskedFrame:targetView/maskView
 */
function inlineResolveSpecialViews(name: string, c: any, game: any, go: any): void {
  switch (name) {
    case 'ProgressBar':
      c.__resolved_bg = resolveViewRef(game, go, c.bgView);
      c.__resolved_fill = resolveViewRef(game, go, c.fillView);
      break;
    case 'Select':
      c.__resolved_closedView = resolveViewRef(game, go, c.closedView);
      c.__resolved_openView = resolveViewRef(game, go, c.openView);
      break;
    case 'Dialog':
      c.__resolved_backdropView = resolveViewRef(game, go, c.backdropView);
      c.__resolved_backgroundView = resolveViewRef(game, go, c.backgroundView);
      break;
    case 'MaskedFrame':
      c.__resolved_targetView = resolveViewRef(game, go, c.targetView);
      c.__resolved_maskView = resolveViewRef(game, go, c.maskView);
      break;
  }
}

/** 验证 inline-resolved view 是否齐备(必填项不能 null) */
function validateInlineResolved(name: string, c: any): boolean {
  switch (name) {
    case 'ProgressBar':
      return !!(c.__resolved_bg && c.__resolved_fill);
    case 'Select':
      return !!(c.__resolved_closedView && c.__resolved_openView);
    case 'Dialog':
      // backgroundView 可 fallback PixiContainer,backdropView 也可 null
      return true;
    case 'MaskedFrame':
      return !!(c.__resolved_targetView && c.__resolved_maskView);
    default:
      return true;
  }
}

function collectChildContainers(game: any, go: any, childName: string): PixiContainer[] {
  const result: PixiContainer[] = [];
  const contentChild = findChildEntity(go, childName);
  if (!contentChild) return result;
  const tfChildren = contentChild.transform?.children || [];
  for (const tf of tfChildren) {
    const child = tf?.gameObject;
    if (!child) continue;
    const childContainer = getEvaContainer(game, child);
    if (childContainer) {
      try { (childContainer as any).parent?.removeChild?.(childContainer); } catch (_) {}
      result.push(childContainer as any);
    }
  }
  return result;
}

function findChildEntity(go: any, name: string): any | null {
  if (!go) return null;
  if (typeof go.findChildByName === 'function') {
    try { const c = go.findChildByName(name); if (c) return c; } catch (_) {}
  }
  const children = go.transform?.children || [];
  for (const tf of children) {
    if (tf?.gameObject?.name === name) return tf.gameObject;
  }
  return null;
}
