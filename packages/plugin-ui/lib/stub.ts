import { Component } from '@eva/eva.js';

/**
 * PluginUiStub
 *
 * Phase 0 验收专用的最简组合组件,验证整条 plugin-ui 集成链路:
 * - SINGLETON vs COMPOSITE 区分(自身在 COMPOSITE_RENDER_COMPONENTS,因此可与其它
 *   render 组件共存而不报 duplicate-render-component 错)
 * - 嵌套 isFolder + dot-path Inspector 元数据(states.hover.fill / states.pressed.scale)
 * - RuntimeEditableComponent 契约(applyDeclarativeProps + redraw)
 * - 通过 App.tsx externalRuntimeExtensions 注入 runtime
 *
 * v0.1 (MVP) 起会被 FancyButton / ProgressBar 等真实组件替换;**不要在生产 DSL 里使用**。
 */

interface InspectorFieldMetadata {
  name: string;
  type: string;
  isArray: boolean;
  isFolder?: boolean;
  step?: number;
  children?: InspectorFieldMetadata[];
}

export interface PluginUiStubStateStyle {
  fill?: string;
  scale?: number;
}

export interface PluginUiStubParams {
  enabled?: boolean;
  label?: string;
  states?: {
    hover?: PluginUiStubStateStyle;
    pressed?: PluginUiStubStateStyle;
  };
}

export default class PluginUiStub extends Component<PluginUiStubParams> {
  static override componentName = 'PluginUiStub';

  enabled = true;
  label = '';
  states: PluginUiStubParams['states'] = { hover: {}, pressed: {} };

  /** 运行时私有状态(不应被 Inspector 编辑;hot-sync 时必须保留) */
  private _appliedCount = 0;
  private _redrawCount = 0;

  static getInspectorMetadata(): InspectorFieldMetadata {
    const stateFields: InspectorFieldMetadata[] = [
      { name: 'fill', type: 'color', isArray: false },
      { name: 'scale', type: 'number', isArray: false, step: 0.05 },
    ];
    return {
      name: PluginUiStub.componentName,
      type: 'object',
      isArray: false,
      isFolder: true,
      children: [
        { name: 'enabled', type: 'boolean', isArray: false },
        { name: 'label', type: 'string', isArray: false },
        {
          name: 'states',
          type: 'object',
          isArray: false,
          isFolder: true,
          children: [
            { name: 'hover', type: 'object', isArray: false, isFolder: true, children: stateFields },
            { name: 'pressed', type: 'object', isArray: false, isFolder: true, children: stateFields },
          ],
        },
      ],
    };
  }

  override init(params?: PluginUiStubParams) {
    if (!params) return;
    if (typeof params.enabled === 'boolean') this.enabled = params.enabled;
    if (typeof params.label === 'string') this.label = params.label;
    if (params.states) this.states = { hover: { ...params.states.hover }, pressed: { ...params.states.pressed } };
  }

  /** RuntimeEditableComponent contract:幂等同步声明性 props,保留运行时计数 */
  applyDeclarativeProps(next: PluginUiStubParams, _prev?: PluginUiStubParams): void {
    this.init(next);
    this._appliedCount += 1;
  }

  redraw(): void {
    this._redrawCount += 1;
  }

  /** 调试用:获取应用次数,验证 hot-sync 路径走通 */
  getAppliedCount(): number {
    return this._appliedCount;
  }

  getRedrawCount(): number {
    return this._redrawCount;
  }
}
