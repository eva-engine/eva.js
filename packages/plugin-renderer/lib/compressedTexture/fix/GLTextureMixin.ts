/**
 * Inspired by pixi-compressed-texture
 * @link https://github.com/pixijs/pixi-compressed-textures/tree/v4.x
 */
import { glCore } from "pixi.js";
import { CompressedTextureResource } from "../resource/CompressedTextureResource";
const GLTexture = glCore.GLTexture;
export const GLTextureMixin = {
  isCompressed: false,

  uploadNotCompressed: GLTexture.prototype.upload,

  upload: function (source) {
    if (!(source instanceof CompressedTextureResource)) {
      return this.uploadNotCompressed(source);
    }
    this.bind();
    var gl = this.gl as WebGLRenderingContext;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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