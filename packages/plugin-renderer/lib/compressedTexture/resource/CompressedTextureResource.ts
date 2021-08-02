import { INTERNAL_FORMATS } from "../const"
/**
 * @ignore
 */
// Used in PIXI.KTXLoader
export type CompressedLevelBuffer = {
  levelID: number,
  levelWidth: number,
  levelHeight: number,
  levelBuffer: Uint8Array
};
export class CompressedTextureResource {
  width: number
  height: number
  complete: boolean
  src: string
  internalFormat: number
  levelBuffers: CompressedLevelBuffer[]
  levels: number
  upload(gl: WebGLRenderingContext) {
    const { levels } = this;
    var offset = 0;
    // Loop through each mip level of COMPRESSED texture data provided and upload it to the given texture.
    for (var i = 0; i < this.levels; ++i) {
      let { levelWidth, levelHeight, levelBuffer } = this.levelBuffers[i];
      gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, levelWidth, levelHeight, 0, levelBuffer);
      offset += levelBuffer.byteLength;
    }

    // We can't use gl.generateMipmaps with COMPRESSED textures, so only use
    // mipmapped filtering if the COMPRESSED texture data contained mip levels.
    if (levels > 1) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    }
    else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    // Cleaning the data to save memory. NOTE : BECAUSE OF THIS WE CANNOT CREATE TWO GL TEXTURE FROM THE SAME COMPRESSED IMAGE !
    // if (!this.preserveSource)
    //   this.data = null;
  }
}
// Calcualates the size of a COMPRESSED texture level in bytes
function textureLevelSize(format, width, height) {
  switch (format) {
    case INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT:
    case INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL:
    case INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL:
      return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

    case INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT:
    case INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT:
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
      return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;

    case INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG:
    case INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG:
      return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);

    case INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG:
    case INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG:
      return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);

    //ASTC formats, https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:
      return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_5x4_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:
      return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_5x5_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:
      return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_6x5_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:
      return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_6x6_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:
      return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x5_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:
      return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x6_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:
      return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x8_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:
      return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x5_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:
      return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x6_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:
      return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x8_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:
      return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x10_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:
      return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_12x10_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:
      return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
    case INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_12x12_KHR:
    case INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:
      return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;

    default:
      return 0;
  }
}