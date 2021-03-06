import { INTERNAL_FORMATS_TO_EXTENSION_NAME } from './../const';
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
  naturalWidth: number
  naturalHeight: number
  formerWidth: number
  formerHeight: number
  complete: boolean
  src: string
  internalFormat: number
  levelBuffers: CompressedLevelBuffer[] = []
  levels: number
  upload(gl: WebGLRenderingContext) {
    const { levels } = this;


    // Before use compressed texture, must call getExtension early !
    // Now we don't keep the compressed texture type is supported !
    let name = INTERNAL_FORMATS_TO_EXTENSION_NAME[this.internalFormat];
    if (!gl[name]) {
      gl[name] = true;
      if (name === 'WEBGL_compressed_texture_pvrtc') {
        gl.getExtension(name) || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
      } else {
        gl.getExtension(name);
      }
    }

    // Loop through each mip level of COMPRESSED texture data provided and upload it to the given texture.
    for (let i = 0; i < this.levels; ++i) {
      let { levelWidth, levelHeight, levelBuffer } = this.levelBuffers[i];
      gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, levelWidth, levelHeight, 0, levelBuffer);
    }

    // for (let i = 1; i < this.levels; ++i) {
    //   setTimeout(() => {
    //     let { levelWidth, levelHeight, levelBuffer } = this.levelBuffers[i];
    //     console.log(levelWidth, levelHeight)
    //     gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, levelWidth, levelHeight, 0, levelBuffer);
    //   }, i * 1000);
    // }



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
    // clear cpu memory, 
    // but spritedAnimation is update texture when the texture reuse.
    // this.levelBuffers.length = 0

  }
}