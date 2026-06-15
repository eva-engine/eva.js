import { Component } from '@eva/eva.js';

interface InspectorFieldMetadata {
  name: string;
  type: string;
  isArray: boolean;
  children?: InspectorFieldMetadata[];
  isFolder?: boolean;
  step?: number;
}

/** 状态枚举 — 5 态(Inspector 上呈 dropdown) */
export type FancyButtonState = 'default' | 'hover' | 'pressed' | 'disabled' | 'selected';

/** 单个状态的视觉变体 — 应用到 sibling/child 实体 */
export interface FancyButtonStateStyle {
  /** 整体 Render.alpha */
  alpha?: number;
  /** 整体 Transform.scale (统一缩放,简化用法) */
  scale?: number;
  /** 应用到 background child 的 tint(色调染色) */
  backgroundTint?: string;
  /** 应用到 label child 的 tint */
  labelTint?: string;
  /** 应用到 background child 的 fill(覆盖 Img/UI) */
  backgroundFill?: string;
}

export interface FancyButtonParams {
  /** 是否启用,disabled 状态下不响应 Event */
  enabled?: boolean;
  /** 当前状态 — 编辑器中可作为预览;runtime 由 Event 触发自动切换 */
  state?: FancyButtonState;
  /** 是否当前选中(用于 RadioGroup / Toggle 样式) */
  selected?: boolean;
  /** label child 实体名(可空) */
  labelChildName?: string;
  /** background child 实体名(可空) */
  backgroundChildName?: string;
  /** icon child 实体名(可空) */
  iconChildName?: string;
  /** 各状态样式表 — undefined 状态走 default + 衍生 */
  states?: {
    default?: FancyButtonStateStyle;
    hover?: FancyButtonStateStyle;
    pressed?: FancyButtonStateStyle;
    disabled?: FancyButtonStateStyle;
    selected?: FancyButtonStateStyle;
  };
}

const DEFAULT_STATE_STYLE: Record<FancyButtonState, FancyButtonStateStyle> = {
  default: { alpha: 1, scale: 1 },
  hover: { alpha: 1, scale: 1.02 },
  pressed: { alpha: 0.95, scale: 0.96 },
  disabled: { alpha: 0.4, scale: 1 },
  selected: { alpha: 1, scale: 1 },
};

/**
 * FancyButton — 复合按钮
 *
 * 职责:维护 enabled / state / selected 三态,并把对应 state 样式应用到 sibling background /
 * label / icon child 实体。视觉子节点必须在 DSL 显式声明为 child entity(由名字引用),
 * **绝不**在 awake 内 createInternal —— 那样 Editor 层级树看不到子项,选中/移动/复制全失效。
 *
 * 与 Eva 现有插件协作:
 * - 命中检测 / pointer 事件:挂同 entity 的 `Event` 组件(`@eva/plugin-renderer-event`)
 * - 视觉子项:`background` = `NinePatch`/`Img`/`UI`,`label` = `Text`,`icon` = `Img`
 * - 缩放 tween:可挂 `Transition` 组件(`@eva/plugin-transition`),由本组件改 transform.scale
 *   后由 Transition 接管;不挂也能用,只是切换没插值
 *
 * 状态切换路径:
 * - 编辑器:Inspector 改 `state` 字段(transient,不持久化到 DSL),applyDeclarativeProps 即时刷
 * - 运行时:Event 派 'tap'/'touchstart'/'touchend' 等,FancyButtonSystem 听并改 component.state
 */
export default class FancyButton extends Component<FancyButtonParams> implements FancyButtonRuntime {
  static override componentName = 'FancyButton';

  enabled = true;
  state: FancyButtonState = 'default';
  selected = false;
  labelChildName = 'label';
  backgroundChildName = 'background';
  iconChildName = 'icon';
  states: NonNullable<FancyButtonParams['states']> = {};

  /** 运行时私有:上次应用过的状态(用于幂等避免重复 apply) */
  private _lastAppliedState: FancyButtonState | null = null;
  /** 运行时私有:hover/press 计数 */
  private _hoverCount = 0;
  private _pressCount = 0;

  static getInspectorMetadata(): InspectorFieldMetadata {
    const stateFields: InspectorFieldMetadata[] = [
      { name: 'alpha', type: 'number', isArray: false, step: 0.05 },
      { name: 'scale', type: 'number', isArray: false, step: 0.05 },
      { name: 'backgroundTint', type: 'color', isArray: false },
      { name: 'labelTint', type: 'color', isArray: false },
      { name: 'backgroundFill', type: 'color', isArray: false },
    ];
    return {
      name: FancyButton.componentName,
      type: 'object',
      isArray: false,
      isFolder: true,
      children: [
        { name: 'enabled', type: 'boolean', isArray: false },
        { name: 'state', type: 'string', isArray: false },
        { name: 'selected', type: 'boolean', isArray: false },
        { name: 'backgroundChildName', type: 'string', isArray: false },
        { name: 'labelChildName', type: 'string', isArray: false },
        { name: 'iconChildName', type: 'string', isArray: false },
        {
          name: 'states',
          type: 'object',
          isArray: false,
          isFolder: true,
          children: [
            { name: 'default', type: 'object', isArray: false, isFolder: true, children: stateFields },
            { name: 'hover', type: 'object', isArray: false, isFolder: true, children: stateFields },
            { name: 'pressed', type: 'object', isArray: false, isFolder: true, children: stateFields },
            { name: 'disabled', type: 'object', isArray: false, isFolder: true, children: stateFields },
            { name: 'selected', type: 'object', isArray: false, isFolder: true, children: stateFields },
          ],
        },
      ],
    };
  }

