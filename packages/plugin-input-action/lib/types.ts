/** 输入源 */
export type InputSource =
  | { type: 'key'; code: string } // 例如 "Space" / "ArrowLeft"
  | { type: 'mouse'; button?: number } // 0=left
  | { type: 'touch' } // 任意触屏按下
  | { type: 'click' }; // 任意点击(touch+mouse 合并)

/** action 配置 */
export interface ActionBinding {
  /** action 名称,emit 信号时使用 (例如 "fire" / "jump") */
  action: string;
  /** 至少一个输入源触发 */
  sources: InputSource[];
  /** 触发哪些信号 (默认 emit `input:{action}`) */
  pressSignal?: string;
  releaseSignal?: string;
  holdSignal?: string;
}

export interface InputActionMapParams {
  bindings?: ActionBinding[];
  /** 监听的根元素;不传走 document */
  rootSelector?: string;
}
