/**
 * Inspired by PIXI.KTXLoader
 */
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
    // Loop through each mip level of COMPRESSED texture data provided and upload it to the given texture.
    for (var i = 0; i < this.levels; ++i) {
      let { levelWidth, levelHeight, levelBuffer } = this.levelBuffers[i];
      gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, levelWidth, levelHeight, 0, levelBuffer);
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