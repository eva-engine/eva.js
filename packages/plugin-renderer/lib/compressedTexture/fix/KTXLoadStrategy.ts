import { resourceLoader } from '@eva/eva.js'
import { KTXTextureResource } from '../resource/KTXTextureResource';
const { XhrLoadStrategy } = resourceLoader;

// @ts-ignore
export default class KTXLoadStrategy extends XhrLoadStrategy {
  // @ts-ignore
  private _complete(type, data): void {
    //@ts-ignore
    super._complete(type, new KTXTextureResource(data, this.config));
  }
}