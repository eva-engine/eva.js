import { resource } from '@eva/eva.js';

// 注册 TILESET 资源类型。此处 try/catch 防止多次 import 重复注册时抛错。
try {
  (resource as { registerResourceType: (t: string) => void }).registerResourceType('TILESET');
} catch {
  /* already registered */
}

// 注册 TILESET 资源的 instance 解析回调:把 raw json 作为 instance 暴露,
// 同时把 src.json.data 拷贝到 res.data.json,与 lottie/audio 资源约定一致。
try {
  (resource as { registerInstance: (t: string, cb: (res: any) => any) => void }).registerInstance(
    'TILESET',
    (res: { data?: { json?: unknown }; src?: { json?: { data?: unknown } } }) => {
      // pixi.js v8 Assets.load 把 JSON 内容放在 res.data.json 或 src.json.data,
      // 不同版本路径不一致:这里两边都兜底,返回 raw JSON 作为 instance。
      const fromData = res.data?.json;
      const fromSrc = res.src?.json?.data;
      return fromData ?? fromSrc ?? null;
    }
  );
} catch {
  /* already registered */
}

export { default as Tilemap } from './component';
export { default as TilemapSystem } from './system';
export type {
  TilemapParams,
  TilemapLayer,
  TileMapLayerV2,
  ChunkedCellData,
} from './component';
export { CHUNK_SIZE, decodeChunk, unpackCell, isEmptyCellValue } from './chunk-codec';
export type { LoadedTileset, TilesetDocumentRaw } from './tileset-types';
export { makeLoadedTileset } from './tileset-types';
export {
  PeeringBitIndex,
  NEIGHBOR_DIRECTIONS,
  NO_NEIGHBOR,
  MAX_TERRAIN_ID,
  pickAutotileCandidate,
} from './peering-bit-index';
export type {
  NeighborDirection,
  PeeringBitsRecord,
  AutotileCandidate,
  PeeringBitMatchResult,
} from './peering-bit-index';
export { TileAnimationDriver } from './animation-driver';
export type { CompiledTileAnimation, AdvanceResult, TileAnimationFrame, TileAnimationKey } from './animation-driver';
export { resolveChunkRenderStrategy, estimateSpriteNodes } from './chunk-renderer';
export type { ChunkRenderStrategyKind, ChunkRenderStrategyContext } from './chunk-renderer';
export { buildChunkMesh, isMeshPathAvailable, estimateChunkMeshMemoryKB } from './chunk-mesh';
export type { ChunkMeshConfig } from './chunk-mesh';
export { TILE_VERT_SHADER, TILE_FRAG_SHADER, TILE_SHADER_SOURCES } from './chunk/tile-shader';
export type { TileShaderSources } from './chunk/tile-shader';
export { buildChunkGeometry } from './chunk/chunk-geometry';
export type { ChunkGeometryAtlasInfo, ChunkGeometryResult } from './chunk/chunk-geometry';
export { diffTilesetForChunkRebuild, computeAffectedChunks } from './hot-reload';
export type { TilesetChunkRebuildDiff } from './hot-reload';
// Deprecated aliases — name collided with @ali/eva-dsl `diffTilesetDocuments`
// (document-level detailed diff). Kept for transitional compatibility; prefer
// `diffTilesetForChunkRebuild` / `TilesetChunkRebuildDiff` for new code.
export { diffTilesetDocuments } from './hot-reload';
export type { TilesetDiff } from './hot-reload';
export { expandSceneCollectionSource, resolveCellPrefabName } from './scene-collection-source';
export type { SceneCollectionPrefabRef } from './scene-collection-source';
export {
  TILEMAP_PROBE_NAMES,
  adaptGamePerfProbes,
  createInMemoryProbeRegistry,
  getRequiredTilemapProbes,
} from './probes';
export type { PerfProbeRegistry } from './probes';
export {
  DecompositionCache,
  cacheKeyOf,
  decomposePolygon,
  translateConvexParts,
} from './physics/decomposition-cache';
export type { ConvexPart, CachedDecomposition, DecompositionCacheKey } from './physics/decomposition-cache';
export { cacheKeyOfNum } from './physics/decomposition-cache-shim';
export { TILEMAP_BODY_SOURCE_REGISTRY } from './physics/body-source-registry';
export type { BodyDefinition, BodySourceContext, BodySourceBuilder } from './physics/body-source-registry';
export { buildTileMapStaticBodies } from './physics/tilemap-static-body';
export type { TileMapStaticBodyInput } from './physics/tilemap-static-body';
export {
  buildTileMapStaticBodyDefinitions,
  extractPhysicsByCellKey,
  ADR_0019_NATIVE_REGISTRY_AVAILABLE,
} from './physics/tilemap-static-body-host';
export type { TileMapStaticBodyHostBuildResult } from './physics/tilemap-static-body-host';
