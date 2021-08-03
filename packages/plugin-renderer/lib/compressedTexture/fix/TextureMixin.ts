import { BaseTexture, Texture } from "pixi.js";
import { CompressedTextureResource } from "../resource/CompressedTextureResource";
const oldFrom = Symbol();
export const TextureMixin = {
  [oldFrom]: Texture.from,
  from(source) {
    if (!(source instanceof CompressedTextureResource)) {
      return this[oldFrom](source);
    }
    return new Texture(BaseTexture.from(source as any));
  }
}

