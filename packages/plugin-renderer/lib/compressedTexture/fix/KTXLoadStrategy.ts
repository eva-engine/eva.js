import { ResourceType,XhrLoadStrategy } from 'resource-loader';
import { KTXTextureResource } from '../resource/KTXTextureResource';


// @ts-ignore
export default class KTXLoadStrategy extends XhrLoadStrategy {
  // @ts-ignore
  private _complete(type: ResourceType, data: any): void {
    //@ts-ignore
    super._complete(type, new KTXTextureResource(data, this.config.url));
  }
}