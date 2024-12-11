import { Texture as PIXITexture, TilingSprite as PIXITilingSprite } from 'pixi.js';

export default class TilingSprite {
  _image: HTMLImageElement | PIXITexture = null;
  public tilingSprite: PIXITilingSprite;

  constructor(image: HTMLImageElement | PIXITexture) {
    this._image = image;
    if (image) {
      if (image instanceof HTMLImageElement) {
        this.tilingSprite = new PIXITilingSprite(PIXITexture.from(image));
      } else if (image instanceof PIXITexture) {
        this.tilingSprite = new PIXITilingSprite(image);
      }
    } else {
      this.tilingSprite = new PIXITilingSprite(PIXITexture.EMPTY);
    }
  }
  set image(val: PIXITexture | HTMLImageElement) {
    if (this._image === val) {
      return;
    }

    if (val instanceof HTMLImageElement) {
      this.tilingSprite.texture = PIXITexture.from(val);
    } else if (val instanceof PIXITexture) {
      this.tilingSprite.texture = val;
    }
    this._image = val;
  }
  get image() {
    return this._image;
  }
}
