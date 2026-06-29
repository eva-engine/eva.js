import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

/**
 * 单个 Tilemap layer 的描述。
 *
 * Phaser-style 静态 tilemap(v1 老路径):
 * - `data` 为二维数组,行优先(row-major):data[row][col]。
 * - tile id `0` 表示空格,不渲染;> 0 的 id 会按 `(id - 1)` 索引到 tileset 的第 N 个 tile。
 * - `offsetX/offsetY` 在 layer 级别整体偏移(等价 Phaser createLayer(... ,x,y))。
 */
export interface TilemapLayer {
  name?: string;
  /** 二维数组 [row][col],为 0 表示空。 */
  data: number[][];
  offsetX?: number;
  offsetY?: number;
  /** layer 级整体不透明度,默认 1。 */
  alpha?: number;
  /** layer 是否可见,默认 true。 */
  visible?: boolean;
  /** 整层着色;按 sprite.tint 写入。 */
  tint?: number;
}

/* ───────────────────────────────────────────────────────── v2 (chunked) ── */

/**
 * Chunked cell data。与 libs/dsl 的 ChunkedCellData 同形,但为避免反向依赖,
 * 在这里独立声明接口(结构兼容 JSON shape)。
 *
 * Cell encoding (1 int32 per cell):
 *   bits 0..7    sourceSlot     (1..255,0 = 空)
 *   bits 8..15   col
 *   bits 16..23  row
 *   bits 24..28  altIdx
 *   bit  29      flipH
 *   bit  30      flipV
 *   bit  31      transpose
 */
export interface ChunkedCellData {
  kind: 'chunked';
  chunkSize: 16;
  stride: 1;
  chunks: Record<string, { blob: string; nonEmpty: number }>;
}

export interface TileMapLayerV2 {
  id: string;
  name?: string;
  enabled?: boolean;
  visible?: boolean;
  locked?: boolean;
  modulate?: string;
  opacity?: number;
  zIndex?: number;
  yOrigin?: 'topLeft' | 'center';
  ySort?: boolean;
  ySortOriginPx?: number;
  collisionEnabled?: boolean;
  navigationEnabled?: boolean;
  animationEnabled?: boolean;
  cellData: ChunkedCellData;
}

export interface TilemapParams {
  // ─────── v1 (Phaser-style 兼容) ───────
  /** Tileset 图像资源 key(对应 DSL assets 中的 image 资源)。 */
  tileset?: string;
  /** 单个 tile 在 tileset 中的宽度。 */
  tileWidth?: number;
  /** 单个 tile 在 tileset 中的高度。 */
  tileHeight?: number;
  tilesetColumns?: number;
  tilesetSpacing?: number;
  tilesetMargin?: number;
  renderTileWidth?: number;
  renderTileHeight?: number;
  layers?: TilemapLayer[];

  // ─────── v2 (Godot-style chunked) ───────
  /** 当存在时,System 走 chunked 路径,忽略 tileset/layers 老字段。 */
  tilemapRef?: string;
  mapOrigin?: { x: number; y: number };
  /** 单 cell 像素;默认从 tileset 文档的 tileSize 派生。 */
  cellSize?: { width: number; height: number };
  layersV2?: TileMapLayerV2[];
  collisionEnabled?: boolean;
  navigationEnabled?: boolean;
  animationEnabled?: boolean;
  renderStrategy?: 'sprite' | 'mesh' | 'auto';
}

/**
 * Tilemap 渲染组件。
 *
 * v1 (Phaser-style, 静态): 通过 `tileset` + `layers[].data[][]` 渲染。
 * v2 (Godot-style, chunked): 通过 `tilemapRef` + `layersV2[].cellData.chunks` 渲染。
 *
 * System 通过有无 `tilemapRef` 判断走哪条路径。两条路径不共存于同一实例。
 */
export default class Tilemap extends Component<TilemapParams> {
  static componentName: string = 'Tilemap';

  // v1 fields
  @type('string') tileset: string = '';
  @type('number') tileWidth: number = 32;
  @type('number') tileHeight: number = 32;
  tilesetColumns?: number;
  @type('number') tilesetSpacing: number = 0;
  @type('number') tilesetMargin: number = 0;
  renderTileWidth?: number;
  renderTileHeight?: number;
  layers: TilemapLayer[] = [];

  // v2 fields
  @type('string') tilemapRef: string = '';
  mapOrigin?: { x: number; y: number };
  cellSize?: { width: number; height: number };
  layersV2?: TileMapLayerV2[];
  collisionEnabled?: boolean;
  navigationEnabled?: boolean;
  animationEnabled?: boolean;
  renderStrategy?: 'sprite' | 'mesh' | 'auto';

  init(obj?: TilemapParams) {
    if (obj) Object.assign(this, obj);
  }
}
