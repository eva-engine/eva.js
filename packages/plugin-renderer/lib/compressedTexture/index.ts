import { addKTXStragetyAndRegister, addPreProcessResourceHandler } from './fix/loader';
// import { BaseTexture, glCore, Texture } from 'pixi.js';
import { resource } from '@eva/eva.js';

export function registerCompressedTexture(gl: WebGLRenderingContext) {
  // Register for load compressed texture correctly
  addPreProcessResourceHandler(resource, gl);
  addKTXStragetyAndRegister();

  // Change some PIXI class implement
  // Object.assign(glCore.GLTexture.prototype, GLTextureMixin);
  // Object.assign(Texture, TextureMixin);
  // Object.assign(BaseTexture, BaseTextureMixin);
}
