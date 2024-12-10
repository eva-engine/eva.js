import { extensions, setKTXTranscoderPath, loadKTX2, resolveCompressedTextureUrl, detectCompressed } from 'pixi.js';
import { addPreProcessResourceHandler } from './fix/loader';
import { resource } from '@eva/eva.js';

interface Params {
  jsUrl: string;
  wasmUrl: string;
}

export function registerKtx2CompressedTexture(params: Params) {
  setKTXTranscoderPath(params);
  extensions.add(loadKTX2);
  extensions.add(resolveCompressedTextureUrl);
  extensions.add(detectCompressed);
  addPreProcessResourceHandler(resource);
}
