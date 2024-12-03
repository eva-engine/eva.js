import { Texture, NineSliceSprite } from 'pixi.js';

export default class NinePatch extends NineSliceSprite {
  constructor(img, leftWidth, topHeight, rightWidth, bottomHeight) {
    let texture;
    if (img instanceof Texture) {
      texture = img;
    } else {
      texture = Texture.from(img);
    }
    super({
      texture,
      leftWidth,
      topHeight,
      rightWidth,
      bottomHeight,
    });
  }
}
