import { ResourceBase, RESOURCE_TYPE_STRATEGY, resourceLoader } from "@eva/eva.js";
import { getAbilities } from "../ability";
import KTXLoadStrategy from "./KTXLoadStrategy";
const { XhrResponseType } = resourceLoader
export function addPreProcessResourceHandler(resource) {
  resource.addPreProcessResourceHandler(function normalizeResource(resource: ResourceBase): void {
    let textures = resource.src?.image?.texture;
    if (!textures) return;
    if (!Array.isArray(textures)) {
      textures = [textures];
    }

    const { extensions } = getAbilities() ?? {};
    if (!extensions) return
    let target = textures.find(texture => extensions[texture.type]);
    if (target) {
      Object.assign(resource.src.image, target);
    }
  })
}
export function addKTXStragetyAndRegister() {
  Object.assign(RESOURCE_TYPE_STRATEGY, {
    astc: KTXLoadStrategy,
    etc: KTXLoadStrategy,
    pvrtc: KTXLoadStrategy,
    s3tc: KTXLoadStrategy,
    atc: KTXLoadStrategy,
  });
  KTXLoadStrategy.setExtensionXhrType('ktx', XhrResponseType.Buffer);
}
