import { addKTXStragetyAndRegister, addPreProcessResourceHandler } from "./fix/loader";
import { BaseTexture, glCore, Texture } from "pixi.js";
import { GLTextureMixin } from "./fix/GLTextureMixin";
import { TextureMixin } from "./fix/TextureMixin";
import { BaseTextureMixin } from "./fix/BaseTextureMixin";
import { resource } from "@eva/eva.js";

export function registerCompressedTexture() {
  // Register for load compressed texture correctly
  addPreProcessResourceHandler(resource);
  addKTXStragetyAndRegister();

  // Change some PIXI class implement
  Object.assign(glCore.GLTexture.prototype, GLTextureMixin);
  Object.assign(Texture, TextureMixin);
  Object.assign(BaseTexture, BaseTextureMixin);
}