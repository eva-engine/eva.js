import { ResourceBase, STRATEGY } from "@eva/eva.js";
import { getAbilities } from "../ability";
import KTXLoadStrategy from "./KTXLoadStrategy";
import { XhrResponseType } from 'resource-loader'
export function addPreProcessResourceHandler(resource) {
  resource.addPreProcessResourceHandler(function normalizeResource(resource: ResourceBase): void {
    const textures = resource.src?.image?.texture;
    if (!textures) return;
    const { extensions, textureFormats, formats } = getAbilities();
    let target = textures.find(texture =>
      extensions[texture.type] &&
      (formats.includes(texture.internalFormat as number) || textureFormats[texture.internalFormat]));
    if (target) {
      resource.src.image.url = target.url;
      resource.src.image.type = target.type;
    }
  })
}
export function addKTXStragetyAndRegister() {
  Object.assign(STRATEGY, {
    astc: KTXLoadStrategy,
    etc: KTXLoadStrategy,
    pvrtc: KTXLoadStrategy,
    s3tc: KTXLoadStrategy,
    atc: KTXLoadStrategy,
  });
  KTXLoadStrategy.setExtensionXhrType('ktx', XhrResponseType.Buffer);
}
