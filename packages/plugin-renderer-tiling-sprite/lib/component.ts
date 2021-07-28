import {Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

export interface TilingSpriteParams {
  resource: string;
  tileScale: {x: number; y: number};
  tilePosition: {x: number; y: number};
}

export default class TilingSprite extends Component {
  static componentName: string = 'TilingSprite';
  @type('string') resource: string = '';
  @type('vector2') tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };
  @type('vector2') tilePosition: TilingSpriteParams['tilePosition'] = {
    x: 0,
    y: 0,
  };
  init(obj?: TilingSpriteParams) {
    if (obj) {
      this.resource = obj.resource;
      this.tileScale = obj.tileScale;
      this.tilePosition = obj.tilePosition;
    }
  }
}
