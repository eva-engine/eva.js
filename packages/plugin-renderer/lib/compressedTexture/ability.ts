/**
 * Inspired by PixiJS v6
 */
export type CompressedTextureExtensions = {
  s3tc?: WEBGL_compressed_texture_s3tc,
  s3tc_sRGB: WEBGL_compressed_texture_s3tc_srgb,
  etc: WEBGL_compressed_texture_etc,
  etc1: WEBGL_compressed_texture_etc1,
  pvrtc: WEBKIT_WEBGL_compressed_texture_pvrtc,
  atc: WEBGL_compressed_texture_atc,
  astc: WEBGL_compressed_texture_astc
};
export type CompressedTextureExtensionRef = keyof CompressedTextureExtensions;
let result = undefined;
export interface SuportedCompressedTexture {
  s3tc: boolean,
  etc: boolean,
  etc1: boolean,
  pvrtc: boolean,
  atc: boolean,
  astc: boolean,
}
export function getSuportCompressedTextureFormats(gl: WebGLRenderingContext): SuportedCompressedTexture {
  if (result) return result;

  if (!gl) {
    // #if _DEBUG
    console.warn('WebGL not available for compressed textures. Silently failing.');
    // #endif

    return {
      s3tc: false,
      etc: false,
      etc1: false,
      pvrtc: false,
      atc: false,
      astc: false,
    };
  }

  result = {
    s3tc: !!gl.getExtension('WEBGL_compressed_texture_s3tc'),
    etc: !!gl.getExtension('WEBGL_compressed_texture_etc'),
    etc1: !!gl.getExtension('WEBGL_compressed_texture_etc1'),
    pvrtc: !!gl.getExtension('WEBGL_compressed_texture_pvrtc')
      || !!gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
    atc: !!gl.getExtension('WEBGL_compressed_texture_atc'),
    astc: !!gl.getExtension('WEBGL_compressed_texture_astc')
  };

  try {
    console.log('Eva.js Supported Compressed Texture Format List: ' + Object.keys(result).filter((type) => result[type]).join(', '))
  } catch (e) { }
  return result;
}