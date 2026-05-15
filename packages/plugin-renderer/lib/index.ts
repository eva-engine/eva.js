import RendererSystem, { RENDERER_TYPE } from './System';
import RendererManager from './manager/RendererManager';
import ContainerManager from './manager/ContainerManager';
import { registerKtx2CompressedTexture } from './compressedTexture';
import Renderer from './Renderer';
import { mixinPIXI } from './mixin';

mixinPIXI();
export type { RendererSystemParams, ResizeRendererOptions, RendererResolutionState } from './System';
export type { BoundsCoordinateSpace, GetBoundsOptions, RenderBounds } from './manager/ContainerManager';
export { RendererManager, ContainerManager, RendererSystem, RENDERER_TYPE, Renderer, registerKtx2CompressedTexture };
