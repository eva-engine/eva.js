import { RendererSystem } from '@eva/plugin-renderer';
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { Text, BitmapText, TextSystem } from '@eva/plugin-renderer-text';
import { Render, RenderSystem } from '@eva/plugin-renderer-render';
export const name = 'text';

resource.addResource([
  {
    type: RESOURCE_TYPE.FONT,
    name: 'test',
    src: {
      font: {
        type: 'font',
        url:
          'https://g.alicdn.com/eva-assets/06b942920d2f310cffb0f22cc6d123ef/0.0.1/tmp/b52fe6c/1dccb0d7-0aae-4811-b763-88bee5675f65.otf?t=' +
          Date.now(),
      },
    },
    preload: true,
  },
]);

export async function init(canvas) {
  const game = new Game();
  await game.init({
    systems: [
      //@ts-ignore
      new RendererSystem({
        canvas,
        width: 750,
        height: 1000,
      }),
      //@ts-ignore
      new RenderSystem(),
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
      y: 0.7,
    },
    scale: {
      x: 3,
      y: 3,
    },
  });

  const txt = text.addComponent(
    new Text({
      text: '¥0.02',
      style: {
        fontFamily: 'test',
        fontSize: 108,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff'],
      },
    }),
  );

  // 使用 Render 组件的 resolution 属性提升渲染清晰度
  text.addComponent(
    new Render({
      resolution: 4,
    }),
  );

  const text2 = new GameObject('text', {
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
      y: 0.3,
    },
    scale: {
      x: 3,
      y: 3,
    },
  });

  const txt2 = text2.addComponent(
    new Text({
      text: '¥0.02',
      style: {
        fontFamily: 'test',
        fontSize: 108,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff'],
      },
    }),
  );

  // 不添加 Render 组件或 resolution 为 1 时使用默认渲染清晰度

  // BitmapText 示例 —— 使用动态生成的 bitmap font，适合频繁更新的文本
  const bitmapTextObj = new GameObject('bitmapText', {
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
      y: 0.1,
    },
    scale: {
      x: 3,
      y: 3,
    },
  });

  const bitmapTxt = bitmapTextObj.addComponent(
    new BitmapText({
      text: 'Score: 0',
      style: {
        fontSize: 48,
        fill: '#ffcc00',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: "red",
        strokeThickness: 8,
      },
    }),
  );
  // 模拟计分板更新，展示 BitmapText 频繁更新的优势
  let score = 0;
  setInterval(() => {
    score += 10;
    bitmapTxt.style.stroke = "#DE9524";
  }, 500);

  setTimeout(() => {
    txt.text = '¥0.03';
  }, 2000);

  game.scene.addChild(text);
  game.scene.addChild(text2);
  game.scene.addChild(bitmapTextObj);
}
