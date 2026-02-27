import { GLHook } from './GLHook';
import { TextureHook } from './TextureHook';
/**
 * 基础 Hooks 类
 *
 * BaseHooks 用于监控 WebGL 的性能指标。
 * 通过 hook WebGL 的底层方法，收集绘制调用次数、纹理数量等统计信息。
 * 适用于性能分析和优化场景。
 *
 * @example
 * ```typescript
 * const hooks = new BaseHooks();
 * hooks.attach(gl); // gl 是 WebGL 上下文
 *
 * // 每帧获取统计信息
 * console.log('Draw Calls:', hooks.drawCalls);
 * console.log('Textures:', hooks.texturesCount);
 *
 * // 重置统计
 * hooks.reset();
 * ```
 */
export class BaseHooks {
  /** 上一次的绘制调用次数 */
  protected _drawCalls: number = -1;

  /** 最大增量绘制调用次数 */
  protected _maxDeltaDrawCalls: number = -1;

  /** GL Hook 实例 */
  protected glhook?: GLHook;

  /** 纹理 Hook 实例 */
  protected texturehook?: TextureHook;

  constructor() {}

  /**
   * 附加 Hook 到 WebGL 上下文
   *
   * 拦截 WebGL 的绘制和纹理相关方法，开始收集统计信息。
   *
   * @param gl - WebGL 渲染上下文
   */
  public attach(gl: any) {
    this.glhook = new GLHook(gl);
    this.texturehook = new TextureHook(gl);
  }

  public get drawCalls(): number {
    if (this.glhook && this.glhook.isInit) {
      return this.glhook.drawPasses;
    }
    return -1;
  }

  public get maxDeltaDrawCalls() {
    return this._maxDeltaDrawCalls;
  }

  public get deltaDrawCalls(): number {
    if (this._drawCalls == -1) {
      this._drawCalls = this.drawCalls;
      return 0;
    }

    var dc: number = this.drawCalls;
    var delta: number = dc - this._drawCalls;
    this._drawCalls = dc;

    this._maxDeltaDrawCalls = Math.max(this._maxDeltaDrawCalls, delta);
    return delta;
  }

  public get maxTextureCount(): number {
    if (this.texturehook && this.texturehook.isInit) return this.texturehook.maxTexturesCount;
    return 0;
  }

  public get texturesCount(): number {
    if (this.texturehook && this.texturehook.isInit) return this.texturehook.currentTextureCount;

    return 0;
  }
  public reset(): void {
    this._maxDeltaDrawCalls = -1;
    this._drawCalls = -1;

    if (this.glhook) this.glhook.reset();
    if (this.texturehook) this.texturehook.reset();
  }

  public release(): void {
    if (this.glhook) this.glhook.release();
    if (this.texturehook) this.texturehook.release();
  }
}
