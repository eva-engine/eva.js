export class TextureHook {
  public createdTextures: Array<any> = new Array<any>();
  public maxTexturesCount: number = 0;

  public isInit: boolean = false;
  private realGLCreateTexture: Function = function () { };
  private realGLDeleteTexture: Function = function () { };

  private gl: any;

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
    }
  }

  private fakeGLDeleteTexture(context): any {
    return function (texture: any): void {
      var index: number = context.createdTextures.indexOf(texture);
      if (index > -1) {
        context.createdTextures.splice(index, 1);
      }
      context.realGLDeleteTexture.call(this, texture);
    }
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
