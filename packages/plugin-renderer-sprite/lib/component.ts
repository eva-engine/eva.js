import { Component, resource } from '@eva/eva.js';
import { Field } from '@eva/inspector-decorator';

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

export interface SpriteParams {
  resource: string;
  spriteName: string;
}

export default class Sprite extends Component<SpriteParams> {
  static componentName: string = 'Sprite';

  @Field({ type: 'resource' })
  resource: string = '';

  @Field({
    type: 'selector',
    options: async function (instance: Sprite) {
      await sleep(0);
      if (!instance.resource || !(resource as any).promiseMap[instance.resource]) {
        return {};
      }
      await (resource as any).promiseMap[instance.resource];
      const frames = resource.resourcesMap[instance.resource]?.data?.json?.frames;
      return frames
        ? Object.values(frames)
            .map((item: any) => item.name)
            .reduce((prev, key) => ({ ...prev, [key]: key }), {})
        : {};
    },
  })
  spriteName: string = '';

  init(obj?: SpriteParams) {
    if (obj && obj.resource) {
      this.resource = obj.resource;
      this.spriteName = obj.spriteName;
    }
  }
}
