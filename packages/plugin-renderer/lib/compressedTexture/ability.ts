/**
 * Inspired by PixiJS v6
 */
import { INTERNAL_FORMATS } from "./const";
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
let res = undefined;
type Abilities = {
  extensions: Partial<CompressedTextureExtensions>,
  textureFormats: { [key in keyof typeof INTERNAL_FORMATS]: number },
  formats: number[]
}
export function getAbilities(): Abilities {
  if (res) return res;
  // Auto-detect WebGL compressed-texture extensions
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    // #if _DEBUG
    console.warn('WebGL not available for compressed textures. Silently failing.');
    // #endif

    return;
  }

  const extensions = {
    s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
    s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), /* eslint-disable-line camelcase */
    etc: gl.getExtension('WEBGL_compressed_texture_etc'),
    etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
    pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
      || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
    atc: gl.getExtension('WEBGL_compressed_texture_atc'),
    astc: gl.getExtension('WEBGL_compressed_texture_astc')
  };

  const textureFormats = {};

  // Assign all available compressed-texture formats
  for (const extensionName in extensions) {
    const extension = extensions[extensionName as keyof typeof extensions];

    if (!extension) {
      continue;
    }

    Object.assign(
      textureFormats,
      Object.getPrototypeOf(extension));
  }
  let formats = Object.values(textureFormats);
  res = {
    extensions,
    textureFormats,
    formats
  }
  return res;
}