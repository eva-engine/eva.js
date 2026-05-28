import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, RESOURCE_TYPE, resource } from '@eva/eva.js';
import '@eva/plugin-renderer-img';
import { Tilemap, TilemapSystem } from '@eva/plugin-renderer-tilemap';

export const name = 'tilemap';

export async function init(canvas: HTMLCanvasElement) {
  resource.addResource([
    {
      name: 'tileset',
      type: RESOURCE_TYPE.IMAGE,
      src: {
        image: {
          type: 'png',
          url: '/phaser-assets/sprites/block-ice.png',
        },
      },
      preload: true,
    },
  ]);

  const game = new Game();
  await game.init({
    systems: [
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
        backgroundColor: 0x202030,
      }),
      new TilemapSystem(),
    ],
  });

  // block-ice.png 256x256,16x16 = 16 列 16 行
  // 用 id 11 / 12 / 25 等几个不同 tile 拼一个简单棋盘
  const buildPattern = (rows: number, cols: number) => {
    const data: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) row.push(11);
        else if ((r + c) % 2 === 0) row.push(25);
        else row.push(12);
      }
      data.push(row);
    }
    return data;
  };

  const tilemapGo = new GameObject('tilemap', {
    position: { x: 75, y: 200 },
    anchor: { x: 0, y: 0 },
  });
  tilemapGo.addComponent(
    new Tilemap({
      tileset: 'tileset',
      tileWidth: 16,
      tileHeight: 16,
      tilesetColumns: 16,
      renderTileWidth: 48,
      renderTileHeight: 48,
      layers: [
        { name: 'ground', data: buildPattern(12, 12) },
      ],
    }),
  );
  game.scene.addChild(tilemapGo);
}
