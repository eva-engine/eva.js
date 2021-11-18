import { XhrLoadStrategy } from './XhrLoadStrategy'
import { KTXTextureResource } from '../resource/KTXTextureResource';

// @ts-ignore
export default class KTXLoadStrategy extends XhrLoadStrategy {
  // @ts-ignore
  private _complete(type, data): void {
    //@ts-ignore
    super._complete(type, new KTXTextureResource(data, this.config));
  }
}