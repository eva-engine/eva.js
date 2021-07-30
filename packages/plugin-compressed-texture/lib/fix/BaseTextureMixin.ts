import { BaseTexture, utils } from "pixi.js";
import { CompressedTextureResource } from "../resource/CompressedTextureResource";
const oldFrom = Symbol();
export const BaseTextureMixin = {
  [oldFrom]: BaseTexture.from,
  from(source, scaleMode, sourceScale) {
    if (!(source instanceof CompressedTextureResource)) {
      return this[oldFrom](source, scaleMode, sourceScale);
    }
    const imageUrl = source.src;
    let baseTexture = utils.BaseTextureCache[imageUrl];

    if (!baseTexture) {
      baseTexture = new BaseTexture(source as any, scaleMode);
      baseTexture.imageUrl = imageUrl;

      if (sourceScale) {
        baseTexture.sourceScale = sourceScale;
      }
      BaseTexture.addToCache(baseTexture, imageUrl);
    }
    return baseTexture;
  }
}