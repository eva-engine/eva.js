import { Texture } from 'pixi.js';

export default class NinePatch {
  constructor(img, leftWidth, topHeight, rightWidth, bottomHeight) {
    let texture;
    if (img === 'string') {
      texture = Texture.fromFrame(img);
    } else {
      texture = Texture.from(img);
    }
    // super(texture, leftWidth, topHeight, rightWidth, bottomHeight);
  }
}
