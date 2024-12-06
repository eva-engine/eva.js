import { ResourceBase } from '@eva/eva.js';
import { getSuportCompressedTextureFormats } from '../ability';
export function addPreProcessResourceHandler(resource, gl: WebGLRenderingContext) {
  resource.addPreProcessResourceHandler(function normalizeResource(resource: ResourceBase): void {
    let textures = resource.src?.image?.texture;

    if (!textures) return;
    if (!Array.isArray(textures)) {
      textures = [textures];
    }

    const formats = getSuportCompressedTextureFormats(gl) ?? {};

    let target = textures.find(texture => formats[texture.type]);
    if (target) {
      Object.assign(resource.src.image, target);
    }
  });
}
export function addKTXStragetyAndRegister() {}
