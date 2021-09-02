/**
 * Inspired by PixiJS v6
 */

import { INTERNAL_FORMAT_TO_BLOCK_SIZE } from "../const";
import type { CompressedLevelBuffer } from "./CompressedTextureResource";
import { CompressedTextureResource } from "./CompressedTextureResource";

export interface KTXResource {
  width: number,
  height: number,
  src: string,
  complete: string,
  data: ArrayBuffer
}

/**
 * Byte size of the file header fields in {@code KTX_FIELDS}
 *
 * @ignore
 */
const FILE_HEADER_SIZE = 64;
/**
 * Byte offsets of the KTX file header fields
 *
 * @ignore
 */
const KTX_FIELDS = {
  FILE_IDENTIFIER: 0,
  ENDIANNESS: 12,
  GL_TYPE: 16,
  GL_TYPE_SIZE: 20,
  GL_FORMAT: 24,
  GL_INTERNAL_FORMAT: 28,
  GL_BASE_INTERNAL_FORMAT: 32,
  PIXEL_WIDTH: 36,
  PIXEL_HEIGHT: 40,
  PIXEL_DEPTH: 44,
  NUMBER_OF_ARRAY_ELEMENTS: 48,
  NUMBER_OF_FACES: 52,
  NUMBER_OF_MIPMAP_LEVELS: 56,
  BYTES_OF_KEY_VALUE_DATA: 60
};
/**
 * The 12-byte KTX file identifier
 *
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.1
 * @ignore
 */
const FILE_IDENTIFIER = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];
/**
 * The value stored in the "endianness" field.
 *
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.2
 * @ignore
 */
const ENDIANNESS = 0x04030201;
export class KTXTextureResource extends CompressedTextureResource {
  complete = true
  constructor(source: ArrayBuffer, public src: string) {
    super();
    const dataView = new DataView(source);
    if (!validateKTX(dataView)) {
      throw new Error('Not a valid KTX Texture');
    }
    const littleEndian = dataView.getUint32(KTX_FIELDS.ENDIANNESS, true) === ENDIANNESS;
    // const glType = dataView.getUint32(KTX_FIELDS.GL_TYPE, littleEndian);
    // const glTypeSize = dataView.getUint32(KTX_FIELDS.GL_TYPE_SIZE, littleEndian);
    // const glFormat = dataView.getUint32(KTX_FIELDS.GL_FORMAT, littleEndian);
    this.internalFormat = dataView.getUint32(KTX_FIELDS.GL_INTERNAL_FORMAT, littleEndian);

    const pixelWidth = this.formerWidth = dataView.getUint32(KTX_FIELDS.PIXEL_WIDTH, littleEndian);
    const pixelHeight = this.formerHeight = dataView.getUint32(KTX_FIELDS.PIXEL_HEIGHT, littleEndian) || 1;// "pixelHeight = 0" -> "1"

    let size = INTERNAL_FORMAT_TO_BLOCK_SIZE[this.internalFormat];
    this.width = pixelWidth % size[0] === 0 ? pixelWidth : (pixelWidth + size[0] - (pixelWidth % size[0]));
    this.height = pixelHeight % size[1] === 0 ? pixelHeight : (pixelHeight + size[1] - (pixelHeight % size[1]));

    const pixelDepth = dataView.getUint32(KTX_FIELDS.PIXEL_DEPTH, littleEndian) || 1;// ^^
    const numberOfArrayElements = dataView.getUint32(KTX_FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;// ^^
    const numberOfFaces = dataView.getUint32(KTX_FIELDS.NUMBER_OF_FACES, littleEndian);
    const numberOfMipmapLevels = this.levels = dataView.getUint32(KTX_FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
    const bytesOfKeyValueData = dataView.getUint32(KTX_FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);
    // Whether the platform architecture is little endian. If littleEndian !== platformLittleEndian, then the
    // file contents must be endian-converted!
    // TODO: Endianness conversion
    // const platformLittleEndian = new Uint8Array((new Uint32Array([ENDIANNESS])).buffer)[0] === 0x01;
    if (pixelHeight === 0 || pixelDepth !== 1) {
      throw new Error('Only 2D textures are supported!');
    }
    if (numberOfFaces !== 1) {
      throw new Error('CubeTextures are not supported!');
    }
    if (numberOfArrayElements !== 1) {
      throw new Error('It does not support array textures!');
    }

    let mipWidth = pixelWidth;
    let mipHeight = pixelHeight;
    let imageOffset = FILE_HEADER_SIZE + bytesOfKeyValueData;

    for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++) {
      const imageSize = dataView.getUint32(imageOffset, littleEndian);
      imageOffset += 4;

      let size = INTERNAL_FORMAT_TO_BLOCK_SIZE[this.internalFormat];
      const levelWidth = mipWidth % size[0] === 0 ? mipWidth : mipWidth + size[0] - (mipWidth % size[0]);
      const levelHeight = mipHeight % size[1] === 0 ? mipHeight : mipHeight + size[1] - (mipHeight % size[1]);

      const mip: CompressedLevelBuffer = {
        levelID: mipmapLevel,
        levelWidth,
        levelHeight,
        levelBuffer: new Uint8Array(source, imageOffset, imageSize)
      };
      this.levelBuffers.push(mip);
      imageOffset += imageSize;
      imageOffset += 3 - ((imageOffset + 3) % 4);
      mipWidth = (mipWidth >> 1) || 1;
      mipHeight = (mipHeight >> 1) || 1;
    }
  }
}
function validateKTX(dataView: DataView): boolean {
  for (let i = 0; i < FILE_IDENTIFIER.length; i++) {
    if (dataView.getUint8(i) !== FILE_IDENTIFIER[i]) {
      return false;
    }
  }
  return true;
}
