import { Component, decorators } from '@eva/eva.js';
import { getSignalBus } from '@eva/plugin-signal-bus';
import type { InputActionMapParams, ActionBinding } from './types';

interface ActionState {
  binding: ActionBinding;
  pressed: boolean;
}

/**
 * InputActionMap 组件 — 把原始 input 抽象成语义化 action 并 emit 信号。
 *
 * DSL 用法:
 * ```json
 * {
 *   "type": "InputActionMap",
 *   "props": {
 *     "bindings": [
 *       { "action": "fire", "sources": [{ "type": "click" }, { "type": "key", "code": "Space" }] },
 *       { "action": "left", "sources": [{ "type": "key", "code": "ArrowLeft" }] }
 *     ]
 *   }
 * }
 * ```
 *
 * 信号:
 * - 默认 emit `input:fire:press` / `input:fire:release` / `input:fire:hold`(每帧)
 * - 可在 binding 显式指定 pressSignal / releaseSignal / holdSignal 覆盖
 *
 * 设计原则:Component 不直接修改游戏状态,只 emit 语义化信号。
 */
@decorators.componentObserver({})
export class InputActionMap extends Component<InputActionMapParams> {
  static componentName = 'InputActionMap';

  private bindings: ActionBinding[] = [];
  private states = new Map<string, ActionState>();
  private root?: HTMLElement | Document;
  // 注意:不能命名 `listeners`,会与 EventEmitter 基类的 listeners(event) 方法签名冲突
  private domListeners: Array<() => void> = [];
  private pressedKeys = new Set<string>();
  private pressedButtons = new Set<number>();
  private touchActive = false;

  init(params?: InputActionMapParams) {
    if (!params) return;
    this.bindings = params.bindings ?? [];
    for (const b of this.bindings) {
      this.states.set(b.action, { binding: b, pressed: false });
    }
    if (typeof document === 'undefined') return;
    this.root = params.rootSelector
      ? (document.querySelector(params.rootSelector) as HTMLElement) || document
      : document;
    this.bind();
  }

  private bind() {
    if (!this.root) return;
    const onKD = (e: KeyboardEvent) => {
      if (e.repeat) return;
      this.pressedKeys.add(e.code);
      this.evaluate('press', { type: 'key', code: e.code });
    };
    const onKU = (e: KeyboardEvent) => {
      this.pressedKeys.delete(e.code);
      this.evaluate('release', { type: 'key', code: e.code });
    };
    const onMD = (e: MouseEvent) => {
      this.pressedButtons.add(e.button);
      this.evaluate('press', { type: 'mouse', button: e.button });
      this.evaluate('press', { type: 'click' });
    };
    const onMU = (e: MouseEvent) => {
      this.pressedButtons.delete(e.button);
      this.evaluate('release', { type: 'mouse', button: e.button });
      this.evaluate('release', { type: 'click' });
    };
    const onTS = () => {
      this.touchActive = true;
      this.evaluate('press', { type: 'touch' });
      this.evaluate('press', { type: 'click' });
    };
    const onTE = () => {
      this.touchActive = false;
      this.evaluate('release', { type: 'touch' });
      this.evaluate('release', { type: 'click' });
    };
    const r = this.root as any;
    r.addEventListener('keydown', onKD);
    r.addEventListener('keyup', onKU);
    r.addEventListener('mousedown', onMD);
    r.addEventListener('mouseup', onMU);
    r.addEventListener('touchstart', onTS);
    r.addEventListener('touchend', onTE);
    this.domListeners = [
      () => r.removeEventListener('keydown', onKD),
      () => r.removeEventListener('keyup', onKU),
      () => r.removeEventListener('mousedown', onMD),
      () => r.removeEventListener('mouseup', onMU),
      () => r.removeEventListener('touchstart', onTS),
      () => r.removeEventListener('touchend', onTE),
    ];
  }

  private evaluate(phase: 'press' | 'release', src: any) {
    const bus = getSignalBus();
    for (const [name, state] of this.states) {
      if (!state.binding.sources.some((s) => this.sourceMatches(s, src))) continue;
      if (phase === 'press' && !state.pressed) {
        state.pressed = true;
        const sig = state.binding.pressSignal ?? `input:${name}:press`;
        bus.emit(sig, { action: name });
      } else if (phase === 'release' && state.pressed) {
        // 检查是否所有源都已 release
        if (this.anySourceActive(state.binding)) continue;
        state.pressed = false;
        const sig = state.binding.releaseSignal ?? `input:${name}:release`;
        bus.emit(sig, { action: name });
      }
    }
  }

  private sourceMatches(s: any, e: any): boolean {
    if (s.type !== e.type) return false;
    if (s.type === 'key') return s.code === e.code;
    if (s.type === 'mouse') return s.button == null || s.button === e.button;
    return true;
  }

  private anySourceActive(b: ActionBinding): boolean {
    for (const s of b.sources) {
      if (s.type === 'key' && this.pressedKeys.has(s.code)) return true;
      if (s.type === 'mouse' && (s.button == null || this.pressedButtons.has(s.button))) return true;
      if (s.type === 'touch' && this.touchActive) return true;
      if (s.type === 'click' && (this.touchActive || this.pressedButtons.size > 0)) return true;
    }
    return false;
  }

  /** 每帧 emit hold 信号,允许移动型 action 用 update 读 */
  update() {
    const bus = getSignalBus();
    for (const [name, state] of this.states) {
      if (!state.pressed) continue;
      const sig = state.binding.holdSignal ?? `input:${name}:hold`;
      bus.emit(sig, { action: name });
    }
  }

  /** 查询某 action 当前是否按下(给非信号场景用) */
  isPressed(action: string): boolean {
    return !!this.states.get(action)?.pressed;
  }

  onDestroy() {
    for (const off of this.domListeners) off();
    this.domListeners = [];
    this.states.clear();
    this.pressedKeys.clear();
    this.pressedButtons.clear();
  }
}
