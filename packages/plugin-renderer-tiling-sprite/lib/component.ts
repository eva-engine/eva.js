import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

export interface TilingSpriteParams {
  resource: string;
  tileScale: { x: number; y: number };
  tilePosition: { x: number; y: number };
}

export default class TilingSprite extends Component<TilingSpriteParams> {
  static componentName: string = 'TilingSprite';
  @Field({ type: 'resource' }) resource: string = '';
  @Field({ type: 'vector2', step: 0.01 }) tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };
  @Field({ type: 'vector2', step: 0.01 }) tilePosition: TilingSpriteParams['tilePosition'] = {
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