  override init(params?: FancyButtonParams) {
    if (!params) return;
    this.applyParams(params);
  }

  override awake() {
    this.applyState(this.computeEffectiveState(), /* force */ true);
  }

  override start() {
    this.applyState(this.computeEffectiveState(), /* force */ false);
  }

  applyDeclarativeProps(next: FancyButtonParams, _prev?: FancyButtonParams): void {
    this.applyParams(next);
    this.applyState(this.computeEffectiveState(), /* force */ true);
  }

  private applyParams(params: FancyButtonParams): void {
    if (typeof params.enabled === 'boolean') this.enabled = params.enabled;
    if (typeof params.state === 'string') this.state = params.state as FancyButtonState;
    if (typeof params.selected === 'boolean') this.selected = params.selected;
    if (typeof params.labelChildName === 'string') this.labelChildName = params.labelChildName;
    if (typeof params.backgroundChildName === 'string') this.backgroundChildName = params.backgroundChildName;
    if (typeof params.iconChildName === 'string') this.iconChildName = params.iconChildName;
    if (params.states) this.states = { ...this.states, ...params.states };
  }

  /** 根据 enabled / selected / state 决定生效状态 */
  computeEffectiveState(): FancyButtonState {
    if (!this.enabled) return 'disabled';
    if (this.state === 'pressed' || this.state === 'hover') return this.state;
    if (this.selected) return 'selected';
    return this.state;
  }

  /** 由 Event 系统调用切换 state */
  setState(next: FancyButtonState, source: 'editor' | 'runtime' = 'runtime'): void {
    if (next === 'hover') this._hoverCount += 1;
    if (next === 'pressed') this._pressCount += 1;
    this.state = next;
    this.applyState(this.computeEffectiveState(), /* force */ source === 'editor');
  }

  /** 把当前 state 对应的样式应用到 sibling/child 实体 */
  applyState(effective: FancyButtonState, force: boolean): void {
    if (!force && this._lastAppliedState === effective) return;
    this._lastAppliedState = effective;
    if (!this.gameObject) return;

    const merged: FancyButtonStateStyle = {
      ...DEFAULT_STATE_STYLE[effective],
      ...(this.states[effective] ?? {}),
    };

    // 整体 alpha 通过 Render 组件(若有)控制;没有 Render 则降级用 Transform.alpha
    const renderComp: any = this.gameObject.getComponent?.('Render');
    if (renderComp && typeof merged.alpha === 'number') renderComp.alpha = merged.alpha;
    const tf: any = this.gameObject.transform as any;
    if (tf && typeof merged.scale === 'number') {
      if (tf.scale) {
        tf.scale.x = merged.scale;
        tf.scale.y = merged.scale;
      }
    }

    // 子实体染色 / 填充
    this.applyChildTint(this.backgroundChildName, merged.backgroundTint, merged.backgroundFill);
    this.applyChildTint(this.labelChildName, merged.labelTint, undefined);
  }

  private applyChildTint(childName: string, tint: string | undefined, fill: string | undefined): void {
    const child = this.findChild(childName);
    if (!child) return;
    // Render.tint 优先(支持所有渲染组件);否则 Img/Sprite 自身的 tint
    const renderComp: any = child.getComponent?.('Render');
    if (renderComp && tint) renderComp.tint = tint;

    if (fill) {
      // UI 组件:批量改 shapes[].style.fill 然后 redraw
      const ui: any = child.getComponent?.('UI');
      if (ui && Array.isArray(ui.shapes)) {
        for (const shape of ui.shapes) {
          if (shape?.style) shape.style.fill = fill;
        }
        if (typeof ui.redraw === 'function') ui.redraw();
      }
    }
  }

  private findChild(name: string): any | null {
    const go: any = this.gameObject;
    if (!go) return null;
    if (typeof go.findChildByName === 'function') {
      try {
        const c = go.findChildByName(name);
        if (c) return c;
      } catch (_) {}
    }
    if (Array.isArray(go.transform?.children)) {
      for (const tf of go.transform.children) {
        if (tf?.gameObject?.name === name) return tf.gameObject;
      }
    }
    return null;
  }

  /** 调试:状态计数,验证 hot-sync 不破坏 runtime state */
  getHoverCount(): number {
    return this._hoverCount;
  }
  getPressCount(): number {
    return this._pressCount;
  }
}

/** 接口标记:实现 RuntimeEditableComponent 契约(applyDeclarativeProps + redraw 派生) */
export interface FancyButtonRuntime {
  applyDeclarativeProps(next: FancyButtonParams, prev?: FancyButtonParams): void;
}
