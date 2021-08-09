import { Component, decorators } from '@eva/eva.js';

export interface TilingSpriteParams {
  resource: string;
  tileScale: { x: number; y: number };
  tilePosition: { x: number; y: number };
}

export default class TilingSprite extends Component<TilingSpriteParams> {
  static componentName: string = 'TilingSprite';
  @decorators.IDEProp resource: string = '';
  @decorators.IDEProp tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };
  @decorators.IDEProp tilePosition: TilingSpriteParams['tilePosition'] = {
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
