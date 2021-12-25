import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject } from '@eva/eva.js';
import { StatsSystem } from '@eva/plugin-stats';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
export const name = 'stats';
export async function init(canvas) {
  
  const game = new Game({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      //@ts-ignore
      new StatsSystem({
        show: true,
        style: {
          x: 0,
          y: 0,
          width: 20,
          height: 12,
        },
      }),
      //@ts-ignore
      new TextSystem(),
    ],
  });
  // 此处还在考虑如何设置默认场景的宽高
  game.scene.transform.size = {
    width: 750,
    height: 1000,
  };

  const text = new GameObject('text', {
    position: {
      x: 0,
      y: 0,
    },
    origin: {
      x: 0.5,
      y: 0.5,
    },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });

  text.addComponent(
    //@ts-ignore
    new Text({
      text: '欢迎使用EVA互动游戏开发体系！',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#b35d9e', '#84c35f', '#ebe44f'], // gradient
        fillGradientType: 1,
        fillGradientStops: [0.1, 0.4],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 400,
        breakWords: true,
      },
    }),
  );

  game.scene.addChild(text);
}
