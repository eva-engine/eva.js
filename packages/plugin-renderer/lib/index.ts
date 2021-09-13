import RendererSystem, { RENDERER_TYPE } from './System';
import RendererManager from './manager/RendererManager';
import ContainerManager from './manager/ContainerManager';
import Renderer from './Renderer';
export * from "./compressedTexture/const";
import { registerCompressedTexture } from "./compressedTexture";
import { mixinPIXI } from './mixin';

mixinPIXI()
registerCompressedTexture();
export type { RendererSystemParams } from "./System";
export { RendererManager, ContainerManager, RendererSystem, RENDERER_TYPE, Renderer };

