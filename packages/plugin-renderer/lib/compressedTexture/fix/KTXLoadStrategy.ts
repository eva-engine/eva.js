import { KTXTextureResource } from '../resource/KTXTextureResource';

// @ts-ignore
export default class KTXLoadStrategy {
  // @ts-ignore
  private _complete(type, data): void {
    //@ts-ignore
    super._complete(type, new KTXTextureResource(data, this.config));
  }
}
