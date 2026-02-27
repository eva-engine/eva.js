/**
 * WebGL 绘制调用 Hook 类
 *
 * GLHook 通过拦截 WebGL 的 drawElements 方法，
 * 统计每帧的绘制调用次数（Draw Calls）。
 * 绘制调用次数是衡量渲染性能的重要指标。
 *
 * @example
 * ```typescript
 * const glHook = new GLHook(gl);
 * console.log('Draw Passes:', glHook.drawPasses);
 * glHook.reset(); // 重置计数
 * glHook.release(); // 移除 Hook
 * ```
 */
export class GLHook {
  /** 绘制调用次数 */
  public drawPasses: number = 0;

  /** 是否已初始化 Hook */
  public isInit: boolean = false;

  /** 原始的 drawElements 方法 */
  private realGLDrawElements: Function = function () {};

  /** WebGL 上下文引用 */
  private gl: any;

  /**
   * 构造 GL Hook
   * @param _gl - WebGL 渲染上下文
   */
  constructor(_gl?: any) {
    if (_gl) {
      if (_gl.__proto__.drawElements) {
        this.gl = _gl;
        this.realGLDrawElements = _gl.__proto__.drawElements;

        //replace to new function
        _gl.__proto__.drawElements = this.fakeGLdrawElements(this);
        this.isInit = true;

        // console.log("[GLHook] GL was Hooked!");
      }
    } else {
      console.error("[GLHook] GL can't be NULL");
    }
  }

  private fakeGLdrawElements(context): any {
    return function (mode: any, count: any, type: any, offset: any): void {
      context.drawPasses++;
      context.realGLDrawElements.call(this, mode, count, type, offset);
    };
  }
  public reset(): void {
    this.drawPasses = 0;
  }

  public release(): void {
    if (this.isInit) {
      this.gl.__proto__.drawElements = this.realGLDrawElements;
      // console.log("[GLHook] Hook was removed!");
    }

    this.isInit = false;
  }
}
