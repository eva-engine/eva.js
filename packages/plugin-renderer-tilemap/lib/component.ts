import { Component } from '@eva/eva.js';
import { type } from '@eva/inspector-decorator';

/**
 * 单个 Tilemap layer 的描述。
 *
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

export interface TilemapParams {
  /** Tileset 图像资源 key(对应 DSL assets 中的 image 资源)。 */
  tileset: string;
  /** 单个 tile 在 tileset 中的宽度。 */
  tileWidth: number;
  /** 单个 tile 在 tileset 中的高度。 */
  tileHeight: number;
  /**
   * Tileset 横向有几列 tile。Tileset 图像总宽 ≥ tilesetColumns * tileWidth。
   * 如果不传,会使用 tileset 图实际尺寸 / tileWidth 推断。
   */
  tilesetColumns?: number;
  /** Tileset 内部 tile 之间的间距,默认 0。 */
  tilesetSpacing?: number;
  /** Tileset 内部 tile 与图像边缘的 margin,默认 0。 */
  tilesetMargin?: number;
  /** 渲染时的 tile 显示宽度;不传则与 tileWidth 一致(用于切片放大)。 */
  renderTileWidth?: number;
  /** 渲染时的 tile 显示高度。 */
  renderTileHeight?: number;
  /** 多个 layer。 */
  layers: TilemapLayer[];
}

/**
 * Phaser-style Static Tilemap 渲染组件(MVP)。
 *
 * 行为:
 * 1. 从 `tileset` 资源加载一张 spritesheet 纹理;
 * 2. 每个 layer 对应一个 PixiJS Container;
 * 3. layer 内每个非零 tile 都创建一个 Sprite,texture 由原 tileset 切片得到;
 * 4. tile 在 layer Container 内的位置:`(col * tileW + offsetX, row * tileH + offsetY)`。
 *
 * 不支持(Phase 2 视情况增加):tile flipping、动态修改 API、iso/hex、physics 碰撞、camera。
 */
export default class Tilemap extends Component<TilemapParams> {
  static componentName: string = 'Tilemap';

  @type('string') tileset: string = '';
  @type('number') tileWidth: number = 32;
  @type('number') tileHeight: number = 32;
  tilesetColumns?: number;
  @type('number') tilesetSpacing: number = 0;
  @type('number') tilesetMargin: number = 0;
  renderTileWidth?: number;
  renderTileHeight?: number;
  layers: TilemapLayer[] = [];

  init(obj?: TilemapParams) {
    if (obj) Object.assign(this, obj);
  }
}
