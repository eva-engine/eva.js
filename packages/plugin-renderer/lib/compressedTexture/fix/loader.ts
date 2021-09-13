import { ResourceBase, STRATEGY } from "@eva/eva.js";
import { getAbilities } from "../ability";
import KTXLoadStrategy from "./KTXLoadStrategy";
import { XhrResponseType } from 'resource-loader'
export function addPreProcessResourceHandler(resource) {
  resource.addPreProcessResourceHandler(function normalizeResource(resource: ResourceBase): void {
    let textures = resource.src?.image?.texture;
    if (!textures) return;
    if (!Array.isArray(textures)) {
      textures = [textures];
    }
    // When astc is supported, its all types are supported. 《MoChuan》
    const { extensions } = getAbilities();
    let target = textures.find(texture => extensions[texture.type]);
    if (target) {
      Object.assign(resource.src.image, target);
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
