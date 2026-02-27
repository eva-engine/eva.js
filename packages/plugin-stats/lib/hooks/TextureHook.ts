/**
 * WebGL 纹理 Hook 类
 *
 * TextureHook 通过拦截 WebGL 的纹理创建和删除方法，
 * 统计当前活跃的纹理数量和历史最大纹理数量。
 * 纹理数量直接影响显存占用和渲染性能。
 *
 * @example
 * ```typescript
 * const textureHook = new TextureHook(gl);
 * console.log('Current Textures:', textureHook.currentTextureCount);
 * console.log('Max Textures:', textureHook.maxTexturesCount);
 * textureHook.reset(); // 重置统计
 * textureHook.release(); // 移除 Hook
 * ```
 */
export class TextureHook {
  /** 当前创建的纹理列表 */
  public createdTextures: Array<any> = new Array<any>();

  /** 历史最大纹理数量 */
  public maxTexturesCount: number = 0;

  /** 是否已初始化 Hook */
  public isInit: boolean = false;

  /** 原始的 createTexture 方法 */
  private realGLCreateTexture: Function = function () {};

  /** 原始的 deleteTexture 方法 */
  private realGLDeleteTexture: Function = function () {};

  /** WebGL 上下文引用 */
  private gl: any;

  /**
   * 构造纹理 Hook
   * @param _gl - WebGL 渲染上下文
   */
  constructor(_gl?: any) {
    if (_gl) {
      if (_gl.__proto__.createTexture) {
        this.gl = _gl;
        this.realGLCreateTexture = _gl.__proto__.createTexture;
        this.realGLDeleteTexture = _gl.__proto__.deleteTexture;

        //replace to new function
        _gl.__proto__.createTexture = this.fakeGLCreateTexture(this);
        _gl.__proto__.deleteTexture = this.fakeGLDeleteTexture(this);

        this.isInit = true;

        // console.log('[TextureHook] GL was Hooked!');
      }
    } else {
      console.error("[TextureHook] GL can't be NULL");
    }
  }

  public get currentTextureCount(): number {
    return this.createdTextures.length;
  }

  public registerTexture(texture: any): void {
    this.createdTextures.push(texture); // ++;
    this.maxTexturesCount = Math.max(this.createdTextures.length, this.maxTexturesCount);
  }

  private fakeGLCreateTexture(context): any {
    return function () {
      var texture = context.realGLCreateTexture.call(this);
      context.registerTexture(texture);
      return texture;
    };
  }

  private fakeGLDeleteTexture(context): any {
    return function (texture: any): void {
      var index: number = context.createdTextures.indexOf(texture);
      if (index > -1) {
        context.createdTextures.splice(index, 1);
      }
      context.realGLDeleteTexture.call(this, texture);
    };
  }
  public reset(): void {
    this.createdTextures = new Array<any>();
    this.maxTexturesCount = 0;
  }
  public release(): void {
    if (this.isInit) {
      this.gl.__proto__.createTexture = this.realGLCreateTexture;
      this.gl.__proto__.deleteTexture = this.realGLDeleteTexture;

      console.log('[TextureHook] Hook was removed!');
    }

    this.isInit = false;
  }
}
