/**
 * RadioGroup — 独立保留(不进入 components.ts factory)。
 *
 * 不能塌缩的原因:
 *   1. boundCheckBoxes 是 runtime collection,System 在 ADD 阶段 queueMicrotask 后填充
 *   2. applySelection() 反向遍历同步 child CheckBox.checked,跨实体协调
 *   3. system.ts handleRadioGroup 必须从 checkBoxInstances map 捞已构造的 PixiCheckBox 实例
 */

import { Component } from '@eva/eva.js';

interface InspectorFieldMetadata {
  name: string; type: string; isArray: boolean;
  children?: InspectorFieldMetadata[]; isFolder?: boolean; step?: number;
}

export interface RadioGroupParams {
  selectedId?: string;
  childNames?: string[];
  direction?: 'horizontal' | 'vertical' | 'bidirectional';
  elementsMargin?: number;
}

export default class RadioGroup extends Component<RadioGroupParams> {
  static override componentName = 'RadioGroup';
  componentName?: string = 'RadioGroup';

  selectedId: string | undefined;
  childNames: string[] | undefined;
  direction: 'horizontal' | 'vertical' | 'bidirectional' = 'vertical';
  elementsMargin = 4;

  /** runtime: 已绑定的子 CheckBox(System 填充) */
  boundCheckBoxes: { name: string; cb: any }[] = [];

  static getInspectorMetadata(): InspectorFieldMetadata {
    return {
      name: RadioGroup.componentName, type: 'object', isArray: false, isFolder: true,
      children: [
        { name: 'selectedId', type: 'string', isArray: false },
        { name: 'direction', type: 'string', isArray: false },
        { name: 'elementsMargin', type: 'number', isArray: false },
        { name: 'childNames', type: 'string', isArray: true },
      ],
    };
  }

  override init(p?: RadioGroupParams) { if (p) this.applyParams(p); }
  applyDeclarativeProps(next: RadioGroupParams, _prev?: RadioGroupParams): void { this.applyParams(next); }

  applySelection(): void {
    for (const { name, cb } of this.boundCheckBoxes) {
      const isSelected = name === this.selectedId;
      if (cb.checked !== isSelected) cb.checked = isSelected;
    }
  }

  private applyParams(p: RadioGroupParams): void {
    if (typeof p.selectedId === 'string') this.selectedId = p.selectedId;
    if (Array.isArray(p.childNames)) this.childNames = p.childNames.slice();
    if (p.direction) this.direction = p.direction;
    if (typeof p.elementsMargin === 'number') this.elementsMargin = p.elementsMargin;
  }
}
