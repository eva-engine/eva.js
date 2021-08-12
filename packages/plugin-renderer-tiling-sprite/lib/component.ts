<<<<<<< HEAD
import {Component} from '@eva/eva.js';
import {type, step} from '@eva/inspector-decorator';
=======
import { Component, decorators } from '@eva/eva.js';
>>>>>>> origin/dev

export interface TilingSpriteParams {
  resource: string;
  tileScale: { x: number; y: number };
  tilePosition: { x: number; y: number };
}

export default class TilingSprite extends Component<TilingSpriteParams> {
  static componentName: string = 'TilingSprite';
  @type('string') resource: string = '';
  @type('vector2') @step(0.1) tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };
  @type('vector2') @step(1) tilePosition: TilingSpriteParams['tilePosition'] = {
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
