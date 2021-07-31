import { glCore } from "pixi.js";
import { CompressedTextureResource } from "../resource/CompressedTextureResource";
const GLTexture = glCore.GLTexture;
export const GLTextureMixin = {
  uploadNotCompressed: GLTexture.prototype.upload,
  isCompressed: false,
  upload: function (source) {
    if (!(source instanceof CompressedTextureResource)) {
      return this.uploadNotCompressed(source);
    }
    this.bind();

    var gl = this.gl;

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

    this.isCompressed = true;

    source.upload(gl);
  },

  enableMipmap: function () {
    if (this.isCompressed) {
      return;
    }
    var gl = this.gl;

    this.bind();

    this.mipmap = true;

    gl.generateMipmap(gl.TEXTURE_2D);
  }
};