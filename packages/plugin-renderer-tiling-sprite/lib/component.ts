import { Component } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

export interface TilingSpriteParams {
  resource: string;
  tileScale: { x: number; y: number };
  tilePosition: { x: number; y: number };
}

class Vector2 {
  @Field({ step: 0.1 })
  x!: number;
  @Field({ step: 0.1 })
  y!: number;
}

class IntVector2 extends Vector2 {
  @Field({ step: 1 })
  x!: number;
  @Field({ step: 1 })
  y!: number;
}

export default class TilingSprite extends Component<TilingSpriteParams> {
  static componentName: string = 'TilingSprite';
  @Field() resource: string = '';
  @Field(() => Vector2) tileScale: TilingSpriteParams['tileScale'] = {
    x: 1,
    y: 1,
  };
  @Field(() => IntVector2) tilePosition: TilingSpriteParams['tilePosition'] = {
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
