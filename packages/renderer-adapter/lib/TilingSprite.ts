import {Texture as PIXITexture, extras} from 'pixi.js';
const PIXITilingSprite = extras.TilingSprite;

export default class TilingSprite {
  _image: HTMLImageElement | PIXITexture = null;
  // public tilingSprite: PIXI.extras.TilingSprite;
  public tilingSprite: any;
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
  set image(val) {
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
