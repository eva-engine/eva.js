import { GLHook } from './GLHook';
import { TextureHook } from './TextureHook';
export class BaseHooks {
  protected _drawCalls: number = -1;
  protected _maxDeltaDrawCalls: number = -1;
  protected glhook?: GLHook;
  protected texturehook?: TextureHook;

  constructor() {}

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
