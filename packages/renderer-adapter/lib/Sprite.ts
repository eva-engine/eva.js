import {Texture as PIXITexture, Sprite as PIXISprite} from 'pixi.js';

export default class Sprite {
  _image: HTMLImageElement | PIXITexture = null;
  public sprite: PIXISprite;
  constructor(image: HTMLImageElement | PIXITexture) {
    this._image = image;
    if (image) {
      if (image instanceof HTMLImageElement) {
        this.sprite = PIXISprite.from(image as any);
      } else if (image instanceof PIXITexture) {
        this.sprite = new PIXISprite(image);
      }
    } else {
      this.sprite = new PIXISprite();
    }
  }
  set image(val) {
    if (this._image === val) {
      return;
    }

    if (val instanceof HTMLImageElement) {
      this.sprite.texture && this.sprite.texture.destroy(false);
      this.sprite.texture = PIXITexture.from(val);
    } else if (val instanceof PIXITexture) {
      this.sprite.texture = val;
    }
    this._image = val;
  }
  get image() {
    return this._image;
  }
}
