/**
 * TileSet 外链 .tileset.json 在运行时的 minimal type shape。
 *
 * 为避免反向依赖 libs/dsl,这里独立声明;与 libs/dsl/src/types/tileset.ts 的 disk schema 同形。
 */

export interface TilesetDocumentRaw {
  kind: 'tileset';
  schemaVersion: 1;
  name: string;
  version?: string;
  tileSize: { width: number; height: number };
  gridMode?: 'square' | 'isometric' | 'halfOffsetSquare' | 'hexagon';
  sources: TilesetSourceRaw[];
}

export type TilesetSourceRaw =
  | {
      kind: 'atlas';
      id: string;
      textureAsset: string;
      regionSize: { width: number; height: number };
      margins?: { x: number; y: number };
      separation?: { x: number; y: number };
      usePadding?: boolean;
      tiles: AtlasTileRaw[];
    }
  | {
      kind: 'sceneCollection';
      id: string;
      prefabRefs: string[];
    };

export interface AtlasTileRaw {
  atlasCoords: { col: number; row: number };
  size?: { width: number; height: number };
  alternatives: Array<{
    altId: number;
    modulate?: string;
    zIndex?: number;
    probability?: number;
    [extra: string]: unknown;
  }>;
}

/** 运行时解析后的 frozen TileSet。 */
export interface LoadedTileset {
  raw: TilesetDocumentRaw;
  /** sourceSlot 索引(1-based):slot 0 = empty,slot 1 = sources[0]。 */
  sourcesBySlot: TilesetSourceRaw[];
  /** id → slot,patch 寻址用。 */
  slotByIdMap: Map<string, number>;
  tileWidth: number;
  tileHeight: number;
}

export function makeLoadedTileset(raw: TilesetDocumentRaw): LoadedTileset {
  const slotByIdMap = new Map<string, number>();
  // slot 0 reserved as "empty"; sources begin at slot 1
  const sourcesBySlot: TilesetSourceRaw[] = [];

  // Detect cache collisions: same textureAsset with different regionSize/margins/separation
  // will share frame texture cache slots downstream (cache key = textureAsset#col,row),
  // producing visual artifacts where source A renders source B's frame. Warn so users see
  // the issue instead of staring at swapped sprites.
  const seenByAsset = new Map<
    string,
    {
      regionSize: { width: number; height: number };
      margins?: { x: number; y: number };
      separation?: { x: number; y: number };
      sourceId: string;
    }
  >();

  for (let i = 0; i < raw.sources.length; i++) {
    const src = raw.sources[i]!;
    sourcesBySlot.push(src);
    slotByIdMap.set(src.id, i + 1);

    if (src.kind === 'atlas' && src.textureAsset) {
      const prev = seenByAsset.get(src.textureAsset);
      if (prev) {
        const sameRegion =
          prev.regionSize.width === src.regionSize.width &&
          prev.regionSize.height === src.regionSize.height;
        const sameMargins =
          (prev.margins?.x ?? 0) === (src.margins?.x ?? 0) &&
          (prev.margins?.y ?? 0) === (src.margins?.y ?? 0);
        const sameSep =
          (prev.separation?.x ?? 0) === (src.separation?.x ?? 0) &&
          (prev.separation?.y ?? 0) === (src.separation?.y ?? 0);
        if (!sameRegion || !sameMargins || !sameSep) {
          if (typeof console !== 'undefined') {
            console.warn(
              `[Tilemap] Atlas sources '${prev.sourceId}' and '${src.id}' share textureAsset='${src.textureAsset}' ` +
                `but differ in regionSize/margins/separation. Frame texture cache may collide and render wrong frames. ` +
                `Use distinct textureAssets per atlas source.`
            );
          }
        }
      } else {
        seenByAsset.set(src.textureAsset, {
          regionSize: src.regionSize,
          margins: src.margins,
          separation: src.separation,
          sourceId: src.id,
        });
      }
    }
  }
  return {
    raw,
    sourcesBySlot,
    slotByIdMap,
    tileWidth: raw.tileSize.width,
    tileHeight: raw.tileSize.height,
  };
}
